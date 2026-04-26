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

let currentIndex = 0;

function renderPokemonList(pokemonList) {
    pokemonList.forEach(p => renderPokemon(p));
}

function renderPokemon(pokemon) {
    const pkmContainer = document.getElementById("pokemon-container");
    const types = getTypes(pokemon);

    const data = {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default,
        gradient: getGradient(types),
        types
    };

    pkmContainer.innerHTML += getPokemonCardTemplate(data);
}

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

function showLoader() {
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");
}

function hideLoader() {
    const loader = document.getElementById("loader");
    loader.classList.add("hidden");
}

function openDialog(index) {
    currentIndex = index;

    const pokemon = pokemonCache[index];

    renderDialog(pokemon);
    initDialogState(pokemon);
}

function renderDialog(pokemon) {
    const pkmDialog = document.getElementById("pokemon-dialog");

    pkmDialog.innerHTML = getPokemonDialogTemplate(pokemon);

    const types = getTypes(pokemon);
    const gradient = getGradient(types);

    pkmDialog.style.background = gradient;
}

function initDialogState(pokemon) {
    setDefaultTab();
    renderInfoTab(pokemon);
    updateArrowState();

    document.body.style.overflow = "hidden";

    const dialog = document.getElementById("pokemon-dialog");
    dialog.showModal();
}

function setDefaultTab() {
    const infoTab = document.querySelector('[data-tab="flavor"]');

    if (infoTab) {
        infoTab.classList.add("active");
    }
}

function bindUI() {
    bindOpenDialog();
    bindCloseDialog();
    bindLoadMore();
    bindDialogNavigation();
}

function bindOpenDialog() {
    const pkmContainer = document.getElementById("pokemon-container");

    pkmContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".pokemon-card");

        if (!card) return;

        const id = Number(card.dataset.id);
        const index = pokemonCache.findIndex(p => p.id === id);

        if (index === -1) return;

        openDialog(index);
    });
}

function bindCloseDialog() {
    const pkmDialog = document.getElementById("pokemon-dialog");

    pkmDialog.addEventListener("click", (e) => {
        const closeButton = e.target.closest("#close-dialog-button");

        if (!closeButton) return;

        pkmDialog.close();
        document.body.style.overflow = "auto"
    });
}

function bindLoadMore() {
    const loadMoreBtn = document.getElementById("load-more-btn");

    loadMoreBtn.addEventListener("click", () => {
        loadPokemon();
    });
}

function bindDialogNavigation() {
    const pkmDialog = document.getElementById("pokemon-dialog");

    pkmDialog.addEventListener("click", (e) => {

        // LEFT
        if (e.target.closest("#arrow-left")) {
            if (currentIndex > 0) {
                openDialog(currentIndex - 1);
            }
        }

        // RIGHT
        if (e.target.closest("#arrow-right")) {
            if (currentIndex < pokemonCache.length - 1) {
                openDialog(currentIndex + 1);
            }
        }

    });
}

function updateArrowState() {
    const left = document.getElementById("arrow-left");
    const right = document.getElementById("arrow-right");

    if (!left || !right) return;

    left.disabled = currentIndex === 0;
    right.disabled = currentIndex === pokemonCache.length - 1;
}

async function renderInfoTab(pokemon) {
    const tabContent = document.getElementById("tab-content");

    tabContent.innerHTML = "Loading...";

    const species = await getPokemonSpecies(pokemon.id);
    const entry = getFlavorEntry(species);

    tabContent.innerHTML = getInfoTabTemplate(pokemon, entry);
}

function getFlavorEntry(species) {
    const entry = species.flavor_text_entries.find(e => e.language.name === "en");

    if (!entry) {
        return {
            text: "No description found.",
            edition: "Unknown"
        };
    }

    return {
        text: entry.flavor_text
            .replace(/\f/g, " ")
            .replace(/\n/g, " "),
        edition: entry.version.name
    };
}