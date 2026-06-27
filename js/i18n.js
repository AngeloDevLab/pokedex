// ===== CONFIG =====
const SUPPORTED_LANGS = ["en", "de", "ja"];
const LANG_STORAGE_KEY = "lang";

// ===== STATE =====
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || "en";
let translations = {};

// ===== INIT =====
async function initI18n() {
    await loadTranslations();
    applyTranslations();
    bindLanguageToggle();
    renderLanguageToggleState();
    document.documentElement.lang = currentLang;
}

async function loadTranslations() {
    try {
        const [en, de, ja] = await Promise.all([
            fetchJSON("./locales/en.json", "Failed to fetch en locale"),
            fetchJSON("./locales/de.json", "Failed to fetch de locale"),
            fetchJSON("./locales/ja.json", "Failed to fetch ja locale")
        ]);
        translations = { en, de, ja };
    } catch (err) {
        console.warn("i18n: could not load locales, falling back to inline EN text", err);
        translations = {};
    }
}

// ===== TRANSLATE =====
function t(key, vars, fallback) {
    const value = getNested(translations[currentLang], key)
        ?? getNested(translations.en, key)
        ?? fallback;

    if (value === undefined) return null;

    return interpolate(value, vars);
}

function getNested(obj, path) {
    if (!obj) return undefined;
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

function interpolate(text, vars) {
    if (!vars) return text;
    return Object.entries(vars).reduce(
        (result, [key, value]) => result.replaceAll(`{${key}}`, value),
        text
    );
}

// ===== APPLY TO DOM =====
function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const value = t(el.dataset.i18n);
        if (value !== null) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const value = t(el.dataset.i18nPlaceholder);
        if (value !== null) el.placeholder = value;
    });
}

// ===== LANGUAGE SWITCH =====
function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;

    currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    applyTranslations();
    renderLanguageToggleState();
    rerenderDynamicContent();
}

function rerenderDynamicContent() {
    renderPokemonList(activeList);

    const dialog = document.getElementById("pokemon-dialog");
    if (dialog?.open) openDialog(currentIndex);
}

function bindLanguageToggle() {
    const toggle = document.getElementById("lang-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", handleLanguageToggleClick);
}

function handleLanguageToggleClick(e) {
    const btn = e.target.closest("[data-lang]");
    if (!btn) return;
    setLanguage(btn.dataset.lang);
}

function renderLanguageToggleState() {
    document.querySelectorAll("#lang-toggle [data-lang]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
}
