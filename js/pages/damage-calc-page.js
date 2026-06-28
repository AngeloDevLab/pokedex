import { initI18n, t } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { initPokemonPicker } from '../core/pokemon-picker.js';
import { fetchMoveset } from '../core/moveset.js';
import { getTypes, formatStatName } from '../core/ui.js';
import { NATURES, getNatureMultiplier } from '../data/natures.js';
import { calculateStat } from '../data/stat-formula.js';
import { getDualTypeMultiplier } from '../data/type-chart.js';
import { calculateDamageRange, getHitsToKO } from '../data/damage-formula.js';

// ===== STATE =====
let attackerPokemon = null;
let attackerMoveset = [];
let selectedMove = null;
let attackerNature = NATURES[0];
let attackerIv = 31;
let attackerEv = 0;

let defenderPokemon = null;
let defenderNature = NATURES[0];
let defenderHpIv = 31;
let defenderHpEv = 0;
let defenderDefIv = 31;
let defenderDefEv = 0;

const SIDE_STATE = {
    attacker: {
        getIv: () => attackerIv, setIv: v => { attackerIv = v; },
        getEv: () => attackerEv, setEv: v => { attackerEv = v; },
        getPokemon: () => attackerPokemon, getNature: () => attackerNature
    },
    "defender-hp": {
        getIv: () => defenderHpIv, setIv: v => { defenderHpIv = v; },
        getEv: () => defenderHpEv, setEv: v => { defenderHpEv = v; },
        getPokemon: () => defenderPokemon, getNature: () => defenderNature
    },
    "defender-def": {
        getIv: () => defenderDefIv, setIv: v => { defenderDefIv = v; },
        getEv: () => defenderDefEv, setEv: v => { defenderDefEv = v; },
        getPokemon: () => defenderPokemon, getNature: () => defenderNature
    }
};

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    populateNatureSelect("attacker-nature-select");
    populateNatureSelect("defender-nature-select");
    bindNatureSelects();
    bindMoveSelect();
    bindStatInputs();

    await initPokemonPicker({
        inputId: "attacker-picker",
        datalistId: "attacker-options",
        onSelect: selectAttacker
    });

    await initPokemonPicker({
        inputId: "defender-picker",
        datalistId: "defender-options",
        onSelect: selectDefender,
        queryParam: "defender"
    });
}

// ===== HELPERS =====
function getBaseStat(pokemon, key) {
    return pokemon.stats.find(s => s.stat.name === key).base_stat;
}

function computeStatValue(pokemon, key, iv, ev, nature) {
    const isHp = key === "hp";
    const multiplier = isHp ? 1 : getNatureMultiplier(nature, key);
    return calculateStat({ base: getBaseStat(pokemon, key), iv, ev, natureMultiplier: multiplier, isHp });
}

function getAttackCategory() {
    return selectedMove.damage_class.name === "physical" ? "attack" : "special-attack";
}

function getDefenseCategory() {
    return selectedMove.damage_class.name === "physical" ? "defense" : "special-defense";
}

function toInt(value) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? 0 : n;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getMoveName(move) {
    const localized = move.names.find(n => n.language.name === "en");
    return localized ? localized.name : move.name;
}

// ===== NATURE =====
function populateNatureSelect(id) {
    const select = document.getElementById(id);
    select.innerHTML = NATURES.map((nature, i) => `<option value="${i}">${nature.name}</option>`).join("");
}

function bindNatureSelects() {
    document.getElementById("attacker-nature-select").addEventListener("change", e => {
        attackerNature = NATURES[Number(e.target.value)];
        recalcAttackerStat();
        updateResult();
    });
    document.getElementById("defender-nature-select").addEventListener("change", e => {
        defenderNature = NATURES[Number(e.target.value)];
        recalcDefenderStats();
        updateResult();
    });
}

// ===== ATTACKER =====
async function selectAttacker(pokemon) {
    attackerPokemon = pokemon;
    selectedMove = null;
    attackerIv = 31;
    attackerEv = 0;

    document.getElementById("attacker-stat-list").classList.add("hidden");
    document.getElementById("attacker-nature-group").classList.add("hidden");
    document.getElementById("move-picker-group").classList.remove("hidden");

    attackerMoveset = (await fetchMoveset(pokemon))
        .filter(entry => entry.move.power != null)
        .sort((a, b) => getMoveName(a.move).localeCompare(getMoveName(b.move)));

    const select = document.getElementById("move-select");
    select.innerHTML = `<option value="" disabled selected>${t('damageCalc.selectMove', null, 'Select a move')}</option>` +
        attackerMoveset.map((entry, i) => `<option value="${i}">${getMoveName(entry.move)}</option>`).join("");

    updateResult();
}

function bindMoveSelect() {
    document.getElementById("move-select").addEventListener("change", e => {
        const index = Number(e.target.value);
        selectedMove = attackerMoveset[index]?.move ?? null;
        if (!selectedMove) return;

        document.getElementById("attacker-nature-group").classList.remove("hidden");
        renderAttackerStat();
        if (defenderPokemon) renderDefenderStats();
        updateResult();
    });
}

function renderAttackerStat() {
    const key = getAttackCategory();
    const list = document.getElementById("attacker-stat-list");
    list.innerHTML = renderStatRow({ side: "attacker", key, iv: attackerIv, ev: attackerEv });
    list.classList.remove("hidden");
    recalcAttackerStat();
}

function recalcAttackerStat() {
    if (!selectedMove) return;
    recalcStatRow("attacker", getAttackCategory());
}

