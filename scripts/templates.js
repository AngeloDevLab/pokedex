function getPokemonCardTemplate({ id, name, image, gradient, types }) {
    return `
        <div class="pokemon-card" data-id="${id}" style="background: ${gradient}">
            <div class="card-inner">
                <h3>${name}</h3>
                <img src="${image}" alt="${name}-Image">
                <div class="type-icons">
                    ${types.map(t => `<img src="${getTypeIcon(t)}" alt="${t}">`).join("")}
                </div>
            </div>
        </div>
    `;
}

function getPokemonDialogTemplate(pokemon) {
    return `
        <h2>${pokemon.name}</h2>

        <div class="dialog-images">
            <img src="${pokemon.sprites.front_default}">
            <img src="${pokemon.sprites.other["official-artwork"].front_default}">
            <img src="${pokemon.sprites.other["official-artwork"].front_shiny}">
        </div>

        <div class="dialog-tabs">
            <button class="tab-btn" data-tab="flavor">Info</button>
            <button class="tab-btn" data-tab="stats">Stats</button>
            <button class="tab-btn" data-tab="evo">Evolution</button>
        </div>

        <div id="dialog-content"></div>
    `;
}