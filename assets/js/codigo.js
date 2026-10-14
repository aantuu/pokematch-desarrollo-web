const CHAMPIONS_API_URL = 'https://championsbattledata.com/api';
const URL_ATACANTES = `${CHAMPIONS_API_URL}?role=atacantes`;
const URL_TANQUES = `${CHAMPIONS_API_URL}?role=tanques`;
const URL_VELOCES = `${CHAMPIONS_API_URL}?role=veloces`;

let myRoster = JSON.parse(localStorage.getItem('pokemonRoster')) || [];
let allPokemonLoaded = [];
const MAX_ROSTER_SIZE = 6;

const TYPE_WEAKNESSES = {
    fire: ['water', 'electric', 'rock'],
    fuego: ['agua', 'electrico', 'roca'],
    water: ['electric', 'grass'],
    agua: ['electrico', 'planta'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    planta: ['fuego', 'hielo', 'veneno', 'volador', 'bicho'],
    electric: ['ground'],
    electrico: ['tierra'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    hielo: ['fuego', 'lucha', 'roca', 'acero'],
    fighting: ['flying', 'psychic', 'fairy'],
    lucha: ['volador', 'psiquico', 'hada'],
    poison: ['ground', 'psychic'],
    veneno: ['tierra', 'psiquico'],
    ground: ['water', 'grass', 'ice'],
    tierra: ['agua', 'planta', 'hielo'],
    flying: ['electric', 'ice', 'rock'],
    volador: ['electrico', 'hielo', 'roca'],
    psychic: ['bug', 'ghost', 'dark'],
    psiquico: ['bicho', 'fantasma', 'siniestro'],
    bug: ['fire', 'flying', 'rock'],
    bicho: ['fuego', 'volador', 'roca'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    roca: ['agua', 'planta', 'lucha', 'tierra', 'acero'],
    ghost: ['ghost', 'dark'],
    fantasma: ['fantasma', 'siniestro'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    siniestro: ['lucha', 'bicho', 'hada'],
    steel: ['fire', 'fighting', 'ground'],
    acero: ['fuego', 'lucha', 'tierra'],
    fairy: ['poison', 'steel'],
    hada: ['veneno', 'acero']
};

async function loadChampionsData(url = CHAMPIONS_API_URL) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        allPokemonLoaded = data.pokemon || data;
        renderGallery(allPokemonLoaded);
        loadSavedTeam();
    } catch (error) {
        console.log("Error al cargar la API:", error);
    }
}

function saveTeamToStorage() {
    const teamNameInput = document.getElementById('team-name');
    const name = teamNameInput ? teamNameInput.value.trim() : 'Mi Equipo Champion';
    const rosterIds = myRoster.map(p => p.id || p.slug || p.name);

    localStorage.setItem('pokematch_team', JSON.stringify({ name, rosterIds }));
}

function saveTeamConfiguration() {
    saveTeamToStorage();
    alert("¡Equipo guardado con éxito en el navegador!");
}

function loadSavedTeam() {
    const saved = localStorage.getItem('pokematch_team');
    if (saved && allPokemonLoaded.length > 0) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.name) {
                const input = document.getElementById('team-name');
                if (input) input.value = parsed.name;
            }
            if (Array.isArray(parsed.rosterIds)) {
                myRoster = parsed.rosterIds
                    .map(id => allPokemonLoaded.find(p => String(p.id) === String(id) || p.slug === id || p.name === id))
                    .filter(Boolean);
                renderRosterUI();
            }
        } catch (e) {
            console.error("Error al cargar el equipo guardado:", e);
        }
    }
}

function createTypeBoxes(typesArray) {
    if (!Array.isArray(typesArray)) return '';
    return typesArray.map(typeInfo => {
        const typeName = typeof typeInfo === 'string' ? typeInfo : (typeInfo.type?.name || typeInfo.name || typeInfo);
        return `
            <div class="badge rounded-2 bg-type-${typeName} px-3 py-2 text-uppercase fw-bold me-1 shadow-sm">
                ${typeName}
            </div>
        `;
    }).join('');
}

