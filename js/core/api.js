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
const ITEM_LIST_CACHE_KEY = "pokedex:itemList:v1";
const SEARCH_INDEX_CACHE_KEY = "pokedex:searchIndex:v1";

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

// ===== FORMS =====
let formCache = {};

export async function fetchPokemonForm(url) {
    if (formCache[url]) return formCache[url];

    const data = await fetchJSON(url, "Failed to fetch pokemon form");
    formCache[url] = data;
    return data;
}

// ===== ITEMS (bulk, GraphQL) =====
// PokéAPI has ~2200 /item resources total, but the vast majority are shop
// potions, key items, TMs-as-items, mail, and per-version Poké Ball
// duplicates — not what "competitive held items" means. Rather than a
// hand-picked item-name list, this restricts to a curated set of real
// PokéAPI item-categories that are actually held/battle-relevant (verified
// against the live API's /item-category list) — still data-driven, just
// scoped. One bulk GraphQL request (same shape as fetchSpeedTierList()) for
// name/category/effect/sprite/localized-names instead of ~300 individual
// REST calls; permanently localStorage-cached like the rest of this app's
// static Pokédex data.
const ITEM_CATEGORIES = [
    "held-items", "bad-held-items", "choice", "other", "type-protection",
    "in-a-pinch", "picky-healing", "medicine", "type-enhancement", "plates",
    "species-specific", "mega-stones", "z-crystals", "jewels", "memories",
    "effort-training"
];

const ITEM_LANGUAGE_IDS = { en: 9, de: 6, ja: 11 };

const ITEM_LIST_QUERY = `query {
    item: pokemon_v2_item(
        where: { pokemon_v2_itemcategory: { name: { _in: ${JSON.stringify(ITEM_CATEGORIES)} } } }
    ) {
        name
        pokemon_v2_itemcategory { name }
        pokemon_v2_itemeffecttexts(where: { language_id: { _eq: 9 } }) { short_effect }
        pokemon_v2_itemnames(where: { language_id: { _in: [9, 6, 11] } }) { name language_id }
        pokemon_v2_itemsprites { sprites }
    }
}`;

export async function fetchItemList() {
    const cached = readCache(ITEM_LIST_CACHE_KEY);
    if (cached) return cached;

    const res = await fetch(GRAPHQL_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ITEM_LIST_QUERY })
    });
    if (!res.ok) throw new Error("Failed to fetch item list");

    const { data } = await res.json();
    const items = data.item.map(buildItem);
    writeCache(ITEM_LIST_CACHE_KEY, items);
    return items;
}

function buildItem(item) {
    const namesByLang = Object.fromEntries(
        item.pokemon_v2_itemnames.map(n => [n.language_id, n.name])
    );

    return {
        name: item.name,
        category: item.pokemon_v2_itemcategory.name,
        effect: item.pokemon_v2_itemeffecttexts[0]?.short_effect ?? null,
        sprite: item.pokemon_v2_itemsprites[0]?.sprites?.default ?? null,
        names: {
            en: namesByLang[ITEM_LANGUAGE_IDS.en],
            de: namesByLang[ITEM_LANGUAGE_IDS.de],
            ja: namesByLang[ITEM_LANGUAGE_IDS.ja]
        }
    };
}

// ===== ENCOUNTERS =====
let encountersCache = {};

