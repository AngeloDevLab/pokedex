import { initI18n, t, getCurrentLang } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { withLoader } from '../core/pagination.js';
import { fetchAbilityList, fetchAbilityByUrl } from '../core/api.js';
import { formatSlug } from '../core/ui.js';

// Hand-picked, well-known competitive staples — highlighted with a badge
// so the list isn't just an undifferentiated wall of ~300 abilities.
// Every slug verified to exist against the live API (Session 16 research),
// not guessed. Same pattern as items-page.js's HIGHLIGHTED_ITEMS.
const HIGHLIGHTED_ABILITIES = new Set([
    "speed-boost", "intimidate", "levitate", "multiscale", "regenerator",
    "protean", "libero", "prankster", "wonder-guard", "huge-power",
    "drizzle", "drought", "sand-stream", "moxie"
]);

let allAbilities = [];
let currentSearch = "";

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    document.getElementById("ability-search").addEventListener("input", handleSearchInput);
    document.getElementById("abilities-result").addEventListener("click", handleAbilitiesClick);

    allAbilities = await withLoader(fetchAbilityList);
    renderAbilities();
}

function handleSearchInput(e) {
    currentSearch = e.target.value.trim().toLowerCase();
    renderAbilities();
}

// ===== RENDER (list) =====
function renderAbilities() {
    const container = document.getElementById("abilities-result");
    const filtered = allAbilities.filter(a => getAbilityName(a).toLowerCase().includes(currentSearch));

    if (!filtered.length) {
        container.innerHTML = `<p class="no-results">${t('results.noResults', null, 'No results found')}</p>`;
        return;
    }

    container.innerHTML = `<ul class="items-list">${filtered.map(renderAbilityRow).join("")}</ul>`;
}

function renderAbilityRow(ability) {
    const highlighted = HIGHLIGHTED_ABILITIES.has(ability.name);

    return `
        <li class="item-row ${highlighted ? "highlighted" : ""}" data-ability-id="${ability.id}">
            <button type="button" class="item-row-toggle">
                <span class="item-name">${getAbilityName(ability)}</span>
                <span class="move-quick-stats">${t('abilities.usedBy', { count: ability.pokemonCount }, `${ability.pokemonCount} Pokémon`)}</span>
                ${highlighted ? `<span class="item-badge">${t('abilities.highlightBadge', null, 'Popular')}</span>` : ""}
                <svg class="item-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>

            <div class="item-details hidden">
                <p class="item-effect">${ability.effect ?? ""}</p>
            </div>
        </li>
    `;
}

function getAbilityName(ability) {
    const lang = getCurrentLang();
    return ability.names[lang] ?? ability.names.en ?? formatSlug(ability.name);
}

// ===== EXPAND/COLLAPSE (lazy detail fetch: which Pokémon have it) =====
async function handleAbilitiesClick(e) {
    const toggle = e.target.closest(".item-row-toggle");
    if (!toggle) return;

    const details = toggle.nextElementSibling;
    details.classList.toggle("hidden");
    if (details.classList.contains("hidden") || details.dataset.loaded) return;

    details.dataset.loaded = "true";
    const row = toggle.closest(".item-row");
    const ability = allAbilities.find(a => String(a.id) === row.dataset.abilityId);

    await withLoader(async () => {
        const fullAbility = await fetchAbilityByUrl(ability.url);
        details.insertAdjacentHTML("beforeend", renderHasAbility(fullAbility));
    });
}

function renderHasAbility(ability) {
    const names = ability.pokemon.map(p => formatSlug(p.pokemon.name)).sort();

    return `
        <div class="move-learned-by">
            <h4>${t('abilities.hasAbility', { count: names.length }, `${names.length} Pokémon have this ability`)}</h4>
            <div class="learned-by-list">
                ${names.map(name => `<span class="learned-by-badge">${name}</span>`).join("")}
            </div>
        </div>
    `;
}
