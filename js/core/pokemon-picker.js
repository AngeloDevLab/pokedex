// Shared Pokémon picker for the tool pages (stats calculator, type matchup,
// and the future learnset/breeding/competitive/shiny pages per TODO.md) —
// datalist-backed name input, ?pokemon= deep-link resolution, no error UI
// for an unmatched/stale name (just leaves the picker as-is).
import { fetchAllPokemonList, fetchPokemonByUrl } from './api.js';
import { withLoader } from './pagination.js';

export async function initPokemonPicker({ inputId, datalistId, onSelect }) {
    const data = await withLoader(fetchAllPokemonList);
    const allPokemon = data.results;

    const datalist = document.getElementById(datalistId);
    datalist.innerHTML = allPokemon.map(p => `<option value="${p.name}">`).join("");

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

    const queryName = new URLSearchParams(location.search).get("pokemon");
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
