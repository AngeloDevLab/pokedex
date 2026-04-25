import { fetchPokemonList, fetchPokemonDetails } from "./api.js";

window.addEventListener("load", init)

const LOAD_MORE_BUTTON = document.getElementById("load-more-btn");

const LIMIT = 20;

let offset = 0;
let pokemonCache = [];

function init() {
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

LOAD_MORE_BUTTON.addEventListener("click", () => {
    loadPokemon();
});

PKM_CONTAINER.addEventListener("click", (e) => {
    const card = e.target.closest(".pokemon-card");

    if (!card) return;

    const id = Number(card.dataset.id);

    const pokemon = pokemonCache.find(p => p.id === id);

    openDialog(pokemon);
});