import { initI18n, t, getCurrentLang } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { initPokemonPicker } from '../core/pokemon-picker.js';
import { withLoader } from '../core/pagination.js';
import { fetchMoveByUrl } from '../core/api.js';
import { getTypeIcon } from '../core/ui.js';

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
function getLatestLearnDetail(moveEntry) {
    const details = moveEntry.version_group_details;
    return details[details.length - 1];
}

async function buildMoveEntries() {
    const entries = currentPokemon.moves.map(moveEntry => ({
        moveEntry,
        latest: getLatestLearnDetail(moveEntry)
    }));

    const moves = await Promise.all(
        entries.map(({ moveEntry }) => fetchMoveByUrl(moveEntry.move.url))
    );

    return entries.map(({ moveEntry, latest }, i) => ({
        move: moves[i],
        method: latest.move_learn_method.name,
        level: latest.level_learned_at
    }));
}

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

    const learnsetEntries = await buildMoveEntries();
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
                <table>
                    <tr><td>${t('learnset.power', null, 'Power')}</td><td>${move.power ?? "—"}</td></tr>
                    <tr><td>${t('learnset.accuracy', null, 'Accuracy')}</td><td>${move.accuracy ? `${move.accuracy}%` : "—"}</td></tr>
                    <tr><td>${t('learnset.pp', null, 'PP')}</td><td>${move.pp ?? "—"}</td></tr>
                    <tr><td>${t('learnset.category', null, 'Category')}</td><td>${getCategoryLabel(move.damage_class.name)}</td></tr>
                </table>
                <p class="move-effect">${getMoveEffect(move)}</p>
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

function formatSlug(slug) {
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function getCategoryLabel(damageClass) {
    return t(`learnset.${damageClass}`, null, formatSlug(damageClass));
}

function getMoveEffect(move) {
    const entry = move.effect_entries.find(e => e.language.name === "en");
    if (!entry) return "";

    return entry.short_effect.replace("$effect_chance", move.effect_chance ?? "");
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
