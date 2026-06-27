# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A vanilla JS, no-framework, no-build-tool Pokédex / competitive Pokémon guide, deployed via GitHub Pages from `main` at pokedex.angelodevelopment.de. There is no `package.json`, no bundler, no test runner — just static HTML/CSS/JS served as-is.

## Running it locally

Open `index.html` (or `pages/search.html`) through a local server (e.g. VS Code "Live Server"), **not** via a `file://` URL — `js/i18n.js` fetches `locales/*.json`, `js/search.js`/`js/api.js` hit the PokéAPI, and every page loads its entry script as `<script type="module">`, all of which fail under `file://`.

There is no build, lint, or test command — nothing to run before checking changes beyond reloading the page in a browser.

## Branching

`main` is the GitHub Pages deploy source and must stay stable/deployable at all times. This is a solo project, so the convention is a single persistent `dev` branch for ongoing work (not one branch per feature) — merge `dev` → `main` whenever there's a stable, tested checkpoint, not necessarily only at session boundaries in TODO.md. Short-lived branches off `dev` are fine for one-off experiments that might get discarded, but that's the exception.

## Architecture

### ES Modules — one entry script per page

Each page loads exactly one `<script type="module">` (its "entry script"); everything else loads transitively via `import`/`export`. There is no bundler — the browser resolves the whole graph at runtime, so relative import specifiers always need the explicit `.js` extension.

- `index.html` → `js/main.js`
- `pages/search.html` → `js/search-page.js`

**Shared modules must stay side-effect-free at the top level.** Importing a module for one of its exports also executes its module body. `js/pagination.js` exists specifically because of this: it used to be part of `main.js`, but `main.js` also had a `DOMContentLoaded`-style bootstrap (now just a direct `init()` call, since module scripts already execute after the DOM is parsed) that called `loadPokemon()` — the index.html-only default browse view. Since `js/ui.js` imports pagination state from that file, and `js/search-page.js` imports from `js/ui.js`, loading the search page transitively pulled in and ran index.html's bootstrap too. The fix: pagination state/logic lives in `js/pagination.js` (no top-level side effects), and `js/main.js`/`js/search-page.js` are thin entry points that just call `init()`. Keep this separation when adding new pages — page-bootstrap code (`init()`, any top-level `addEventListener`/immediate call) belongs only in that page's own entry script, never in a module other pages import from.

**Two real ES-module constraints already surfaced once and will again:** an imported binding can be read from outside its module, but not reassigned — only the declaring module can do `someImportedLet = x`. When state needs to be mutated from elsewhere, export a setter function (e.g. `pagination.js`'s `setVisibleStart()`, `search.js`'s `setActiveList()`) instead. And: state should live in the file that actually owns/mutates it, not wherever it was first read — `currentIndex`/`currentDialogPokemon`/`currentDialogEntry` moved from `ui.js` into `dialog.js` for this reason.

**Some circular imports are fine, some aren't.** `ui.js` ↔ `dialog.js` and `ui.js` ↔ `search.js` import from each other and that's safe, because the shared bindings are `function` declarations (hoisted before any module body evaluates) and all cross-calls happen inside function bodies, never at module top level. Verify changes to the import graph with `node --check js/<file>.js` (syntax) and `node js/main.js` / `node js/search-page.js` (the only expected failure is a `ReferenceError` for a browser-only global like `document`/`localStorage` — anything else, like "does not provide an export named ...", means the graph is actually broken).

### Module responsibilities (`js/`)

