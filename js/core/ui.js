import { activeList, currentMode, handleSearchInput, handleTypeInput, resetSearch } from './search.js';
import { visibleStart, visibleCount, hasMoreData, loadNext, loadPrevious, pokemonCache } from './pagination.js';
import { openDialog, closeDialog, currentIndex, renderInfoTab, renderStatsTab, renderEvoTab, renderArtworkTab } from './dialog.js';
import { t } from './i18n.js';
import { getPokemonCardTemplate } from './templates.js';

// ===== CONFIG =====
const TYPE_COLORS = {
    fire: "#e62829",
    water: "#2980ef",
    grass: "#3fa129",
    electric: "#fac000",
    poison: "#9141cb",
    bug: "#91a119",
    normal: "#9fa19f",
    ground: "#915121",
    fairy: "#ef70ef",
    fighting: "#ff8000",
    psychic: "#ee3d78",
    rock: "#aea983",
    ghost: "#70416f",
    ice: "#49d9fe",
    dragon: "#5762de",
    dark: "#50413f",
    steel: "#62a2b7",
    flying: "#81b9ef"
};

// dialog.js imports TAB_RENDERER back from here, while this object references
// dialog.js's own render*Tab functions — a circular import, but a safe one:
// function declarations are hoisted, so they're already bound when either
// module's body runs, regardless of which side of the cycle evaluates first.
export const TAB_RENDERER = {
    flavor: renderInfoTab,
    stats: renderStatsTab,
    evo: renderEvoTab,
    artworks: renderArtworkTab
};

const STAT_NAME_FALLBACK = {
    hp: "HP",
    attack: "ATTACK",
    defense: "DEFENSE",
    "special-attack": "SP. ATTACK",
    "special-defense": "SP. DEFENSE",
    speed: "SPEED"
};

const STAT_NAME_KEY = {
    hp: "stats.hp",
    attack: "stats.attack",
    defense: "stats.defense",
    "special-attack": "stats.specialAttack",
    "special-defense": "stats.specialDefense",
    speed: "stats.speed"
};

export const LOAD_MODE = "append"; // "append" | "pagination"

// ===== DATA HELPERS =====
export function getFlavorEntry(species) {
    const entry = species.flavor_text_entries
        .find(e => e.language.name === "en");
    if (!entry) return getDefaultFlavor();

    return {
        text: cleanFlavorText(entry.flavor_text),
        edition: entry.version.name
    };
}

function getDefaultFlavor() {
    return {
        text: t('dialog.flavorFallback', null, 'No description found.'),
        edition: t('dialog.editionUnknown', null, 'Unknown')
    };
}

function cleanFlavorText(text) {
    return text
        .replace(/\f/g, " ")
        .replace(/\n/g, " ");
}

export function prepareStats(pokemon) {
    return pokemon.stats.map(stat => {
        const value = stat.base_stat;

        return {
            name: formatStatName(stat.stat.name),
            value,
            percent: (value / 200) * 100,
            color: getStatColor(value)
        };
    });
}

export function formatStatName(name) {
    return t(STAT_NAME_KEY[name], null, STAT_NAME_FALLBACK[name]);
}

function getStatColor(value) {
    if (value < 50) return "var(--stat-low)";
    if (value < 80) return "var(--stat-mid)";

    return "var(--stat-high)";
}

export function mapEvolutionToPokemon(names) {
    return names.map(name => {
        const pkm = activeList.find(p => p.name === name)
            || pokemonCache.find(p => p.name === name);

        return pkm
            ? {
                name: pkm.name,
                id: pkm.id,
                image: pkm.sprites.other["official-artwork"].front_default
            }
            : { name, id: null, image: null };
    });
}

export function parseEvolutionChain(chain) {
    const result = [];
    let current = chain;

    while (current) {
        result.push(current.species.name);
        current = current.evolves_to[0];
    }

    return result;
}

export function getAbilities(pokemon) {
    return pokemon.abilities.map(a => {
        const name = a.ability.name;

        return a.is_hidden
            ? `${name} (hidden)`
            : name;
    });
}

// ===== UI HELPERS =====
export function getTypes(pokemon) {
    return pokemon.types.map(t => t.type.name);
}

