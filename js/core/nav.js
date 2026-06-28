// ===== STATE =====
let sidebarOpen = false;

// Single source of truth for nav links — rendered into both the mobile
// sidebar (vertical) and the desktop header (horizontal, see initNavShell()).
const NAV_LINKS = [
    { href: "/pages/search.html", i18nKey: "common.search", fallback: "Search" },
    { href: "/pages/stats-calc.html", i18nKey: "statsCalc.navLink", fallback: "Stats Calculator" },
    { href: "/pages/matchup.html", i18nKey: "matchup.navLink", fallback: "Type Matchup" },
    { href: "/pages/learnset.html", i18nKey: "learnset.navLink", fallback: "Learnset" },
    { href: "/pages/damage-calc.html", i18nKey: "damageCalc.navLink", fallback: "Damage Calculator" }
];

// ===== TEMPLATES =====
function getNavLinksMarkup() {
    return NAV_LINKS
        .map(link => `<a href="${link.href}" data-i18n="${link.i18nKey}">${link.fallback}</a>`)
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
        <nav class="sidebar-nav">${getNavLinksMarkup()}</nav>
        ${getLangToggleTemplate()}
    `;
}

function getHeaderNavTemplate() {
    return `<nav class="header-nav-links">${getNavLinksMarkup()}</nav>`;
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
