# 🧭 TODO – Pokédex (Next Session)

---

## 🟢 MVP – Search System

### 🔍 1. Global Search (Name)
- [ ] Input Feld einbauen
- [ ] min. 3 Zeichen required
- [ ] unter 3 Zeichen:
  - Warning anzeigen („min 3 characters“)

---

### 🌍 2. Alle Pokémon für Suche verfügbar machen
- [ ] einmal alle Pokémon Namen laden  
  → `pokemon?limit=100000`
- [ ] nur Name + URL speichern (lightweight)

---

### 🔎 3. Suche implementieren
- [ ] Suche läuft über **alle Namen (nicht nur Cache)**
- [ ] `includes()` / partial match
- [ ] Ergebnisse anzeigen

---

### 📦 4. Details nachladen
- [ ] bei Suchergebnis:
  - Details fetchen (`fetchPokemonDetails`)
- [ ] in bestehendes UI integrieren

---

### 🧠 5. State Handling
- [ ] Search Mode vs Normal Mode trennen
- [ ] bei aktiver Suche:
  - Pagination deaktivieren ODER resetten

---

## 🟡 OPTIONAL (wenn Zeit)

---

### 🎯 6. Filter by Type
- [ ] Dropdown mit Types
- [ ] bei Auswahl:
  - API: `/type/{type}`
- [ ] Pokémon des Types anzeigen
- [ ] in bestehendes Rendering integrieren

---

### 📀 7. Filter by Edition
- [ ] Dropdown mit Editions
- [ ] API basiert auf Species
- [ ] Pokémon nach Edition filtern

> Hinweis: etwas komplexer → eher Bonus

---

## 🔴 BONUS FEATURES

- [ ] Pokémon Sounds 🔊  
- [ ] „No results found“ Anzeige  
- [ ] Loading State bei Suche  

---

## 🎯 Ziel

👉 Suche fühlt sich „echt“ an:
- global
- schnell
- sinnvoll gefiltert

---

## 💡 Reihenfolge

1. Global Name List holen  
2. Search Input + Filter  
3. Detail Fetch bei Ergebnis  
4. UI Integration  
5. Optional Filter