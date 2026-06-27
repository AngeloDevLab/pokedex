import { initI18n, t } from './i18n.js';
import { initNavShell } from './nav.js';
import { fetchAllPokemonList, fetchPokemonByUrl } from './api.js';
import { withLoader } from './pagination.js';
import { calculateStat } from './stat-formula.js';
import { NATURES, getNatureMultiplier } from './natures.js';
import { formatStatName } from './ui.js';

// ===== CONFIG =====
const EV_LIMIT = 510;
const BAR_SCALE = 500;

// ===== STATE =====
let allPokemon = [];
let currentPokemon = null;
let ivs = createIvState();
let evs = createEvState();
let currentNature = NATURES[0];

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    populateNatureSelect();
    bindPicker();
    bindNatureSelect();
    bindResetButton();
    bindStatInputs();
    await withLoader(loadPokemonOptions);
    await resolvePokemonFromQuery();
}

function createIvState() {
    return { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 };
}

function createEvState() {
    return { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };
}

// ===== POKEMON PICKER =====
async function loadPokemonOptions() {
    const data = await fetchAllPokemonList();
    allPokemon = data.results;

    const datalist = document.getElementById("pokemon-options");
    datalist.innerHTML = allPokemon.map(p => `<option value="${p.name}">`).join("");
}

function bindPicker() {
    const input = document.getElementById("pokemon-picker");
    input.addEventListener("change", handlePickerChange);
}

function handlePickerChange(e) {
    const match = findPokemonByName(e.target.value);
    if (!match) return;
    selectPokemon(match.url);
}

function findPokemonByName(name) {
    const normalized = name.trim().toLowerCase();
    return allPokemon.find(p => p.name === normalized);
}

async function resolvePokemonFromQuery() {
    const name = new URLSearchParams(location.search).get("pokemon");
    if (!name) return;

    const match = findPokemonByName(name);
    if (!match) return;

    document.getElementById("pokemon-picker").value = match.name;
    await selectPokemon(match.url);
}

async function selectPokemon(url) {
    await withLoader(async () => {
        currentPokemon = await fetchPokemonByUrl(url);
        ivs = createIvState();
        evs = createEvState();
        currentNature = NATURES[0];
        document.getElementById("nature-select").value = 0;
        renderStatsCalc();
    });
}

// ===== NATURE =====
function populateNatureSelect() {
    const select = document.getElementById("nature-select");
    select.innerHTML = NATURES.map((nature, i) =>
        `<option value="${i}">${nature.name}</option>`
    ).join("");
}

function bindNatureSelect() {
    const select = document.getElementById("nature-select");
    select.addEventListener("change", handleNatureChange);
}

function handleNatureChange(e) {
    currentNature = NATURES[Number(e.target.value)];
    if (currentPokemon) recalculate();
}

// ===== RESET =====
function bindResetButton() {
    const btn = document.getElementById("stats-calc-reset");
    btn.addEventListener("click", handleReset);
}

function handleReset() {
    ivs = createIvState();
    evs = createEvState();
    currentNature = NATURES[0];
    document.getElementById("nature-select").value = 0;

    if (!currentPokemon) return;

    document.querySelectorAll("#stats-calc-list .iv-input").forEach(input => {
        input.value = ivs[input.dataset.statKey];
    });
    document.querySelectorAll("#stats-calc-list .ev-input").forEach(input => {
        input.value = evs[input.dataset.statKey];
    });

    recalculate();
}

// ===== STAT INPUTS =====
function bindStatInputs() {
    document.getElementById("stats-calc-list").addEventListener("input", handleStatInputChange);
}

function handleStatInputChange(e) {
    const input = e.target;
    const key = input.dataset.statKey;
    if (!key) return;

    if (input.classList.contains("iv-input")) {
        ivs[key] = clamp(toInt(input.value), 0, 31);
        input.value = ivs[key];
    } else if (input.classList.contains("ev-input")) {
        evs[key] = clamp(toInt(input.value), 0, 252);
        input.value = evs[key];
    } else {
        return;
    }

    recalculate();
}

function toInt(value) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? 0 : n;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ===== RENDER =====
function renderStatsCalc() {
    document.getElementById("stats-calc-pokemon-name").textContent = currentPokemon.name;

    const list = document.getElementById("stats-calc-list");
    list.innerHTML = currentPokemon.stats.map(renderStatRow).join("");

    recalculate();
    document.getElementById("stats-calc-result").classList.remove("hidden");
}

function renderStatRow(stat) {
    const key = stat.stat.name;

    return `
        <li class="stat-row" data-stat-key="${key}">
            <div class="stat-header">
                <span class="stat-name">${formatStatName(key)}</span>
                <span class="stat-value">0</span>
            </div>
            <div class="stat-inputs">
                <label class="stat-input-label">
                    <span>${t('statsCalc.iv', null, 'IV')}</span>
                    <input type="number" class="iv-input" min="0" max="31" value="${ivs[key]}" data-stat-key="${key}">
                </label>
                <label class="stat-input-label">
                    <span>${t('statsCalc.ev', null, 'EV')}</span>
                    <input type="number" class="ev-input" min="0" max="252" value="${evs[key]}" data-stat-key="${key}">
                </label>
            </div>
            <div class="stat-bar">
                <div class="stat-fill" style="width: 0%"></div>
            </div>
        </li>
    `;
}

function recalculate() {
    const rows = document.querySelectorAll("#stats-calc-list .stat-row");
    let bst = 0;

    rows.forEach(row => {
        const key = row.dataset.statKey;
        const stat = currentPokemon.stats.find(s => s.stat.name === key);
        const isHp = key === "hp";
        const multiplier = isHp ? 1 : getNatureMultiplier(currentNature, key);
        const value = calculateStat({
            base: stat.base_stat,
            iv: ivs[key],
            ev: evs[key],
            natureMultiplier: multiplier,
            isHp
        });
        bst += value;

        row.querySelector(".stat-value").textContent = value;

        const fill = row.querySelector(".stat-fill");
        fill.style.width = `${Math.min((value / BAR_SCALE) * 100, 100)}%`;
        fill.style.background = getFinalStatColor(value);

        row.classList.toggle("nature-boost", currentNature.increased === key);
        row.classList.toggle("nature-lower", currentNature.decreased === key);
    });

    updateEvTotal();
    document.getElementById("bst-total-value").textContent = bst;
}

function updateEvTotal() {
    const total = Object.values(evs).reduce((sum, v) => sum + v, 0);
    document.getElementById("ev-total-value").textContent = `${total} / ${EV_LIMIT}`;
    document.getElementById("ev-total").classList.toggle("over-limit", total > EV_LIMIT);
}

function getFinalStatColor(value) {
    if (value < 60) return "var(--stat-low)";
    if (value < 100) return "var(--stat-mid)";
    return "var(--stat-high)";
}
