// Final-stat formula at level 100 (fixed — competitive convention, no level input).
export function calculateStat({ base, iv, ev, natureMultiplier, isHp }) {
    const raw = 2 * base + iv + Math.floor(ev / 4);

    if (isHp) {
        return raw + 110;
    }

    return Math.floor((raw + 5) * natureMultiplier);
}
