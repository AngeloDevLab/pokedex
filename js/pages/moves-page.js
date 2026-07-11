import { initI18n, t, getCurrentLang } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { withLoader } from '../core/pagination.js';
import { fetchMoveList, fetchMoveByUrl } from '../core/api.js';
import { getTypeIcon, formatSlug } from '../core/ui.js';
import { getMoveDetailTemplate } from '../core/templates.js';

let allMoves = [];
let currentSearch = "";
let currentType = "";
let currentCategory = "";

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    bindControls();

    allMoves = await withLoader(fetchMoveList);
    renderMoves();
}

function bindControls() {
    document.getElementById("move-search").addEventListener("input", handleSearchInput);
    document.getElementById("move-type-filter").addEventListener("input", handleTypeInput);
    document.getElementById("move-category-select").addEventListener("change", handleCategoryInput);
    document.getElementById("moves-result").addEventListener("click", handleMovesClick);
}

function handleSearchInput(e) {
    currentSearch = e.target.value.trim().toLowerCase();
    renderMoves();
}

function handleTypeInput(e) {
    currentType = e.target.value.trim().toLowerCase();
    renderMoves();
}

function handleCategoryInput(e) {
    currentCategory = e.target.value;
    renderMoves();
}

// ===== RENDER (list) =====
function renderMoves() {
    const container = document.getElementById("moves-result");
    const filtered = allMoves.filter(matchesFilters);

    if (!filtered.length) {
        container.innerHTML = `<p class="no-results">${t('results.noResults', null, 'No results found')}</p>`;
        return;
    }

    container.innerHTML = `<ul class="learnset-list">${filtered.map(renderMoveRow).join("")}</ul>`;
}

function matchesFilters(move) {
    if (currentSearch && !getMoveName(move).toLowerCase().includes(currentSearch)) return false;
    if (currentType && move.type !== currentType) return false;
    if (currentCategory && move.category !== currentCategory) return false;
    return true;
}

function renderMoveRow(move) {
    return `
        <li class="move-row" data-move-id="${move.id}">
            <button type="button" class="move-row-toggle">
                <img class="move-type-icon" src="${getTypeIcon(move.type)}" alt="${move.type}">
                <span class="move-category-badge move-category-${move.category}"></span>
                <span class="move-name">${getMoveName(move)}</span>
                <span class="move-quick-stats">${move.power ?? "—"} / ${move.accuracy ? `${move.accuracy}%` : "—"} / ${move.pp ?? "—"}</span>
                <svg class="move-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            <div class="move-details hidden"></div>
        </li>
    `;
}

function getMoveName(move) {
    const lang = getCurrentLang();
    return move.names[lang] ?? move.names.en ?? formatSlug(move.name);
}

// ===== EXPAND/COLLAPSE (lazy detail fetch) =====
async function handleMovesClick(e) {
    const toggle = e.target.closest(".move-row-toggle");
    if (!toggle) return;

    const details = toggle.nextElementSibling;
    details.classList.toggle("hidden");
    if (details.classList.contains("hidden") || details.dataset.loaded) return;

    details.dataset.loaded = "true";
    const row = toggle.closest(".move-row");
    const move = allMoves.find(m => String(m.id) === row.dataset.moveId);

    await withLoader(async () => {
        const fullMove = await fetchMoveByUrl(move.url);
        details.innerHTML = getMoveDetailTemplate(fullMove) + renderLearnedBy(fullMove);
    });
}

function renderLearnedBy(move) {
    const names = move.learned_by_pokemon.map(p => formatSlug(p.name)).sort();

    return `
        <div class="move-learned-by">
            <h4>${t('moves.learnedBy', { count: names.length }, `Learned by ${names.length} Pokémon`)}</h4>
            <div class="learned-by-list">
                ${names.map(name => `<span class="learned-by-badge">${name}</span>`).join("")}
            </div>
        </div>
    `;
}
