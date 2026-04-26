const LOADER = document.getElementById("loader");
const PKM_CONTAINER = document.getElementById("pokemon-container");
const PKM_DIALOG = document.getElementById("pokemon-dialog");

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

function renderPokemon(pokemon) {
    const types = getTypes(pokemon);

    const data = {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default,
        gradient: getGradient(types),
        types
    };

    PKM_CONTAINER.innerHTML += getPokemonCardTemplate(data);
}

function getTypes(pokemon) {
    return pokemon.types.map(t => t.type.name);
}

function getTypeIcon(type) {
    return `./assets/icons/types/${type}.png`;
}

function getGradient(types) {
    const colors = types.map(t => TYPE_COLORS[t]);

    return colors.length === 1
        ? colors[0]
        : `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}

function renderPokemonList(pokemonList) {
    pokemonList.forEach(p => renderPokemon(p));
}

function showLoader() {
    LOADER.classList.remove("hidden");
}

function hideLoader() {
    LOADER.classList.add("hidden");
}

function openDialog(pokemon) {
    let dialogContent = document.getElementById("dialog-content");

    const types = getTypes(pokemon);
    const gradient = getGradient(types);

    dialogContent.innerHTML = getPokemonDialogTemplate(pokemon);

    PKM_DIALOG.style.background = gradient;
    PKM_DIALOG.showModal();
}



// document.getElementById("close-btn").addEventListener("click", () => {
//     PKM_DIALOG.close();
// });