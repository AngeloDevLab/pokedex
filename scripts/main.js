window.addEventListener("load", init)

const LOAD_MORE_BUTTON = document.getElementById("load-more-btn");

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 20;

let offset = 0;
let pokemonCache = [];

function init() {
    loadPokemon();
}

async function fetchPokemonList() {
    const res = await fetch(`${BASE_URL}?limit=${LIMIT}&offset=${offset}`);
    return await res.json();
}

async function fetchPokemonDetails(list) {
    const promises = list.results.map(p =>
        fetch(p.url).then(r => r.json())
    );

    return await Promise.all(promises);
}

function renderPokemonList(pokemonList) {
    pokemonList.forEach(p => renderPokemon(p));
}

async function loadPokemon() {
    showLoader();

    const minTime = new Promise(r => setTimeout(r, 1500));
    const list = await fetchPokemonList();
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