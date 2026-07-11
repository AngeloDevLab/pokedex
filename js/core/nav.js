// ===== STATE =====
let sidebarOpen = false;

// Single source of truth for nav links — rendered into both the mobile
// sidebar (vertical, categories as accordions) and the desktop header
// (horizontal, categories as click-to-open dropdowns, see initNavShell()).
const NAV_LINKS = {
    top: [
        { href: "/pages/search.html", i18nKey: "common.search", fallback: "Search" }
    ],
    categories: [
        {
            i18nKey: "nav.calculators",
            fallback: "Calculators",
            links: [
                { href: "/pages/stats-calc.html", i18nKey: "statsCalc.navLink", fallback: "Stats Calculator" },
                { href: "/pages/damage-calc.html", i18nKey: "damageCalc.navLink", fallback: "Damage Calculator" },
                { href: "/pages/speed-tiers.html", i18nKey: "speedTiers.navLink", fallback: "Speed Tiers" },
                { href: "/pages/matchup.html", i18nKey: "matchup.navLink", fallback: "Type Matchup" }
            ]
        },
        {
            i18nKey: "nav.guide",
            fallback: "Pokémon Guide",
            links: [
                { href: "/pages/learnset.html", i18nKey: "learnset.navLink", fallback: "Learnset" },
                { href: "/pages/breeding.html", i18nKey: "breeding.navLink", fallback: "Breeding Guide" },
                { href: "/pages/competitive.html", i18nKey: "competitive.navLink", fallback: "Competitive" },
                { href: "/pages/forms.html", i18nKey: "forms.navLink", fallback: "Forms & Megas" },
                { href: "/pages/shiny.html", i18nKey: "shiny.navLink", fallback: "Shiny Hunting" }
            ]
        },
        {
            i18nKey: "nav.reference",
            fallback: "Reference",
            links: [
                { href: "/pages/items.html", i18nKey: "items.navLink", fallback: "Items" }
            ]
        }
    ]
};

// ===== TEMPLATES =====
function getLinksMarkup(links) {
    return links
        .map(link => `<a href="${link.href}" data-i18n="${link.i18nKey}">${link.fallback}</a>`)
        .join("");
}

function getHeaderCategoriesMarkup() {
    return NAV_LINKS.categories
        .map(cat => `
            <div class="nav-category">
                <button type="button" class="nav-category-toggle" data-i18n="${cat.i18nKey}">${cat.fallback}</button>
                <div class="nav-category-menu">${getLinksMarkup(cat.links)}</div>
            </div>
        `)
        .join("");
}

function getSidebarCategoriesMarkup() {
    return NAV_LINKS.categories
        .map(cat => `
            <details class="nav-accordion">
                <summary data-i18n="${cat.i18nKey}">${cat.fallback}</summary>
                <div class="nav-accordion-links">${getLinksMarkup(cat.links)}</div>
            </details>
        `)
        .join("");
}

function getLangToggleTemplate() {
    return `
        <div class="lang-toggle">
            <button type="button" class="lang-btn" data-lang="en">EN</button>
            <button type="button" class="lang-btn" data-lang="de">DE</button>
            <button type="button" class="lang-btn" data-lang="ja">JA</button>
        </div>
    `;
}

function getSidebarTemplate() {
    return `
        <nav class="sidebar-nav">
            ${getLinksMarkup(NAV_LINKS.top)}
            ${getSidebarCategoriesMarkup()}
        </nav>
        ${getLangToggleTemplate()}
    `;
}

function getHeaderNavTemplate() {
    return `
        <nav class="header-nav-links">
            ${getLinksMarkup(NAV_LINKS.top)}
            ${getHeaderCategoriesMarkup()}
        </nav>
    `;
}

// ===== INIT =====
export function initNavShell() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.innerHTML = getSidebarTemplate();

    const headerNavSlot = document.getElementById("header-nav-slot");
    if (headerNavSlot) headerNavSlot.innerHTML = getHeaderNavTemplate();

    const headerLangSlot = document.getElementById("header-lang-slot");
    if (headerLangSlot) headerLangSlot.innerHTML = getLangToggleTemplate();

    bindNavToggle();
    bindNavCategories();
}

function bindNavToggle() {
    const toggle = document.getElementById("nav-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", toggleSidebar);
    document.addEventListener("click", handleClickOutsideSidebar);
}

function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    applySidebarState();
}

function closeSidebar() {
    sidebarOpen = false;
    applySidebarState();
}

function applySidebarState() {
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.getElementById("menu-icon");
    const menuCloseIcon = document.getElementById("menu-close-icon");

    sidebar.classList.toggle("open", sidebarOpen);
    menuIcon.classList.toggle("hidden", sidebarOpen);
    menuCloseIcon.classList.toggle("hidden", !sidebarOpen);
}

function handleClickOutsideSidebar(e) {
    if (!sidebarOpen) return;

    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("nav-toggle");

    if (sidebar.contains(e.target) || toggle.contains(e.target)) return;

    closeSidebar();
}

// ===== DESKTOP CATEGORY DROPDOWNS =====
function bindNavCategories() {
    const headerNavSlot = document.getElementById("header-nav-slot");
    if (!headerNavSlot) return;

    headerNavSlot.querySelectorAll(".nav-category-toggle").forEach(btn => {
        btn.addEventListener("click", handleCategoryToggleClick);
    });

    document.addEventListener("click", handleClickOutsideCategories);
}

function handleCategoryToggleClick(e) {
    const category = e.currentTarget.closest(".nav-category");
    const wasOpen = category.classList.contains("open");

    closeAllCategories();
    if (!wasOpen) category.classList.add("open");
}

function handleClickOutsideCategories(e) {
    if (e.target.closest(".nav-category")) return;
    closeAllCategories();
}

function closeAllCategories() {
    document.querySelectorAll(".nav-category.open").forEach(cat => cat.classList.remove("open"));
}
