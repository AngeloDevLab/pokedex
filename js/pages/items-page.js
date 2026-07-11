import { initI18n, t, getCurrentLang } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { withLoader } from '../core/pagination.js';
import { fetchItemList } from '../core/api.js';
import { formatSlug } from '../core/ui.js';

const SMOGON_ITEMS_BASE = "https://www.smogon.com/dex/sv/items";

// Real PokéAPI item-categories, grouped into the coarser buckets shown in
// the category filter/section headers — see api.js's ITEM_CATEGORIES
// comment for why these categories (and not the ~2200 total items) were
// picked in the first place.
const CATEGORY_GROUPS = {
    "held-items": "general",
    "bad-held-items": "general",
    choice: "choice",
    other: "berries",
    "type-protection": "berries",
    "in-a-pinch": "berries",
    "picky-healing": "berries",
    medicine: "berries",
    "type-enhancement": "typeEnhancement",
    plates: "plates",
    "species-specific": "speciesSpecific",
    "mega-stones": "megaStones",
    "z-crystals": "zCrystals",
    jewels: "jewels",
    memories: "memories",
    "effort-training": "effortTraining"
};

const GROUP_ORDER = [
    "general", "choice", "berries", "typeEnhancement", "plates",
    "speciesSpecific", "megaStones", "zCrystals", "jewels", "memories", "effortTraining"
];

// Hand-picked, well-known competitive singles/VGC staples — highlighted
// with a badge so the list isn't just an undifferentiated wall of ~300
// items. Every slug verified to exist and fall into one of the categories
// above (see Session 13 research), not guessed.
const HIGHLIGHTED_ITEMS = new Set([
    "choice-band", "choice-specs", "choice-scarf", "life-orb", "leftovers",
    "rocky-helmet", "eviolite", "assault-vest", "focus-sash",
    "heavy-duty-boots", "weakness-policy", "black-sludge"
]);

let allItems = [];
let currentSearch = "";
let currentGroup = "all";

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    renderCategoryOptions();
    bindControls();

    allItems = await withLoader(fetchItemList);
    renderItems();
}

function bindControls() {
    document.getElementById("item-search").addEventListener("input", handleSearchInput);
    document.getElementById("item-category-select").addEventListener("change", handleCategoryChange);
    document.getElementById("items-result").addEventListener("click", handleItemsClick);
}

function handleSearchInput(e) {
    currentSearch = e.target.value.trim().toLowerCase();
    renderItems();
}

function handleCategoryChange(e) {
    currentGroup = e.target.value;
    renderItems();
}

function handleItemsClick(e) {
    const toggle = e.target.closest(".item-row-toggle");
    if (!toggle) return;

    toggle.closest(".item-row").querySelector(".item-details").classList.toggle("hidden");
    toggle.classList.toggle("open");
}

// ===== RENDER =====
function renderCategoryOptions() {
    const select = document.getElementById("item-category-select");
    select.innerHTML = [
        `<option value="all">${t('items.categoryAll', null, 'All Categories')}</option>`,
        ...GROUP_ORDER.map(group => `<option value="${group}">${getGroupLabel(group)}</option>`)
    ].join("");
}

function getGroupLabel(group) {
    return t(`items.categories.${group}`, null, formatSlug(group));
}

function renderItems() {
    const container = document.getElementById("items-result");
    const filtered = allItems.filter(matchesFilters);

    if (!filtered.length) {
        container.innerHTML = `<p class="no-results">${t('results.noResults', null, 'No results found')}</p>`;
        return;
    }

    const groups = groupItems(filtered);
    container.innerHTML = GROUP_ORDER
        .filter(group => groups[group]?.length)
        .map(group => renderGroup(group, groups[group]))
        .join("");
}

function matchesFilters(item) {
    const group = CATEGORY_GROUPS[item.category];
    if (currentGroup !== "all" && group !== currentGroup) return false;
    if (!currentSearch) return true;

    return getItemName(item).toLowerCase().includes(currentSearch);
}

function groupItems(items) {
    const groups = {};
    items.forEach(item => {
        const group = CATEGORY_GROUPS[item.category];
        (groups[group] ??= []).push(item);
    });
    return groups;
}

function renderGroup(group, items) {
    return `
        <section class="items-group">
            <h2>${getGroupLabel(group)}</h2>
            <ul class="items-list">
                ${items.map(renderItemRow).join("")}
            </ul>
        </section>
    `;
}

function renderItemRow(item) {
    const highlighted = HIGHLIGHTED_ITEMS.has(item.name);

    return `
        <li class="item-row ${highlighted ? "highlighted" : ""}">
            <button type="button" class="item-row-toggle">
                ${item.sprite ? `<img class="item-icon" src="${item.sprite}" alt="${getItemName(item)}">` : ""}
                <span class="item-name">${getItemName(item)}</span>
                ${highlighted ? `<span class="item-badge">${t('items.highlightBadge', null, 'Popular')}</span>` : ""}
                <svg class="item-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>

            <div class="item-details hidden">
                <p class="item-effect">${item.effect ?? ""}</p>
                <a href="${SMOGON_ITEMS_BASE}/${item.name}/" target="_blank" rel="noopener noreferrer" class="load-btn">
                    ${t('items.viewOnSmogon', null, 'View on Smogon')}
                </a>
            </div>
        </li>
    `;
}

function getItemName(item) {
    const lang = getCurrentLang();
    return item.names[lang] ?? item.names.en ?? formatSlug(item.name);
}