export async function fetchPokemonEncounters(url) {
    if (encountersCache[url]) return encountersCache[url];

    const data = await fetchJSON(url, "Failed to fetch pokemon encounters");
    encountersCache[url] = data;
    return data;
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

// ===== SEARCH INDEX (bulk, GraphQL) =====
// One bulk request (same shape as fetchSpeedTierList()) covering every
// /pokemon entry's type/generation/ability/egg-group/base-stat-total —
// everything search.js's combinable filters (Session 15: name, type,
// generation, ability, egg group, sort by ID/name/BST) need to run
// entirely client-side against a single cached dataset, instead of
// juggling separate REST endpoints per filter (/type/{x}, /generation/{x},
// /ability/{x}, ...) that return incompatible shapes and can't be
// intersected without N more requests. Permanently localStorage-cached
// like the rest of this app's static Pokédex data. `url` is constructed
// directly from `id` (`{API_BASE}/pokemon/{id}/`) rather than fetched,
// since that's PokéAPI's own stable REST URL pattern.
const SEARCH_INDEX_QUERY = `query {
    pokemon: pokemon_v2_pokemon {
        id
        name
        pokemon_v2_pokemonspecy {
            generation_id
            pokemon_v2_pokemonegggroups { pokemon_v2_egggroup { name } }
        }
        pokemon_v2_pokemonabilities { pokemon_v2_ability { name } }
        pokemon_v2_pokemonstats(order_by: { stat_id: asc }) { base_stat }
        pokemon_v2_pokemontypes(order_by: { slot: asc }) { pokemon_v2_type { name } }
    }
}`;

export async function fetchSearchIndex() {
    const cached = readCache(SEARCH_INDEX_CACHE_KEY);
    if (cached) return cached;

    const res = await fetch(GRAPHQL_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: SEARCH_INDEX_QUERY })
    });
    if (!res.ok) throw new Error("Failed to fetch search index");

    const { data } = await res.json();
    const index = data.pokemon.map(buildSearchIndexEntry);
    writeCache(SEARCH_INDEX_CACHE_KEY, index);
    return index;
}

function buildSearchIndexEntry(p) {
    return {
        id: p.id,
        name: p.name,
        url: `${API_BASE}/pokemon/${p.id}/`,
        generation: p.pokemon_v2_pokemonspecy?.generation_id ?? null,
        eggGroups: p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonegggroups.map(g => g.pokemon_v2_egggroup.name) ?? [],
        abilities: p.pokemon_v2_pokemonabilities.map(a => a.pokemon_v2_ability.name),
        types: p.pokemon_v2_pokemontypes.map(t => t.pokemon_v2_type.name),
        bst: p.pokemon_v2_pokemonstats.reduce((sum, s) => sum + s.base_stat, 0)
    };
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

// ===== FORMS (bulk, GraphQL) =====
// Names of every default-form Pokémon whose species has more than one
// variety — used by forms-page.js to restrict its picker's autocomplete
// suggestions to Pokémon that actually have alternate forms, instead of
// letting users pick one from the full ~1300-entry list only to land on a
// "no alternate forms" message. Same GraphQL-bulk shape as
// fetchSpeedTierList() (one request instead of ~1300 individual ones),
// cached permanently like the rest of this app's static Pokédex data.
const NAMES_WITH_FORMS_CACHE_KEY = "pokedex:pokemonNamesWithForms:v1";

const VARIETY_COUNT_QUERY = `query {
    pokemon: pokemon_v2_pokemon {
        name
        is_default
        pokemon_species_id
    }
}`;

export async function fetchPokemonNamesWithForms() {
    const cached = readCache(NAMES_WITH_FORMS_CACHE_KEY);
    if (cached) return cached;

    const res = await fetch(GRAPHQL_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: VARIETY_COUNT_QUERY })
    });
    if (!res.ok) throw new Error("Failed to fetch pokemon forms data");

    const { data } = await res.json();
    const names = buildNamesWithForms(data.pokemon);
    writeCache(NAMES_WITH_FORMS_CACHE_KEY, names);
    return names;
}

function buildNamesWithForms(allPokemon) {
    const varietyCounts = {};
    allPokemon.forEach(p => {
        varietyCounts[p.pokemon_species_id] = (varietyCounts[p.pokemon_species_id] ?? 0) + 1;
    });

    return allPokemon
        .filter(p => p.is_default && varietyCounts[p.pokemon_species_id] > 1)
        .map(p => p.name);
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