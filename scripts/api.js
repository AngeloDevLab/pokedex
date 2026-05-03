// ===== CONFIG =====
const API_BASE = "https://pokeapi.co/api/v2";

// ===== HELPERS =====
async function fetchJSON(url, errorMessage) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(errorMessage);
    return res.json();
}

// ===== CACHE =====
let speciesCache = {};

// ===== POKEMON =====
async function fetchPokemonList(limit, offset) {
    return fetchJSON(
        `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
        "Failed to fetch pokemon list"
    );
}

async function fetchPokemonDetails(list) {
    return Promise.all(
        list.results.map(p =>
            fetchJSON(p.url, "Failed to fetch pokemon details")
        )
    );
}

// ===== SPECIES =====
async function getPokemonSpecies(url) {
    if (speciesCache[url]) return speciesCache[url];

    try {
        const data = await fetchJSON(
            url,
            "Failed to fetch species"
        );
        speciesCache[url] = data;
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// ===== EVOLUTION =====
async function fetchEvolutionChain(url) {
    return fetchJSON(url, "Failed to fetch evolution chain");
}

// ===== SEARCH / FILTER =====
async function fetchAllPokemonList() {
    return fetchJSON(
        `${API_BASE}/pokemon?limit=100000&offset=0`,
        "Failed to fetch all pokemon"
    );
}

async function fetchPokemonByUrl(url) {
    return fetchJSON(url, "Failed to fetch pokemon details");
}

async function fetchPokemonByType(type) {
    return fetchJSON(
        `${API_BASE}/type/${type}`,
        "Failed to fetch pokemon type"
    );
}