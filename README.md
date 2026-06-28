# Pokédex

A small frontend project built to practice working with APIs using vanilla JavaScript.

## Overview

This project uses the PokéAPI to fetch and display Pokémon data in a dynamic and interactive interface.

The focus was on understanding how to structure a frontend application without frameworks while working with asynchronous data.

---

## Features

* Fetch and display Pokémon data from the PokéAPI
* Pagination (Load more / Load previous)
* Search by name (client-side filtering)
* Filter by type (API-based, includes dual types)
* Pokémon detail dialog with:

  * Stats
  * Abilities (including hidden abilities)
  * Evolution chain
* Loading indicator with improved UX (minimum display time)
* "No results found" state
* Multi-language UI (EN / DE / JA) via `js/core/i18n.js`, language preference stored in LocalStorage

---

## Tech Stack

* HTML
* CSS
* JavaScript (Vanilla)
* PokéAPI

---

## Project Structure

```
index.html             → home page (stays at root — required by GitHub Pages)
pages/                  → secondary pages (search, stats-calc, matchup, learnset, imprint)
js/
  core/                 → shared DOM/state/API infrastructure
    api.js              → API calls and data fetching (species/move caching, localStorage Pokémon-list cache)
    dialog.js           → Pokémon detail dialog logic
    i18n.js             → translation loading, language switching
    nav.js              → burger + sidebar nav shell, desktop header nav (shared across pages)
    pagination.js       → shared pagination/loading state (used by index.html and search.html)
    pokemon-picker.js   → shared Pokémon picker (datalist + ?pokemon= deep-link) for the tool pages
    search.js           → search and type-filter logic
    templates.js        → HTML template strings for cards/dialog
    ui.js               → rendering and DOM interactions
  data/                 → pure static data + calculation, no DOM access
    natures.js          → the 25 natures
    stat-formula.js     → level-100 final-stat formula
    type-chart.js       → 18x18 type effectiveness chart
  pages/                → one entry script per page
    main.js             → index.html entry point (default browse view bootstrap)
    search-page.js      → pages/search.html entry point
    stats-calc-page.js  → pages/stats-calc.html entry point (IV/EV/nature calculator)
    matchup-page.js     → pages/matchup.html entry point (type matchup table)
    learnset-page.js    → pages/learnset.html entry point (move list by learn method)
    imprint-page.js     → pages/imprint.html entry point
css/                    → variables.css (design tokens), standard.css (base/reset), components/ (buttons, inputs, search, cards, dialog, nav, stats, matchup, learnset), fonts.css, responsive.css
locales/                → UI translation strings (en.json, de.json, ja.json)
assets/                 → images, icons, fonts
```

ES Modules (`<script type="module">`) — each page loads a single entry script from `js/pages/`, which pulls in everything else via `import`/`export`. Shared modules with cross-page side effects (page bootstrapping) are deliberately kept side-effect-free at the module level, since importing a module for its exports also runs its top-level code.

---

## Getting Started

1. Clone the repository
2. Serve the folder with a local server (e.g. VS Code "Live Server") and open `index.html`

   A local server is required because `i18n.js` fetches `locales/*.json` — this fails under a plain `file://` URL.

No build tools or dependencies required.

---

## API

https://pokeapi.co/

---

## Learning Goals

* Working with `fetch` and asynchronous JavaScript (`async/await`)
* Handling and transforming API data
* Structuring code into reusable modules
* Managing UI state without frameworks
* Improving user experience (loading states, empty states)

---

## Future Improvements

* Accessibility improvements (ARIA, keyboard navigation)
* Combine search + type filter
* Add more Pokémon details (moves, abilities descriptions)
* Add sound effects / Pokémon cries
* UI polish and animations

---

## Author

Angelo Pietsch