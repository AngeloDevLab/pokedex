import { initI18n, t } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { initPokemonPicker } from '../core/pokemon-picker.js';
import { withLoader } from '../core/pagination.js';
import { fetchSmogonTiers } from '../core/api.js';

const SMOGON_DEX_BASE = "https://www.smogon.com/dex/sv/pokemon";

// Ordered strongest to weakest. Described by position in the tier hierarchy
// rather than claiming a literal expansion for every abbreviation — some
// (e.g. "PU") don't have a settled official full name, so a wrong guess
// there would be worse than just explaining what the tier means.
const TIER_LEGEND = [
    { code: "AG", key: "ag" },
    { code: "Uber", key: "uber" },
    { code: "OU", key: "ou" },
    { code: "UUBL", key: "uubl" },
    { code: "UU", key: "uu" },
    { code: "RUBL", key: "rubl" },
    { code: "RU", key: "ru" },
    { code: "NUBL", key: "nubl" },
    { code: "NU", key: "nu" },
    { code: "PUBL", key: "publ" },
    { code: "PU", key: "pu" },
    { code: "ZUBL", key: "zubl" },
    { code: "ZU", key: "zu" },
    { code: "NFE", key: "nfe" },
    { code: "LC", key: "lc" },
    { code: "CAP", key: "cap" }
];

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    renderTierLegend();
    await initPokemonPicker({
        inputId: "pokemon-picker",
        datalistId: "pokemon-options",
        onSelect: selectPokemon
    });
}

async function selectPokemon(pokemon) {
    const tiers = await withLoader(fetchSmogonTiers);
    renderTier(pokemon, tiers[pokemon.name] ?? null);
}

// ===== RENDER =====
function renderTier(pokemon, entry) {
    document.getElementById("competitive-result").classList.remove("hidden");

    const badge = document.getElementById("tier-badge");
    const note = document.getElementById("tier-note");
    const isRanked = entry?.tier && entry.tier !== "Illegal";

    if (isRanked) {
        badge.textContent = entry.tier;
        note.classList.add("hidden");
    } else if (entry?.natDexTier) {
        badge.textContent = entry.natDexTier;
        note.textContent = t('competitive.nationalDexNote', { tier: entry.natDexTier }, `National Dex tier: ${entry.natDexTier}`);
        note.classList.remove("hidden");
    } else {
        badge.textContent = t('competitive.tierNotRanked', null, 'Not ranked');
        note.classList.add("hidden");
    }

    badge.className = `tier-badge ${isRanked || entry?.natDexTier ? "tier-ranked" : "tier-unranked"}`;

    document.getElementById("smogon-link").href = `${SMOGON_DEX_BASE}/${pokemon.name}/`;
}

function renderTierLegend() {
    const list = document.getElementById("tier-legend-list");
    list.innerHTML = TIER_LEGEND.map(({ code, key }) => `
        <li class="tier-legend-row">
            <span class="tier-legend-code">${code}</span>
            <span class="tier-legend-desc">${t(`competitive.legend.${key}`, null, code)}</span>
        </li>
    `).join("");
}
