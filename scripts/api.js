// ===== CONFIG =====
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";


// ===== CACHE =====
let speciesCache = {};


// ===== POKEMON =====
async function fetchPokemonList(limit, offset) {
    const res = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);

    if (!res.ok) throw new Error("Failed to fetch pokemon list");

    return res.json();
}

async function fetchPokemonDetails(list) {
    return Promise.all(
        list.results.map(p => fetch(p.url).then(r => r.json()))
    );
}


// ===== SPECIES =====
async function getPokemonSpecies(id) {
    if (speciesCache[id]) return speciesCache[id];

    const res = await fetch(`${BASE_URL}-species/${id}`);

    if (!res.ok) throw new Error("Failed to fetch species");

    const data = await res.json();
    speciesCache[id] = data;

    return data;
}


// ===== EVOLUTION =====
async function fetchEvolutionChain(url) {
    const res = await fetch(url);

    if (!res.ok) throw new Error("Failed to fetch evolution chain");

    return res.json();
}