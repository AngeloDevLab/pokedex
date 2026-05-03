
// ===== DIALOG =====
async function openDialog(index) {
    setCurrentDialogPokemon(index);
    await loadDialogData();
    renderDialogUI();
}

function setCurrentDialogPokemon(index) {
    currentIndex = index;
    currentDialogPokemon = activeList[index];

    if (currentIndex >= activeList.length) {
        currentIndex = activeList.length - 1;
    }
}

async function loadDialogData() {
    try {
        const species = await getPokemonSpecies(currentDialogPokemon.species.url);
        currentDialogEntry = getFlavorEntry(species);
    } catch (err) {
        console.warn("No species data available");
        currentDialogEntry = null;
    }
}

function renderDialogUI() {
    renderDialogContent();
    applyDialogStyles();

    if (!currentDialogEntry) {
        updateArrowState();
        showDialog();
        return;
    }

    initDialog();
}

function renderDialogContent() {
    const dialog = document.getElementById("pokemon-dialog");

    if (!currentDialogEntry) {
        dialog.innerHTML = getFallbackDialogTemplate(currentDialogPokemon);
        return;
    }

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
    if (!infoTab) return;
    setActiveTab(infoTab);
}

function updateArrowState() {
    const left = document.getElementById("arrow-left");
    const right = document.getElementById("arrow-right");
    if (!left || !right) return;
    left.disabled = currentIndex <= 0;
    right.disabled = currentIndex >= activeList.length - 1;
}

function lockScroll() {
    document.body.style.overflow = "hidden";
}

function showDialog() {
    const dialog = document.getElementById("pokemon-dialog");
    dialog.showModal();
}

function closeDialog() {
    const dialog = document.getElementById("pokemon-dialog");
    dialog.close();
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