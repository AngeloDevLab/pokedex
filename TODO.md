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
- [ ] Sprachumstellung aktualisiert dynamisch gerenderten Content auf den Tool-Seiten nicht live (z.B. Nature-Tabelle auf `breeding.html`) — `i18n.js`s `rerenderDynamicContent()` re-rendert bisher nur `activeList`/den Dialog (index/search), Tool-Seiten (stats-calc, matchup, learnset, damage-calc, breeding) hängen sich da nicht ein und müssten ihre dynamischen Teile bei Sprachwechsel selbst neu rendern (oder der/die zuletzt ausgewählte Zustand wird beim Reselect einfach neu gezogen) — aktuell bewusst zurückgestellt, siehe Zwischenschritt-Entscheidung "erst durchziehen, dann Polish"

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

- [x] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [x] Anzeige nach Lernmethode gruppiert: Level-up / TM / Egg Move / Tutor
- [x] Level-up: Level + Move-Name + Typ-Icon + Kategorie-Icon — Kategorie als farbiger Punkt statt eigenem Icon-Asset (kein Physisch/Spezial/Status-Icon im Bestand, Farbe reicht für die Unterscheidung)
- [x] Egg Moves farblich hervorheben (competitive relevant)
- [x] Move-Details on click: Power, Accuracy, PP, Kategorie, Effekt-Text
- [x] Move-Namen sprachabhängig (i18n aus Session 2 nutzen) — nutzt PokéAPIs eigenes `names`-Array je Move, gefiltert auf die aktuell über `i18n.js` gewählte Sprache (Fallback: EN, dann formatierter Slug)
- [x] Datenquelle: PokéAPI `/pokemon/{id}` liefert komplettes Learnset
- [x] Abgrenzung zu Session 16 (`moves.html`): diese Seite zeigt das Lernset **eines gewählten Pokémon**, Session 16 ist die allgemeine Move-Datenbank ohne Pokémon-Bezug

---

## Session 8 — Schadensrechner

**Ziel:** Eigene Seite `calc.html` + Integration im Dialog als Schnell-Check

- [x] Seite `pages/damage-calc.html` mit zwei Spalten: Angreifer / Verteidiger (statt eines eigenen `calc.html` im Root — folgt der etablierten `pages/`-Konvention)
- [x] Angreifer: Pokémon wählen (Suche), Angriff-Stat + EVs/Nature, Move auswählen — Move-Auswahl kommt aus dem echten Lernset des Angreifers (`core/moveset.js`, aus `learnset-page.js` extrahiert, da jetzt 2 Verbraucher), gefiltert auf schadende Attacken; welcher Stat (Angriff/Sp. Angriff) gezeigt wird, richtet sich nach der Kategorie der gewählten Attacke
- [x] Verteidiger: Pokémon wählen, HP + Def/SpDef + EVs/Nature — gleiche Kategorie-Logik wie beim Angreifer
- [x] Im Dialog: Verteidiger vorausgefüllt mit aktuellem Pokémon — `?defender=`-Query-Param (separat von `?pokemon=`, da der Angreifer-Picker auf derselben Seite den Standard-Parameter nutzt; `pokemon-picker.js` bekam dafür einen optionalen `queryParam`)
- [x] Ergebnis: Schadensspanne Min–Max in HP und in % der Gesamt-HP
  - z.B. „84–99 HP (52–61%)"
