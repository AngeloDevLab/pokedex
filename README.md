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

---

## Tech Stack

* HTML
* CSS
* JavaScript (Vanilla)
* PokéAPI

---

## Project Structure

The project is split into logical modules:

* **api.js** → API calls and data fetching
* **main.js** → Application state and core logic
* **search.js** → Search and filter logic
* **ui.js** → Rendering and DOM interactions

---

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser

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