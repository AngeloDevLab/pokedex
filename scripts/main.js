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
        const batch = loadPokemonBatch();
        await delay(500);

        const details = await batch;

        if (!details || details.length === 0) return;

        updatePokemonCache(details);
        updateVisibleRange();
        updateLoadButtons();
        renderPokemonList(details);

        offset += LIMIT;
    } catch (err) {
        console.error("Load failed:", err);
    } finally {
        hideLoader();
    }
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