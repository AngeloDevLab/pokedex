import { initI18n, t } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import {
    bindOpenDialog,
    bindCloseDialog,
    bindDialogNavigation,
    bindLoadMore,
    bindLoadPrevious,
    bindSearchInputs,
    formatSlug
} from '../core/ui.js';
import { loadSearchIndex, applyUrlParams } from '../core/search.js';
import { withLoader } from '../core/pagination.js';

// A few egg-group slugs read awkwardly through formatSlug() alone (no
// space before the trailing digit) — PokéAPI has no localized names for
// egg groups in the `/egg-group` list endpoint itself (only on the
// individual resource, which would mean 15 extra requests just for this
// dropdown), so this is a small manual label fix rather than a fetch.
const EGG_GROUP_LABELS = {
    water1: "Water 1",
    water2: "Water 2",
    water3: "Water 3",
    humanshape: "Human-Like",
    indeterminate: "Amorphous",
    "no-eggs": "Undiscovered"
};

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    bindOpenDialog();
    bindCloseDialog();
    bindDialogNavigation();
    bindLoadMore();
    bindLoadPrevious();
    bindSearchInputs();

    const index = await withLoader(loadSearchIndex);
    populateGenerationSelect();
    populateAbilityOptions(index);
    populateEggGroupSelect(index);

    await applyUrlParams();
}

// ===== FILTER OPTIONS =====
function populateGenerationSelect() {
    const select = document.getElementById("generation-select");

    const options = [`<option value="">${t('searchPanel.allGenerations', null, 'All Generations')}</option>`];
    for (let gen = 1; gen <= 9; gen++) {
        options.push(`<option value="${gen}">${t('searchPanel.generationLabel', null, 'Generation')} ${gen}</option>`);
    }

    select.innerHTML = options.join("");
}

function populateAbilityOptions(index) {
    const abilities = [...new Set(index.flatMap(p => p.abilities))].sort();
    document.getElementById("ability-options").innerHTML = abilities
        .map(a => `<option value="${a}">`)
        .join("");
}

function populateEggGroupSelect(index) {
    const eggGroups = [...new Set(index.flatMap(p => p.eggGroups))].sort();
    const select = document.getElementById("egg-group-select");

    const options = [`<option value="">${t('searchPanel.allEggGroups', null, 'All Egg Groups')}</option>`];
    eggGroups.forEach(group => {
        options.push(`<option value="${group}">${EGG_GROUP_LABELS[group] ?? formatSlug(group)}</option>`);
    });

    select.innerHTML = options.join("");
}
