// ===== CONFIG =====
const TYPE_COLORS = {
    fire: "#e62829",
    water: "#2980ef",
    grass: "#3fa129",
    electric: "#fac000",
    poison: "#9141cb",
    bug: "#91a119",
    normal: "#9fa19f",
    ground: "#915121",
    fairy: "#ef70ef",
    fighting: "#ff8000",
    psychic: "#ee3d78",
    rock: "#aea983",
    ghost: "#70416f",
    ice: "#49d9fe",
    dragon: "#5762de",
    dark: "#50413f",
    steel: "#62a2b7",
    flying: "#81b9ef"
};

const TAB_RENDERER = {
    flavor: renderInfoTab,
    stats: renderStatsTab,
    evo: renderEvoTab,
    artworks: renderArtworkTab
};

// ===== STATE =====
let currentIndex = 0;
let currentDialogPokemon = null;
let currentDialogEntry = null;

let searchOpen = false;

// ===== DATA HELPERS =====
function getFlavorEntry(species) {
    const entry = species.flavor_text_entries
        .find(e => e.language.name === "en");

    if (!entry) return getDefaultFlavor();

    return {
        text: cleanFlavorText(entry.flavor_text),
        edition: entry.version.name
    };
}

function getDefaultFlavor() {
    return {
        text: "No description found.",
        edition: "Unknown"
    };
}

function cleanFlavorText(text) {
    return text
        .replace(/\f/g, " ")
        .replace(/\n/g, " ");
}

function prepareStats(pokemon) {
    return pokemon.stats.map(stat => {
        const value = stat.base_stat;

        return {
            name: formatStatName(stat.stat.name),
            value,
            percent: (value / 200) * 100,
            color: getStatColor(value)
        };
    });
}

function formatStatName(name) {
    return name
        .replace("-", " ")
        .replace("special", "sp.")
        .toUpperCase();
}

function getStatColor(value) {
    if (value < 50) return "red";
    if (value < 80) return "orange";
    return "green";
}

function mapEvolutionToPokemon(names) {
    return names.map(name => {
        const pkm = pokemonCache.find(p => p.name === name);

        return pkm
            ? {
                name: pkm.name,
                id: pkm.id,
                image: pkm.sprites.other["official-artwork"].front_default
            }
            : { name, id: null, image: null };
    });
}

function parseEvolutionChain(chain) {
    const result = [];

    let current = chain;

    while (current) {
        result.push(current.species.name);
        current = current.evolves_to[0];
    }

    return result;
}

// ===== UI HELPERS =====
function getTypes(pokemon) {
    return pokemon.types.map(t => t.type.name);
}