- [x] OHKO / 2HKO / 3HKO Indikator mit Farbmarkierung — Spanne aus bestem/schlechtestem Treffer (z.B. „2-3HKO"), Farbe nach dem gefährlicheren Ende (OHKO rot, 2HKO orange, sonst grün)
- [x] Schadensformel: `⌊⌊⌊2·Level/5+2⌋ · Angriff/Verteidigung · BasePower / 50 + 2⌋ · Modifier⌋` — Level fix 100 (gleiche Konvention wie der Statuswert-Rechner), Modifier bewusst auf STAB × Typeneffektivität × offizielle 85–100%-Zufallsspanne begrenzt (keine Items/Abilities/Wetter, gibt's im Projekt noch nicht)

---

## Session 9 — Breeding Guide (eigene Seite)

**Ziel:** Alles was man für kompetitive Zucht wissen muss — eigene Seite `pages/breeding.html`, kein Dialog-Tab mehr (siehe Zwischenschritt vor Session 5)

- [x] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [x] Ei-Gruppe(n) anzeigen (mit welchen Pokémon kann es züchten) — über `getEggGroup()` (neu in `js/core/api.js`), Undiscovered-Gruppe (`no-eggs`) zeigt stattdessen einen "kann nicht normal gezüchtet werden"-Hinweis statt der Zuchtkette
- [x] Egg Moves Liste (aus Learnset, Lernmethode `egg`) — über bereits bestehendes `fetchMoveset()`
- [x] Für jeden Egg Move: welche anderen Pokémon vererben ihn (Zucht-Kette) — Algorithmus vermeidet das naive Durchfetchen ganzer Ei-Gruppen (teils ~100 Mitglieder): pro Egg Move wird PokéAPIs `move.learned_by_pokemon` mit den Namen der eigenen Ei-Gruppe(n) geschnitten, die verbleibenden Kandidaten werden einmalig vollständig geladen (page-lokaler Cache in `breeding-page.js`) und nur behalten, wenn ihre eigene `version_group_details`-Lernmethode für diesen Move *nicht* `egg` ist (echter Lehrer, keine reine Weitervererbung)
- [x] Allgemeiner Teil (Pokémon-unabhängig, gleiche Seite):
  - Schritt-für-Schritt IV-Zucht-Anleitung (Destino-Knoten, Items)
  - Nature-Tabelle: alle 25 Wesen mit +/− Stats — wiederverwendet `js/data/natures.js` (war bereits für diese Session vorbereitet)
  - Hidden Ability: wie bekommt man sie (Max-Raid, Ability Patch)
  - Masuda-Methode erklärt

---

## Session 10 — Speed-Tier-Übersicht

**Ziel:** Seite `speed-tiers.html` — wer überholt wen beim Teambuilding

- [x] Alle Pokémon sortiert nach Initiativ-Endwert (Lvl 100, 31 IVs, 252 EVs, neutral) — Datenquelle ist Pokémon-API's GraphQL-Beta-Endpoint (`fetchSpeedTierList()` in `js/core/api.js`, erster GraphQL-Call im Projekt), da ~1300 einzelne REST-Requests zu langsam/schwer gewesen wären; Formen-Auswahl datengetrieben (nicht namensbasiert): pro Spezies wird die Default-Form immer behalten, eine Nicht-Default-Form nur wenn ihr voller Stat-Block vom Default abweicht (verifiziert gegen Live-Daten: behält Mega/Regionalformen/Therian/Origin/Crowned/etc., verwirft Pikachu-Kostüme/Totem-Formen/Gmax-Formen, da PokéAPI diese mit identischen Stats zur Default-Form führt) — Ergebnis ~1177 Einträge
- [x] Filter nach Generation (Smogon-Tier-Filter zurückgestellt bis Session 11 die `smogon-tiers.json`-Datenquelle einführt)
- [x] Eingabefeld: Speed-Wert eingeben → markiert was drüber / drunter liegt
- [x] Choice Scarf Toggle (×1,5) per Button
- [x] Quick-Pick-Buttons für runde Speed-Werte (100/110/120/130/140/150/200) statt konkret benannter Pokémon-Benchmarks — bewusste Scope-Vereinfachung, um keine ungeprüften Fakten über exakte Meta-Breakpoints zu behaupten; TODOs eigenes Beispiel ("130 = Dragapult") war ohnehin nur illustrativ

---

## Session 11 — Competitive (eigene Seite)

**Ziel:** Eigene Seite `pages/competitive.html` — Smogon-Tier und Beispiel-Sets zu einem gewählten Pokémon (kein Dialog-Tab mehr, siehe Zwischenschritt vor Session 5)

- [x] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [x] Smogon-Tier anzeigen (OU / UU / RU / NU / Ubers / NFE / LC) — Datenquelle ist keine eigene `smogon-tiers.json` mehr, sondern ein Live-Fetch von Pokémon Showdowns eigener `data/formats-data.ts` auf GitHub (`fetchSmogonTiers()` in `js/core/api.js`), der tatsächlichen Quelle hinter Smogons Tier-Liste — immer aktuell, alle ~1400 Einträge, kein manuelles Pflegen. Datei ist eine TS-Objektliteral-Export, kein JSON, daher ein kleiner Regex-Parser statt `fetchJSON()`/Eval. Cache hat als einziger im Projekt eine TTL (1 Woche) statt permanent, da sich Tier-Einstufungen mit der Zeit ändern. Fällt ein Pokémon in der aktuellen Generation unter „Illegal" (z. B. jede Mega-Entwicklung in SV), wird stattdessen `natDexTier` mit Hinweistext angezeigt (verifiziert: 382 von 509 „Illegal"-Einträgen haben einen nutzbaren `natDexTier`-Fallback)
- [x] Beispiel-Sets & „Was schlägt X?"-Sektion — bewusst durch einen Link zur echten Smogon-Dex-Seite (`smogon.com/dex/sv/pokemon/<name>/`) ersetzt statt selbst kuratiert: dafür gibt's keine saubere API (nur von Analysten geschriebener Text auf Smogon selbst), eigene Sets/Counter zu erfinden hätte das Risiko veralteter/falscher Angaben gehabt. `counters.json`-Datenquelle damit komplett entfallen — bewusste Scope-Entscheidung, kein übersehener Punkt

---

## Zwischenschritt — Navigation-Kategorien

**Ziel:** Bevor Session 12+ weitere Seiten in die Navbar packen, die Navigation auf Kategorien mit Dropdown/Flyout umstellen. Aktuell schon 8 flache Links (Search, Stats-Rechner, Matchup, Lernset, Schadensrechner, Zucht-Guide, Speed-Tiers, Competitive), bis Session 17 kämen realistisch 5–6 weitere dazu (~13–14 total) — jetzt gemacht, damit jede künftige Session nur noch ihren Link in die passende Kategorie einträgt statt am Ende eine eigene große Nav-Umbau-Session zu brauchen (gleiches Muster wie der localStorage-Cache-Zwischenschritt vor Session 5).

- [x] Kategorie-Struktur: 1 flacher Top-Level-Link (Search) + 3 Dropdown-Kategorien
  - Rechner: Statuswert-Rechner, Schadensrechner, Speed-Tiers, Typ-Matchup
  - Pokémon-Guide: Lernset, Zucht-Guide, Competitive, Regionalformen & Megas, Shiny Hunting
  - Referenz: Items (seit Session 13; Moves & Abilities/VGC-Guide kommen mit Session 16/17 dazu) — bis Session 13 bewusst noch nicht angelegt, keine leere Dropdown-Kategorie auf Vorrat, gleiches Prinzip wie „keine toten Links" aus Session 4
  - Zucht-Guide/Shiny-Hunting sind Mischformen (Pokémon-Tool + allgemeiner Guide-Text) und könnten auch unter Referenz stehen — bei Bedarf beim tatsächlichen Umbau nochmal gegenchecken
- [x] `NAV_LINKS` in `js/core/nav.js` von flacher Liste auf Kategorie-Struktur umbauen (`{ top: [...], categories: [...] }`)
- [x] Desktop: Dropdown/Flyout per Klick auf Kategorie-Label (`.nav-category-toggle`) — bewusst kein Hover, um mit der Klick-Logik auf Touch/Tablet konsistent zu bleiben; schließt sich bei Klick auf eine andere Kategorie oder außerhalb (gleiches `document`-Click-Outside-Muster wie das Burger-Menü)
- [x] Mobile (Sidebar): Kategorien als native `<details>`/`<summary>`-Accordions statt Dropdown — kein eigenes JS nötig, barrierefrei by default
- [x] Ab hier tragen neue Sessions ihren Link nur noch in die passende Kategorie ein, keine Nav-Struktur-Änderung mehr nötig

---

## Session 12 — Regionale Formen & Megas (eigene Seite)

**Ziel:** Alola/Galar/Hisui/Paldea-Formen und Mega-Entwicklungen zu einem gewählten Pokémon

> Entscheidung gefallen: eigene Seite `pages/forms.html`, gleiches Muster wie alle anderen Tool-Seiten seit dem Zwischenschritt vor Session 5 (Dialog bekommt keine weiteren Tabs mehr) — kein Sonderfall trotz enger Kopplung ans gerade offene Pokémon.

- [x] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [x] Varianten-Auswahl wenn Formen vorhanden (z.B. „Alola" / „Galar") — Button-Leiste (`variant-selector`), nur sichtbar wenn die Spezies mehr als eine `variety` hat; sonst Hinweistext „keine alternativen Formen"
  - PokéAPI: eigene Einträge wie `rattata-alola`, `mewtwo-mega-x` — jede Variante ist ein eigener `/pokemon/{name}`-Eintrag, verlinkt von `/pokemon-species/{id}`s `varieties`-Array; Klassifikation (`is_mega`/`is_battle_only`/`form_name`) kommt vom verknüpften `/pokemon-form/{id}`-Eintrag (neu: `fetchPokemonForm()` in `js/core/api.js`)
- [x] Stats, Typ, Ability der Form korrekt laden und anzeigen — wiederverwendet `prepareStats()`/`getTypes()`/`getAbilities()` aus `ui.js`, gleiche Stat-Bar-Optik wie Dialog/Stats-Rechner (`css/components/stats.css`)
- [x] Mega-Entwicklungen: Stats-Unterschied zur Basis-Form visualisieren — pro Stat ein `(+n)`/`(−n)`-Delta neben dem Wert (grün/rot, gleiche `--stat-high`/`--stat-low`-Konvention wie die Wesen-Tabelle im Zucht-Guide), relativ zur `is_default`-Variante der Spezies
- [x] Gigantamax-Formen: Unterschied zu Standard-Dynamax — G-Max Move bewusst nicht dargestellt: gegen die echte API verifiziert, dass er nirgends als Daten modelliert ist (weder im `moves`-Array der Gigadynamax-Variante noch der Standardform, kein `/move/g-max-*`-Eintrag) — Hinweistext (`forms.gmaxMoveNote`) erklärt das statt eine falsche Quelle zu erfinden, gleiches Prinzip wie die „keine ungeprüften Fakten"-Entscheidung aus Session 10
- [ ] Auf der Pokémon-Karte kleines Icon wenn Formen vorhanden — zurückgestellt: bräuchte einen Bulk-Lookup (Spezies → Varianten-Anzahl, gleiche GraphQL-Bulk-Bauart wie `fetchSpeedTierList()`), der vor dem allerersten Render des Haupt-Grids abgewartet werden müsste und damit den First Paint der meistbesuchten Seite spürbar verzögern würde; erst angehen, wenn ein Weg ohne First-Paint-Blocker gefunden ist
- [x] Nachtrag: Picker-Autocomplete auf `forms.html` schlägt jetzt nur Pokémon mit tatsächlichen Alternativformen vor, statt dass man erst nach der Auswahl „keine alternativen Formen" sieht — neue `fetchPokemonNamesWithForms()` (Bulk-GraphQL wie oben, permanent gecacht) + optionaler `filterNames`-Parameter in `pokemon-picker.js`, der nur die Vorschlagsliste einschränkt; exakte Eingabe/Deep-Link aus dem Dialog funktioniert weiterhin für jedes Pokémon. Anderer, deutlich kleinerer Blast-Radius als der zurückgestellte Karten-Icon-Punkt oben (betrifft nur diese eine Seite, nicht das Haupt-Grid)

---

## Session 13 — Items-Übersicht

**Ziel:** Seite `items.html` mit Fokus auf competitive relevante Items

> PokéAPI hat ~2200 `/item`-Ressourcen insgesamt, fast alles Shop-Heiltränke, Schlüsselitems, TMs-als-Item, Post und pro-Version-Duplikate von Pokébällen — nicht was mit „Held Items" gemeint ist. Statt einer handkuratierten Namensliste ist die Auswahl über echte, gegen die Live-API verifizierte `item-category`-Werte gescoped (Held Items, Choice, Beeren, Typ-Items, Tafeln, Spezies-spezifisch, Mega-Steine, Z-Kristalle, Juwelen, Memories, FP-Trainings-Items) — 16 Kategorien, ~300 Items, weiterhin datengetrieben statt geraten.

- [x] Alle Held Items listbar + filterbar (Kategorie: Choice / Berry / Mega Stone / …) — `fetchItemList()` in `js/core/api.js` (Bulk-GraphQL wie `fetchSpeedTierList()`, permanent gecacht), auf der Seite zu 11 nutzerfreundlicheren Filter-Gruppen zusammengefasst (`CATEGORY_GROUPS` in `items-page.js`, z.B. alle Beeren-Kategorien → eine „Beeren"-Gruppe)
- [x] Suchfeld nach Item-Name — client-seitiger Live-Filter über die bereits geladene, gecachte Liste (kein erneuter API-Call pro Tastenanschlag)
- [x] Item-Detail: Effekt-Text, wann competitive sinnvoll — Klick zum Aufklappen (gleiches Akkordeon-Muster wie die Move-Zeilen im Lernset), `short_effect` aus der API; nur Englisch (gleiche bewusste Vereinfachung wie schon bei Move-Effekttexten im Lernset, siehe Session 7 — keine ungelöste Session-2-Altlast neu aufgemacht)
- [x] Competitive-relevante Items hervorheben: Choice Band / Specs / Scarf, Life Orb, Leftovers, Rocky Helmet, Eviolite, … — handkuratierte, gegen die Live-API verifizierte Liste (`HIGHLIGHTED_ITEMS`), farbiger Rand + „Beliebt"-Badge (gleiches Highlight-Muster wie Egg Moves im Lernset)
- [x] „Typisch gehalten von" — Verlinkung zu Pokémon die dieses Item nutzen — ersetzt durch Link zur echten Smogon-Item-Dex-Seite (`smogon.com/dex/sv/items/<name>/`), gleiches Prinzip wie der Smogon-Link in Session 11: PokéAPIs `held_by_pokemon`-Feld heißt „im Spiel wild mit diesem Item gefunden", nicht „competitive genutzt von" — gegen die Live-API verifiziert, dass es für praktisch jedes competitive-relevante Item leer ist (z.B. Choice Band), eigene Daten dafür zu erfinden hätte das gleiche Risiko wie ein selbst kuratiertes `counters.json` gehabt

---

## Session 14 — Fundorte & Shiny Hunting (eigene Seite)

**Ziel:** Wo finde ich dieses Pokémon, wie shinye ich es effizient — eigene Seite `pages/shiny.html`, kein Dialog-Tab mehr (Fundorte-Teil wandert mit dazu statt eigener Dialog-Tab „Finden", siehe Zwischenschritt vor Session 5)

> Wichtige Datenlücke gegen die Live-API verifiziert und mit Nutzer abgestimmt, bevor gebaut wurde: PokéAPI hat **keinerlei Fundort-Daten für Scarlet/Violet** (Paldea existiert nur als `/region`-Metadaten-Eintrag, keine befüllten Location-Areas; getestet an Sprigatito/Fidough — leeres Array). Entscheidung: trotzdem bauen, mit echten Daten für alle abgedeckten Spiele (Gen 1 bis Sword/Shield) und einem klaren Hinweis statt einer leeren Seite, wenn für ein Pokémon nichts vorliegt.

- [x] Pokémon-Suche/Auswahl auf der Seite + Deep-Link aus dem Dialog heraus
- [x] Fundorte je Spielversion (PokéAPI `/pokemon/{id}/encounters`, per `pokemon.location_area_encounters`-URL) — Spiel-Dropdown (nur Versionen, die für dieses Pokémon tatsächlich Daten haben, Standard = neuestes abgedecktes Spiel), darunter Fundort-Gruppen mit Methode/Level-Spanne/relativer Chance
  - Hinweis wenn nur über Zucht / Trade / Event — wenn das Encounters-Array leer ist, klarer Hinweistext statt leerer Seite (siehe Datenlücke oben)
- [x] Allgemeiner Teil (Pokémon-unabhängig, gleiche Seite):
  - Methoden-Übersicht je Generation (Masuda, Radar-Kette, DexNav, Max-Raids, Massenausbrüche) + Wahrscheinlichkeits-Tabelle (1/4096 Basis, mit Shiny Charm, mit Methode) — zusammengefasst in einer Tabelle (`js/data/shiny-methods.js`, 12 Methoden), da Methode und Odds ohnehin zusammengehören; Zahlen gegen aktuelle Community-Dokumentation verifiziert statt aus dem Gedächtnis geschrieben, u.a. SV-spezifische Sandwich-Mechanik (Glitzerkraft Lvl. 3, mit Schillerstein, mit 60er-Massenausbruchs-Kette), da das die aktuell relevante Methode ist; DexNav/Chain-Fishing/Friend-Safari-Feinheiten bewusst nicht mit Einzelzahlen versehen, da nicht mit vergleichbarer Sicherheit verifiziert
  - Für jedes Pokémon: effizienteste Methode — datengetrieben statt geraten: hat das Pokémon Wildvorkommen in den abgedeckten Spielen → Vollchance/Sandwich/Ausbruchs-Empfehlung; keine Wildvorkommen aber Zucht möglich (gleiche Undiscovered-Ei-Gruppen-Prüfung wie im Zucht-Guide) → Masuda-Methode-Empfehlung mit Link zum Zucht-Guide; keins von beidem → Hinweis auf besondere Begegnung/Geschenk/Event ohne beeinflussbare Shiny-Chance

---

## Session 15 — Suche & Filter erweitern

**Ziel:** Suche um sinnvolle Parameter ergänzen

> Hinweis: Die Suche ist bereits in Session 4 auf eine eigene Seite (`pages/search.html`) umgezogen, vorgezogen im Zuge des Nav-Shell-Umbaus. Die Punkte hier sind die noch offenen Erweiterungen.

> Vor dem Bauen geklärt: Name- und Typ-Suche waren bisher gegenseitig exklusiv (`currentMode`: entweder `search` oder `type`, nie beides). Die `?type=fire&gen=1`-Zeile unten impliziert aber kombinierbare Filter — das war die eigentliche Scope-Entscheidung dieser Session, nicht nur "ein paar Filter dazu". Entschieden: alle Filter kombinierbar (UND-Verknüpfung), größerer Umbau von `search.js` in Kauf genommen.
>
> Umsetzung: Ein einziger Bulk-GraphQL-Request (`fetchSearchIndex()` in `js/core/api.js`, gleiche Bauart wie `fetchSpeedTierList()`) lädt für alle ~1300 Pokémon-Einträge Typ/Generation/Fähigkeiten/Ei-Gruppen/Basis-Gesamtwert in einem Rutsch, permanent gecacht. Alle Filter + Sortierung laufen danach komplett clientseitig gegen diesen einen Datensatz (`computeFilteredResults()` in `search.js`) — kein Jonglieren mehr mit einzelnen, inkompatibel geformten REST-Endpunkten (`/type/{x}`, `/generation/{x}`, `/ability/{x}`, …) die sich nicht sauber schneiden ließen. Nur die tatsächlich angezeigte Seite der gefilterten Treffer wird als volles REST-Objekt nachgeladen (`loadSearchBatch()`, unverändert), Netzwerkkosten bleiben an das gebunden was wirklich gerendert wird. `fetchPokemonByType()` (REST) dadurch überflüssig geworden und entfernt.

- [x] Filter nach Generation (Gen 1–9) — PokéAPI-Daten über `fetchSearchIndex()`, `<select>` mit 9 Optionen (statisches, kleines Set)
- [x] Filter nach Ei-Gruppe — `<select>`, Optionen aus dem Bulk-Datensatz abgeleitet (keine feste Liste im Code); ein paar Slugs (`water1`/`water2`/`water3`/`humanshape`/`indeterminate`) bekommen eine kleine manuelle Label-Korrektur in `search-page.js`, da PokéAPIs Ei-Gruppen-Listen-Endpunkt selbst keine lokalisierten Namen liefert (nur die einzelne Ressource, 15 Extra-Requests nur fürs Dropdown wären es nicht wert)
- [x] Suche nach Ability — Datalist-Input, gleiches UX-Muster wie der bestehende Typ-Filter
- [x] Sortierung: nach ID / Name / Basis-Gesamt-Wert (BST) — `<select>`, rein clientseitig über den Bulk-Datensatz (BST wird dort direkt mitgeliefert)
- [x] URL-Parameter (`?name=&type=&gen=&ability=&eggGroup=&sort=`) für Deep-Links und Sharing — `history.replaceState` (kein Verlauf-Spam pro Tastenanschlag), gleiches Grundprinzip wie `pokemon-picker.js`s `?pokemon=`, nur für mehrere Parameter gleichzeitig; wird beim Laden aufgelöst und bei jeder Filteränderung aktualisiert

---

## Session 16 — Moves & Abilities Seiten

**Ziel:** Vollständige Referenz für Moves und Abilities

> Beide Seiten brauchen Bulk-Daten für ~900+ Einträge (937 Moves, 307 Main-Series-Abilities) — Einzel-REST-Calls wären wieder zu langsam (gleiche Begründung wie Speed-Tiers/Items/Search-Index). `fetchMoveList()`/`fetchAbilityList()` in `js/core/api.js` decken nur die Listen-/Filter-Ansicht ab (Name/Typ/Kategorie/Power/Accuracy/PP bzw. Name/Kurz-Effekt/Pokémon-Anzahl); volles Detail (Effekt-Text mit `$effect_chance`, welche Pokémon es lernen/haben) wird erst beim Aufklappen einzeln nachgeladen (`fetchMoveByUrl()` aus Session 7, neu: `fetchAbilityByUrl()`).
>
> Beim Bauen zwei Wiederverwendungen gefunden statt neu geschrieben: die Power/Accuracy/PP/Kategorie/Effekt-Detailtabelle war in `learnset-page.js` schon exakt so vorhanden — jetzt als `getMoveDetailTemplate()`/`getMoveCategoryLabel()` nach `templates.js` extrahiert (gleiche „beim zweiten Verbraucher extrahieren"-Regel wie bei `pokemon-picker.js`), `learnset-page.js` nutzt sie jetzt auch. `abilities.html` braucht keine eigene CSS-Datei — das Zeilen/Toggle/Badge-Muster ist identisch zu `items.css`, einfach mitverlinkt (gleiches Prinzip wie `breeding.html`, das schon seit Session 9 `learnset.css` mitverlinkt).

- [x] `moves.html` — alle Moves filterbar nach Typ / Kategorie (Physisch/Speziell/Status) — Name-Suche zusätzlich, nicht nur die zwei geforderten Filter
  - Move-Detail: Power, Accuracy, PP, Effekt-Text, welche Pokémon lernen ihn — Klick zum Aufklappen (gleiches Akkordeon-Muster wie Lernset/Items), „Gelernt von N Pokémon"-Liste
- [x] `abilities.html` — alle Abilities listbar
  - Ability-Detail: Effekt, welche Pokémon haben sie
  - Competitive relevante Abilities hervorheben (Speed Boost, Intimidate, …) — handkuratierte, gegen die Live-API verifizierte Liste (14 Abilities), gleiches Highlight-Muster wie die Items-Seite

---

## Session 17 — Guide-Inhalte (VGC & Wetter-Teams)

**Ziel:** Redaktionelle Guide-Inhalte für Einsteiger ins Competitive

> Wichtiger Fund beim Recherchieren, mit Nutzer abgestimmt bevor gebaut wurde: VGC ist seit dem 8. April 2026 komplett von Scarlet/Violet auf ein neues Spiel umgezogen (Pokémon Champions, aktuell Regulation M-B mit Mega-Entwicklungen) — ein anderes Spiel als das, worauf der Rest dieser Seite ausgelegt ist (Schadensrechner, Competitive-Seite mit Smogon-„sv"-Tiers). Entscheidung: Guide bleibt im SV-Rahmen der restlichen Seite, zeigt Regulation I (SVs letztes Format) statt des tatsächlich aktuellen Turnier-Regelwerks, mit explizitem Hinweistext zur Umstellung. Zahlen zu Regulation I, Wettermechaniken (inkl. Schnee statt Hagel seit Gen 9) und Beispiel-Pokémon/Fähigkeit-Paarungen gegen Live-Quellen bzw. die eigene PokéAPI-Daten verifiziert, nicht aus dem Gedächtnis geschrieben (gleiches Prinzip wie bei den Shiny-Odds in Session 14).

- [x] Guide-Sektion oder eigene Seite `guide.html` — eigene Seite, kein Pokémon-Picker (Pokémon-unabhängiger Inhalt wie Items/Moves/Abilities), daher auch kein Dialog-Link
- [x] VGC vs. Singles erklärt: Regelwerk, Teamgröße, Doubles-Mechaniken — inkl. Flächenattacken, Umleitung (Helfer An/Lockblüte), Initiative-Kontrolle (Wunderraum/Tailwind), Bedroher im Doppelkampf, Schutzschild-Varianten
- [x] Teambuilding-Archetypes:
  - Hyper Offense / Balance / Stall kurz erklärt — mit ehrlichem Hinweis, dass Hyper Offense/Stall vor allem Einzelkampf-Konzepte sind (VGCs Best-of-3 + 4-von-6-Auswahl + Zeitlimit sprechen gegen reines Stall/HO in Doppelkämpfen), statt so zu tun als wären alle drei gleich häufig in VGC
  - Regen / Sonne / Sand / Schnee — Setter, Abuser, Synergien (Hagel bewusst als „Schnee" bezeichnet — seit Gen 9 eigene Mechanik mit Verteidigungs- statt Rundenschaden-Bonus, keine veraltete Gen-1-8-Beschreibung recycelt)
- [x] Empfohlene Einstiegs-Teams mit Links zu den Pokémon — je Wetter-Team ein Beispiel-Kern (Setter + Abuser, z.B. Pelipper + Barraskewda für Regen), jedes verlinkt zu `/pages/competitive.html?pokemon=<name>`; bewusst illustrative Archetyp-Beispiele statt eines Anspruchs auf „aktuell optimales Team", da sich das Meta schneller ändert als dieser Guide gepflegt werden kann
- [x] Aktuelles VGC-Format (Series/Regelset) — manuell gepflegt — Regulation I (SV-Regeln: bis zu 2 Restricted Legendaries, alle Mystischen Pokémon verboten, Paldea-Dex-Nummer-Klausel, Item-Klausel), mit Hinweistext dass der Abschnitt Handarbeit ist und veralten kann

---

## Session 18 — UI/UX Polish (Feinschliff)

**Ziel:** Feinschliff, bevor der Guide als „fertig" gilt

- [ ] Dark / Light Mode Toggle
- [ ] Pokémon-Karten: Hover-Effekt mit Kurzinfo (Tier, BST)
- [ ] Mobile: Swipe-Geste im Dialog (links/rechts)
- [ ] Pokémon-Cry abspielen (PokéAPI liefert `.ogg`)
- [ ] Favoriten-Liste (LocalStorage)

---

## Session 19 — Design-Review (eigene Session)

**Ziel:** Nach Session 3 (kleinere Hover/Spacing-Fixes) noch mal grundsätzlich übers gesamte visuelle Design gehen, statt nur Einzelfixes zu sammeln — aktuelle Farbpalette/Abstände/Struktur/Typo fühlen sich noch nicht final an

- [ ] Farbpalette gegenchecken (aktuell 4 Farben aus Session 3, seitdem nicht mehr grundsätzlich hinterfragt)
- [ ] Abstände/Spacing-Skala (`--space-1`…`--space-7`) auf Konsistenz über alle Seiten prüfen (mittlerweile 7 Seiten mit teils eigenen Card-/Section-Paddings)
- [ ] Seitenstruktur/Layout der Tool-Seiten (stats-calc, matchup, learnset, damage-calc, breeding) im Vergleich — sind sie konsistent genug zueinander oder ist jede Seite leicht anders gewachsen?
- [ ] Typographie (Schriftgrößen-Skala, Line-Height, Headings) — bisher nicht zentral definiert, nur implizit durch Browser-Defaults + Einzelregeln

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
