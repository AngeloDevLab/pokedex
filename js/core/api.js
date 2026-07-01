// ===== CONFIG =====
const API_BASE = "https://pokeapi.co/api/v2";
const GRAPHQL_BASE = "https://beta.pokeapi.co/graphql/v1beta";
const SHOWDOWN_FORMATS_DATA_URL = "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/formats-data.ts";

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
const SPEED_TIER_CACHE_KEY = "pokedex:speedTierList:v1";
const SMOGON_TIERS_CACHE_KEY = "pokedex:smogonTiers:v1";
const SMOGON_TIERS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

// TTL-aware cache variant — everything else cached in this file is static
// Pokédex data (a species' base stats never change), so it's cached forever
// until a version bump. Smogon tier data actually shifts over time, so it
// needs to expire and re-fetch on its own instead.
function readCacheWithTTL(key, ttlMs) {
    const cached = readCache(key);
    if (!cached) return null;
    if (Date.now() - cached.fetchedAt > ttlMs) return null;
    return cached.data;
}

function writeCacheWithTTL(key, data) {
    writeCache(key, { fetchedAt: Date.now(), data });
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

// ===== EGG GROUPS =====
let eggGroupCache = {};

export async function getEggGroup(url) {
    if (eggGroupCache[url]) return eggGroupCache[url];

    try {
        const data = await fetchJSON(url, "Failed to fetch egg group");
        eggGroupCache[url] = data;
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
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

// ===== SPEED TIERS (GraphQL) =====
// The only GraphQL call in the project — the speed-tier page needs base
// stats for every Pokémon at once to build a sorted list, and doing that as
// ~1300 individual REST /pokemon/{id} requests (like fetchPokemonByUrl)
// would be far too slow/heavy. PokéAPI's GraphQL beta endpoint returns
// exactly the fields we need for every Pokémon form in a single request.
const SPEED_TIER_QUERY = `query {
    pokemon: pokemon_v2_pokemon {
        id
        name
        is_default
        pokemon_species_id
        pokemon_v2_pokemonstats(order_by: { stat_id: asc }) { base_stat }
        pokemon_v2_pokemonspecy { generation_id }
        pokemon_v2_pokemontypes(order_by: { slot: asc }) { pokemon_v2_type { name } }
    }
}`;

export async function fetchSpeedTierList() {
    const cached = readCache(SPEED_TIER_CACHE_KEY);
    if (cached) return cached;

    const res = await fetch(GRAPHQL_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: SPEED_TIER_QUERY })
    });
    if (!res.ok) throw new Error("Failed to fetch speed tier data");

    const { data } = await res.json();
    const list = buildSpeedTierList(data.pokemon);
    writeCache(SPEED_TIER_CACHE_KEY, list);
    return list;
}

// Keeps every default-form Pokémon, plus non-default forms (Megas, regional
// forms, Therian/Origin/Crowned, ...) only if their base stats actually
// differ from their species' default form — this drops purely cosmetic
// duplicates (Pikachu costumes, Totem forms, Gmax forms all share identical
// base stats with their default form in PokéAPI's data) without a
// hand-maintained name blocklist.
function buildSpeedTierList(allPokemon) {
    const bySpecies = new Map();
    allPokemon.forEach(p => {
        const forms = bySpecies.get(p.pokemon_species_id) ?? [];
        forms.push(p);
        bySpecies.set(p.pokemon_species_id, forms);
    });

    const result = [];
    bySpecies.forEach(forms => {
        const defaultForm = forms.find(p => p.is_default) ?? forms[0];
        const defaultStats = statArray(defaultForm);

        forms.forEach(p => {
            if (p !== defaultForm && arraysEqual(statArray(p), defaultStats)) return;
            result.push({
                id: p.id,
                name: p.name,
                speed: statArray(p)[5],
                gen: p.pokemon_v2_pokemonspecy?.generation_id ?? null,
                types: p.pokemon_v2_pokemontypes.map(t => t.pokemon_v2_type.name)
            });
        });
    });

    return result;
}

function statArray(pokemon) {
    return pokemon.pokemon_v2_pokemonstats.map(s => s.base_stat);
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every((value, i) => value === b[i]);
}

// ===== SMOGON TIERS =====
// Not a PokéAPI endpoint at all — Smogon's competitive tier placement isn't
// part of PokéAPI. Fetches Pokémon Showdown's own data/formats-data.ts
// (the actual source Smogon's tier list is built from) straight from
// GitHub. That file is a TypeScript object-literal export, not JSON, so it
// can't go through fetchJSON() — a small regex extractor pulls out just the
// `tier`/`natDexTier` fields per entry instead of evaluating the fetched
// text as code. Also the only cache in this file with a TTL (see
// readCacheWithTTL above): tier placements actually change over time,
// unlike the rest of this app's Pokédex data.
export async function fetchSmogonTiers() {
    const cached = readCacheWithTTL(SMOGON_TIERS_CACHE_KEY, SMOGON_TIERS_TTL_MS);
    if (cached) return cached;

    const res = await fetch(SHOWDOWN_FORMATS_DATA_URL);
    if (!res.ok) throw new Error("Failed to fetch Smogon tier data");

    const text = await res.text();
    const tiers = parseFormatsData(text);
    writeCacheWithTTL(SMOGON_TIERS_CACHE_KEY, tiers);
    return tiers;
}

function parseFormatsData(text) {
    const entryRegex = /^\t([a-z0-9]+): \{([\s\S]*?)\n\t\},$/gm;
    const tierRegex = /\btier: "([^"]+)"/;
    const natDexTierRegex = /\bnatDexTier: "([^"]+)"/;

    const tiers = {};
    let match;
    while ((match = entryRegex.exec(text)) !== null) {
        const [, name, body] = match;
        const tier = tierRegex.exec(body)?.[1] ?? null;
        const natDexTier = natDexTierRegex.exec(body)?.[1] ?? null;
        if (tier || natDexTier) tiers[name] = { tier, natDexTier };
    }

    return tiers;
}