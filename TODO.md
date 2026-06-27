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

- [x] Hover-States durchgegangen (Pokémon-Karten, Buttons, Lang-Toggle, Tabs) — konsistent, kein Fix nötig
- [x] `css/variables.css` angelegt: Farben, Spacing-, Radius- und Transition-Skala zentralisiert (vorher über `standard.css`/`style.css` verstreut hartcodiert)
- [ ] Farbpalette/Kontraste inhaltlich bewerten (Werte sind jetzt zentral in `variables.css`, aber noch nicht auf Kontrast/Wirkung geprüft — v. a. Stat-Farben `--stat-low`/`--stat-mid`/`--stat-high`, aktuell noch `red`/`orange`/`green`)
- [x] Spacing/Abstände im Header gegengecheckt — Bug gefunden + gefixt: `.search-panel` war bei `top: 80px` während Header `6rem` (96px) hoch ist, dadurch 16px Überlappung beim Öffnen; jetzt beide an `var(--header-height)` gekoppelt
- [ ] Weitere kleinere visuelle Unstimmigkeiten sammeln und fixen

---

## Session 4 — Navigation & Architektur

**Ziel:** Grundgerüst schaffen, bevor weitere Seiten/Tabs (Sessions 5+) den Header/die Codebasis überladen

### Architektur-Entscheidungen
- [x] MPA bestätigt (passt zur bestehenden Roadmap — `calc.html`, `items.html`, etc. sind bereits als eigene Seiten geplant — sowie zu „kein Build-Tool" + GitHub-Pages-Hosting)
- [x] Ordnerstruktur: `scripts/` → `js/`, `styles/` → `css/`; neue Seiten außer `index.html` (das aus GitHub-Pages-Gründen im Root bleiben muss) wandern in `pages/` (z. B. `pages/imprint.html`)
- [x] Konvention für künftige Seiten (Sessions 5+): pro Seite eine `js/<seite>.js` + `css/<seite>.css`, flach in `js/`/`css/` (kein Unterordner pro Seite, solange es nur wenige sind). Gemeinsam genutzter Code (`api.js`, `i18n.js`, ggf. `ui.js`-Helfer) bleibt zentral und wird von mehreren Seiten eingebunden. Aufteilung in Unterordner (z. B. `js/core/`, `js/pages/`) erst, wenn die flache Liste unübersichtlich wird (~8–10 Dateien) — nicht vorab anlegen.
- [ ] Umstieg auf ES Modules (`<script type="module">`, `import`/`export` statt globaler Funktionen/Variablen)
  - Vermeidet Namespace-Kollisionen bei wachsender Dateizahl
  - Erfordert lokalen Server zum Testen (kein `file://`, wie schon bei `locales/*.json`)

### Navigation-Shell
- [ ] Burger-Menü (Mobile) / Sidebar (Desktop) für Navigation zwischen Features
- [ ] Default-Ansicht bleibt der bestehende Pokémon-Grid-Scroll
- [ ] Menü verlinkt zu künftigen Seiten (`pages/calc.html`, `pages/items.html`, `pages/moves.html`, …) sobald sie existieren
- [ ] Language-Toggle ins Menü verschieben (Header bleibt schlank: Logo + Menü-Toggle + Search)
- [ ] Header-Layout entsprechend aufräumen

---

## Session 5 — Statuswert-Rechner (Stats Tab)

**Ziel:** Den bestehenden Stats-Tab zum vollständigen IV/EV/Nature-Rechner ausbauen

- [ ] IV-Eingabefelder (0–31, Standard: 31) für alle 6 Stats
- [ ] EV-Eingabefelder (0–252, Standard: 0) mit Live-Summen-Counter (≤ 510)
- [ ] Nature-Dropdown (alle 25 Wesen, positiver Stat grün / negativer rot markiert)
- [ ] Endwert live berechnen nach offizieller Formel (Level 100):
  - KP: `⌊(2·AS + IS + ⌊EV/4⌋) · 1⌋ + 110`
  - Rest: `⌊(⌊(2·AS + IS + ⌊EV/4⌋) + 5⌋ · Nature⌋`
- [ ] Endwert groß neben Balken anzeigen, Balken reagiert live
- [ ] Farbcodierung Endwert: grün ≥ 100 / orange 60–99 / rot < 60
- [ ] Schnell-Button „Reset" (EVs 0, IVs 31, Nature neutral)
- [ ] Gesamt-BST der Endwerte unten anzeigen
- [ ] Info-Tabelle Kampfstufen (−6 bis +6) mit Multiplikator

---

## Session 6 — Typ-Matchup Tab

**Ziel:** Im Dialog auf einen Blick sehen welche Typen wie viel Schaden machen

- [ ] Neuer Tab im Dialog: „Matchup"
- [ ] Tabelle: alle 18 Typen mit Schadens-Multiplikator gegen dieses Pokémon
  - 4× / 2× / 1× / 0,5× / 0,25× / 0× (Immunität)
- [ ] Dual-Typ-Berechnung automatisch (z.B. Wasser/Boden = Gras trifft 4×)
- [ ] Typ-Icons statt Text für kompakte Darstellung
- [ ] Statische Matchup-Matrix als JS-Objekt (ändert sich nie)

---

## Session 7 — Learnset Tab

**Ziel:** Alle Attacken die ein Pokémon lernen kann übersichtlich anzeigen

- [ ] Neuer Tab im Dialog: „Moves"
- [ ] Anzeige nach Lernmethode gruppiert: Level-up / TM / Egg Move / Tutor
- [ ] Level-up: Level + Move-Name + Typ-Icon + Kategorie-Icon
- [ ] Egg Moves farblich hervorheben (competitive relevant)
- [ ] Move-Details on click: Power, Accuracy, PP, Kategorie, Effekt-Text
- [ ] Move-Namen sprachabhängig (i18n aus Session 2 nutzen)
- [ ] Datenquelle: PokéAPI `/pokemon/{id}` liefert komplettes Learnset

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

## Session 9 — Breeding Guide

**Ziel:** Alles was man für kompetitive Zucht wissen muss, direkt am Pokémon

- [ ] Neuer Tab im Dialog: „Breeding"
- [ ] Ei-Gruppe(n) anzeigen (mit welchen Pokémon kann es züchten)
- [ ] Egg Moves Liste (aus Learnset, Lernmethode `egg`)
- [ ] Für jeden Egg Move: welche anderen Pokémon vererben ihn (Zucht-Kette)
- [ ] Zucht-Guide Seite `breeding.html`:
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

## Session 11 — Competitive Tab (Smogon)

**Ziel:** Smogon-Tier und Beispiel-Sets direkt am Pokémon anzeigen

- [ ] Neuer Tab im Dialog: „Competitive"
- [ ] Smogon-Tier anzeigen (OU / UU / RU / NU / Ubers / NFE / LC)
  - Datenquelle: eigene `smogon-tiers.json` (manuell gepflegt oder geskrapt)
- [ ] 1–2 Beispiel-Sets im Showdown-Export-Format:
  - Pokémon @ Item / Ability / EVs / Nature / Moves
- [ ] „Was schlägt X?" Sektion:
  - Häufige Counter mit kurzem Grund (Typ, Speed, Ability)
  - Datenquelle: kuratierte `counters.json`

---

## Session 12 — Regionale Formen & Megas

**Ziel:** Alola/Galar/Hisui/Paldea-Formen und Mega-Entwicklungen im Dialog

- [ ] Varianten-Tabs im Dialog wenn Formen vorhanden (z.B. „Alola" / „Galar")
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

## Session 14 — Fundorte & Shiny Hunting

**Ziel:** Wo finde ich dieses Pokémon, wie shinye ich es effizient

- [ ] Neuer Tab im Dialog: „Finden"
  - Fundorte je Spielversion (PokéAPI `/pokemon/{id}/encounters`)
  - Hinweis wenn nur über Zucht / Trade / Event
- [ ] Shiny Hunting Seite `shiny.html`:
  - Methoden-Übersicht je Generation (Masuda, Radar-Kette, DexNav, Max-Raids, Massenausbrüche)
  - Wahrscheinlichkeits-Tabelle (1/4096 Basis, mit Shiny Charm, mit Methode)
  - Für jedes Pokémon: effizienteste Methode

---

## Session 15 — Suche & Filter erweitern

**Ziel:** Suche um sinnvolle Parameter ergänzen

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
