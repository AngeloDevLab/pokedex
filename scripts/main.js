const LIMIT = 20;

let offset = 0;
let pokemonCache = [];

function init() {
    bindUI();
    loadPokemon();
}

async function loadPokemon() {
    showLoader();

    const minTime = new Promise(r => setTimeout(r, 1500));
    const list = await fetchPokemonList(LIMIT, offset);
    const details = await fetchPokemonDetails(list);

    pokemonCache = [...pokemonCache, ...details];

    renderPokemonList(details);

    offset += LIMIT;

    await minTime;

    hideLoader();
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});
