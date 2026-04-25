const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

export async function fetchPokemonList(limit, offset) {
    const res = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return await res.json();
}

export async function fetchPokemonDetails(list) {
    const promises = list.results.map(p =>
        fetch(p.url).then(r => r.json())
    );

    return await Promise.all(promises);
}