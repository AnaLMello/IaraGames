class SearchModal {
    constructor() {
        this.modal = null;
        this.searchInput = null;
        this.searchResults = null;
        this.searchTimeout = null;
        this.isLoading = false;
        this.init();
    }
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupModal());
        } else {
            this.setupModal();
        }
    }
    setupModal() {
        this.modal = document.getElementById('searchModal');
        this.searchInput = document.getElementById('modalSearchInput');
        this.searchResults = document.getElementById('searchResults');
        console.log('Modal elements:', {
            modal: this.modal,
            searchInput: this.searchInput,
            searchResults: this.searchResults
        });
        if (!this.modal || !this.searchInput || !this.searchResults) {
            console.warn('Search modal elements not found');
            console.log('Available elements:', {
                searchModal: document.getElementById('searchModal'),
                modalSearchInput: document.getElementById('modalSearchInput'),
                searchResults: document.getElementById('searchResults')
            });
            return;
        }
        this.bindEvents();
    }
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.search-icon-container')) {
                e.preventDefault();
                this.openModal();
            }
        });
        const closeBtn = document.getElementById('closeSearchModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
        this.searchInput.addEventListener('input', (e) => {
            console.log('Input event triggered:', e.target.value);
            this.handleSearch(e.target.value);
        });
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }
    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);
    }
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.searchInput.value = '';
        this.showInitialMessage();
    }
    handleSearch(query) {
        console.log('handleSearch called with:', query);
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        if (!query.trim()) {
            this.showInitialMessage();
            return;
        }
        this.searchTimeout = setTimeout(() => {
            console.log('Performing search for:', query.trim());
            this.performSearch(query.trim());
        }, 300);
    }
    async performSearch(query) {
        console.log('performSearch called with:', query);
        if (this.isLoading) return;
        this.isLoading = true;
        this.showLoading();
        try {
            const results = await this.searchGames(query);
            console.log('Search results:', results);
            this.displayResults(results, query);
        } catch (error) {
            console.error('Erro na busca:', error);
            this.showError('Erro ao buscar jogos. Tente novamente.');
        } finally {
            this.isLoading = false;
        }
    }
    async searchGames(query) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const realGames = [
            {
                id: 1,
                title: "Super Mombo Quest",
                description: "Uma aventura de plataforma cheia de ação e desafios únicos.",
                developer: "Orube Game Studio",
                genre: "Plataforma, Aventura",
                price: "R$ 90,45",
                originalPrice: "R$ 180,90",
                image: "img/SuperMomboQuest.jpg",
                rating: "4.8 (4,502)"
            },
            {
                id: 2,
                title: "Bem feito!",
                description: "Um jogo de aventura brasileiro com narrativa envolvente e personagens únicos.",
                developer: "Iara Studios",
                genre: "Aventura",
                price: "Gratuito",
                originalPrice: "",
                image: "img/BemFeito.jpg",
                rating: "4.8 (51,882)"
            },
            {
                id: 3,
                title: "Bacuri",
                description: "Jogo de ação inspirado na cultura brasileira com elementos únicos de gameplay.",
                developer: "Iara Studios",
                genre: "Ação",
                price: "R$ 170,90",
                originalPrice: "R$ 180,90",
                image: "img/Bacuri.jpg",
                rating: "4.8 (6,269)"
            },
            {
                id: 4,
                title: "Unsighted",
                description: "Um RPG de ação isométrico com elementos de Zelda e Dark Souls.",
                developer: "Studio Pixel Punk",
                genre: "RPG, Ação",
                price: "R$ 41,96",
                originalPrice: "R$ 105,00",
                image: "img/UNSIGHTED.png",
                rating: "4.8 (15,368)"
            },
            {
                id: 5,
                title: "Curse of the Dead Gods",
                description: "Roguelike de ação onde você explora templos amaldiçoados em busca de tesouros.",
                developer: "Passtech Games",
                genre: "Roguelike, Ação, Fantasia",
                price: "R$ 104,90",
                originalPrice: "",
                image: "img/19.jpeg",
                rating: "4.9 (30,944)"
            },
            {
                id: 6,
                title: "Pocket Bravery",
                description: "Jogo de luta 2D com personagens únicos e mecânicas inovadoras.",
                developer: "Statera Studio",
                genre: "Luta, Multiplayer",
                price: "R$ 59,95",
                originalPrice: "",
                image: "img/pocketBravery.jpg",
                rating: "4.5 (10,439)"
            },
            {
                id: 7,
                title: "Until Dead",
                description: "Jogo de sobrevivência em um mundo pós-apocalíptico cheio de zumbis.",
                developer: "Apocalypse Studios",
                genre: "Sobrevivência, Ação, Multiplayer, Fantasia",
                price: "Gratuito",
                originalPrice: "",
                image: "img/untilDead.jpeg",
                rating: "4.7 (10,588)"
            },
            {
                id: 8,
                title: "No place for Bravery",
                description: "RPG de ação com narrativa sombria e emocional sobre um guerreiro veterano.",
                developer: "Glitch Factory",
                genre: "RPG, Ação, Fantasia",
                price: "R$ 19,99",
                originalPrice: "R$ 59,90",
                image: "img/Bravery.jpg",
                rating: "3.6 (648)"
            },
            {
                id: 9,
                title: "Fobia",
                description: "Jogo de terror psicológico com elementos de sobrevivência e mistério.",
                developer: "Pulsatrix Studios",
                genre: "Terror, Fantasia",
                price: "R$ 159,50",
                originalPrice: "",
                image: "img/Fobia.jpg",
                rating: "4.5 (1,439)"
            }
        ];
        const filteredGames = realGames.filter(game => 
            game.title.toLowerCase().includes(query.toLowerCase()) ||
            game.description.toLowerCase().includes(query.toLowerCase()) ||
            game.developer.toLowerCase().includes(query.toLowerCase()) ||
            game.genre.toLowerCase().includes(query.toLowerCase())
        );
        return filteredGames;
    }
    displayResults(results, query) {
        if (results.length === 0) {
            this.showNoResults(query);
            return;
        }
        const resultsHTML = results.map(game => `
            <div class="search-result-item" data-game-id="${game.id}">
                <div class="search-result-header">
                    <div class="search-result-title">${game.title}</div>
                    <div class="search-result-rating">
                        <span class="text-warning">★</span> ${game.rating}
                    </div>
                </div>
                <div class="search-result-description">
                    ${game.description}
                </div>
                <div class="search-result-meta">
                    <small style="color: #1CB80E;">
                        <strong>Desenvolvedor:</strong> ${game.developer} | 
                        <strong>Gênero:</strong> ${game.genre}
                    </small>
                </div>
                <div class="search-result-price">
                    ${game.originalPrice ? `<span class="price-old">${game.originalPrice}</span>` : ''}
                    <span class="price-current">${game.price}</span>
                </div>
            </div>
        `).join('');
        this.searchResults.innerHTML = resultsHTML;
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const gameId = item.dataset.gameId;
                this.handleGameClick(gameId);
            });
        });
    }
    handleGameClick(gameId) {
        const gameIdMapping = {
            1: 'super-mombo-quest',
            2: 'bem-feito',
            3: 'bacuri',
            4: 'unsighted',
            5: 'curse-of-the-dead-gods',
            6: 'pocket-bravery',
            7: 'until-dead',
            8: 'no-place-for-bravery',
            9: 'fobia'
        };
        this.closeModal();
        const mappedGameId = gameIdMapping[parseInt(gameId)];
        if (mappedGameId) {
            setTimeout(() => {
                if (typeof openGameModal === 'function') {
                    openGameModal(mappedGameId);
                } else {
                    console.error('Função openGameModal não encontrada');
                }
            }, 300);
        } else {
            console.error('ID do jogo não encontrado no mapeamento:', gameId);
        }
    }
    showLoading() {
        this.searchResults.innerHTML = `
            <div class="search-loading">
                <div style="display: inline-block; animation: spin 1s linear infinite;">🔍</div>
                Buscando jogos...
            </div>
        `;
    }
    showInitialMessage() {
        this.searchResults.innerHTML = `
            <div class="search-no-results">
                Digite algo para começar a buscar...
            </div>
        `;
    }
    showNoResults(query) {
        this.searchResults.innerHTML = `
            <div class="search-no-results">
                Nenhum jogo encontrado para "<strong>${query}</strong>"
                <br><br>
                <small>Tente buscar por:</small>
                <br>
                <small>• Nome do jogo</small>
                <br>
                <small>• Desenvolvedor</small>
                <br>
                <small>• Gênero</small>
            </div>
        `;
    }
    showError(message) {
        this.searchResults.innerHTML = `
            <div class="search-no-results" style="color: #ff6b6b;">
                ${message}
            </div>
        `;
    }
}
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
let searchModal;
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('Tentando inicializar SearchModal...');
        searchModal = new SearchModal();
        window.SearchModal = SearchModal;
        window.searchModal = searchModal;
    }, 1000);
});
