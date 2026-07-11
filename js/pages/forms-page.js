import { initI18n, t, getCurrentLang } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { initPokemonPicker } from '../core/pokemon-picker.js';
import { withLoader } from '../core/pagination.js';
import { getPokemonSpecies, fetchPokemonByUrl, fetchPokemonForm, fetchPokemonNamesWithForms } from '../core/api.js';
import { getTypes, getTypeIcon, getAbilities, prepareStats, formatSlug } from '../core/ui.js';

let variants = [];
let selectedIndex = 0;

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    const namesWithForms = await withLoader(fetchPokemonNamesWithForms);
    await initPokemonPicker({
        inputId: "pokemon-picker",
        datalistId: "pokemon-options",
        onSelect: selectPokemon,
        filterNames: new Set(namesWithForms)
    });
}

async function selectPokemon(pokemon) {
    await withLoader(async () => {
        variants = await loadVariants(pokemon);
        selectedIndex = Math.max(0, variants.findIndex(v => v.pokemon.name === pokemon.name));
        renderPage();
    });
}

// Every variety of a species (regional forms, Megas, Gigantamax forms, ...)
// is its own /pokemon resource in PokéAPI, linked from the species' own
// `varieties` array; is_mega/is_battle_only/form_name come from the
// separate /pokemon-form resource each variety points to via `.forms[0]`.
async function loadVariants(pokemon) {
    const species = await getPokemonSpecies(pokemon.species.url);

    return Promise.all(species.varieties.map(async variety => {
        const variantPokemon = variety.pokemon.url === pokemon.url
            ? pokemon
            : await fetchPokemonByUrl(variety.pokemon.url);

        const form = await fetchPokemonForm(variantPokemon.forms[0].url);

        return {
            pokemon: variantPokemon,
            form,
            isDefault: variety.is_default,
            isMega: form.is_mega,
            isGmax: form.form_name === "gmax"
        };
    }));
}

// ===== RENDER =====
function renderPage() {
    const hasAlternateForms = variants.length > 1;

    document.getElementById("forms-result").classList.remove("hidden");
    document.getElementById("no-forms-message").classList.toggle("hidden", hasAlternateForms);
    document.getElementById("forms-detail").classList.toggle("hidden", !hasAlternateForms);

    if (!hasAlternateForms) return;

    renderVariantSelector();
    renderVariantDetail();
}

function renderVariantSelector() {
    const nav = document.getElementById("variant-selector");
    nav.classList.remove("hidden");
    nav.innerHTML = variants.map((variant, index) => `
        <button type="button" class="variant-btn ${index === selectedIndex ? "active" : ""}" data-index="${index}">
            ${getVariantLabel(variant)}
        </button>
    `).join("");

    nav.querySelectorAll(".variant-btn").forEach(btn => {
        btn.addEventListener("click", () => handleVariantClick(btn));
    });
}

function handleVariantClick(btn) {
    selectedIndex = Number(btn.dataset.index);
    btn.parentElement.querySelectorAll(".variant-btn")
        .forEach(b => b.classList.toggle("active", b === btn));
    renderVariantDetail();
}

function getVariantLabel(variant) {
    return variant.isDefault
        ? t('forms.standardForm', null, 'Standard')
        : getFormName(variant.form);
}

function getFormName(form) {
    const lang = getCurrentLang();
    const localized = form.names.find(n => n.language.name === lang)
        ?? form.names.find(n => n.language.name === "en");

    return localized ? localized.name : formatSlug(form.form_name || form.name);
}

function renderVariantDetail() {
    const variant = variants[selectedIndex];
    const defaultVariant = variants.find(v => v.isDefault) ?? variants[0];

    document.getElementById("form-name").textContent = variant.isDefault
        ? formatSlug(variant.pokemon.name)
        : getFormName(variant.form);

    renderBadges(variant);
    document.getElementById("gmax-note").classList.toggle("hidden", !variant.isGmax);

    document.getElementById("form-types").innerHTML = getTypes(variant.pokemon)
        .map(type => `<img src="${getTypeIcon(type)}" alt="${type}">`)
        .join("");

    document.getElementById("form-abilities").textContent = getAbilities(variant.pokemon).join(", ");

    renderStatsComparison(variant, defaultVariant);
}

function renderBadges(variant) {
    const badges = [];
    if (variant.isMega) badges.push(t('forms.megaBadge', null, 'Mega Evolution'));
    if (variant.isGmax) badges.push(t('forms.gmaxBadge', null, 'Gigantamax'));
    if (variant.form.is_battle_only && !variant.isMega && !variant.isGmax) {
        badges.push(t('forms.battleOnlyBadge', null, 'Battle only'));
    }

    document.getElementById("form-badges").innerHTML = badges
        .map(label => `<span class="form-badge">${label}</span>`)
        .join("");
}

function renderStatsComparison(variant, defaultVariant) {
    const stats = prepareStats(variant.pokemon);
    const baseStats = prepareStats(defaultVariant.pokemon);
    const showDiff = variant !== defaultVariant;

    document.getElementById("form-stats").innerHTML = stats.map((stat, index) => `
        <li class="stat-row">
            <div class="stat-header">
                <span class="stat-name">${stat.name}</span>
                <span class="stat-value">${stat.value}${getDiffMarkup(showDiff, stat.value - baseStats[index].value)}</span>
            </div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${stat.percent}%; background: ${stat.color}"></div>
            </div>
        </li>
    `).join("");
}

function getDiffMarkup(showDiff, delta) {
    if (!showDiff || delta === 0) return "";

    const cssClass = delta > 0 ? "forms-stat-up" : "forms-stat-down";
    const sign = delta > 0 ? "+" : "";
    return ` <span class="${cssClass}">(${sign}${delta})</span>`;
}
