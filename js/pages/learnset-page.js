import { initI18n, getCurrentLang } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { initPokemonPicker } from '../core/pokemon-picker.js';
import { withLoader } from '../core/pagination.js';
import { fetchMoveset } from '../core/moveset.js';
import { getTypeIcon, formatSlug } from '../core/ui.js';
import { getMoveDetailTemplate } from '../core/templates.js';

const METHODS = ["level-up", "machine", "egg", "tutor"];

let currentPokemon = null;

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    bindExpandToggle();
    await initPokemonPicker({
        inputId: "pokemon-picker",
        datalistId: "pokemon-options",
        onSelect: selectPokemon
    });
}

async function selectPokemon(pokemon) {
    currentPokemon = pokemon;
    await withLoader(renderLearnset);
}

// ===== DATA =====
function groupByMethod(learnsetEntries) {
    const groups = { "level-up": [], machine: [], egg: [], tutor: [] };

    learnsetEntries.forEach(entry => {
        if (groups[entry.method]) groups[entry.method].push(entry);
    });

    groups["level-up"].sort((a, b) => a.level - b.level);
    Object.values(groups).forEach(group => {
        if (group !== groups["level-up"]) {
            group.sort((a, b) => getMoveName(a.move).localeCompare(getMoveName(b.move)));
        }
    });

    return groups;
}

// ===== RENDER =====
async function renderLearnset() {
    document.getElementById("learnset-pokemon-name").textContent = currentPokemon.name;

    const learnsetEntries = await fetchMoveset(currentPokemon);
    const groups = groupByMethod(learnsetEntries);

    METHODS.forEach(method => renderGroup(method, groups[method]));

    document.getElementById("learnset-result").classList.remove("hidden");
}

function renderGroup(method, entries) {
    const section = document.getElementById(`learnset-group-${method}`);
    const list = document.getElementById(`learnset-list-${method}`);

    section.classList.toggle("hidden", entries.length === 0);
    list.innerHTML = entries.map(entry => renderMoveRow(entry, method)).join("");
}

function renderMoveRow({ move, level }, method) {
    const isEgg = method === "egg";

    return `
        <li class="move-row ${isEgg ? "egg-move" : ""}">
            <button type="button" class="move-row-toggle">
                ${method === "level-up" ? `<span class="move-level">${level}</span>` : ""}
                <img class="move-type-icon" src="${getTypeIcon(move.type.name)}" alt="${move.type.name}">
                <span class="move-category-badge move-category-${move.damage_class.name}"></span>
                <span class="move-name">${getMoveName(move)}</span>
                <svg class="move-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            <div class="move-details hidden">
                ${getMoveDetailTemplate(move)}
            </div>
        </li>
    `;
}

function getMoveName(move) {
    const lang = getCurrentLang();
    const localized = move.names.find(n => n.language.name === lang)
        ?? move.names.find(n => n.language.name === "en");

    return localized ? localized.name : formatSlug(move.name);
}

// ===== EXPAND/COLLAPSE =====
function bindExpandToggle() {
    document.getElementById("learnset-result").addEventListener("click", handleRowToggle);
}

function handleRowToggle(e) {
    const toggle = e.target.closest(".move-row-toggle");
    if (!toggle) return;

    const details = toggle.nextElementSibling;
    details.classList.toggle("hidden");
}
