// Static nature data — 25 natures, each boosting one stat by ×1.1 and
// lowering another by ×0.9 (or neutral on all stats). Shared because
// Session 9 (Breeding Guide) needs the same "all 25 natures" table.
export const NATURES = [
    { name: "Hardy", increased: null, decreased: null },
    { name: "Lonely", increased: "attack", decreased: "defense" },
    { name: "Brave", increased: "attack", decreased: "speed" },
    { name: "Adamant", increased: "attack", decreased: "special-attack" },
    { name: "Naughty", increased: "attack", decreased: "special-defense" },
    { name: "Bold", increased: "defense", decreased: "attack" },
    { name: "Docile", increased: null, decreased: null },
    { name: "Relaxed", increased: "defense", decreased: "speed" },
    { name: "Impish", increased: "defense", decreased: "special-attack" },
    { name: "Lax", increased: "defense", decreased: "special-defense" },
    { name: "Timid", increased: "speed", decreased: "attack" },
    { name: "Hasty", increased: "speed", decreased: "defense" },
    { name: "Serious", increased: null, decreased: null },
    { name: "Jolly", increased: "speed", decreased: "special-attack" },
    { name: "Naive", increased: "speed", decreased: "special-defense" },
    { name: "Modest", increased: "special-attack", decreased: "attack" },
    { name: "Mild", increased: "special-attack", decreased: "defense" },
    { name: "Quiet", increased: "special-attack", decreased: "speed" },
    { name: "Bashful", increased: null, decreased: null },
    { name: "Rash", increased: "special-attack", decreased: "special-defense" },
    { name: "Calm", increased: "special-defense", decreased: "attack" },
    { name: "Gentle", increased: "special-defense", decreased: "defense" },
    { name: "Sassy", increased: "special-defense", decreased: "speed" },
    { name: "Careful", increased: "special-defense", decreased: "special-attack" },
    { name: "Quirky", increased: null, decreased: null }
];

export function getNatureMultiplier(nature, statKey) {
    if (!nature) return 1;
    if (nature.increased === statKey) return 1.1;
    if (nature.decreased === statKey) return 0.9;
    return 1;
}
