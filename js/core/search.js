import { fetchPokemonByUrl, fetchSearchIndex } from './api.js';
import { LIMIT, pokemonCache, visibleCount, withLoader, setVisibleStart } from './pagination.js';
import { renderPokemonList, updateLoadButtons, showSearchWarning } from './ui.js';
import { getNoResultTemplate } from './templates.js';

// ===== STATE =====
export let activeList = [];
export let currentMode = "default";  // default | filtered
export let searchOffset = 0;
export let searchResults = [];

// Bulk dataset (id/name/url/generation/eggGroups/abilities/types/bst) all
// combinable filters below run against client-side — see api.js's
// fetchSearchIndex() for why this replaces separate per-filter REST calls.
let searchIndex = [];

// All filters combine with AND; empty string/falsy = not applied.
const filters = { name: "", type: "", generation: "", ability: "", eggGroup: "" };
let sortBy = "id"; // id | name | bst

export function setActiveList(list) {
    activeList = list;
}

// ===== INDEX (LOAD ONCE) =====
export async function loadSearchIndex() {
    if (!searchIndex.length) {
        searchIndex = await fetchSearchIndex();
    }
    return searchIndex;
}

// ===== FILTER + SORT (client-side) =====
function computeFilteredResults() {
    let results = searchIndex;

    if (filters.name) results = results.filter(p => p.name.includes(filters.name));
    if (filters.type) results = results.filter(p => p.types.includes(filters.type));
    if (filters.generation) results = results.filter(p => String(p.generation) === filters.generation);
    if (filters.ability) results = results.filter(p => p.abilities.includes(filters.ability));
    if (filters.eggGroup) results = results.filter(p => p.eggGroups.includes(filters.eggGroup));

    return sortResults(results);
}

function sortResults(results) {
    const sorted = [...results];

    if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "bst") sorted.sort((a, b) => b.bst - a.bst);
    else sorted.sort((a, b) => a.id - b.id);

    return sorted;
}

function hasActiveFilter() {
    return Object.values(filters).some(Boolean) || sortBy !== "id";
}

// ===== PAGINATION =====
export async function loadSearchBatch() {
    const batch = searchResults.slice(
        searchOffset,
        searchOffset + LIMIT
    );
    const details = await Promise.all(
        batch.map(pokemon => fetchPokemonByUrl(pokemon.url))
    );
    searchOffset += LIMIT;

    return details;
}

// ===== INPUT HANDLING =====
export function handleSearchInput(e) {
    const query = getInputValue(e);
    const isShort = query.length > 0 && query.length < 3;

    showSearchWarning(isShort);
    filters.name = isShort ? "" : query;
    applyFilters();
}

export function handleTypeInput(e) {
    filters.type = getInputValue(e);
    applyFilters();
}

export function handleGenerationInput(e) {
    filters.generation = e.target.value;
    applyFilters();
}

export function handleAbilityInput(e) {
    filters.ability = getInputValue(e);
    applyFilters();
}

export function handleEggGroupInput(e) {
    filters.eggGroup = e.target.value;
    applyFilters();
}

export function handleSortInput(e) {
    sortBy = e.target.value;
    applyFilters();
}

// ===== SEARCH FLOW =====
export function resetSearch() {
    resetFilterInputs();

    filters.name = "";
    filters.type = "";
    filters.generation = "";
    filters.ability = "";
    filters.eggGroup = "";
    sortBy = "id";
    showSearchWarning(false);

    currentMode = "default";
    activeList = pokemonCache;
    setVisibleStart(Math.max(
        0,
        activeList.length - visibleCount
    ));

    renderPokemonList(activeList);
    updateLoadButtons();
    syncUrlParams();
}

function resetFilterInputs() {
    ["search-name", "filter-type", "ability-filter"].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
    ["generation-select", "egg-group-select"].forEach(id => {
        const select = document.getElementById(id);
        if (select) select.value = "";
    });
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) sortSelect.value = "id";
}

async function applyFilters() {
    if (!hasActiveFilter()) {
        resetSearch();
        return;
    }

    await withLoader(async () => {
        await loadSearchIndex();
        currentMode = "filtered";
        searchResults = computeFilteredResults();
        searchOffset = 0;

        if (!searchResults.length) {
            activeList = [];
            renderNoResults();
            updateLoadButtons();
            return;
        }

        const details = await loadSearchBatch();
        activeList = details;
        setVisibleStart(0);
        renderPokemonList(activeList);
        updateLoadButtons();
    });

    syncUrlParams();
}

// ===== URL PARAMS (deep-links / sharing) =====
export async function applyUrlParams() {
    const params = new URLSearchParams(location.search);
    if (![...params.keys()].length) return;

    filters.name = params.get("name") ?? "";
    filters.type = params.get("type") ?? "";
    filters.generation = params.get("gen") ?? "";
    filters.ability = params.get("ability") ?? "";
    filters.eggGroup = params.get("eggGroup") ?? "";
    sortBy = params.get("sort") ?? "id";

    syncFilterInputs();
    await applyFilters();
}

function syncFilterInputs() {
    setInputValue("search-name", filters.name);
    setInputValue("filter-type", filters.type);
    setInputValue("generation-select", filters.generation);
    setInputValue("ability-filter", filters.ability);
    setInputValue("egg-group-select", filters.eggGroup);
    setInputValue("sort-select", sortBy);
}

function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function syncUrlParams() {
    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.type) params.set("type", filters.type);
    if (filters.generation) params.set("gen", filters.generation);
    if (filters.ability) params.set("ability", filters.ability);
    if (filters.eggGroup) params.set("eggGroup", filters.eggGroup);
    if (sortBy !== "id") params.set("sort", sortBy);

    const query = params.toString();
    const url = query ? `${location.pathname}?${query}` : location.pathname;
    history.replaceState(null, "", url);
}

// ===== HELPERS =====
function getInputValue(e) {
    return e.target.value.trim().toLowerCase();
}

function renderNoResults() {
    const container = document.getElementById("pokemon-container");
    container.classList.add("centered");
    container.innerHTML = getNoResultTemplate();
}
