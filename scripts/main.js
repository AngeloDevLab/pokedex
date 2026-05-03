// ===== CONFIG =====
const LIMIT = 20;
const LOADER_MIN_TIME = 500;

// ===== STATE =====
let offset = 0;
let pokemonCache = [];
let visibleStart = 0;
let visibleCount = 20;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", init);

function init() {
    bindUI();
    loadPokemon();
}

// ===== LOAD =====
async function loadPokemon() {
    await withLoader(async () => {
        const details = await loadPokemonBatch();
        if (!details.length) return;
        handleNewPokemon(details);
        offset += LIMIT;
    });
}

function handleNewPokemon(details) {
    updatePokemonCache(details);
    activeList = pokemonCache;
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
async function loadNext() {
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

    if (currentMode === "search" || currentMode === "type") {
        return loadMoreSearch(nextStart);
    }
}

async function loadMoreDefault() {
    await loadPokemon();
    activeList = pokemonCache;
}

async function loadMoreSearch(nextStart) {
    await withLoader(async () => {
        const newDetails = await loadSearchBatch();
        if (!newDetails.length) return;
        activeList = [...activeList, ...newDetails];
        if (LOAD_MODE === "pagination") {
            visibleStart = nextStart;
        }
    });
}

function loadPrevious() {
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

function hasMoreData() {
    if (currentMode === "default") {
        return pokemonCache.length % LIMIT === 0;
    }

    if (currentMode === "search" || currentMode === "type") {
        return searchOffset < searchResults.length;
    }

    return false;
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ===== EVOLUTION =====
async function getEvolutionData(pokemon) {
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
async function withLoader(task, minTime = LOADER_MIN_TIME) {
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