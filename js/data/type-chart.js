// Static type effectiveness chart (current gen, post-Fairy) — defending-type
// perspective: each type lists which attacking types are super effective
// (weak, x2), not very effective (resist, x0.5), or have no effect (immune,
// x0) against it. Never changes.
export const TYPE_CHART = {
    normal: { weak: ["fighting"], resist: [], immune: ["ghost"] },
    fire: { weak: ["water", "ground", "rock"], resist: ["fire", "grass", "ice", "bug", "steel", "fairy"], immune: [] },
    water: { weak: ["electric", "grass"], resist: ["fire", "water", "ice", "steel"], immune: [] },
    electric: { weak: ["ground"], resist: ["electric", "flying", "steel"], immune: [] },
    grass: { weak: ["fire", "ice", "poison", "flying", "bug"], resist: ["water", "electric", "grass", "ground"], immune: [] },
    ice: { weak: ["fire", "fighting", "rock", "steel"], resist: ["ice"], immune: [] },
    fighting: { weak: ["flying", "psychic", "fairy"], resist: ["bug", "rock", "dark"], immune: [] },
    poison: { weak: ["ground", "psychic"], resist: ["grass", "fighting", "poison", "bug", "fairy"], immune: [] },
    ground: { weak: ["water", "grass", "ice"], resist: ["poison", "rock"], immune: ["electric"] },
    flying: { weak: ["electric", "ice", "rock"], resist: ["grass", "fighting", "bug"], immune: ["ground"] },
    psychic: { weak: ["bug", "ghost", "dark"], resist: ["fighting", "psychic"], immune: [] },
    bug: { weak: ["fire", "flying", "rock"], resist: ["grass", "fighting", "ground"], immune: [] },
    rock: { weak: ["water", "grass", "fighting", "ground", "steel"], resist: ["normal", "fire", "poison", "flying"], immune: [] },
    ghost: { weak: ["ghost", "dark"], resist: ["poison", "bug"], immune: ["normal", "fighting"] },
    dragon: { weak: ["ice", "dragon", "fairy"], resist: ["fire", "water", "electric", "grass"], immune: [] },
    dark: { weak: ["fighting", "bug", "fairy"], resist: ["ghost", "dark"], immune: ["psychic"] },
    steel: { weak: ["fire", "fighting", "ground"], resist: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"], immune: ["poison"] },
    fairy: { weak: ["poison", "steel"], resist: ["fighting", "bug", "dark"], immune: ["dragon"] }
};

export const ALL_TYPES = Object.keys(TYPE_CHART);

export function getMultiplier(attackingType, defendingType) {
    const chart = TYPE_CHART[defendingType];
    if (chart.immune.includes(attackingType)) return 0;
    if (chart.weak.includes(attackingType)) return 2;
    if (chart.resist.includes(attackingType)) return 0.5;
    return 1;
}

export function getDualTypeMultiplier(attackingType, defendingTypes) {
    return defendingTypes.reduce(
        (multiplier, defendingType) => multiplier * getMultiplier(attackingType, defendingType),
        1
    );
}