// ===== DEFENDER =====
function selectDefender(pokemon) {
    defenderPokemon = pokemon;
    defenderHpIv = 31;
    defenderHpEv = 0;
    defenderDefIv = 31;
    defenderDefEv = 0;

    document.getElementById("defender-nature-group").classList.remove("hidden");
    renderDefenderStats();
    updateResult();
}

function renderDefenderStats() {
    const defKey = selectedMove ? getDefenseCategory() : "defense";
    const list = document.getElementById("defender-stat-list");
    list.innerHTML =
        renderStatRow({ side: "defender-hp", key: "hp", iv: defenderHpIv, ev: defenderHpEv }) +
        renderStatRow({ side: "defender-def", key: defKey, iv: defenderDefIv, ev: defenderDefEv });
    list.classList.remove("hidden");
    recalcDefenderStats();
}

function recalcDefenderStats() {
    if (!defenderPokemon) return;
    const defKey = selectedMove ? getDefenseCategory() : "defense";
    recalcStatRow("defender-hp", "hp");
    recalcStatRow("defender-def", defKey);
}

// ===== STAT ROW (shared markup, reused from the Stats Calculator's visual language) =====
function renderStatRow({ side, key, iv, ev }) {
    return `
        <li class="stat-row" data-side="${side}" data-stat-key="${key}">
            <div class="stat-header">
                <span class="stat-name">${formatStatName(key)}</span>
                <span class="stat-value">0</span>
            </div>
            <div class="stat-inputs">
                <label class="stat-input-label">
                    <span>${t('statsCalc.iv', null, 'IV')}</span>
                    <input type="number" class="iv-input" min="0" max="31" value="${iv}" data-side="${side}" data-input="iv">
                </label>
                <label class="stat-input-label">
                    <span>${t('statsCalc.ev', null, 'EV')}</span>
                    <input type="number" class="ev-input" min="0" max="252" value="${ev}" data-side="${side}" data-input="ev">
                </label>
            </div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: 0%"></div>
            </div>
        </li>
    `;
}

function recalcStatRow(side, key) {
    const state = SIDE_STATE[side];
    const pokemon = state.getPokemon();
    if (!pokemon) return;

    const row = document.querySelector(`.stat-row[data-side="${side}"]`);
    if (!row) return;

    const value = computeStatValue(pokemon, key, state.getIv(), state.getEv(), state.getNature());
    row.querySelector(".stat-value").textContent = value;
    row.querySelector(".stat-fill").style.width = `${Math.min((value / 500) * 100, 100)}%`;
}

function bindStatInputs() {
    document.getElementById("attacker-stat-list").addEventListener("input", handleStatInput);
    document.getElementById("defender-stat-list").addEventListener("input", handleStatInput);
}

function handleStatInput(e) {
    const input = e.target;
    const side = input.dataset.side;
    const kind = input.dataset.input;
    if (!side || !kind) return;

    const state = SIDE_STATE[side];
    const max = kind === "iv" ? 31 : 252;
    const value = clamp(toInt(input.value), 0, max);
    input.value = value;

    if (kind === "iv") state.setIv(value); else state.setEv(value);

    if (side === "attacker") recalcAttackerStat();
    else recalcDefenderStats();

    updateResult();
}

// ===== RESULT =====
function updateResult() {
    const resultEl = document.getElementById("damage-result");

    if (!attackerPokemon || !defenderPokemon || !selectedMove) {
        resultEl.classList.add("hidden");
        return;
    }

    const attackKey = getAttackCategory();
    const defKey = getDefenseCategory();

    const attackStat = computeStatValue(attackerPokemon, attackKey, attackerIv, attackerEv, attackerNature);
    const defenseStat = computeStatValue(defenderPokemon, defKey, defenderDefIv, defenderDefEv, defenderNature);
    const hp = computeStatValue(defenderPokemon, "hp", defenderHpIv, defenderHpEv, defenderNature);

    const stab = getTypes(attackerPokemon).includes(selectedMove.type.name) ? 1.5 : 1;
    const typeMultiplier = getDualTypeMultiplier(selectedMove.type.name, getTypes(defenderPokemon));

    resultEl.classList.remove("hidden");

    const breakdownEl = document.getElementById("damage-breakdown");
    const rangeEl = document.getElementById("damage-range");
    const badge = document.getElementById("hko-badge");

    breakdownEl.textContent =
        `${t('damageCalc.stab', null, 'STAB')} ×${stab} · ${t('damageCalc.typeEffectiveness', null, 'Type')} ×${typeMultiplier}`;

    if (typeMultiplier === 0) {
        rangeEl.textContent = t('damageCalc.noEffect', null, 'No effect');
        badge.textContent = "";
        badge.className = "hko-badge";
        return;
    }

    const { min, max } = calculateDamageRange({
        attackStat, defenseStat, basePower: selectedMove.power, stab, typeMultiplier
    });
    const minPercent = Math.round((min / hp) * 100);
    const maxPercent = Math.round((max / hp) * 100);

    rangeEl.textContent = `${min}–${max} HP (${minPercent}–${maxPercent}%)`;

    const minHits = getHitsToKO(max, hp);
    const maxHits = getHitsToKO(min, hp);

    badge.textContent = formatHkoLabel(minHits, maxHits);
    badge.className = `hko-badge ${getHkoClass(minHits)}`;
}

function formatHkoLabel(minHits, maxHits) {
    const format = n => n === 1 ? t('damageCalc.ohko', null, 'OHKO') : `${n}HKO`;
    return minHits === maxHits ? format(minHits) : `${format(minHits)}–${format(maxHits)}`;
}

function getHkoClass(minHits) {
    if (minHits <= 1) return "hko-ohko";
    if (minHits === 2) return "hko-2hko";
    return "hko-safe";
}
