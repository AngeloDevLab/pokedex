# Pokémon Guide – Roadmap

**Ziel:** pokedex.angelodevelopment.de — ein vollständiger, competitive-tauglicher Pokémon Guide  
**Hosting:** GitHub Pages + Custom Domain (pokedex.angelodevelopment.de)  
**Stack:** Vanilla JS, kein Framework, kein Build-Tool

---

## Session 1 — Deployment

**Ziel:** Seite live schalten unter pokedex.angelodevelopment.de

- [x] GitHub Pages aktivieren (Branch: `main`, Root `/`)
- [x] `CNAME`-Datei ins Repo (Inhalt: `pokedex.angelodevelopment.de`)
- [x] Custom Domain in GitHub Repo-Settings eintragen
- [x] DNS beim Registrar konfigurieren (A-Records auf GitHub IPs)
- [x] HTTPS erzwingen (GitHub-Setting)
- [x] Testen: pokedex.angelodevelopment.de lädt korrekt

---

## Session 2 — Internationalisierung (i18n)

**Ziel:** Mehrsprachigkeit als Grundlage — EN / DE / JA — bevor weitere Features gebaut werden

### Architektur
- [x] `locales/en.json`, `locales/de.json`, `locales/ja.json` anlegen
- [x] `js/i18n.js` schreiben:
  - `t('key')` Funktion für UI-Strings
  - Sprachpräferenz in LocalStorage speichern
  - Fallback auf `en` wenn Key fehlt
- [x] Language-Toggle im Header (EN / DE / JA)
- [x] Bei Sprachwechsel: UI neu rendern ohne Seitenreload

### Bestehende Strings ersetzen
- [x] Alle hardcodierten UI-Texte im bestehenden Code durch `t('key')` ersetzen
  - Buttons: „load more", „load previous", „Clear Search", …
  - Labels: „Search by Name", „Filter by Type", …
  - Dialog: Tab-Beschriftungen, „No results found", …

### Pokémon-Daten mehrsprachig
- [ ] Pokémon-Namen aus PokéAPI sprachabhängig laden (`names` Array)
- [ ] Flavor Texts sprachabhängig laden (`flavor_text_entries`)
- [ ] Move- und Ability-Namen sprachabhängig (für spätere Sessions vorbereiten)
- [ ] Japanisch: PokéAPI liefert `ja` (Kanji) und `ja-Hrkt` (Hiragana/Katakana) — `ja-Hrkt` als Default für JA

> Hinweis: erfordert Vorladen der Species-Daten je Pokémon-Karte (aktuell nur lazy beim Dialog-Öffnen) — eigener Performance-Umbau, daher in diesem Schritt bewusst zurückgestellt.

### Japanisch UI-Strings
- [x] `ja.json` initial manuell übersetzt (kein DeepL-Zugriff verfügbar — bei Bedarf später von Muttersprachler/DeepL gegenprüfen)
- [ ] CJK-Zeichensatz testen (System-Fonts reichen auf modernen OS)

---

## Session 3 — UI Polish (Zwischenschritt)

**Ziel:** Kleinigkeiten im bestehenden UI verfeinern, bevor Navigation/Architektur (Session 4) und weitere Features draufgesetzt werden

- [x] Hover-States durchgegangen und vereinheitlicht — Buttons hatten 5 verschiedene Hover/Active-Stile (Fill+Scale, nur Fill, nur Border, …); jetzt ein gemeinsames Modell: Hover = Border-Color `--accent-color` + Scale, Active/Selected = nur Border-Color, nie ein Hintergrund-Fill (wichtig wegen weißer Schrift überall — Border-Farbe braucht keinen Kontrast-Check, ein Fill schon)
- [x] `css/variables.css` angelegt: Farben, Spacing-, Radius- und Transition-Skala zentralisiert (vorher über `standard.css`/`style.css` verstreut hartcodiert); `style.css` komplett in `css/components/*.css` aufgeteilt (buttons, inputs, search, cards, dialog)
- [x] Farbpalette neu gewählt: 4 Farben (`--primary-color #1d1234`, `--secondary-color #1f1e33`, `--accent-color #5500ff`, `--muted-color #dadada`) statt der alten 3 (+ ungenutzter Rest einer 7er-Palette)
- [ ] Stat-Farben (`--stat-low`/`--stat-mid`/`--stat-high`, aktuell noch `red`/`orange`/`green`) inhaltlich auf Kontrast/Wirkung prüfen — sind jetzt zentral in `variables.css`, aber noch nicht bewertet
- [x] Spacing/Abstände im Header gegengecheckt — Bug gefunden + gefixt: `.search-panel` war bei `top: 80px` während Header `6rem` (96px) hoch ist, dadurch 16px Überlappung beim Öffnen; jetzt beide an `var(--header-height)` gekoppelt
- [x] Bug gefunden + gefixt: Such-Toggle-Button hatte Klasse `search-button` statt `svg-button` und sah dadurch eckig statt rund/konsistent zu den anderen Icon-Buttons aus
- [ ] Weitere kleinere visuelle Unstimmigkeiten sammeln und fixen

