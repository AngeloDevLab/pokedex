function getPokemonCardTemplate({ id, name, image, gradient, types }) {
    return `
        <div class="pokemon-card" data-id="${id}" style="background: ${gradient}">
            <div class="card-inner">
                <h3>#${id}<br>${name}</h3>
                <img src="${image}" alt="No ${name}-Image found. Sorry">
                <div class="type-icons">
                    ${types.map(t => `<img src="${getTypeIcon(t)}" alt="${t}">`).join("")}
                </div>
            </div>
        </div>
    `;
}

function getPokemonDialogTemplate(pokemon, entry) {
    return `
        <div class="dialog-inner">

            <button id="close-dialog-button" class="svg-button close-dialog-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>

            <hr>

            <h2>#${pokemon.id} ${pokemon.name}</h2>

            <hr>

            <div class="dialog-hero">
                <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
                <p class="flavor-text">${entry.text}</p>
            </div>

            <hr>

            <div class="dialog-tabs">

                <button class="tab-btn" data-tab="flavor">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                    <p class="hide-tab-text">Info</p>
                </button>

                <button class="tab-btn" data-tab="stats">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                        <path d="M7 16h8" />
                        <path d="M7 11h12" />
                        <path d="M7 6h3" />
                    </svg>
                    <p class="hide-tab-text">Stats</p>
                </button>

                <button class="tab-btn" data-tab="evo">
                    <div class="evo-chain-image">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12.1" cy="12.1" r="6" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12.1" cy="12.1" r="6" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12.1" cy="12.1" r="6" />
                        </svg>
                    </div>

                    <p class="hide-tab-text">Evolution</p>
                </button>

                <button class="tab-btn" data-tab="artworks">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>

                    <p class="hide-tab-text">Artworks</p>
                </button>

            </div>

            <div id="tab-content" class="tab-content"></div>


            <footer class="dialog-footer">
                <hr>

                <nav>
                    <button id="arrow-left" class="svg-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <button id="arrow-right" class="svg-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </nav>
            </footer>

        </div>
    `;
}

function getInfoTabTemplate(pokemon, entry) {
    return `
        <table class="info-table">
            <tr><td>Types</td><td>${getTypes(pokemon).join(", ")}</td></tr>
            <tr><td>Edition</td><td>${entry.edition}</td></tr>
            <tr><td>Base XP</td><td>${pokemon.base_experience}</td></tr>
            <tr><td>Height</td><td>${(pokemon.height / 10).toFixed(1)} m</td></tr>
            <tr><td>Weight</td><td>${(pokemon.weight / 10).toFixed(1)} kg</td></tr>
            <tr><td>Abilities</td><td>${getAbilities(pokemon).join(", ")}</td></tr>
        </table>
    `;
}

function getStatsTabTemplate(stats) {
    return `
        <ul class="stats-list">
            ${stats.map(stat => `
                <li class="stat-row">
                    <div class="stat-header">
                        <span class="stat-name">${stat.name}</span>
                        <span class="stat-value">${stat.value}</span>
                    </div>

                    <div class="stat-bar">
                        <div class="stat-fill" 
                             style="width: ${stat.percent}%; background: ${stat.color}">
                        </div>
                    </div>
                </li>
            `).join("")}
        </ul>
    `;
}

function getEvoTemplate(evoData) {
    return `
        <div class="evo-chain">
            ${evoData.map((evo, index) => `
                <div class="evo-item">
                    ${evo.image ? `<img src="${evo.image}" alt="${evo.name}">` : ""}
                    <p>${evo.name}</p>
                </div>

                ${index < evoData.length - 1 ? `
                    <span class="arrow">
                        <svg class="hide-desktop" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                        </svg>

                        <svg class="hide-mobile" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </span>
                ` : ""}
            `).join("")}
        </div>
    `;
}

function getArtworkTabTemplate(pokemon) {
    return `
        <div class="artwork-images">
            <img src="${pokemon.sprites.other["official-artwork"].front_default}">
            <img src="${pokemon.sprites.other["official-artwork"].front_shiny}">
            <img src="${pokemon.sprites.front_default}">
            <img src="${pokemon.sprites.front_shiny}">
        </div>
    `;
}

function getNoResultTemplate() {
    return `
        <div class="no-results">
            No results found
        </div>
    `;
}