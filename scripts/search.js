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

async function searchPokemonByType(type) {
    const data = await fetchPokemonByType(type);

    const results = data.pokemon.map(p => p.pokemon);

    searchResults = results;
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
    const typeInput = document.getElementById("filter-type");

    if (query.length === 0) {
        showSearchWarning(false);
        resetSearch();
        return;
    }

    if (isShortQuery(query)) {
        showSearchWarning(true);
        return;
    }

    typeInput.value = "";

    currentMode = "search";
    showSearchWarning(false);
    runNameSearch(query);
}

function handleTypeInput(e) {
    const type = e.target.value.trim().toLowerCase();
    const searchInput = document.getElementById("search-name");

    if (!type) {
        resetSearch();
        return;
    }

    searchInput.value = "";

    currentMode = "type";
    runTypeSearch(type);
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

async function runNameSearch(query) {
    showLoader();
    try {
        const details = await searchPokemonByName(query);

        activeList = details;

        visibleStart = 0;

        renderPokemonList(activeList);
        updateLoadButtons();

    } catch (err) {
        console.error("Search failed:", err);
    } finally {
        hideLoader();
    }
}

async function runTypeSearch(type) {
    currentMode = "type";

    showLoader();

    try {
        const details = await searchPokemonByType(type);

        activeList = details;
        visibleStart = 0;

        renderPokemonList(activeList);
        updateLoadButtons();

    } catch (err) {
        console.error("Type search failed:", err);
    } finally {
        hideLoader();
    }
}

// ===== HELPERS =====
function isShortQuery(query) {
    return query.length > 0 && query.length < 3;
}