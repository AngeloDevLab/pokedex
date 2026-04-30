// ===== SEARCH STATE =====
let activeList = [];
let currentMode = "default";  // default | search | type
let allPokemonList = [];
let searchResults = [];
let searchOffset = 0;

// ===== DATA LOAD =====
async function loadAllPokemonForSearch() {
    if (allPokemonList.length > 0) return;

    const data = await fetchAllPokemonList();
    allPokemonList = data.results;
}

// ===== SEARCH LOGIC =====
async function searchPokemonByName(query) {
    await loadAllPokemonForSearch();

    const matches = allPokemonList.filter(pokemon =>
        pokemon.name.includes(query)
    );

    searchResults = matches;
    searchOffset = 0;

    return loadSearchBatch();
}

// ===== PAGINATION (SEARCH MODE) =====
async function loadSearchBatch() {
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
function handleSearchInput(e) {
    const query = e.target.value.trim().toLowerCase();

    if (query.length === 0) {
        showSearchWarning(false);
        resetSearch();
        return;
    }

    if (isShortQuery(query)) {
        showSearchWarning(true);
        return;
    }

    showSearchWarning(false);
    runSearch(query);
}

// ===== SEARCH FLOW =====
function resetSearch() {
    currentMode = "default";

    activeList = pokemonCache;

    visibleStart = Math.max(
        0,
        pokemonCache.length - visibleCount
    );

    renderPokemonList(activeList);
    updateLoadButtons();
}

async function runSearch(query) {
    currentMode = "search";

    showLoader();

    try {
        const details = await searchPokemonByName(query);

        activeList = details;
        
        visibleStart = 0;

        renderPokemonList(activeList);

    } catch (err) {
        console.error("Search failed:", err);
    } finally {
        hideLoader();
    }
}

// ===== HELPERS =====
function isShortQuery(query) {
    return query.length > 0 && query.length < 3;
}