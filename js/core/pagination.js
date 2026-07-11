// Pagination/loading state shared across pages (index.html's default browse
// view and pages/search.html's search results both page through their data
// the same way). Deliberately has no top-level side effects (no
// DOMContentLoaded listener, no init logic) — main.js and search-page.js both
// import from here, and a side effect at module-evaluation time would run on
// every page that transitively imports this file, not just its "owner".

import {
    LOAD_MODE,
    renderPokemonList,
    updateLoadButtons,
    showLoader,
    hideLoader,
    parseEvolutionChain,
    mapEvolutionToPokemon
} from './ui.js';
import { fetchPokemonList, fetchPokemonDetails, getPokemonSpecies, fetchEvolutionChain } from './api.js';
import { activeList, currentMode, searchOffset, searchResults, loadSearchBatch, setActiveList } from './search.js';

// ===== CONFIG =====
export const LIMIT = 20;
const LOADER_MIN_TIME = 500;

// ===== STATE =====
let offset = 0;
export let pokemonCache = [];
export let visibleStart = 0;
export let visibleCount = 20;

export function setVisibleStart(value) {
    visibleStart = value;
}

// ===== LOAD =====
export async function loadPokemon() {
    await withLoader(async () => {
        const details = await loadPokemonBatch();
        if (!details.length) return;
        handleNewPokemon(details);
        offset += LIMIT;
    });
}

function handleNewPokemon(details) {
    updatePokemonCache(details);
    setActiveList(pokemonCache);
    updateVisibleRange();
    updateLoadButtons();
    renderPokemonList(activeList);
}

// ===== DATA =====
async function loadPokemonBatch() {
    const list = await fetchPokemonList(LIMIT, offset);
    return fetchPokemonDetails(list);
}

function updatePokemonCache(details) {
    pokemonCache.push(...details);
}

// ===== PAGINATION =====
export async function loadNext() {
    if (LOAD_MODE === "append") {
        await loadMoreData();
    } else {
        const nextStart = visibleStart + visibleCount;

        if (nextStart < activeList.length) {
            visibleStart = nextStart;
        } else {
            await loadMoreData(nextStart);
        }
    }

    updateView();
}

async function loadMoreData(nextStart) {
    if (currentMode === "default") {
        return loadMoreDefault();
    }

    if (currentMode === "filtered") {
        return loadMoreSearch(nextStart);
    }
}

async function loadMoreDefault() {
    await loadPokemon();
    setActiveList(pokemonCache);
}

async function loadMoreSearch(nextStart) {
    await withLoader(async () => {
        const newDetails = await loadSearchBatch();
        if (!newDetails.length) return;
        setActiveList([...activeList, ...newDetails]);
        if (LOAD_MODE === "pagination") {
            visibleStart = nextStart;
        }
    });
}

export function loadPrevious() {
    visibleStart = Math.max(0, visibleStart - visibleCount);
    updateView();
}

// ===== VIEW =====
function updateView() {
    renderPokemonList(activeList);
    updateLoadButtons();
    if (LOAD_MODE === "pagination") {
        window.scrollTo(0, 0);
    }
}

// ===== HELPERS =====
function updateVisibleRange() {
    visibleStart = Math.max(
        0,
        pokemonCache.length - visibleCount
    );
}

export function hasMoreData() {
    if (currentMode === "default") {
        return pokemonCache.length % LIMIT === 0;
    }

    if (currentMode === "filtered") {
        return searchOffset < searchResults.length;
    }

    return false;
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ===== EVOLUTION =====
export async function getEvolutionData(pokemon) {
    const species = await getPokemonSpecies(pokemon.species.url);

    if (!species || !species.evolution_chain) {
        console.warn("No evolution data");
        return null;
    }

    const evoData = await fetchEvolutionChain(
        species.evolution_chain.url
    );

    if (!evoData) return null;

    const names = parseEvolutionChain(evoData.chain);
    return mapEvolutionToPokemon(names);
}

// ===== LOADER =====
export async function withLoader(task, minTime = LOADER_MIN_TIME) {
    showLoader();
    const start = Date.now();
    try {
        return await task();
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        const elapsed = Date.now() - start;

        if (elapsed < minTime) {
            await delay(minTime - elapsed);
        }

        hideLoader();
    }
}
