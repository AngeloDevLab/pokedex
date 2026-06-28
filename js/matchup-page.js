import { initI18n, t } from './i18n.js';
import { initNavShell } from './nav.js';
import { initPokemonPicker } from './pokemon-picker.js';
import { getTypes, getTypeIcon } from './ui.js';
import { ALL_TYPES, getDualTypeMultiplier } from './type-chart.js';

let currentPokemon = null;

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    await initPokemonPicker({
        inputId: "pokemon-picker",
        datalistId: "pokemon-options",
        onSelect: selectPokemon
    });
}

function selectPokemon(pokemon) {
    currentPokemon = pokemon;
    renderMatchup();
}

// ===== RENDER =====
function renderMatchup() {
    document.getElementById("matchup-pokemon-name").textContent = currentPokemon.name;

    const defendingTypes = getTypes(currentPokemon);
    const rows = ALL_TYPES
        .map(type => ({ type, multiplier: getDualTypeMultiplier(type, defendingTypes) }))
        .sort((a, b) => b.multiplier - a.multiplier);

    document.getElementById("matchup-list").innerHTML = rows.map(renderMatchupRow).join("");
    document.getElementById("matchup-result").classList.remove("hidden");
}

function renderMatchupRow({ type, multiplier }) {
    return `
        <li class="matchup-row ${getMultiplierClass(multiplier)}">
            <img src="${getTypeIcon(type)}" alt="${type}">
            <span class="matchup-type-name">${type}</span>
            <span class="matchup-multiplier">${formatMultiplier(multiplier)}</span>
        </li>
    `;
}

function formatMultiplier(multiplier) {
    if (multiplier === 0) return t('matchup.immune', null, 'Immune');
    return `×${multiplier}`;
}

function getMultiplierClass(multiplier) {
    if (multiplier === 0) return "matchup-immune";
    if (multiplier > 1) return "matchup-weak";
    if (multiplier < 1) return "matchup-resist";
    return "matchup-neutral";
}
