const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

async function fetchPokemonList(limit, offset) {
    const res = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return await res.json();
}

async function fetchPokemonDetails(list) {
    const promises = list.results.map(p =>
        fetch(p.url).then(r => r.json())
    );

    return await Promise.all(promises);
}

async function getPokemonSpecies(id) {
    if (speciesCache[id]) {
        return speciesCache[id];
    }

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data = await res.json();

    speciesCache[id] = data;

    return data;
}

async function fetchEvolutionChain(url) {
    const res = await fetch(url);
    return await res.json();
}