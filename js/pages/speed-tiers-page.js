import { initI18n, t } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { withLoader } from '../core/pagination.js';
import { fetchSpeedTierList } from '../core/api.js';
import { getTypeIcon, formatSlug } from '../core/ui.js';
import { calculateStat } from '../data/stat-formula.js';

const QUICK_PICKS = [100, 110, 120, 130, 140, 150, 200];

// ===== STATE =====
let entries = [];
let selectedGeneration = "all";
let scarfActive = false;

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    populateGenerationSelect();
    renderQuickPicks();
    bindFilters();

    const raw = await withLoader(fetchSpeedTierList);
    entries = raw.map(entry => ({
        ...entry,
        finalSpeed: calculateStat({ base: entry.speed, iv: 31, ev: 252, natureMultiplier: 1, isHp: false })
    }));

    renderList();
}

// ===== FILTER BAR =====
function populateGenerationSelect() {
    const select = document.getElementById("generation-select");

    const options = [`<option value="all">${t('speedTiers.allGenerations', null, 'All Generations')}</option>`];
    for (let gen = 1; gen <= 9; gen++) {
        options.push(`<option value="${gen}">${t('speedTiers.generationLabel', null, 'Generation')} ${gen}</option>`);
    }

    select.innerHTML = options.join("");
}

function renderQuickPicks() {
    const container = document.getElementById("benchmark-quick-picks");
    container.innerHTML = QUICK_PICKS
        .map(value => `<button type="button" class="quick-pick-btn" data-value="${value}">${value}</button>`)
        .join("");
}

function bindFilters() {
    document.getElementById("generation-select").addEventListener("change", e => {
        selectedGeneration = e.target.value;
        renderList();
    });

    document.getElementById("benchmark-input").addEventListener("input", renderList);

    document.getElementById("benchmark-quick-picks").addEventListener("click", e => {
        const btn = e.target.closest(".quick-pick-btn");
        if (!btn) return;

        document.getElementById("benchmark-input").value = btn.dataset.value;
        renderList();
    });

    document.getElementById("scarf-toggle").addEventListener("click", e => {
        scarfActive = !scarfActive;
        e.currentTarget.classList.toggle("active", scarfActive);
        renderList();
    });
}

// ===== RENDER =====
function renderList() {
    const benchmark = getBenchmark();

    const filtered = selectedGeneration === "all"
        ? entries
        : entries.filter(entry => String(entry.gen) === selectedGeneration);

    const rows = filtered
        .map(entry => ({
            ...entry,
            displaySpeed: scarfActive ? Math.floor(entry.finalSpeed * 1.5) : entry.finalSpeed
        }))
        .sort((a, b) => b.displaySpeed - a.displaySpeed);

    const list = document.getElementById("speed-tier-list");
    list.innerHTML = rows.map((entry, i) => renderRow(entry, i + 1, benchmark)).join("");
}

function getBenchmark() {
    const raw = document.getElementById("benchmark-input").value;
    if (raw === "") return null;

    const value = Number(raw);
    return Number.isNaN(value) ? null : value;
}

function renderRow(entry, rank, benchmark) {
    const benchmarkClass = benchmark === null
        ? ""
        : entry.displaySpeed >= benchmark ? "above-benchmark" : "below-benchmark";

    return `
        <li class="speed-tier-row ${benchmarkClass}">
            <span class="speed-tier-rank">#${rank}</span>
            <div class="speed-tier-types">
                ${entry.types.map(type => `<img src="${getTypeIcon(type)}" alt="${type}">`).join("")}
            </div>
            <span class="speed-tier-name">${formatSlug(entry.name)}</span>
            <span class="speed-tier-value">${entry.displaySpeed}</span>
        </li>
    `;
}