- `api.js` — all PokéAPI fetch calls. No dependencies on other files. `speciesCache` memoizes species lookups.
- `i18n.js` — loads `locales/{en,de,ja}.json`, exposes `t(key, vars, fallback)` for translated strings, handles language switching and re-rendering translated DOM (`data-i18n` / `data-i18n-placeholder` attributes). `rerenderDynamicContent()` re-invokes `renderPokemonList`/`openDialog` on language change.
- `nav.js` — the burger + sidebar nav shell shared by every page. `initNavShell()` injects the sidebar markup (nav links + language toggle) into that page's `<div id="sidebar">` placeholder and wires the toggle/click-outside-to-close. Must run *before* `initI18n()` in each entry script, since `initI18n()` binds/translates the language-toggle markup that `initNavShell()` just injected.
- `pagination.js` — shared pagination/loading state (`LIMIT`, `pokemonCache`, `visibleStart`/`visibleCount`, `loadNext`/`loadPrevious`, `hasMoreData`, `withLoader`, `getEvolutionData`). No top-level side effects — see above.
- `main.js` — index.html's entry point only: calls `init()` which wires nav/i18n/dialog/load-buttons and triggers the default browse-all load.
- `search-page.js` — pages/search.html's entry point only: same wiring minus the default load, plus `bindSearchInputs()`.
- `search.js` — name/type search state and pagination over search results. Owns `activeList`/`currentMode`, read by `ui.js`, `dialog.js`, `i18n.js`, and `pagination.js`.
- `templates.js` — pure functions returning HTML template strings (card markup, dialog markup, per-tab markup, sidebar markup lives in `nav.js` instead since it's behavior-coupled). No DOM access, no state.
- `dialog.js` — Pokémon detail dialog: opening/closing, per-tab rendering (`TAB_RENDERER` dispatch table lives in `ui.js`), arrow-navigation enable/disable state, owns `currentIndex`/`currentDialogPokemon`/`currentDialogEntry`.
- `ui.js` — DOM binding/rendering: card grid rendering, dialog open/close/navigation event wiring, load-button visibility, search-input wiring (`bindSearchInputs()` — no toggle logic anymore, search isn't a header dropdown), stat color/percent calculation (`getStatColor`), type-color gradients. Exports small composable `bind*` functions rather than one monolithic `bindUI()`, since each page's entry script needs a different subset.

### Pages and routing

Multi-page app, no router. `index.html` **must stay at repo root** — GitHub Pages serves `/` from it directly. Every other page goes in `pages/` (`pages/imprint.html`, `pages/search.html`). Future pages from the TODO.md roadmap (`calc.html`, `items.html`, `moves.html`, etc.) follow the same rule: new page in `pages/`, its own entry script (`js/<page>-page.js` or similar) plus its own `js/<page>.js`/`css/<page>.css` if it needs page-specific logic/styling, reusing shared modules (`api.js`, `ui.js`, `dialog.js`, `templates.js`, `nav.js`, `pagination.js`) rather than duplicating them.

### CSS structure

- `css/variables.css` — all design tokens (colors, spacing scale `--space-1`..`--space-7`, radius scale, transition timings). Always linked first.
- `css/standard.css` — element resets/base styles (`body`, `header`/`footer`/`main` layout) plus page-chrome utility classes (`.max-content`, `.hide-mobile`, `.loader`, etc.) that don't belong to one specific component. There is **no base `button` element rule** — it was deliberately removed; every button class (`svg-button`, `lang-btn`, `load-btn`, `tab-btn`) defines its own full styling including its own `:hover`. A plain `<button>` with no component class gets no styling at all, so don't add one — always use one of the existing button classes, or add a new one with its own complete rule set (background, border, `:hover`) rather than relying on inheriting from a shared base that doesn't exist anymore.
- `css/components/` — one file per UI component (`buttons.css`, `inputs.css`, `search.css`, `cards.css`, `dialog.css`, `nav.css`), flat, no further nesting.
- `css/responsive.css` — media query overrides only, linked last so it can override component rules.
- `css/fonts.css` — `@font-face` declarations.

**Button interaction model** (established convention, keep new buttons consistent with it): hover = `border-color: var(--accent-color)` + a `scale()` transform (never a background-color fill — the UI is dark with white text everywhere, and fill colors need individual contrast checking that border colors don't). Active/selected state = `border-color: var(--accent-color)` only, no fill. Icon-only buttons (circular, fixed size) use class `svg-button`; never invent a parallel class for an icon button — there was previously a bug where the search-toggle button used a one-off `search-button` class instead of `svg-button` and silently fell back to the wrong shape.

**Any local/relative asset path referenced from shared JS (not page-specific HTML) must be root-relative (`/assets/...`), not `./assets/...`.** `js/ui.js`'s `getTypeIcon()` is shared by every page; a `./`-relative path resolves against whichever page's URL is currently loaded, so it breaks for any page not at the repo root (e.g. `pages/search.html`). This is safe because the site deploys at a custom domain root, not a GitHub Pages subpath.

### Naming convention for future CSS/JS file splits

Don't pre-create subfolders or split files until there's an actual reason (a real second page, a file that's grown genuinely hard to navigate). Both `js/` and `css/components/` are meant to stay flat; only introduce subfolders (`js/core/`, `js/pages/`, etc.) once the flat list is unwieldy (~8–10 files), not in advance.

## Roadmap

`TODO.md` is the authoritative, actively-maintained roadmap, organized as numbered "sessions" (not chronological dates — session 1 is deployment/done, session 2 is i18n, session 3 is UI polish, session 4 is navigation/architecture, sessions 5+ are individual features like a stats calculator, type matchup tab, damage calculator, etc.). Check it before starting work to see what's already decided vs. still open, and update its checkboxes as items are completed.
