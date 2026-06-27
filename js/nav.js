// ===== STATE =====
let sidebarOpen = false;

// ===== TEMPLATE =====
function getSidebarTemplate() {
    return `
        <nav class="sidebar-nav">
            <a href="/pages/search.html" data-i18n="common.search">Search</a>
            <a href="/pages/stats-calc.html" data-i18n="statsCalc.navLink">Stats Calculator</a>
        </nav>

        <div class="lang-toggle" id="lang-toggle">
            <button type="button" class="lang-btn" data-lang="en">EN</button>
            <button type="button" class="lang-btn" data-lang="de">DE</button>
            <button type="button" class="lang-btn" data-lang="ja">JA</button>
        </div>
    `;
}

// ===== INIT =====
export function initNavShell() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    sidebar.innerHTML = getSidebarTemplate();
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
