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
* Multi-language UI (EN / DE / JA) via `js/i18n.js`, language preference stored in LocalStorage

---

## Tech Stack

* HTML
* CSS
* JavaScript (Vanilla)
* PokéAPI

---

## Project Structure

```
index.html          → home page (stays at root — required by GitHub Pages)
pages/               → secondary pages (e.g. imprint.html)
js/
  api.js             → API calls and data fetching
  main.js            → application state and core logic (pagination, evolution loading)
  search.js          → search and type-filter logic
  templates.js        → HTML template strings for cards/dialog
  dialog.js          → Pokémon detail dialog logic
  ui.js              → rendering and DOM interactions
  i18n.js            → translation loading, language switching
css/                 → stylesheets (standard, layout, fonts, responsive)
locales/             → UI translation strings (en.json, de.json, ja.json)
assets/              → images, icons, fonts
```

Plain `<script>` tags (no bundler, no ES modules yet) — load order in `index.html` matters, since the files share state via global functions/variables rather than `import`/`export`.

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