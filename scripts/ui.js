const loader = document.getElementById("loader");
const container = document.getElementById("pokemon-container");

function renderPokemon(pokemon) {
    const image = pokemon.sprites.other["official-artwork"].front_default;

    container.innerHTML += `
        <div class="pokemon-card">
            <img src="${image}">
            <p>${pokemon.name}</p>
        </div>
    `;
}

function showLoader() {
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}
