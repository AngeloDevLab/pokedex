// Shared Pokémon picker for the tool pages (stats calculator, type matchup,
// learnset, damage calculator, breeding guide, competitive, forms & megas)
// — datalist-backed name input, ?<queryParam>= deep-link resolution
// (defaults to "pokemon"; the damage calculator uses two instances on one
// page, so its defender picker passes queryParam: "defender" to avoid
// colliding with the attacker's), no error UI for an unmatched/stale name
// (just leaves the picker as-is).
import { fetchAllPokemonList, fetchPokemonByUrl } from './api.js';
import { withLoader } from './pagination.js';

// `filterNames` (optional Set/array of names) only narrows the visible
// autocomplete *suggestions* — exact typed matches and the ?<queryParam>=
// deep-link still resolve against the full list regardless, so e.g. the
// dialog's "Open Forms & Megas" link still works (and correctly shows a
// "no alternate forms" message) for a Pokémon that didn't make the
// suggestion list.
export async function initPokemonPicker({ inputId, datalistId, onSelect, queryParam = "pokemon", filterNames }) {
    const data = await withLoader(fetchAllPokemonList);
    const allPokemon = data.results;

    const suggestions = filterNames
        ? allPokemon.filter(p => filterNames.has(p.name))
        : allPokemon;

    const datalist = document.getElementById(datalistId);
    datalist.innerHTML = suggestions.map(p => `<option value="${p.name}">`).join("");

    const input = document.getElementById(inputId);
    input.addEventListener("change", () => handleChange(input.value));

    async function handleChange(name) {
        const match = findPokemonByName(allPokemon, name);
        if (!match) return;

        await withLoader(async () => {
            const pokemon = await fetchPokemonByUrl(match.url);
            onSelect(pokemon);
        });
    }

    const queryName = new URLSearchParams(location.search).get(queryParam);
    if (!queryName) return;

    const match = findPokemonByName(allPokemon, queryName);
    if (!match) return;

    input.value = match.name;
    await handleChange(match.name);
}

function findPokemonByName(list, name) {
    const normalized = name.trim().toLowerCase();
    return list.find(p => p.name === normalized);
}
