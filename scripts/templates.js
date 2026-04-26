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

function getPokemonDialogTemplate(pokemon) {
    return `
        <div class="dialog-inner">

            <button class="svg-button close-dialog-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>

            <hr>

            <nav>
                <button class="svg-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <button class="svg-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </nav>

            <hr>

            <h2>${pokemon.name}</h2>

            <hr>

            <div class="artwork-container">

                <h3>artworks</h3>

                <div class="dialog-images">
                    <img src="${pokemon.sprites.other["official-artwork"].front_default}"
                        alt="No official artwork of ${pokemon.name} found. Sorry">
                    <img src="${pokemon.sprites.other["official-artwork"].front_shiny}"
                        alt="No shiny official artwork of ${pokemon.name} found. Sorry">
                    <img class="sprite-image" src="${pokemon.sprites.front_default}" alt="No ${pokemon.name} sprite found. Sorry">
                    <img class="sprite-image" src="${pokemon.sprites.front_shiny}" alt="No ${pokemon.name} shiny sprite found. Sorry">
                </div>

            </div>

            <hr>

            <div class="dialog-tabs">

                <button class="tab-btn" data-tab="flavor">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-info-icon lucide-info">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                    <p class="hide-mobile">Info</p>
                </button>

                <button class="tab-btn" data-tab="stats">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                        <path d="M7 16h8" />
                        <path d="M7 11h12" />
                        <path d="M7 6h3" />
                    </svg>
                    <p class="hide-mobile">Stats</p>
                </button>

                <button class="tab-btn" data-tab="evo">

                    <div class="evo-chain-image">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12.1" cy="12.1" r="8" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12.1" cy="12.1" r="8" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12.1" cy="12.1" r="8" />
                        </svg>
                    </div>

                    <p class="hide-mobile">Evolution</p>
                    
                </button>
            </div>

            <div id="dialog-content"></div>

        </div>
    `;
}