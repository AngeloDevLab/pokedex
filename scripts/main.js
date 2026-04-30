const LIMIT = 20;

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

// ===== LOAD FLOW =====
async function loadPokemon() {
    showLoader();
    try {
        const details = await getPokemonDetails();

        if (!details.length) return;

        handleNewPokemon(details);
        offset += LIMIT;
    } catch (err) {
        console.error("Load failed:", err);
    } finally {
        hideLoader();
    }
}

async function getPokemonDetails() {
    const batch = loadPokemonBatch();
    await delay(500);
    return batch;
}

function handleNewPokemon(details) {
    updatePokemonCache(details);
    updateVisibleRange();
    updateLoadButtons();
    renderPokemonList(details);
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function updateVisibleRange() {
    const total = pokemonCache.length;

    if (total <= visibleCount) {
        visibleStart = 0;
        return;
    }

    visibleStart = total - visibleCount;
}

// ===== DATA =====
async function loadPokemonBatch() {
    const list = await fetchPokemonList(LIMIT, offset);
    return fetchPokemonDetails(list);
}

function updatePokemonCache(details) {
    pokemonCache.push(...details);
}