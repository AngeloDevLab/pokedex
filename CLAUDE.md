# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A vanilla JS, no-framework, no-build-tool Pokédex / competitive Pokémon guide, deployed via GitHub Pages from `main` at pokedex.angelodevelopment.de. There is no `package.json`, no bundler, no test runner — just static HTML/CSS/JS served as-is.

## Running it locally

Open `index.html` (or `pages/search.html`) through a local server (e.g. VS Code "Live Server"), **not** via a `file://` URL — `js/core/i18n.js` fetches `locales/*.json`, `js/core/search.js`/`js/core/api.js` hit the PokéAPI, and every page loads its entry script as `<script type="module">`, all of which fail under `file://`.

There is no build, lint, or test command — nothing to run before checking changes beyond reloading the page in a browser.

## Branching

`main` is the GitHub Pages deploy source and must stay stable/deployable at all times. This is a solo project, so the convention is a single persistent `dev` branch for ongoing work (not one branch per feature) — merge `dev` → `main` whenever there's a stable, tested checkpoint, not necessarily only at session boundaries in TODO.md. Short-lived branches off `dev` are fine for one-off experiments that might get discarded, but that's the exception.

## Architecture

### ES Modules — one entry script per page

Each page loads exactly one `<script type="module">` (its "entry script"); everything else loads transitively via `import`/`export`. There is no bundler — the browser resolves the whole graph at runtime, so relative import specifiers always need the explicit `.js` extension.

- `index.html` → `js/pages/main.js`
- `pages/search.html` → `js/pages/search-page.js`
- `pages/stats-calc.html` → `js/pages/stats-calc-page.js`
- `pages/matchup.html` → `js/pages/matchup-page.js`
- `pages/learnset.html` → `js/pages/learnset-page.js`
- `pages/damage-calc.html` → `js/pages/damage-calc-page.js`
- `pages/breeding.html` → `js/pages/breeding-page.js`
- `pages/speed-tiers.html` → `js/pages/speed-tiers-page.js`
- `pages/competitive.html` → `js/pages/competitive-page.js`
- `pages/imprint.html` → `js/pages/imprint-page.js`

**Shared modules must stay side-effect-free at the top level.** Importing a module for one of its exports also executes its module body. `js/core/pagination.js` exists specifically because of this: it used to be part of `main.js`, but `main.js` also had a `DOMContentLoaded`-style bootstrap (now just a direct `init()` call, since module scripts already execute after the DOM is parsed) that called `loadPokemon()` — the index.html-only default browse view. Since `js/core/ui.js` imports pagination state from that file, and `js/pages/search-page.js` imports from `js/core/ui.js`, loading the search page transitively pulled in and ran index.html's bootstrap too. The fix: pagination state/logic lives in `js/core/pagination.js` (no top-level side effects), and `js/pages/main.js`/`js/pages/search-page.js` are thin entry points that just call `init()`. Keep this separation when adding new pages — page-bootstrap code (`init()`, any top-level `addEventListener`/immediate call) belongs only in that page's own entry script, never in a module other pages import from.

**Two real ES-module constraints already surfaced once and will again:** an imported binding can be read from outside its module, but not reassigned — only the declaring module can do `someImportedLet = x`. When state needs to be mutated from elsewhere, export a setter function (e.g. `pagination.js`'s `setVisibleStart()`, `search.js`'s `setActiveList()`) instead. And: state should live in the file that actually owns/mutates it, not wherever it was first read — `currentIndex`/`currentDialogPokemon`/`currentDialogEntry` moved from `ui.js` into `dialog.js` for this reason.

**Some circular imports are fine, some aren't.** `ui.js` ↔ `dialog.js` and `ui.js` ↔ `search.js` import from each other and that's safe, because the shared bindings are `function` declarations (hoisted before any module body evaluates) and all cross-calls happen inside function bodies, never at module top level. Verify changes to the import graph with `node --check js/<folder>/<file>.js` (syntax) and `node js/pages/main.js` / `node js/pages/search-page.js` / etc. for each entry script (the only expected failure is a `ReferenceError` for a browser-only global like `document`/`localStorage` — anything else, like "does not provide an export named ...", means the graph is actually broken).