---

## Session 4 — Navigation & Architektur

**Ziel:** Grundgerüst schaffen, bevor weitere Seiten/Tabs (Sessions 5+) den Header/die Codebasis überladen

### Architektur-Entscheidungen
- [x] MPA bestätigt (passt zur bestehenden Roadmap — `calc.html`, `items.html`, etc. sind bereits als eigene Seiten geplant — sowie zu „kein Build-Tool" + GitHub-Pages-Hosting)
- [x] Ordnerstruktur: `scripts/` → `js/`, `styles/` → `css/`; neue Seiten außer `index.html` (das aus GitHub-Pages-Gründen im Root bleiben muss) wandern in `pages/` (z. B. `pages/imprint.html`)
- [x] Konvention für künftige Seiten (Sessions 5+): pro Seite eine `js/<seite>.js` + `css/<seite>.css`, flach in `js/`/`css/` (kein Unterordner pro Seite, solange es nur wenige sind). Gemeinsam genutzter Code (`api.js`, `i18n.js`, ggf. `ui.js`-Helfer) bleibt zentral und wird von mehreren Seiten eingebunden. Aufteilung in Unterordner (z. B. `js/core/`, `js/pages/`) erst, wenn die flache Liste unübersichtlich wird (~8–10 Dateien) — nicht vorab anlegen.
- [x] Umstieg auf ES Modules (`<script type="module">`, `import`/`export` statt globaler Funktionen/Variablen) — `index.html` lädt jetzt nur noch `js/main.js`, der Rest wird über den Import-Graphen automatisch nachgeladen. Zwei echte Blocker dabei gefunden und behoben: `currentIndex`/`currentDialogPokemon`/`currentDialogEntry` wurden aus `ui.js` nach `dialog.js` verschoben (waren dort eigentlich beheimatet, wurden aber von einer anderen Datei reassigned, was ES Modules nicht erlaubt); `visibleStart` bekam einen `setVisibleStart()`-Setter in `main.js`, weil `search.js` es von außen reassigned hat. Zwei verbleibende zirkuläre Imports (`ui.js`↔`dialog.js`, `ui.js`↔`search.js`) sind unkritisch, da nur Funktions-Deklarationen (gehoistet) betroffen sind und alle Zugriffe erst innerhalb von Funktionsaufrufen passieren, nie auf Modul-Ebene — mit `node --check` und einem Lade-Test des kompletten Modul-Graphen verifiziert.

### Navigation-Shell
- [x] Burger-Menü (`#nav-toggle`) öffnet eine Sidebar, die von rechts reinfliegt (`js/nav.js` + `css/components/nav.css`) — gleiches Verhalten auf Mobile, nur volle Breite statt 320px (Media-Query in `responsive.css`)
- [x] Sidebar wird zur Laufzeit per JS in einen `<div id="sidebar">`-Platzhalter injiziert (gleiches Template-String-Muster wie `templates.js`), statt das Markup in jeder Seite zu duplizieren
- [x] Default-Ansicht bleibt der bestehende Pokémon-Grid-Scroll
- [x] Menü verlinkt zu `pages/search.html` (siehe unten); weitere Seiten (`calc.html`, `items.html`, …) werden erst eingetragen, wenn sie existieren — keine toten Links auf Vorrat
- [x] Language-Toggle ins Menü verschoben
- [x] Header aufgeräumt: nur noch Logo + Burger-Toggle (Search ist komplett raus, siehe unten)
- [x] **Suche wurde zur eigenen Seite** (`pages/search.html`, eigener Entry-Point `js/search-page.js`) statt nur ins Menü verschoben — Header brauchte dafür keinen Such-Button/Such-Panel mehr. `js/ui.js`s monolithisches `bindUI()`/`bindSearchUI()` wurden dafür in einzelne `bind*`-Funktionen aufgeteilt, die jede Seite selbst zusammensetzt (index.html: Dialog + Pagination + Nav-Shell; search.html: zusätzlich `bindSearchInputs()`, kein automatischer Default-Load)
- [x] Bug beim Umbau gefunden + gefixt: `js/main.js`s `DOMContentLoaded`-Bootstrap (inkl. `loadPokemon()` für die Default-Browse-Ansicht) wurde transitiv mitgeladen, sobald `pages/search.html` über `ui.js` irgendwas aus `main.js` importierte — die geteilte Pagination-Logik (`LIMIT`, `pokemonCache`, `loadNext`/`loadPrevious`, `getEvolutionData`, `withLoader`, …) wanderte deshalb in ein neues, seiteneffektfreies `js/pagination.js`; `main.js` ist jetzt nur noch der schlanke Entry-Point für index.html
- [x] Basis-`button`-Regel in `standard.css` komplett entfernt — jede Button-Klasse (`svg-button`, `lang-btn`, `load-btn`, `tab-btn`) hat jetzt ihr eigenes vollständiges Regelwerk inkl. eigenem `:hover` (Border-Color `--accent-color` + `scale(1.05)`, gleiches Muster wie bisher), da nichts mehr geerbt wird
- [x] Bug gefunden + gefixt: `getTypeIcon()` in `js/ui.js` baute einen seitenrelativen Pfad (`./assets/...`) — auf `pages/search.html` zeigte das auf `pages/assets/...` (404). Jetzt root-relativ (`/assets/...`), funktioniert unabhängig von der Seitentiefe (sicher, weil die Seite an der Domain-Root deployed wird)

---

## Zwischenschritt — Muster für Pokémon-Tool-Seiten

**Kurswechsel (nach Session 4 entschieden):** Der Dialog bekommt **keine weiteren neuen Tabs** mehr (bleibt bei Info/Stats/Evolution/Artworks). Alles, was ursprünglich als neuer Dialog-Tab geplant war (Sessions 5, 6, 7, 9, 11 — und tendenziell auch 12, 14, siehe dort), wird stattdessen eine **eigene Seite**, verlinkt aus der Sidebar neben „Search". Hintergrund: diese Inhalte sind eher eigenständige Werkzeuge/Referenzen als Detailinfos zum gerade offenen Pokémon, und der Dialog würde mit 6+ Tabs unübersichtlich.

**Gemeinsames Muster für jede dieser Seiten:**
- Eigene Pokémon-Suche/Auswahl direkt auf der Seite (wie schon für `calc.html`/Session 8 geplant)
- Zusätzlich aus dem Dialog heraus verlinkt (Button/Icon bei der jeweiligen Pokémon-Karte), mit vorausgefülltem Pokémon
- Sonderfälle (Session 12 Regionalformen, Session 14 Fundorte) sind aktuell auch als eigene Seite vorgesehen, aber das ist nicht in Stein gemeißelt — wenn sich bei der jeweiligen Session ein Dialog-Tab doch sinnvoller anfühlt, können wir das dann nochmal anders entscheiden.

**Vorarbeit — Cache für die Pokémon-Liste:** Jede dieser Seiten braucht ihre eigene Pokémon-Suche, die intern `fetchAllPokemonList()` nutzt (die große ~1300-Einträge-Liste). Aktuell wird die bei jedem Seitenwechsel neu geladen, weil der In-Memory-Cache (`allPokemonList` in `search.js`) nicht über Seitenwechsel hinweg besteht. Bevor mehrere neue Seiten das brauchen:
- [x] `localStorage`-Cache für die Liste aus `fetchAllPokemonList()` (nur `{name, url}`-Paare, ~130 KB — passt locker ins Limit) — direkt in `js/api.js` verdrahtet (versionierter Key `pokedex:allPokemonList:v1`), damit jeder Aufrufer automatisch profitiert, nicht nur `search.js`
- [x] Bewusst **nicht** die vollen Pokémon-Detail-Objekte gecacht (würden bei ~1300 Stück mehrere MB werden, sprengt das übliche 5–10 MB-Limit) — die sind ohnehin schon über den normalen Browser-HTTP-Cache bei wiederholten Requests an dieselbe URL abgedeckt
- [ ] Bei Bedarf später: falls doch mehr Detail-Daten dauerhaft gecacht werden sollen, dafür IndexedDB statt `localStorage` nutzen (höheres Quota, dafür gemacht) — nicht jetzt nötig

---

## Session 5 — Statuswert-Rechner (eigene Seite)

**Ziel:** Eigene Seite `pages/stats-calc.html` für den vollständigen IV/EV/Nature-Rechner (siehe Zwischenschritt oben — kein Dialog-Tab mehr)

- [x] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [x] IV-Eingabefelder (0–31, Standard: 31) für alle 6 Stats
- [x] EV-Eingabefelder (0–252, Standard: 0) mit Live-Summen-Counter (≤ 510)
- [x] Nature-Dropdown (alle 25 Wesen, positiver Stat grün / negativer rot markiert)
- [x] Endwert live berechnen nach offizieller Formel (Level 100):
  - KP: `⌊(2·AS + IS + ⌊EV/4⌋) · 1⌋ + 110`
  - Rest: `⌊(⌊(2·AS + IS + ⌊EV/4⌋) + 5⌋ · Nature⌋`
- [x] Endwert groß neben Balken anzeigen, Balken reagiert live
- [x] Farbcodierung Endwert: grün ≥ 100 / orange 60–99 / rot < 60
- [x] Schnell-Button „Reset" (EVs 0, IVs 31, Nature neutral)
- [x] Gesamt-BST der Endwerte unten anzeigen
- [x] Info-Tabelle Kampfstufen (−6 bis +6) mit Multiplikator

---

## Session 6 — Typ-Matchup (eigene Seite)

**Ziel:** Eigene Seite `pages/matchup.html` — auf einen Blick sehen welche Typen wie viel Schaden gegen ein gewähltes Pokémon machen

- [x] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [x] Tabelle: alle 18 Typen mit Schadens-Multiplikator gegen dieses Pokémon
  - 4× / 2× / 1× / 0,5× / 0,25× / 0× (Immunität)
- [x] Dual-Typ-Berechnung automatisch (z.B. Wasser/Boden = Gras trifft 4×)
- [x] Typ-Icons statt Text für kompakte Darstellung
- [x] Statische Matchup-Matrix als JS-Objekt (ändert sich nie)

---

## Session 7 — Lernset (eigene Seite)

**Ziel:** Eigene Seite `pages/learnset.html` — alle Attacken, die ein gewähltes Pokémon lernen kann

- [ ] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [ ] Anzeige nach Lernmethode gruppiert: Level-up / TM / Egg Move / Tutor
- [ ] Level-up: Level + Move-Name + Typ-Icon + Kategorie-Icon
- [ ] Egg Moves farblich hervorheben (competitive relevant)
- [ ] Move-Details on click: Power, Accuracy, PP, Kategorie, Effekt-Text
- [ ] Move-Namen sprachabhängig (i18n aus Session 2 nutzen)
- [ ] Datenquelle: PokéAPI `/pokemon/{id}` liefert komplettes Learnset
- [ ] Abgrenzung zu Session 16 (`moves.html`): diese Seite zeigt das Lernset **eines gewählten Pokémon**, Session 16 ist die allgemeine Move-Datenbank ohne Pokémon-Bezug

---

## Session 8 — Schadensrechner

**Ziel:** Eigene Seite `calc.html` + Integration im Dialog als Schnell-Check

- [ ] Seite `calc.html` mit zwei Seiten: Angreifer / Verteidiger
- [ ] Angreifer: Pokémon wählen (Suche), Angriff-Stat + EVs/Nature, Move auswählen
- [ ] Verteidiger: Pokémon wählen, HP + Def/SpDef + EVs/Nature
- [ ] Im Dialog: Verteidiger vorausgefüllt mit aktuellem Pokémon
- [ ] Ergebnis: Schadensspanne Min–Max in HP und in % der Gesamt-HP
  - z.B. „84–99 HP (52–61%)"
- [ ] OHKO / 2HKO / 3HKO Indikator mit Farbmarkierung
- [ ] Schadensformel: `⌊⌊⌊2·Level/5+2⌋ · Angriff/Verteidigung · BasePower / 50 + 2⌋ · Modifier⌋`

---

## Session 9 — Breeding Guide (eigene Seite)

**Ziel:** Alles was man für kompetitive Zucht wissen muss — eigene Seite `pages/breeding.html`, kein Dialog-Tab mehr (siehe Zwischenschritt vor Session 5)

- [ ] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [ ] Ei-Gruppe(n) anzeigen (mit welchen Pokémon kann es züchten)
- [ ] Egg Moves Liste (aus Learnset, Lernmethode `egg`)
- [ ] Für jeden Egg Move: welche anderen Pokémon vererben ihn (Zucht-Kette)
- [ ] Allgemeiner Teil (Pokémon-unabhängig, gleiche Seite):
  - Schritt-für-Schritt IV-Zucht-Anleitung (Destino-Knoten, Items)
  - Nature-Tabelle: alle 25 Wesen mit +/− Stats
  - Hidden Ability: wie bekommt man sie (Max-Raid, Ability Patch)
  - Masuda-Methode erklärt

---

## Session 10 — Speed-Tier-Übersicht

**Ziel:** Seite `speed-tiers.html` — wer überholt wen beim Teambuilding

- [ ] Alle Pokémon sortiert nach Initiativ-Endwert (Lvl 100, 31 IVs, 252 EVs, neutral)
- [ ] Filter nach Generation / Smogon-Tier
- [ ] Eingabefeld: Speed-Wert eingeben → markiert was drüber / drunter liegt
- [ ] Choice Scarf Toggle (×1,5) per Button
- [ ] Wichtige Benchmarks highlighten (z.B. 130 = Dragapult-Speed-Tier)

---

## Session 11 — Competitive (eigene Seite)

**Ziel:** Eigene Seite `pages/competitive.html` — Smogon-Tier und Beispiel-Sets zu einem gewählten Pokémon (kein Dialog-Tab mehr, siehe Zwischenschritt vor Session 5)

- [ ] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [ ] Smogon-Tier anzeigen (OU / UU / RU / NU / Ubers / NFE / LC)
  - Datenquelle: eigene `smogon-tiers.json` (manuell gepflegt oder geskrapt)
- [ ] 1–2 Beispiel-Sets im Showdown-Export-Format:
  - Pokémon @ Item / Ability / EVs / Nature / Moves
- [ ] „Was schlägt X?" Sektion:
  - Häufige Counter mit kurzem Grund (Typ, Speed, Ability)
  - Datenquelle: kuratierte `counters.json`

---

## Session 12 — Regionale Formen & Megas (eigene Seite, vorläufig)

**Ziel:** Alola/Galar/Hisui/Paldea-Formen und Mega-Entwicklungen zu einem gewählten Pokémon

> Vorläufig als eigene Seite `pages/forms.html` eingeplant, analog zu den anderen Sessions oben. Da das hier am stärksten an "genau dieses eine Pokémon gerade offen" hängt, nochmal neu bewerten, wenn diese Session tatsächlich anfängt — ein Dialog-Tab könnte hier am Ende doch die bessere Wahl sein.

- [ ] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus (oder doch Dialog-Tab — siehe Hinweis oben)
- [ ] Varianten-Auswahl wenn Formen vorhanden (z.B. „Alola" / „Galar")
  - PokéAPI: eigene Einträge wie `rattata-alola`, `mewtwo-mega-x`
- [ ] Stats, Typ, Ability der Form korrekt laden und anzeigen
- [ ] Mega-Entwicklungen: Stats-Unterschied zur Basis-Form visualisieren
- [ ] Gigantamax-Formen: G-Max Move + Unterschied zu Standard-Dynamax
- [ ] Auf der Pokémon-Karte kleines Icon wenn Formen vorhanden

---

## Session 13 — Items-Übersicht

**Ziel:** Seite `items.html` mit Fokus auf competitive relevante Items

- [ ] Alle Held Items listbar + filterbar (Kategorie: Choice / Berry / Mega Stone / …)
- [ ] Suchfeld nach Item-Name
- [ ] Item-Detail: Effekt-Text, wann competitive sinnvoll
- [ ] Competitive-relevante Items hervorheben:
  - Choice Band / Specs / Scarf, Life Orb, Leftovers, Rocky Helmet, Eviolite, …
- [ ] „Typisch gehalten von" — Verlinkung zu Pokémon die dieses Item nutzen

---

## Session 14 — Fundorte & Shiny Hunting (eigene Seite)

**Ziel:** Wo finde ich dieses Pokémon, wie shinye ich es effizient — eigene Seite `pages/shiny.html`, kein Dialog-Tab mehr (Fundorte-Teil wandert mit dazu statt eigener Dialog-Tab „Finden", siehe Zwischenschritt vor Session 5)

- [ ] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [ ] Fundorte je Spielversion (PokéAPI `/pokemon/{id}/encounters`)
  - Hinweis wenn nur über Zucht / Trade / Event
- [ ] Allgemeiner Teil (Pokémon-unabhängig, gleiche Seite):
  - Methoden-Übersicht je Generation (Masuda, Radar-Kette, DexNav, Max-Raids, Massenausbrüche)
  - Wahrscheinlichkeits-Tabelle (1/4096 Basis, mit Shiny Charm, mit Methode)
  - Für jedes Pokémon: effizienteste Methode

---

## Session 15 — Suche & Filter erweitern

**Ziel:** Suche um sinnvolle Parameter ergänzen

> Hinweis: Die Suche ist bereits in Session 4 auf eine eigene Seite (`pages/search.html`) umgezogen, vorgezogen im Zuge des Nav-Shell-Umbaus. Die Punkte hier sind die noch offenen Erweiterungen.

- [ ] Filter nach Generation (Gen 1–9) — PokéAPI `/generation/{id}`
- [ ] Filter nach Ei-Gruppe
- [ ] Suche nach Ability
- [ ] Sortierung: nach ID / Name / Basis-Gesamt-Wert (BST)
- [ ] URL-Parameter (`?type=fire&gen=1`) für Deep-Links und Sharing

---

## Session 16 — Moves & Abilities Seiten

**Ziel:** Vollständige Referenz für Moves und Abilities

- [ ] `moves.html` — alle Moves filterbar nach Typ / Kategorie (Physisch/Speziell/Status)
  - Move-Detail: Power, Accuracy, PP, Effekt-Text, welche Pokémon lernen ihn
- [ ] `abilities.html` — alle Abilities listbar
  - Ability-Detail: Effekt, welche Pokémon haben sie
  - Competitive relevante Abilities hervorheben (Speed Boost, Intimidate, …)

---

## Session 17 — Guide-Inhalte (VGC & Wetter-Teams)

**Ziel:** Redaktionelle Guide-Inhalte für Einsteiger ins Competitive

- [ ] Guide-Sektion oder eigene Seite `guide.html`
- [ ] VGC vs. Singles erklärt: Regelwerk, Teamgröße, Doubles-Mechaniken
- [ ] Teambuilding-Archetypes:
  - Hyper Offense / Balance / Stall kurz erklärt
  - Regen / Sonne / Sand / Hagel / Schnee — Setter, Abuser, Synergien
- [ ] Empfohlene Einstiegs-Teams mit Links zu den Pokémon
- [ ] Aktuelles VGC-Format (Series/Regelset) — manuell gepflegt

---

## Session 18 — UI/UX Polish (Feinschliff)

**Ziel:** Feinschliff, bevor der Guide als „fertig" gilt

- [ ] Dark / Light Mode Toggle
- [ ] Pokémon-Karten: Hover-Effekt mit Kurzinfo (Tier, BST)
- [ ] Mobile: Swipe-Geste im Dialog (links/rechts)
- [ ] Pokémon-Cry abspielen (PokéAPI liefert `.ogg`)
- [ ] Favoriten-Liste (LocalStorage)

---

## Datenquellen (Referenz)

| Inhalt | Quelle |
|---|---|
| Pokémon, Moves, Abilities, Evo, Learnset | PokéAPI `/pokemon/{id}` |
| Pokémon-Namen mehrsprachig | PokéAPI `names` Array (`en`, `de`, `ja`, `ja-Hrkt`) |
| Flavor Texts mehrsprachig | PokéAPI `flavor_text_entries` |
| Fundorte | PokéAPI `/pokemon/{id}/encounters` |
| Natures | PokéAPI `/nature/{id}` |
| Items | PokéAPI `/item/{id}` |
| Regionale Formen / Megas | PokéAPI (eigene Einträge, z.B. `rattata-alola`) |
| Typ-Matchup-Matrix | Statisch als JS-Objekt |
| Nature-Tabelle | Statisch (25 Wesen, unveränderlich) |
| UI-Strings (EN/DE/JA) | `locales/*.json` — JA initial manuell übersetzt |
| Smogon Tiers | Eigene `smogon-tiers.json` |
| Competitive Sets / Counter | Eigene `sets.json` / `counters.json` |
| Shiny-Wahrscheinlichkeiten | Statisch je Generation |
| Speed-Benchmarks | Aus PokéAPI-Daten berechnet |
