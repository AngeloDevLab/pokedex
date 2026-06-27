# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A vanilla JS, no-framework, no-build-tool Pokédex / competitive Pokémon guide, deployed via GitHub Pages from `main` at pokedex.angelodevelopment.de. There is no `package.json`, no bundler, no test runner — just static HTML/CSS/JS served as-is.

## Running it locally

Open `index.html` through a local server (e.g. VS Code "Live Server"), **not** via a `file://` URL — `js/i18n.js` fetches `locales/*.json` and `js/search.js`/`js/api.js` hit the PokéAPI, both of which fail under `file://` due to CORS/fetch restrictions on the file protocol.

There is no build, lint, or test command — nothing to run before checking changes beyond reloading the page in a browser.

## Branching

`main` is the GitHub Pages deploy source and must stay stable/deployable at all times. This is a solo project, so the convention is a single persistent `dev` branch for ongoing work (not one branch per feature) — merge `dev` → `main` whenever there's a stable, tested checkpoint, not necessarily only at session boundaries in TODO.md. Short-lived branches off `dev` are fine for one-off experiments that might get discarded, but that's the exception.

## Architecture

### Script loading model — not ES modules

All `js/*.js` files are loaded via plain `<script>` tags in `index.html` (no `type="module"`, no `import`/`export`). Every top-level `function`/`let`/`const` in each file is an **implicit global** shared across all other script files. This means:

- **Load order in `index.html` matters.** A file can reference a global defined in a file loaded later in the list, as long as nothing actually *calls* that reference before the later file has executed (i.e. function declarations are hoisted/available, but module-level `let` state is not initialized until its own script runs).
- There is real cross-file shared mutable state: `activeList`, `currentMode`, `searchOffset`, `searchResults` (`js/search.js`), `pokemonCache`, `visibleStart`, `visibleCount`, `LIMIT` (`js/main.js`), `currentIndex`, `currentDialogPokemon`, `currentDialogEntry` (`js/dialog.js`), `LOAD_MODE` (`js/ui.js`). Renaming or scoping any of these requires grepping all 7 files, not just the one you're editing.
- A planned migration to ES Modules exists in TODO.md (Session 4) but has **not** happened — circular dependencies between `js/ui.js` and `js/dialog.js` were already identified as a blocker that needs its own design pass, not a mechanical rename.

### Module responsibilities (`js/`)

- `api.js` — all PokéAPI fetch calls. No dependencies on other files. `speciesCache` memoizes species lookups.
- `i18n.js` — loads `locales/{en,de,ja}.json`, exposes `t(key, vars, fallback)` for translated strings, handles language switching and re-rendering translated DOM (`data-i18n` / `data-i18n-placeholder` attributes). `rerenderDynamicContent()` re-invokes `renderPokemonList`/`openDialog` from `ui.js`/`dialog.js` on language change — this is the one place i18n reaches into rendering state owned by other files.
- `main.js` — pagination state and the load-more/load-previous orchestration, evolution-chain fetching glue (`getEvolutionData`), the loader overlay helper `withLoader`.
- `search.js` — name/type search state and pagination over search results. Owns `activeList`/`currentMode`, which `ui.js` and `dialog.js` both read.
- `templates.js` — pure functions returning HTML template strings (card markup, dialog markup, per-tab markup). No DOM access, no state.
- `dialog.js` — Pokémon detail dialog: opening/closing, per-tab rendering (`TAB_RENDERER` dispatch table lives in `ui.js`), arrow-navigation enable/disable state.
- `ui.js` — DOM binding/rendering: card grid rendering, dialog open/close/navigation event wiring, search panel UI, load-button visibility, stat color/percent calculation (`getStatColor`), type-color gradients.

### Pages and routing

Multi-page app, no router. `index.html` **must stay at repo root** — GitHub Pages serves `/` from it directly. Every other page goes in `pages/` (currently just `pages/imprint.html`). Future pages from the TODO.md roadmap (`calc.html`, `items.html`, `moves.html`, etc.) follow the same rule: new page in `pages/`, with its own `js/<page>.js` + `css/<page>.css` per the convention below — never add `type="module"` to just one page, since the rest of the app still relies on global-script loading.

### CSS structure

- `css/variables.css` — all design tokens (colors, spacing scale `--space-1`..`--space-7`, radius scale, transition timings). Always linked first.
- `css/standard.css` — element resets/base styles (`body`, `button`, `header`/`footer`/`main` layout) plus page-chrome utility classes (`.max-content`, `.hide-mobile`, `.loader`, etc.) that don't belong to one specific component.
- `css/components/` — one file per UI component (`buttons.css`, `inputs.css`, `search.css`, `cards.css`, `dialog.css`), flat, no further nesting.
- `css/responsive.css` — media query overrides only, linked last so it can override component rules.
- `css/fonts.css` — `@font-face` declarations.

**Button interaction model** (established convention, keep new buttons consistent with it): hover = `border-color: var(--accent-color)` + a `scale()` transform (never a background-color fill — the UI is dark with white text everywhere, and fill colors need individual contrast checking that border colors don't). Active/selected state = `border-color: var(--accent-color)` only, no fill. Icon-only buttons (circular, fixed size) use class `svg-button`; never invent a parallel class for an icon button — there was previously a bug where the search-toggle button used a one-off `search-button` class instead of `svg-button` and silently fell back to the wrong shape.

### Naming convention for future CSS/JS file splits

Don't pre-create subfolders or split files until there's an actual reason (a real second page, a file that's grown genuinely hard to navigate). Both `js/` and `css/components/` are meant to stay flat; only introduce subfolders (`js/core/`, `js/pages/`, etc.) once the flat list is unwieldy (~8–10 files), not in advance.

## Roadmap

`TODO.md` is the authoritative, actively-maintained roadmap, organized as numbered "sessions" (not chronological dates — session 1 is deployment/done, session 2 is i18n, session 3 is UI polish, session 4 is navigation/architecture, sessions 5+ are individual features like a stats calculator, type matchup tab, damage calculator, etc.). Check it before starting work to see what's already decided vs. still open, and update its checkboxes as items are completed.