function getStatColorClass(val) {
    if (val < 60) {
        return 'bg-danger';
    } else if (val < 90) {
        return 'bg-warning';
    } else {
        return 'bg-success';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadChampionsData(CHAMPIONS_API_URL);
    
    const homeView = document.getElementById('home-view');

    const modalSearchInput = document.getElementById('modal-search-input');
    const resultsContainer = document.getElementById('modal-search-results');

    const galleryNavBtn = document.getElementById('btn-gallery-nav');
    const gallerySection = document.getElementById('pokemon-gallery-section');
    const btnVerOtrosGallery = document.getElementById('btn-ver-otros-gallery');

    const homeNavBtn = document.getElementById('btn-home-nav');

    if (modalSearchInput && resultsContainer) {
        modalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length === 0) {
                resultsContainer.style.display = 'none';
                resultsContainer.innerHTML = '';
                return;
            }

            const matches = allPokemonLoaded.filter(p => {
                const name = (p.name || p.slug || '').toLowerCase();
                const idStr = (p.id || p.number || '').toString();
                return name.includes(query) || idStr.includes(query);
            }).slice(0, 5);

            if (matches.length === 0) {
                resultsContainer.style.display = 'block';
                resultsContainer.innerHTML = `<div class="list-group-item text-muted small py-2">No se encontró ningún Pokémon.</div>`;
                return;
            }

            resultsContainer.style.display = 'block';
            resultsContainer.style.position = 'absolute';
            resultsContainer.style.zIndex = '1080';
            resultsContainer.style.width = '100%';

            resultsContainer.innerHTML = matches.map(poke => {
                const pokeName = poke.name || poke.slug || 'Desconocido';
                const pokeId = poke.id || poke.slug;
                const spriteUrl = poke.sprites?.front_default || poke.sprite || poke.icon || '';

                return `
                    <button type="button" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2" onclick="selectPokemonFromModal('${pokeName}')">
                        <div class="d-flex align-items-center gap-2">
                            <img src="${spriteUrl}" style="width: 35px; height: 35px; object-fit: contain;" alt="${pokeName}" onerror="this.style.display='none'">
                            <span class="fw-bold text-capitalize">${pokeName}</span>
                        </div>
                        <span class="badge bg-secondary small">${pokeId ? '#' + pokeId : ''}</span>
                    </button>
                `;
            }).join('');
        });

        document.addEventListener('click', (e) => {
            if (!modalSearchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }

    if (galleryNavBtn) {
        galleryNavBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (homeView) homeView.style.display = 'none';
            if (gallerySection) gallerySection.style.display = 'block';

            renderGallery();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (homeNavBtn) {
        homeNavBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (gallerySection) gallerySection.style.display = 'none';
            if (homeView) homeView.style.display = 'block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (btnVerOtrosGallery) {
        btnVerOtrosGallery.addEventListener('click', (e) => {
            e.preventDefault();

            if (homeView) homeView.style.display = 'none';
            if (gallerySection) gallerySection.style.display = 'block';

            renderGallery();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    renderRosterUI();
});

function renderGallery(list = allPokemonLoaded) {
    const galleryContainer = document.getElementById('pokemon-gallery-container');
    if (!galleryContainer) return;

    if (!list || list.length === 0) {
        galleryContainer.innerHTML = `<div class="col-12 text-center text-muted py-4">No hay Pokémon disponibles para mostrar.</div>`;
        return;
    }

    galleryContainer.innerHTML = list.map(poke => {
        const pokeName = poke.name || poke.slug || 'Pokémon';
        const pokeId = poke.id || poke.slug;
        const typesHTML = createTypeBoxes(poke.types || poke.typeList || []);

        const imagePath = poke.primary?.image_path || poke.summary?.sprite || '';
        const staticImageUrl = `https://championsbattledata.com/${encodeURI(imagePath)}`;

        const pokemonSlug = getPokemonSlug(poke);
        const detailPageUrl = `https://www.pokemon-zone.com/champions/pokemon/${pokemonSlug}/`;

        return `
            <div class="col">
                <a href="${detailPageUrl}" target="_blank" class="text-decoration-none text-dark" title="Ver perfil detallado de ${pokeName}">
                    <div class="card h-100 shadow-sm border-0 text-center p-3 bg-white position-relative" style="cursor: pointer; transition: transform 0.2s;">
                        <span class="position-absolute top-0 start-0 badge bg-secondary m-2">#${pokeId}</span>
                        <img src="${staticImageUrl}" class="img-fluid mx-auto mt-3" style="height: 110px; object-fit: contain;" alt="${pokeName}" onerror="this.style.display='none'">
                        <h5 class="fw-bold text-capitalize mt-3 mb-2">${pokeName}</h5>
                        <div class="d-flex justify-content-center gap-1 my-2 flex-wrap">
                            ${typesHTML}
                        </div>
                        <small class="text-muted d-block mb-2" style="font-size: 0.75rem;">Ver perfil en Pokémon Zone</small>
                        <button class="btn btn-outline-danger btn-sm mt-auto fw-semibold" onclick="event.preventDefault(); event.stopPropagation(); addToRoster('${pokeId}')">
                            + Añadir al Equipo
                        </button>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}

function getPokemonSlug(poke) {
    const baseSlug = (poke.slug || '').toLowerCase();
    const titleText = (poke.primary?.title || '').toLowerCase();
    const pokeName = poke.name || 'pokémon';

    if (baseSlug.endsWith('-f')) {
        return baseSlug.replace(/-f$/, '-female');
    }
    if (baseSlug.includes('galar') || titleText.includes('galarian')) {
        const base = baseSlug.replace(/-galar|galar-|_galar/g, '').replace(/[^a-z]/g, '');
        return `${base}-galarian-form`;
    }
    if (baseSlug.includes('hisui') || titleText.includes('hisuian')) {
        const base = baseSlug.replace(/-hisui|hisui-|_hisui/g, '').replace(/[^a-z]/g, '');
        return `${base}-hisuian-form`;
    }
    if (baseSlug.includes('tauros') && baseSlug.includes('paldea')) {
        if (baseSlug.includes('aqua')) return 'tauros-paldean-form-aqua-breed';
        if (baseSlug.includes('blaze')) return 'tauros-paldean-form-blaze-breed';
        if (baseSlug.includes('combat')) return 'tauros-paldean-form-combat-breed';
        return 'tauros-paldean-form';
    }
    if (baseSlug.includes('floette') && (baseSlug.includes('eternal') || titleText.includes('eternal'))) {
        return 'floette-eternal-flower';
    }
    if (baseSlug.includes('gourgeist') || baseSlug.includes('pumpkaboo')) {
        const prefix = baseSlug.includes('gourgeist') ? 'gourgeist' : 'pumpkaboo';
        if (baseSlug.includes('small')) return `${prefix}-small-size`;
        if (baseSlug.includes('large')) return `${prefix}-large-variety`;
        if (baseSlug.includes('super')) return `${prefix}-jumbo-size`;
        return `${prefix}-average-size`;
    }
    if (baseSlug.includes('lycanroc')) {
        if (baseSlug.includes('dusk')) return 'lycanroc-dusk-form';
        if (baseSlug.includes('midnight')) return 'lycanroc-midnight-form';
        return 'lycanroc';
    }
    if (baseSlug.includes('rotom') && ['fan', 'frost', 'heat', 'mow', 'wash'].some(form => baseSlug.includes(form))) {
        const formType = baseSlug.replace('rotom', '').replace(/-/g, '').trim();
        return `rotom-${formType}-rotom`;
    }
    if (baseSlug.includes('toxtricity') && (baseSlug.includes('low-key') || baseSlug.includes('lowkey'))) {
        return 'toxtricity-low-key-form';
    }
    if (['maushold', 'squawkabilly', 'vivillon', 'tauros'].some(prefix => baseSlug.startsWith(prefix))) {
        return baseSlug.split('-')[0];
    }
    if (poke.primary?.title) {
        return poke.primary.title
            .toLowerCase()
            .replace(/["']/g, '')
            .replace(/[\[\]()]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/--+/g, '-');
    }
    return (baseSlug || pokeName.toLowerCase().replace(/\s+/g, '-')).replace(/--+/g, '-');
}

function openPokemonModal(identifier) {
    const poke = allPokemonLoaded.find(p => p.id === identifier || p.slug === identifier || p.name === identifier);
    if (!poke) return;

    const pokeName = poke.name || poke.slug || 'Pokémon';
    const spriteUrl = poke.sprites?.front_default || poke.sprite || poke.image || '';
    const typesHTML = createTypeBoxes(poke.types || poke.typeList || []);
    const pokeId = poke.id || poke.slug;

    const detailBody = document.getElementById('pokemon-detail-body');
    detailBody.innerHTML = `
        <div class="bg-light rounded p-3 mb-3">
            <img src="${spriteUrl}" class="img-fluid" style="height: 150px; object-fit: contain;" alt="${pokeName}">
        </div>
        <h3 class="fw-bold text-capitalize mb-2">${pokeName}</h3>
        <span class="badge bg-secondary mb-3">ID: #${pokeId}</span>
        <div class="d-flex justify-content-center gap-1 mb-3 flex-wrap">
            ${typesHTML}
        </div>
        <div class="d-grid gap-2 mt-4">
            <button class="btn btn-danger fw-semibold" onclick="addToRoster('${pokeId}'); bootstrap.Modal.getInstance(document.getElementById('pokemonDetailModal')).hide();">
                + Añadir al Equipo
            </button>
        </div>
    `;

    const modalElement = document.getElementById('pokemonDetailModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function addToRoster(identifier) {
    if (myRoster.length >= MAX_ROSTER_SIZE) {
        alert("¡Tu equipo ya está completo! Máximo 6 integrantes.");
        return;
    }

    const selectedPoke = allPokemonLoaded.find(p =>
        p.id === identifier || p.slug === identifier || p.name === identifier
    );

    if (!selectedPoke) return;

    const pokeName = selectedPoke.name || selectedPoke.slug;

    if (myRoster.some(p => (p.name || p.slug) === pokeName)) {
        alert(`${pokeName} ya forma parte de tu equipo.`);
        return;
    }

    myRoster.push(selectedPoke);

    saveTeamToStorage();

    renderRosterUI();
    alert(`¡${pokeName} añadido a tu equipo!`);
}

function removeFromRoster(identifier) {
    myRoster = myRoster.filter(p =>
        String(p.id) !== String(identifier) &&
        p.slug !== identifier &&
        p.name !== identifier
    );

    saveTeamToStorage();
    renderRosterUI();
}

function clearRoster() {
    if (confirm("¿Estás seguro de que deseas vaciar todo tu equipo?")) {
        myRoster = [];
        saveTeamToStorage();
        renderRosterUI();
    }
}

function selectPokemonFromModal(identifier) {
    addToRoster(identifier);

    const modalSearchInput = document.getElementById('modal-search-input');
    const resultsContainer = document.getElementById('modal-search-results');
    if (modalSearchInput) modalSearchInput.value = '';
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
    }
}

function renderRosterUI() {
    const badge = document.querySelector('.badge.bg-danger, #roster-count-badge, .nav-item .badge');
    if (badge) badge.textContent = `${myRoster.length}/6`;

    const modalCount = document.getElementById('modal-roster-count');
    if (modalCount) modalCount.textContent = myRoster.length;

    const container = document.getElementById('roster-slots-container');
    if (container) {
        let html = '';
        for (let i = 0; i < 6; i++) {
            const poke = myRoster[i];
            if (poke) {
                const pokeName = poke.name || poke.slug || 'Pokémon';
                const pokeId = poke.id || poke.slug;
                const spriteUrl = poke.sprites?.front_default || poke.sprite || `https://championsbattledata.com/pokemon_champions_assets/pokemon/${encodeURIComponent(pokeName)}.png`;

                html += `
                    <div class="col">
                        <div class="card h-100 shadow-sm border-danger text-center p-2 position-relative bg-white">
                            <button type="button" class="btn-close position-absolute top-0 end-0 m-1" style="font-size: 0.7rem;" onclick="removeFromRoster('${pokeId}')" aria-label="Quitar"></button>
                            <img src="${spriteUrl}" class="img-fluid mx-auto mt-2" style="height: 60px; object-fit: contain;" alt="${pokeName}" onerror="this.style.display='none'">
                            <span class="fw-bold text-capitalize text-dark mt-2" style="font-size: 0.85rem;">${pokeName}</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="col">
                        <div class="card h-100 border text-center p-3 d-flex align-items-center justify-content-center bg-light text-muted" style="min-height: 110px;">
                            <small class="small" style="font-size: 0.75rem;">Slot Vacío</small>
                        </div>
                    </div>
                `;
            }
        }
        container.innerHTML = html;
    }

    updateTeamTypesSummary();
    updateTeamWeaknessesSummary();
}

function updateTeamTypesSummary() {
    const typeCoverage = document.getElementById('team-type-coverage');
    if (!typeCoverage) return;

    if (myRoster.length === 0) {
        typeCoverage.innerHTML = `<span class="text-muted small">Agrega integrantes para ver los tipos representados.</span>`;
        return;
    }

    const allTypesSet = new Set();
    myRoster.forEach(poke => {
        const types = poke.summary?.types ?? poke.types ?? [];
        types.forEach(t => allTypesSet.add(t));
    });

    typeCoverage.innerHTML = Array.from(allTypesSet).map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('');
}

function updateTeamWeaknessesSummary() {
    const weaknessesContainer = document.getElementById('team-type-weaknesses');
    if (!weaknessesContainer) return;

    if (myRoster.length === 0) {
        weaknessesContainer.innerHTML = `<span class="text-muted small">Agrega integrantes para ver las debilidades.</span>`;
        return;
    }

    const teamWeaknesses = new Set();

    myRoster.forEach(poke => {
        const types = poke.summary?.types ?? poke.types ?? [];
        
        types.forEach(type => {
            const normalizedType = String(type).toLowerCase().trim();
            const weaknesses = TYPE_WEAKNESSES[normalizedType] || [];
            
            weaknesses.forEach(w => teamWeaknesses.add(w));
        });
    });

    if (teamWeaknesses.size === 0) {
        weaknessesContainer.innerHTML = `<span class="text-muted small">Sin debilidades registradas.</span>`;
        return;
    }

    weaknessesContainer.innerHTML = Array.from(teamWeaknesses)
        .map(w => `<span class="badge bg-danger me-1 text-uppercase">${w}</span>`)
        .join('');
}

function updateTypeCoverage() {
    const coverageContainer = document.getElementById('team-type-coverage');
    if (!coverageContainer) return;

    if (myRoster.length === 0) {
        coverageContainer.innerHTML = '<span class="text-muted small">Agrega integrantes para ver los tipos representados.</span>';
        return;
    }

    const allTypes = myRoster.flatMap(p => p.types);
    coverageContainer.innerHTML = createTypeBoxes(allTypes);
}

function filterByRole(role) {
    const gallerySection = document.getElementById('pokemon-gallery-section');
    const homeView = document.getElementById('home-view');
    if (gallerySection && homeView) {
        gallerySection.style.display = 'block';
        homeView.style.display = 'none';
    }

    const filteredPokemon = allPokemonLoaded.filter(entry => {
        const stats = entry.summary?.baseStats || entry.baseStats || entry.stats || {};
        const attack = Number(stats.attack || stats.ataque || 0);
        const defense = Number(stats.defense || stats.defensa || 0);
        const hp = Number(stats.hp || stats.vida || 0);
        const speed = Number(stats.speed || stats.velocidad || 0);

        if (role === 'atacantes') {
            return attack >= 100;
        } else if (role === 'tanques') {
            return defense >= 90 || hp >= 100;
        } else if (role === 'veloces') {
            return speed >= 100;
        } else {
            return true;
        }
    });

    renderGallery(filteredPokemon);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleNavbarSearch(event) {
    if (event) event.preventDefault();

    const searchInput = document.getElementById('navbar-search-input');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    const matchedPokemon = allPokemonLoaded.filter(p => {
        const name = (p.name || p.slug || '').toLowerCase();
        const idStr = (p.id || p.number || '').toString().toLowerCase();
        return name.includes(query) || idStr.includes(query);
    });

    const gallerySection = document.getElementById('pokemon-gallery-section');
    const homeView = document.getElementById('home-view');
    if (gallerySection && homeView) {
        gallerySection.style.display = 'block';
        homeView.style.display = 'none';
    }

    renderGallery(matchedPokemon);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}