function getGradient(types) {
    const colors = types.map(t => TYPE_COLORS[t]);

    return colors.length === 1
        ? colors[0]
        : `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}

function getTypeIcon(type) {
    return `./assets/icons/types/${type}.png`;
}

function getTabContent() {
    return document.getElementById("tab-content");
}

function showLoader() {
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");
}

function hideLoader() {
    const loader = document.getElementById("loader");
    loader.classList.add("hidden");
}

// ===== POKEMON LIST =====
function renderPokemonList(list) {
    const container = document.getElementById("pokemon-container");

    const visiblePokemon = list.slice(
        visibleStart,
        visibleStart + visibleCount
    );

    const html = visiblePokemon
        .map(p => createPokemonData(p))
        .map(data => getPokemonCardTemplate(data))
        .join("");

    container.innerHTML = html;
}

function createPokemonData(pokemon) {
    const types = getTypes(pokemon);

    return {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default,
        gradient: getGradient(types),
        types
    };
}

// ===== DIALOG FLOW =====
async function openDialog(index) {
    setCurrentDialogPokemon(index);

    await loadDialogData();

    renderDialogUI();
}

function setCurrentDialogPokemon(index) {
    currentIndex = index;
    currentDialogPokemon = activeList[index];
}

async function loadDialogData() {
    const species = await getPokemonSpecies(currentDialogPokemon.id);
    currentDialogEntry = getFlavorEntry(species);
}

// ===== DIALOG RENDER =====
function renderDialogUI() {
    renderDialogContent();
    applyDialogStyles();
    initDialog();
}

function renderDialogContent() {
    const dialog = document.getElementById("pokemon-dialog");
    dialog.innerHTML = getPokemonDialogTemplate(
        currentDialogPokemon,
        currentDialogEntry
    );
}

function applyDialogStyles() {
    const dialog = document.getElementById("pokemon-dialog");

    const types = getTypes(currentDialogPokemon);
    dialog.style.background = getGradient(types);
}

// ===== DIALOG STATE =====
function initDialog() {
    setDefaultTab();
    renderInfoTab();
    updateArrowState();
    lockScroll();
    showDialog();
    bindTabs();
}

function setDefaultTab() {
    const infoTab = document.querySelector('[data-tab="flavor"]');

    if (infoTab) {
        infoTab.classList.add("active");
    }
}

function updateArrowState() {
    const left = document.getElementById("arrow-left");
    const right = document.getElementById("arrow-right");

    if (!left || !right) return;

    left.disabled = currentIndex === 0;
    right.disabled = currentIndex === pokemonCache.length - 1;
}

function lockScroll() {
    document.body.style.overflow = "hidden";
}

function showDialog() {
    const dialog = document.getElementById("pokemon-dialog");
    dialog.showModal();
}

// ===== TAB SYSTEM =====
function bindTabs() {
    const tabs = document.querySelectorAll(".tab-btn");

    tabs.forEach(tab => {
        tab.addEventListener("click", handleTabClick);
    });
}

function handleTabClick(e) {
    const tab = e.currentTarget;

    setActiveTab(tab);
    renderTabContent(tab.dataset.tab);
}

function setActiveTab(activeTab) {
    const tabs = document.querySelectorAll(".tab-btn");

    tabs.forEach(t => t.classList.remove("active"));
    activeTab.classList.add("active");
}

function renderTabContent(type) {
    const render = TAB_RENDERER[type];
    if (!render) return;

    render();
}

function getAbilities(pokemon) {
    return pokemon.abilities.map(a => {
        const name = a.ability.name;

        return a.is_hidden
            ? `${name} (hidden)`
            : name;
    });
}

// ===== TAB RENDER =====
function renderInfoTab() {
    const tabContent = getTabContent();
    tabContent.innerHTML = getInfoTabTemplate(
        currentDialogPokemon,
        currentDialogEntry
    );
}

function renderStatsTab() {
    const tabContent = getTabContent();
    const stats = prepareStats(currentDialogPokemon);

    tabContent.innerHTML = getStatsTabTemplate(stats);
}

async function renderEvoTab() {
    const tabContent = getTabContent();

    tabContent.innerHTML = "Loading...";

    const evoData = await getEvolutionData(currentDialogPokemon);

    tabContent.innerHTML = getEvoTemplate(evoData);
}

function renderArtworkTab() {
    const tabContent = getTabContent();
    tabContent.innerHTML = getArtworkTabTemplate(currentDialogPokemon);
}

// ===== EVOLUTION DATA =====
async function getEvolutionData(pokemon) {
    const species = await getPokemonSpecies(pokemon.id);
    const evoData = await fetchEvolutionChain(species.evolution_chain.url);

    const names = parseEvolutionChain(evoData.chain);

    return mapEvolutionToPokemon(names);
}

// ===== EVENTS =====
function bindUI() {
    bindOpenDialog();
    bindCloseDialog();
    bindLoadMore();
    bindDialogNavigation();
    bindLoadPrevious();
    bindSearchUI();
}

function bindOpenDialog() {
    const pkmContainer = document.getElementById("pokemon-container");

    pkmContainer.addEventListener("click", handlePokemonClick);
}

function handlePokemonClick(e) {
    const card = getPokemonCard(e);
    if (!card) return;

    const index = getPokemonIndex(card);
    if (index === -1) return;

    openDialog(index);
}

function getPokemonCard(e) {
    return e.target.closest(".pokemon-card");
}

function getPokemonIndex(card) {
    const id = Number(card.dataset.id);
    return activeList.findIndex(p => p.id === id);
}

function bindCloseDialog() {
    const pkmDialog = document.getElementById("pokemon-dialog");

    pkmDialog.addEventListener("click", handleDialogClick);
    pkmDialog.addEventListener("close", handleDialogClose);
}

function handleDialogClick(e) {
    if (!isCloseButton(e)) return;

    closeDialog();
}

function handleDialogClose() {
    document.body.style.overflow = "auto";
}

function isCloseButton(e) {
    return e.target.closest("#close-dialog-button");
}

function closeDialog() {
    const dialog = document.getElementById("pokemon-dialog");
    dialog.close();
}

function bindLoadMore() {
    const btn = document.getElementById("load-more-btn");
    if (!btn) return;
    btn.addEventListener("click", loadNext);
}

function bindDialogNavigation() {
    const pkmDialog = document.getElementById("pokemon-dialog");

    pkmDialog.addEventListener("click", handleDialogNavigation);
}

function handleDialogNavigation(e) {
    if (isLeftArrow(e)) return previousPokemon();
    if (isRightArrow(e)) return nextPokemon();
}

function isLeftArrow(e) {
    return e.target.closest("#arrow-left");
}

function isRightArrow(e) {
    return e.target.closest("#arrow-right");
}

function previousPokemon() {
    if (currentIndex <= 0) return;
    openDialog(currentIndex - 1);
}

function nextPokemon() {
    if (currentIndex >= pokemonCache.length - 1) return;
    openDialog(currentIndex + 1);
}

function bindSearchUI() {
    const searchToggle = document.getElementById("search-toggle");
    const searchInput = document.getElementById("search-name");
    const typeInput = document.getElementById("filter-type");

    searchToggle.addEventListener("click", toggleSearch);
    searchInput.addEventListener("input", handleSearchInput);
    typeInput.addEventListener("input", handleTypeInput);
}

// ===== LOAD NAVIGATION =====
function updateLoadButtons() {
    const prevBtn = document.getElementById("load-previous-btn");
    const nextBtn = document.getElementById("load-more-btn");

    if (!prevBtn || !nextBtn) return;

    const hasPrevious = visibleStart > 0;
    const hasNext = checkHasNext();

    prevBtn.classList.toggle("hidden", !hasPrevious);
    nextBtn.classList.toggle("hidden", !hasNext);
}

function checkHasNext() {
    if (hasMoreVisible()) return true;

    return hasMoreData();
}

function hasMoreVisible() {
    return visibleStart + visibleCount < activeList.length;
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

function loadPrevious() {
    visibleStart -= visibleCount;

    if (visibleStart < 0) {
        visibleStart = 0;
    }

    renderPokemonList(activeList);
    updateLoadButtons();
}

async function loadNext() {
    const nextStart = visibleStart + visibleCount;

    if (nextStart < activeList.length) {
        visibleStart = nextStart;
    } else {
        await loadMoreData(nextStart);
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
    showLoader();

    try {
        const newDetails = await loadSearchBatch();
        if (!newDetails.length) return;

        activeList = [...activeList, ...newDetails];
        visibleStart = nextStart;

    } catch (err) {
        console.error("Search load more failed:", err);
    } finally {
        hideLoader();
    }
}

function updateView() {
    renderPokemonList(activeList);
    updateLoadButtons();
    window.scrollTo(0, 0);
}

function bindLoadPrevious() {
    const btn = document.getElementById("load-previous-btn");
    if (!btn) return;

    btn.addEventListener("click", loadPrevious);
}

// ===== SEARCH =====
function toggleSearch() {
    searchOpen = !searchOpen;

    const panel = document.getElementById("search-panel");
    const searchIcon = document.getElementById("search-icon");
    const closeIcon = document.getElementById("close-icon");

    panel.classList.toggle("open", searchOpen);
    searchIcon.classList.toggle("hidden", searchOpen);
    closeIcon.classList.toggle("hidden", !searchOpen);

    if (searchOpen) {
        document.getElementById("search-name").focus();
    }
}

function showSearchWarning(show) {
    const warning = document.getElementById("search-warning");
    warning.classList.toggle("hidden", !show);
}