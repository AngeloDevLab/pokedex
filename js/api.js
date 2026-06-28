// ===== CONFIG =====
const API_BASE = "https://pokeapi.co/api/v2";

// ===== HELPERS =====
export async function fetchJSON(url, errorMessage) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(errorMessage);
    return res.json();
}

// ===== CACHE =====
let speciesCache = {};
let moveCache = {};

const ALL_POKEMON_CACHE_KEY = "pokedex:allPokemonList:v1";

function readCache(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        // localStorage unavailable or quota exceeded — cache is an
        // optimization, not a requirement, so just skip persisting it
    }
}

// ===== POKEMON =====
export async function fetchPokemonList(limit, offset) {
    return fetchJSON(
        `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
        "Failed to fetch pokemon list"
    );
}

export async function fetchPokemonDetails(list) {
    return Promise.all(
        list.results.map(p =>
            fetchJSON(p.url, "Failed to fetch pokemon details")
        )
    );
}

// ===== SPECIES =====
export async function getPokemonSpecies(url) {
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
export async function fetchEvolutionChain(url) {
    return fetchJSON(url, "Failed to fetch evolution chain");
}

// ===== SEARCH / FILTER =====
export async function fetchAllPokemonList() {
    const cached = readCache(ALL_POKEMON_CACHE_KEY);
    if (cached) return cached;

    const data = await fetchJSON(
        `${API_BASE}/pokemon?limit=100000&offset=0`,
        "Failed to fetch all pokemon"
    );
    writeCache(ALL_POKEMON_CACHE_KEY, data);
    return data;
}

export async function fetchPokemonByUrl(url) {
    return fetchJSON(url, "Failed to fetch pokemon details");
}

export async function fetchPokemonByType(type) {
    return fetchJSON(
        `${API_BASE}/type/${type}`,
        "Failed to fetch pokemon type"
    );
}

// ===== MOVES =====
export async function fetchMoveByUrl(url) {
    if (moveCache[url]) return moveCache[url];

    const data = await fetchJSON(url, "Failed to fetch move");
    moveCache[url] = data;
    return data;
}