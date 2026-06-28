// Shared "fetch a Pokémon's full, fully-resolved moveset" logic — used by
// learnset-page.js (shows everything, grouped by learn method) and
// damage-calc-page.js (filters to damage-dealing moves for the move picker).
import { fetchMoveByUrl } from './api.js';

export async function fetchMoveset(pokemon) {
    const entries = pokemon.moves.map(moveEntry => ({
        moveEntry,
        latest: getLatestLearnDetail(moveEntry)
    }));

    const moves = await Promise.all(
        entries.map(({ moveEntry }) => fetchMoveByUrl(moveEntry.move.url))
    );

    return entries.map(({ latest }, i) => ({
        move: moves[i],
        method: latest.move_learn_method.name,
        level: latest.level_learned_at
    }));
}

function getLatestLearnDetail(moveEntry) {
    const details = moveEntry.version_group_details;
    return details[details.length - 1];
}
