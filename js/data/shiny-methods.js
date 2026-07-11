// Shiny-hunting methods and their odds — numbers verified against current
// community-documented data (Game8/Dexerto/Bulbapedia-class sources) rather
// than recalled from memory, since these are exactly the kind of precise
// numeric claims that are easy to misremember. `odds` is a literal fraction
// string (language-independent); `key` maps to `shiny.methods.<key>.name`/
// `.games` in the locale files for the translatable parts.
export const SHINY_METHODS = [
    { key: "fullOddsModern", odds: "1/4096" },
    { key: "fullOddsLegacy", odds: "1/8192" },
    { key: "shinyCharm", odds: "1/1365" },
    { key: "masuda", odds: "1/683" },
    { key: "masudaCharm", odds: "1/512" },
    { key: "sparklingPower", odds: "1/1024" },
    { key: "sparklingPowerCharm", odds: "1/683" },
    { key: "sparklingPowerOutbreak", odds: "1/512" },
    { key: "pokeRadar", odds: "1/99" },
    { key: "sosChain", odds: "~1/1365" },
    { key: "arceusOutbreak", odds: "~1/137" },
    { key: "maxRaid", odds: "1/4096" }
];