### Module responsibilities (`js/`)

`js/` is split into three subfolders by role (see "Naming convention" below for when/why) — `core/` for shared DOM/state/API infrastructure, `data/` for pure static data and calculation with no DOM access, `pages/` for the one thin entry script per page.

**`js/core/`:**
- `api.js` — all PokéAPI fetch calls. No dependencies on other files. `speciesCache`/`moveCache` memoize species/move lookups; `fetchAllPokemonList()` also persists to `localStorage` (versioned key `pokedex:allPokemonList:v1`) so every tool page's Pokémon picker shares one cached copy. `fetchSpeedTierList()` (Session 10) is the one exception to "REST via `fetchJSON()`" — it POSTs to PokéAPI's GraphQL beta endpoint instead, since the speed-tiers page needs base stats for every Pokémon at once and ~1300 individual REST calls would be far too slow; result is `localStorage`-cached the same way. `fetchSmogonTiers()` (Session 11) isn't PokéAPI at all — it fetches Pokémon Showdown's own `data/formats-data.ts` from GitHub (the real source behind Smogon's tier list; no clean structured API exists for this data otherwise), parses the fetched TypeScript object-literal text with a small regex extractor (deliberately not `eval`/`Function()` — safer than executing fetched external code), and is the only cache in this file with a TTL (`readCacheWithTTL`/`writeCacheWithTTL`, 1 week) instead of being permanent, since tier placements actually shift over time unlike the rest of this app's static Pokédex data.
- `i18n.js` — loads `locales/{en,de,ja}.json`, exposes `t(key, vars, fallback)` for translated strings and `getCurrentLang()` for code that needs to pick a language-specific value from API data (e.g. `learnset-page.js` selecting a move's localized name out of PokéAPI's own `names` array). Handles language switching and re-rendering translated DOM (`data-i18n` / `data-i18n-placeholder` attributes). `rerenderDynamicContent()` re-invokes `renderPokemonList`/`openDialog` on language change.
- `nav.js` — the burger + sidebar nav shell shared by every page, plus the desktop inline header nav (see CSS section below). `NAV_LINKS` is the single source of truth for which tool pages appear in both. `initNavShell()` injects sidebar markup (nav links + language toggle) into `<div id="sidebar">`, and the same nav-links/language-toggle markup into the header's `#header-nav-slot`/`#header-lang-slot` placeholders, then wires the burger toggle/click-outside-to-close. Must run *before* `initI18n()` in each entry script, since `initI18n()` binds/translates the language-toggle markup `initNavShell()` just injected.
- `pagination.js` — shared pagination/loading state (`LIMIT`, `pokemonCache`, `visibleStart`/`visibleCount`, `loadNext`/`loadPrevious`, `hasMoreData`, `withLoader`, `getEvolutionData`). No top-level side effects — see above.
- `pokemon-picker.js` — the Pokémon picker (datalist input + `?pokemon=` deep-link resolution) shared by every single-Pokémon tool page (stats calculator, type matchup, learnset, damage calculator, breeding guide, competitive, and future Session 14 pages — not speed-tiers, which lists every Pokémon at once rather than looking up one). `initPokemonPicker({ inputId, datalistId, onSelect, queryParam })` fetches the cached all-Pokémon list, wires the input, resolves a `?<queryParam>=` query param if present (defaults to `"pokemon"`; the damage calculator's defender picker passes `queryParam: "defender"` to avoid colliding with the attacker's), and calls `onSelect(pokemon)` with the fully-fetched Pokémon object either way — extracted out of `stats-calc-page.js` once `matchup-page.js` needed the identical logic.
- `search.js` — name/type search state and pagination over search results. Owns `activeList`/`currentMode`, read by `ui.js`, `dialog.js`, `i18n.js`, and `pagination.js`.
- `templates.js` — pure functions returning HTML template strings (card markup, dialog markup, per-tab markup, sidebar markup lives in `nav.js` instead since it's behavior-coupled). No DOM access, no state.
- `dialog.js` — Pokémon detail dialog: opening/closing, per-tab rendering (`TAB_RENDERER` dispatch table lives in `ui.js`), arrow-navigation enable/disable state, owns `currentIndex`/`currentDialogPokemon`/`currentDialogEntry`.
- `ui.js` — DOM binding/rendering: card grid rendering, dialog open/close/navigation event wiring, load-button visibility, search-input wiring (`bindSearchInputs()` — no toggle logic anymore, search isn't a header dropdown), stat color/percent calculation (`getStatColor`), type-color gradients, `getTypeIcon()`/`getTypes()`/`formatStatName()` reused by the tool pages. Exports small composable `bind*` functions rather than one monolithic `bindUI()`, since each page's entry script needs a different subset.

**`js/data/`** (no imports, no DOM access — safe to import from anywhere without side effects):
- `natures.js` — the 25 natures (boosted/lowered stat) + `getNatureMultiplier()`.
- `stat-formula.js` — the level-100 final-stat formula, `calculateStat({ base, iv, ev, natureMultiplier, isHp })`.
- `type-chart.js` — the 18×18 type effectiveness chart (defending-type perspective) + `getMultiplier()`/`getDualTypeMultiplier()`.

**`js/pages/`** (one thin entry script per page — wiring and page-specific rendering only, no logic meant to be reused elsewhere):
- `main.js` — index.html's entry point only: calls `init()` which wires nav/i18n/dialog/load-buttons and triggers the default browse-all load.
- `search-page.js` — pages/search.html's entry point only: same wiring minus the default load, plus `bindSearchInputs()`.
- `stats-calc-page.js` — pages/stats-calc.html: IV/EV/nature calculator, uses `pokemon-picker.js` + `data/stat-formula.js` + `data/natures.js`.
- `matchup-page.js` — pages/matchup.html: type matchup table, uses `pokemon-picker.js` + `data/type-chart.js`.
- `learnset-page.js` — pages/learnset.html: move list grouped by learn method, uses `pokemon-picker.js` + `api.js`'s `fetchMoveByUrl()`.
- `damage-calc-page.js` — pages/damage-calc.html: attacker/defender damage range + OHKO/2HKO/3HKO indicator, uses `pokemon-picker.js` (two instances, defender via `queryParam: "defender"`) + `core/moveset.js` + `data/stat-formula.js` + `data/natures.js` + `data/type-chart.js` + `data/damage-formula.js`.
- `breeding-page.js` — pages/breeding.html: egg groups, egg-move list with breeding-chain "who can teach this" lookup, plus a static IV-breeding/nature-table/Hidden-Ability/Masuda guide. Uses `pokemon-picker.js` + `core/moveset.js` + `data/natures.js` + `api.js`'s `getEggGroup()`.
- `speed-tiers-page.js` — pages/speed-tiers.html: every Pokémon ranked by computed Level-100 Speed, with generation filter, a typed benchmark value, and a Choice Scarf ×1.5 toggle. Does *not* use `pokemon-picker.js` (it's a bulk list, not a single-Pokémon lookup) — uses `api.js`'s `fetchSpeedTierList()` (GraphQL) + `data/stat-formula.js`.
- `competitive-page.js` — pages/competitive.html: a chosen Pokémon's Smogon tier (falling back to `natDexTier` with an explanatory note when the current-gen tier is `"Illegal"`) plus a link out to the real Smogon dex page for sets/counters. Uses `pokemon-picker.js` + `api.js`'s `fetchSmogonTiers()`.
- `imprint-page.js` — pages/imprint.html: just nav + i18n, no page-specific logic.

### Pages and routing

Multi-page app, no router. `index.html` **must stay at repo root** — GitHub Pages serves `/` from it directly. Every other page goes in `pages/`. Future pages from the TODO.md roadmap follow the same rule: new page in `pages/`, its own entry script in `js/pages/<page>-page.js`, reusing shared modules from `js/core/`/`js/data/` rather than duplicating them. Keep page-specific logic directly in the entry script at first — only extract it into `js/core/` once a second page actually needs the same logic (this is exactly how `pokemon-picker.js` came about: written inline in `stats-calc-page.js` first, pulled out once `matchup-page.js` needed the identical picker).

### CSS structure

- `css/variables.css` — all design tokens (colors, spacing scale `--space-1`..`--space-7`, radius scale, transition timings). Always linked first.
- `css/standard.css` — element resets/base styles (`body`, `header`/`footer`/`main` layout) plus page-chrome utility classes (`.max-content`, `.hide-mobile`, `.loader`, etc.) that don't belong to one specific component. There is **no base `button` element rule** — it was deliberately removed; every button class (`svg-button`, `lang-btn`, `load-btn`, `tab-btn`) defines its own full styling including its own `:hover`. A plain `<button>` with no component class gets no styling at all, so don't add one — always use one of the existing button classes, or add a new one with its own complete rule set (background, border, `:hover`) rather than relying on inheriting from a shared base that doesn't exist anymore.
- `css/components/` — one file per UI component (`buttons.css`, `inputs.css`, `search.css`, `cards.css`, `dialog.css`, `nav.css`, `stats.css`, `matchup.css`, `learnset.css`, `damage-calc.css`, `breeding.css`, `speed-tiers.css`, `competitive.css`), flat, no further nesting.
- `css/responsive.css` — media query overrides only, linked last so it can override component rules.
- `css/fonts.css` — `@font-face` declarations.

**Button interaction model** (established convention, keep new buttons consistent with it): hover = `border-color: var(--accent-color)` + a `scale()` transform (never a background-color fill — the UI is dark with white text everywhere, and fill colors need individual contrast checking that border colors don't). Active/selected state = `border-color: var(--accent-color)` only, no fill. Icon-only buttons (circular, fixed size) use class `svg-button`; never invent a parallel class for an icon button — there was previously a bug where the search-toggle button used a one-off `search-button` class instead of `svg-button` and silently fell back to the wrong shape.

**Any local/relative asset path referenced from shared JS (not page-specific HTML) must be root-relative (`/assets/...`), not `./assets/...`.** `js/core/ui.js`'s `getTypeIcon()` is shared by every page; a `./`-relative path resolves against whichever page's URL is currently loaded, so it breaks for any page not at the repo root (e.g. `pages/search.html`). This is safe because the site deploys at a custom domain root, not a GitHub Pages subpath.

### Naming convention for future CSS/JS file splits

Don't pre-create subfolders or split files until there's an actual reason (a real second page, a file that's grown genuinely hard to navigate). `js/` was kept flat through Session 7, then split into `core/`/`data/`/`pages/` (see above) once it hit 18 files, past the ~8–10-file point where a flat list stops being easy to scan. `css/components/` is at 13 files and stays flat for now — split it the same way (by role, not arbitrarily) once it actually becomes unwieldy, not in advance. When adding a new JS file: a per-page entry script goes in `js/pages/`, pure data/calculation with no DOM access goes in `js/data/`, anything else shared goes in `js/core/`.

## Roadmap

`TODO.md` is the authoritative, actively-maintained roadmap, organized as numbered "sessions" (not chronological dates — session 1 is deployment/done, session 2 is i18n, session 3 is UI polish, session 4 is navigation/architecture, sessions 5+ are individual features like a stats calculator, type matchup tab, damage calculator, etc.). Check it before starting work to see what's already decided vs. still open, and update its checkboxes as items are completed.
