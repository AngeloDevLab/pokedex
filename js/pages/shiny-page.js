import { initI18n, t } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { initPokemonPicker } from '../core/pokemon-picker.js';
import { withLoader } from '../core/pagination.js';
import { getPokemonSpecies, fetchPokemonEncounters } from '../core/api.js';
import { formatSlug } from '../core/ui.js';
import { SHINY_METHODS } from '../data/shiny-methods.js';

const NO_EGGS_GROUP = "no-eggs";

let currentEncounters = [];
let currentVersion = null;

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    renderMethodsTable();
    document.getElementById("version-select").addEventListener("change", handleVersionChange);

    await initPokemonPicker({
        inputId: "pokemon-picker",
        datalistId: "pokemon-options",
        onSelect: selectPokemon
    });
}

async function selectPokemon(pokemon) {
    await withLoader(async () => {
        const [encounters, species] = await Promise.all([
            fetchPokemonEncounters(pokemon.location_area_encounters),
            getPokemonSpecies(pokemon.species.url)
        ]);

        document.getElementById("shiny-result").classList.remove("hidden");
        renderRecommendation(encounters, species);
        renderEncounters(encounters);
    });
}

// ===== RECOMMENDATION =====
// Data-driven, not per-species guesswork: based on whether this exact
// Pokémon (regional form included) has any wild encounters in the games
// PokéAPI covers, and whether its species can breed at all (same
// undiscovered-egg-group check as breeding-page.js).
function renderRecommendation(encounters, species) {
    const eggGroupRefs = species?.egg_groups ?? [];
    const canBreed = eggGroupRefs.length > 0 && !eggGroupRefs.some(g => g.name === NO_EGGS_GROUP);

    const el = document.getElementById("recommended-method");

    if (encounters.length > 0) {
        el.textContent = t(
            'shiny.recommendWild', null,
            'This Pokémon has wild encounters — hunt at full odds with a Shiny Charm equipped, or (in Scarlet/Violet) stack a Sparkling Power Lvl. 3 sandwich. If it also appears in Mass Outbreaks, chaining 60+ catches boosts the odds further.'
        );
    } else if (canBreed) {
        el.textContent = t(
            'shiny.recommendBreeding', null,
            'No wild encounters in the data covered here, but this species can breed — the Masuda Method is the most efficient option. See the Breeding Guide for how it works.'
        );
    } else {
        el.textContent = t(
            'shiny.recommendNone', null,
            "No wild encounters in the data covered here, and this species can't breed normally — it may only be obtainable via a special encounter, gift, trade, or event, where shiny odds usually can't be influenced."
        );
    }
}

// ===== ENCOUNTER LOCATIONS =====
function renderEncounters(encounters) {
    currentEncounters = encounters;

    const hasEncounters = encounters.length > 0;
    document.getElementById("no-encounters-note").classList.toggle("hidden", hasEncounters);
    document.getElementById("encounters-detail").classList.toggle("hidden", !hasEncounters);
    if (!hasEncounters) return;

    const versions = getSortedVersions(encounters);
    const select = document.getElementById("version-select");
    select.innerHTML = versions.map(v => `<option value="${v.name}">${formatSlug(v.name)}</option>`).join("");

    currentVersion = versions[versions.length - 1].name;
    select.value = currentVersion;
    renderEncounterList();
}

function getSortedVersions(encounters) {
    const byName = new Map();
    encounters.forEach(entry => {
        entry.version_details.forEach(vd => {
            byName.set(vd.version.name, extractIdFromUrl(vd.version.url));
        });
    });

    return [...byName.entries()]
        .map(([name, id]) => ({ name, id }))
        .sort((a, b) => a.id - b.id);
}

function extractIdFromUrl(url) {
    return Number(url.split("/").filter(Boolean).pop());
}

function handleVersionChange(e) {
    currentVersion = e.target.value;
    renderEncounterList();
}

function renderEncounterList() {
    const rows = currentEncounters
        .map(entry => ({
            location: entry.location_area.name,
            versionDetail: entry.version_details.find(vd => vd.version.name === currentVersion)
        }))
        .filter(row => row.versionDetail);

    document.getElementById("encounters-list").innerHTML = rows.map(renderLocationGroup).join("");
}

function renderLocationGroup({ location, versionDetail }) {
    return `
        <div class="encounter-group">
            <h3>${formatSlug(location)}</h3>
            <ul class="encounter-list">
                ${versionDetail.encounter_details.map(d => renderEncounterDetail(d, versionDetail.max_chance)).join("")}
            </ul>
        </div>
    `;
}

function renderEncounterDetail(detail, maxChance) {
    const levelLabel = detail.min_level === detail.max_level
        ? `Lv. ${detail.min_level}`
        : `Lv. ${detail.min_level}–${detail.max_level}`;
    const chancePercent = Math.round((detail.chance / maxChance) * 100);

    return `
        <li class="encounter-row">
            <span class="encounter-method">${formatSlug(detail.method.name)}</span>
            <span class="encounter-level">${levelLabel}</span>
            <span class="encounter-chance">${chancePercent}%</span>
        </li>
    `;
}

// ===== METHODS & ODDS TABLE =====
function renderMethodsTable() {
    const table = document.getElementById("methods-table");
    table.innerHTML = `
        <tr>
            <th>${t('shiny.methodHeader', null, 'Method')}</th>
            <th>${t('shiny.gamesHeader', null, 'Games')}</th>
            <th>${t('shiny.oddsHeader', null, 'Odds')}</th>
        </tr>
        ${SHINY_METHODS.map(renderMethodRow).join("")}
    `;
}

function renderMethodRow(method) {
    return `
        <tr>
            <td>${t(`shiny.methods.${method.key}.name`, null, method.key)}</td>
            <td>${t(`shiny.methods.${method.key}.games`, null, "")}</td>
            <td>${method.odds}</td>
        </tr>
    `;
}
