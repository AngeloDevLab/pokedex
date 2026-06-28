// Damage formula at level 100 (fixed — same competitive convention as
// stat-formula.js, no level input). Modifier is intentionally limited to
// STAB + type effectiveness + the official 85-100% random roll — no
// items/abilities/weather, since none of those exist anywhere in this
// project yet.
const LEVEL = 100;

export function calculateDamageRange({ attackStat, defenseStat, basePower, stab, typeMultiplier }) {
    const levelFactor = Math.floor((2 * LEVEL) / 5 + 2);
    const baseDamage = Math.floor(
        (levelFactor * (attackStat / defenseStat) * basePower) / 50 + 2
    );

    const modifier = stab * typeMultiplier;

    return {
        min: Math.floor(baseDamage * modifier * 0.85),
        max: Math.floor(baseDamage * modifier * 1.00)
    };
}

export function getHitsToKO(damage, hp) {
    if (damage <= 0) return Infinity;
    return Math.ceil(hp / damage);
}
