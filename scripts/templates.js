function getPokemonCardTemplate({ name, image, gradient, icons }) {
    return `
        <div class="pokemon-card" style="background: ${gradient}">
            <div class="card-inner">
                <h3>${name}</h3>
                <img src="${image}">
                <div class="type-icons">${icons}</div>
            </div>
        </div>
    `;
}