export function getGradient(types) {
    const colors = types.map(t => TYPE_COLORS[t]);

    return colors.length === 1
        ? colors[0]
        : `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
}

export function getTypeIcon(type) {
    return `/assets/icons/types/${type}.png`;
}

export function formatSlug(slug) {
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function getTabContent() {
    return document.getElementById("tab-content");
}

export function showLoader() {
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");
}

export function hideLoader() {
    const loader = document.getElementById("loader");
    loader.classList.add("hidden");
}

// ===== RENDER =====
export function renderPokemonList(list = []) {
    const container = document.getElementById("pokemon-container");
    if (!container) return;

    container.classList.remove("centered");

    const visiblePokemon = getVisiblePokemon(list);
    const html = buildPokemonListHTML(visiblePokemon);

    container.innerHTML = html;
}

function getVisiblePokemon(list) {
    if (LOAD_MODE === "append") return list;

    return list.slice(
        visibleStart,
        visibleStart + visibleCount
    );
}

function buildPokemonListHTML(list) {
    return list
        .map(createPokemonData)
        .filter(Boolean)
        .map(getPokemonCardTemplate)
        .join("");
}

function createPokemonData(pokemon) {
    const types = getTypes(pokemon);

    return {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other["official-artwork"].front_default,
        gradient: getGradient(types),
        types
    };
}

// ===== EVENTS =====
export function bindOpenDialog() {
    const pkmContainer = document.getElementById("pokemon-container");
    pkmContainer.addEventListener("click", handlePokemonClick);
}

function handlePokemonClick(e) {
    const card = getPokemonCard(e);
    if (!card) return;
    const index = getPokemonIndex(card);
    if (index === -1) return;
    openDialog(index);
}

function getPokemonCard(e) {
    return e.target.closest(".pokemon-card");
}

function getPokemonIndex(card) {
    const id = Number(card.dataset.id);
    return activeList.findIndex(p => p.id === id);
}

export function bindCloseDialog() {
    const pkmDialog = document.getElementById("pokemon-dialog");
    pkmDialog.addEventListener("click", handleDialogClick);
    pkmDialog.addEventListener("close", handleDialogClose);
}

function handleDialogClick(e) {
    if (!isCloseButton(e)) return;
    closeDialog();
}

function handleDialogClose() {
    document.body.style.overflow = "auto";
}

function isCloseButton(e) {
    return e.target.closest("#close-dialog-button");
}

export function bindDialogNavigation() {
    const pkmDialog = document.getElementById("pokemon-dialog");
    pkmDialog.addEventListener("click", handleDialogNavigation);
}

function handleDialogNavigation(e) {
    if (isLeftArrow(e)) return previousPokemon();
    if (isRightArrow(e)) return nextPokemon();
}

function isLeftArrow(e) {
    return e.target.closest("#arrow-left");
}

function isRightArrow(e) {
    return e.target.closest("#arrow-right");
}

function previousPokemon() {
    if (currentIndex <= 0) return;
    openDialog(currentIndex - 1);
}

function nextPokemon() {
    if (currentIndex >= activeList.length - 1) return;
    openDialog(currentIndex + 1);
}

// ===== LOAD BUTTON UI =====
export function bindLoadMore() {
    const btn = document.getElementById("load-more-btn");
    if (!btn) return;
    btn.addEventListener("click", loadNext);
}

export function bindLoadPrevious() {
    const btn = document.getElementById("load-previous-btn");
    if (!btn) return;
    btn.addEventListener("click", loadPrevious);
}

export function updateLoadButtons() {
    const prevBtn = document.getElementById("load-previous-btn");
    const nextBtn = document.getElementById("load-more-btn");
    if (!prevBtn || !nextBtn) return;

    const hasNext = checkHasNext();

    if (LOAD_MODE === "append") {
        prevBtn.classList.add("hidden");
    } else {
        const hasPrevious = visibleStart > 0;
        prevBtn.classList.toggle("hidden", !hasPrevious);
    }

    nextBtn.classList.toggle("hidden", !hasNext);
}

function checkHasNext() {
    if (LOAD_MODE === "append") {
        return hasMoreData();
    }

    if (hasMoreVisible()) return true;
    return hasMoreData();
}

function hasMoreVisible() {
    return visibleStart + visibleCount < activeList.length;
}

// ===== SEARCH UI =====
export function bindSearchInputs() {
    const searchInput = document.getElementById("search-name");
    const typeInput = document.getElementById("filter-type");
    const resetBtn = document.getElementById("search-reset");
    resetBtn.addEventListener("click", resetSearch);
    searchInput.addEventListener("input", handleSearchInput);
    typeInput.addEventListener("input", handleTypeInput);
}

export function showSearchWarning(show) {
    const warning = document.getElementById("search-warning");
    warning.classList.toggle("hidden", !show);
}