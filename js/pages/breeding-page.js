import { initI18n, t, getCurrentLang } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { initPokemonPicker } from '../core/pokemon-picker.js';
import { withLoader } from '../core/pagination.js';
import { fetchMoveset } from '../core/moveset.js';
import { getPokemonSpecies, getEggGroup, fetchPokemonByUrl } from '../core/api.js';
import { getTypeIcon, formatSlug, formatStatName } from '../core/ui.js';
import { NATURES } from '../data/natures.js';

const NO_EGGS_GROUP = "no-eggs";

// Fetched Pokémon objects for candidate egg-move "fathers", keyed by URL —
// page-local, since only this page needs to fetch many individual full
// Pokémon objects up front.
const fatherCache = new Map();

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    renderNatureTable();
    bindExpandToggle();
    await initPokemonPicker({
        inputId: "pokemon-picker",
        datalistId: "pokemon-options",
        onSelect: selectPokemon
    });
}

async function selectPokemon(pokemon) {
    await withLoader(() => renderBreeding(pokemon));
}

// ===== BREEDING CHAIN =====
async function renderBreeding(pokemon) {
    document.getElementById("breeding-result").classList.remove("hidden");

    const species = await getPokemonSpecies(pokemon.species.url);
    const eggGroupRefs = species?.egg_groups ?? [];
    const canBreed = eggGroupRefs.length > 0 && !eggGroupRefs.some(g => g.name === NO_EGGS_GROUP);

    const eggGroups = (await Promise.all(eggGroupRefs.map(g => getEggGroup(g.url)))).filter(Boolean);
    renderEggGroups(eggGroups, canBreed);

    const section = document.getElementById("egg-moves-section");
    section.classList.toggle("hidden", !canBreed);
    if (!canBreed) return;

    const learnsetEntries = await fetchMoveset(pokemon);
    const eggMoveEntries = learnsetEntries.filter(entry => entry.method === "egg");

    const list = document.getElementById("egg-moves-list");
    const noEggMovesNote = document.getElementById("no-egg-moves-note");

    if (eggMoveEntries.length === 0) {
        list.innerHTML = "";
        noEggMovesNote.classList.remove("hidden");
        return;
    }
    noEggMovesNote.classList.add("hidden");

    const groupMemberNames = new Set();
    eggGroups.forEach(group => {
        group.pokemon_species.forEach(s => {
            if (s.name !== pokemon.species.name) groupMemberNames.add(s.name);
        });
    });

    const fathersByMove = await resolveFathers(eggMoveEntries, groupMemberNames);
    renderEggMoves(eggMoveEntries, fathersByMove);
}

async function resolveFathers(eggMoveEntries, groupMemberNames) {
    const candidatesByMove = eggMoveEntries.map(entry => ({
        entry,
        candidates: entry.move.learned_by_pokemon.filter(p => groupMemberNames.has(p.name))
    }));

    const candidateUrls = new Set();
    candidatesByMove.forEach(({ candidates }) => candidates.forEach(c => candidateUrls.add(c.url)));

    await Promise.all([...candidateUrls].map(async url => {
        if (fatherCache.has(url)) return;
        fatherCache.set(url, await fetchPokemonByUrl(url));
    }));

    const fathersByMove = new Map();
    candidatesByMove.forEach(({ entry, candidates }) => {
        const fathers = candidates
            .map(c => fatherCache.get(c.url))
            .filter(candidate => candidate && canTeachDirectly(candidate, entry.move.name));
        fathersByMove.set(entry.move.name, fathers);
    });

    return fathersByMove;
}

function canTeachDirectly(pokemon, moveName) {
    const moveEntry = pokemon.moves.find(m => m.move.name === moveName);
    if (!moveEntry) return false;

    const details = moveEntry.version_group_details;
    const latest = details[details.length - 1];
    return latest.move_learn_method.name !== "egg";
}

// ===== RENDER: EGG GROUPS =====
function renderEggGroups(eggGroups, canBreed) {
    const list = document.getElementById("egg-groups-list");
    const note = document.getElementById("cannot-breed-note");

    list.innerHTML = eggGroups.map(g => `<span class="egg-group-badge">${getEggGroupName(g)}</span>`).join("");
    note.classList.toggle("hidden", canBreed);
}

function getEggGroupName(eggGroup) {
    const lang = getCurrentLang();
    const localized = eggGroup.names.find(n => n.language.name === lang)
        ?? (lang === "ja" ? eggGroup.names.find(n => n.language.name === "ja-hrkt") : null)
        ?? eggGroup.names.find(n => n.language.name === "en");

    return localized ? localized.name : formatSlug(eggGroup.name);
}

// ===== RENDER: EGG MOVES =====
function renderEggMoves(eggMoveEntries, fathersByMove) {
    const list = document.getElementById("egg-moves-list");
    list.innerHTML = [...eggMoveEntries]
        .sort((a, b) => getMoveName(a.move).localeCompare(getMoveName(b.move)))
        .map(entry => renderEggMoveRow(entry, fathersByMove.get(entry.move.name) ?? []))
        .join("");
}

function renderEggMoveRow({ move }, fathers) {
    return `
        <li class="move-row egg-move">
            <button type="button" class="move-row-toggle">
                <img class="move-type-icon" src="${getTypeIcon(move.type.name)}" alt="${move.type.name}">
                <span class="move-name">${getMoveName(move)}</span>
                <svg class="move-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            <div class="move-details hidden">
                ${fathers.length > 0
                    ? `
                        <p class="fathers-label">${t('breeding.fathersLabel', null, 'Can be taught by:')}</p>
                        <ul class="fathers-list">${fathers.map(f => `<li>${formatSlug(f.name)}</li>`).join("")}</ul>
                    `
                    : `<p class="breeding-note">${t('breeding.noFathersFound', null, 'No direct teacher found — this move may only be passed down through chain breeding.')}</p>`
                }
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

// ===== RENDER: NATURE TABLE =====
function renderNatureTable() {
    const table = document.getElementById("nature-table");

    const rows = NATURES.map(nature => {
        if (!nature.increased) {
            return `
                <tr>
                    <td>${nature.name}</td>
                    <td colspan="2" class="nature-neutral">${t('breeding.natureTableNeutral', null, 'No effect')}</td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>${nature.name}</td>
                <td class="nature-increased">${formatStatName(nature.increased)}</td>
                <td class="nature-decreased">${formatStatName(nature.decreased)}</td>
            </tr>
        `;
    }).join("");

    table.innerHTML = `
        <tr>
            <th>${t('statsCalc.natureLabel', null, 'Nature')}</th>
            <th>${t('breeding.natureTableIncreased', null, 'Increases')}</th>
            <th>${t('breeding.natureTableDecreased', null, 'Decreases')}</th>
        </tr>
        ${rows}
    `;
}

// ===== EXPAND/COLLAPSE =====
function bindExpandToggle() {
    document.getElementById("egg-moves-list").addEventListener("click", handleRowToggle);
}

function handleRowToggle(e) {
    const toggle = e.target.closest(".move-row-toggle");
    if (!toggle) return;

    const details = toggle.nextElementSibling;
    details.classList.toggle("hidden");
}
