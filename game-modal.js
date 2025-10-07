class GameModal {
    constructor() {
        this.modal = document.getElementById('gameModal');
        this.closeBtn = document.getElementById('closeGameModal');
        this.gameData = this.initializeGameData();
        this.init();
    }
    init() {
        this.bindEvents();
    }
    bindEvents() {
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
        document.getElementById('gameModalPurchaseBtn').addEventListener('click', () => {
            this.handlePurchase();
        });
    }
    initializeGameData() {
        return {
            'super-mombo-quest': {
                title: 'Super Mombo Quest',
                image: 'img/superMomb.jpg',
                rating: '4.8 (4,502)',
                oldPrice: 'R$ 180,90',
                currentPrice: 'R$ 90,45',
                description: 'Super Mombo Quest é um jogo de plataforma em 2D, repleto de ação e desafios em um mundo vibrante e colorido. Embarque em uma jornada para resgatar seu povo. Com uma jogabilidade fluida e dinâmica, Super Mombo Quest apresenta um estilo retrô de pixel art, remetendo aos jogos clássicos da era 16-bit.',
                developer: 'EnsGames',
                releaseDate: 'Setembro/19',
                genre: 'Aventura, Plataforma',
                gallery: [
                    'img/superMomb.jpg',
                    'img/superMomb.jpg',
                    'img/superMomb.jpg'
                ]
            },
            'bem-feito': {
                title: 'Bem feito!',
                image: 'img/BemFeito.jpg',
                rating: '4.8 (51,882)',
                oldPrice: '',
                currentPrice: 'Gratuito',
                description: 'Um jogo indie brasileiro que combina elementos de aventura e quebra-cabeças. Explore um mundo único e colorido, resolvendo desafios criativos e descobrindo segredos escondidos em cada fase.',
                developer: 'Studio Brasileiro',
                releaseDate: '2023',
                genre: 'Aventura, Puzzle',
                gallery: [
                    'img/BemFeito.jpg',
                    'img/BemFeito.jpg',
                    'img/BemFeito.jpg'
                ]
            },
            'bacuri': {
                title: 'Bacuri',
                image: 'img/Bacuri.jpg',
                rating: '4.8 (6,269)',
                oldPrice: 'R$ 180,90',
                currentPrice: 'R$ 170,90',
                description: 'Bacuri é um jogo de ação e aventura inspirado na cultura brasileira. Explore cenários exuberantes da Amazônia, enfrente criaturas místicas e descubra os segredos da floresta em uma jornada épica.',
                developer: 'Amazonia Games',
                releaseDate: '2023',
                genre: 'Ação, Aventura',
                gallery: [
                    'img/Bacuri.jpg',
                    'img/Bacuri.jpg',
                    'img/Bacuri.jpg'
                ]
            },
            'unsighted': {
                title: 'Unsighted',
                image: 'img/UNSIGHTED.png',
                rating: '4.8 (15,368)',
                oldPrice: 'R$ 105,00',
                currentPrice: 'R$ 41,96',
                description: 'Unsighted é um RPG de ação isométrico em um mundo cyberpunk. Explore uma cidade futurística, lute contra robôs e androides, e tome decisões que afetarão o destino de seus companheiros em uma narrativa envolvente.',
                developer: 'Studio Pixel Punk',
                releaseDate: '2021',
                genre: 'RPG, Ação',
                gallery: [
                    'img/UNSIGHTED.png',
                    'img/UNSIGHTED.png',
                    'img/UNSIGHTED.png'
                ]
            },
            'curse-of-the-dead-gods': {
                title: 'Curse of the Dead Gods',
                image: 'img/19.jpeg',
                rating: '4.9 (30,944)',
                oldPrice: '',
                currentPrice: 'R$ 104,90',
                description: 'Curse of the Dead Gods é um roguelike de ação onde você explora templos amaldiçoados em busca de tesouros. Enfrente deuses antigos, colete relíquias poderosas e sobreviva às maldições que crescem a cada passo.',
                developer: 'Passtech Games',
                releaseDate: '2021',
                genre: 'Roguelike, Ação',
                gallery: [
                    'img/19.jpeg',
                    'img/19.jpeg',
                    'img/19.jpeg'
                ]
            },
            'pocket-bravery': {
                title: 'Pocket Bravery',
                image: 'img/pocketBravery.jpg',
                rating: '4.5 (10,439)',
                oldPrice: '',
                currentPrice: 'R$ 59,95',
                description: 'Pocket Bravery é um jogo de luta 2D com personagens únicos e mecânicas inovadoras. Domine combos devastadores, participe de torneios online e prove suas habilidades contra jogadores do mundo todo.',
                developer: 'Statera Studio',
                releaseDate: '2022',
                genre: 'Luta, Multiplayer',
                gallery: [
                    'img/pocketBravery.jpg',
                    'img/pocketBravery.jpg',
                    'img/pocketBravery.jpg'
                ]
            },
            'until-dead': {
                title: 'Until Dead',
                image: 'img/untilDead.jpeg',
                rating: '4.7 (10,588)',
                oldPrice: '',
                currentPrice: 'Gratuito',
                description: 'Until Dead é um jogo de sobrevivência em um mundo pós-apocalíptico. Colete recursos, construa abrigos e lute contra hordas de zumbis em um ambiente hostil onde cada decisão pode ser a diferença entre a vida e a morte.',
                developer: 'Apocalypse Studios',
                releaseDate: '2023',
                genre: 'Sobrevivência, Ação',
                gallery: [
                    'img/untilDead.jpeg',
                    'img/untilDead.jpeg',
                    'img/untilDead.jpeg'
                ]
            },
            'no-place-for-bravery': {
                title: 'No place for Bravery',
                image: 'img/Bravery.jpg',
                rating: '3.6 (648)',
                oldPrice: 'R$ 59,90',
                currentPrice: 'R$ 19,99',
                description: 'No Place for Bravery é um RPG de ação com uma narrativa sombria e emocional. Acompanhe a jornada de um guerreiro veterano em busca de sua filha desaparecida em um mundo brutal e implacável.',
                developer: 'Glitch Factory',
                releaseDate: '2022',
                genre: 'RPG, Ação',
                gallery: [
                    'img/Bravery.jpg',
                    'img/Bravery.jpg',
                    'img/Bravery.jpg'
                ]
            },
            'fobia': {
                title: 'Fobia',
                image: 'img/Fobia.jpg',
                rating: '4.5 (1,439)',
                oldPrice: '',
                currentPrice: 'R$ 159,50',
                description: 'Fobia é um jogo de terror psicológico que combina elementos de survival horror com quebra-cabeças complexos. Explore um hotel assombrado, desvende mistérios sombrios e enfrente seus medos mais profundos.',
                developer: 'Pulsatrix Studios',
                releaseDate: '2022',
                genre: 'Terror, Survival Horror',
                gallery: [
                    'img/Fobia.jpg',
                    'img/Fobia.jpg',
                    'img/Fobia.jpg'
                ]
            }
        };
    }
    normalizeId(str) {
        return String(str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');
    }
    openModal(gameId) {
        let game = this.gameData[gameId];
        if (!game) {
            const target = this.normalizeId(gameId);
            const altKey = Object.keys(this.gameData).find(k => {
                const byKey = this.normalizeId(k) === target;
                const byTitle = this.normalizeId(this.gameData[k]?.title) === target;
                return byKey || byTitle;
            });
            if (altKey) {
                gameId = altKey;
                game = this.gameData[altKey];
            }
        }
        if (!game) {
            console.error('Game not found:', gameId);
            return;
        }
        console.log('Opening modal for game:', gameId, game);
        const titleEl = document.getElementById('gameModalTitle');
        if (titleEl) titleEl.textContent = game.title;
        const mainImg = document.getElementById('gameModalImage');
        if (mainImg) {
            mainImg.src = game.image;
            mainImg.alt = `Capa do jogo ${game.title}`;
        }
        const ratingEl = document.getElementById('gameModalRating');
        if (ratingEl) ratingEl.textContent = game.rating;
        const priceEl = document.getElementById('gameModalPrice');
        if (priceEl) priceEl.textContent = game.currentPrice;
        const descEl = document.getElementById('gameModalDescription');
        if (descEl) descEl.textContent = game.description;
        const devEls = document.querySelectorAll('#gameModalDeveloper');
        devEls.forEach(el => { el.textContent = game.developer; });
        const relEls = document.querySelectorAll('#gameModalReleaseDate');
        relEls.forEach(el => { el.textContent = game.releaseDate; });
        const genreEls = document.querySelectorAll('#gameModalGenre');
        genreEls.forEach(el => { el.textContent = game.genre; });
        const oldPriceElement = document.getElementById('gameModalOldPrice');
        if (oldPriceElement) {
            if (game.oldPrice) {
                oldPriceElement.textContent = game.oldPrice;
                oldPriceElement.style.display = 'block';
            } else {
                oldPriceElement.style.display = 'none';
            }
        }
        const galleryContainer = document.getElementById('gameModalGallery');
        if (galleryContainer) {
            galleryContainer.innerHTML = '';
            game.gallery.forEach((imageSrc, index) => {
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = `Screenshot ${index + 1} do jogo ${game.title}`;
                img.className = 'game-modal-gallery-image';
                img.addEventListener('click', () => {
                    const main = document.getElementById('gameModalImage');
                    if (main) main.src = imageSrc;
                });
                galleryContainer.appendChild(img);
            });
        }
        this.modal.style.display = 'block';
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        console.log('Modal should be visible now');
    }
    closeModal() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300); // Wait for animation to complete
        document.body.style.overflow = 'auto'; // Restore background scrolling
        console.log('Modal closed');
    }
    handlePurchase() {
        const gameTitle = document.getElementById('gameModalTitle').textContent;
        const gamePrice = document.getElementById('gameModalPrice').textContent;
        if (gamePrice === 'Gratuito') {
            alert(`${gameTitle} foi adicionado à sua biblioteca!`);
        } else {
            alert(`${gameTitle} foi adicionado ao seu carrinho por ${gamePrice}!`);
        }
        this.closeModal();
    }
}
function openGameModal(gameId) {
    console.log('openGameModal called with gameId:', gameId);
    if (window.gameModalInstance) {
        console.log('Game modal instance found, opening modal');
        window.gameModalInstance.openModal(gameId);
    } else {
        console.error('Game modal instance not initialized');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.gameModalInstance = new GameModal();
                window.gameModalInstance.openModal(gameId);
            });
        } else {
            window.gameModalInstance = new GameModal();
            window.gameModalInstance.openModal(gameId);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.gameModalInstance = new GameModal();
});
