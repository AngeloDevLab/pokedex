// ===== STATE =====
let activeList = [];
let currentMode = "default";  // default | search | type
let allPokemonList = [];
let searchResults = [];
let searchOffset = 0;

// ===== DATA (LOAD) =====
async function loadAllPokemonForSearch() {
    if (allPokemonList.length > 0) return;
    const data = await fetchAllPokemonList();
    allPokemonList = data.results;
}

// ===== SEARCH (LOGIC) =====
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

// ===== PAGINATION =====
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
    const query = getInputValue(e);
    if (!validateSearchQuery(query)) return;
    resetOtherInput("filter-type");
    currentMode = "search";
    showSearchWarning(false);
    runNameSearch(query);
}

function handleTypeInput(e) {
    const type = getInputValue(e);

    if (!type) {
        resetSearch();
        return;
    }

    resetOtherInput("search-name");
    currentMode = "type";
    runTypeSearch(type);
}

function validateSearchQuery(query) {
    if (!query) {
        showSearchWarning(false);
        resetSearch();
        return false;
    }

    if (isShortQuery(query)) {
        showSearchWarning(true);
        return false;
    }

    return true;
}

// ===== SEARCH FLOW =====
function resetSearch() {
    const searchInput = document.getElementById("search-name");
    const typeInput = document.getElementById("filter-type");
    searchInput.value = "";
    typeInput.value = "";
    showSearchWarning(false);
    currentMode = "default";
    activeList = pokemonCache;
    visibleStart = Math.max(
        0,
        activeList.length - visibleCount
    );
    
    renderPokemonList(activeList);
    updateLoadButtons();
}

async function runSearch(task) {
    await withLoader(async () => {
        const details = await task();

        if (!details.length) {
            activeList = [];
            renderNoResults();
            updateLoadButtons();
            return;
        }

        activeList = details;
        visibleStart = 0;
        renderPokemonList(activeList);
        updateLoadButtons();
    });
}

function runNameSearch(query) {
    currentMode = "search";
    showSearchWarning(false);

    return runSearch(() => searchPokemonByName(query));
}

function runTypeSearch(type) {
    currentMode = "type";

    return runSearch(() => searchPokemonByType(type));
}

// ===== HELPERS =====
function isShortQuery(query) {
    return query.length > 0 && query.length < 3;
}

function getInputValue(e) {
    return e.target.value.trim().toLowerCase();
}

function resetOtherInput(id) {
    const input = document.getElementById(id);
    if (input) input.value = "";
}

function renderNoResults() {
    const container = document.getElementById("pokemon-container");
    container.classList.add("centered");
    container.innerHTML = getNoResultTemplate();
}