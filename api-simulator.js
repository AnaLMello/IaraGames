// API Simulator - Simula endpoints de uma API real
class APISimulator {
    constructor() {
        this.baseDelay = 500; // Simula latência de rede
        this.data = {
            usuarios: [
                {
                    id: 1,
                    nome: "Ana Silva",
                    email: "ana.silva@email.com",
                    whatsapp: "+55 11 99999-1234",
                    sobre: "Apaixonada por jogos indie e narrativas envolventes. Sempre em busca de novas experiências interativas.",
                    detalhes_jogador: {
                        expertise: ["RPG", "Indie", "Aventura", "Narrativa"],
                        anos_experiencia: "5 anos jogando",
                        avaliacao: 5,
                        reviews_recebidos: [
                            {
                                id: 1,
                                jogo: "Bacuri",
                                autor: "João Santos",
                                estrelas: 5,
                                comentario: "Excelente análise do jogo! Ana conseguiu capturar perfeitamente a essência da narrativa brasileira.",
                                data: "2024-01-15"
                            }
                        ]
                    }
                },
                {
                    id: 2,
                    nome: "Carlos Mendes",
                    email: "carlos.mendes@email.com",
                    whatsapp: "+55 21 98888-5678",
                    sobre: "Gamer veterano com foco em jogos competitivos e análises técnicas detalhadas.",
                    detalhes_jogador: {
                        expertise: ["FPS", "MOBA", "Estratégia", "Competitivo"],
                        anos_experiencia: "8 anos jogando",
                        avaliacao: 4,
                        reviews_recebidos: [
                            {
                                id: 2,
                                jogo: "Counter-Strike 2",
                                autor: "Maria Costa",
                                estrelas: 4,
                                comentario: "Análise técnica muito boa, especialmente sobre mecânicas de tiro.",
                                data: "2024-01-10"
                            }
                        ]
                    }
                }
            ],
            jogos: [
                {
                    id: 1,
                    nome: "Bacuri",
                    desenvolvedor: "Curupira Games",
                    categoria: "Aventura",
                    preco: 29.99,
                    descricao: "Uma aventura amazônica única",
                    imagem: "https://via.placeholder.com/300x200?text=Bacuri",
                    avaliacao: 4.8,
                    tags: ["indie", "aventura", "brasileiro"],
                    lancamento: "2023-06-15",
                    plataformas: ["PC", "Nintendo Switch"],
                    requisitos: {
                        minimos: "Windows 10, 4GB RAM, DirectX 11",
                        recomendados: "Windows 11, 8GB RAM, DirectX 12"
                    }
                },
                {
                    id: 2,
                    nome: "UNSIGHTED",
                    desenvolvedor: "Studio Pixel Punk",
                    categoria: "Action RPG",
                    preco: 39.99,
                    descricao: "RPG de ação isométrico com mecânicas únicas",
                    imagem: "https://via.placeholder.com/300x200?text=UNSIGHTED",
                    avaliacao: 4.9,
                    tags: ["rpg", "ação", "indie"],
                    lancamento: "2021-09-30",
                    plataformas: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
                    requisitos: {
                        minimos: "Windows 10, 6GB RAM, DirectX 11",
                        recomendados: "Windows 11, 12GB RAM, DirectX 12"
                    }
                },
                {
                    id: 3,
                    nome: "Pocket Bravery",
                    desenvolvedor: "Statera Studio",
                    categoria: "Luta",
                    preco: 24.99,
                    descricao: "Jogo de luta 2D com personagens únicos",
                    imagem: "https://via.placeholder.com/300x200?text=Pocket+Bravery",
                    avaliacao: 4.6,
                    tags: ["luta", "2d", "competitivo"],
                    lancamento: "2022-11-20",
                    plataformas: ["PC", "PlayStation", "Xbox"],
                    requisitos: {
                        minimos: "Windows 10, 4GB RAM, DirectX 11",
                        recomendados: "Windows 11, 8GB RAM, DirectX 12"
                    }
                },
                {
                    id: 4,
                    nome: "Celeste",
                    desenvolvedor: "Maddy Makes Games",
                    categoria: "Plataforma",
                    preco: 19.99,
                    descricao: "Plataforma desafiador com narrativa tocante",
                    imagem: "https://via.placeholder.com/300x200?text=Celeste",
                    avaliacao: 4.9,
                    tags: ["plataforma", "indie", "narrativa"],
                    lancamento: "2018-01-25",
                    plataformas: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
                    requisitos: {
                        minimos: "Windows 7, 2GB RAM, DirectX 10",
                        recomendados: "Windows 10, 4GB RAM, DirectX 11"
                    }
                },
                {
                    id: 5,
                    nome: "Hollow Knight",
                    desenvolvedor: "Team Cherry",
                    categoria: "Metroidvania",
                    preco: 14.99,
                    descricao: "Aventura sombria em um reino subterrâneo",
                    imagem: "https://via.placeholder.com/300x200?text=Hollow+Knight",
                    avaliacao: 4.8,
                    tags: ["metroidvania", "indie", "aventura"],
                    lancamento: "2017-02-24",
                    plataformas: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
                    requisitos: {
                        minimos: "Windows 7, 4GB RAM, DirectX 10",
                        recomendados: "Windows 10, 8GB RAM, DirectX 11"
                    }
                }
            ],
            reviews: [
                {
                    id: 1,
                    usuario_id: 1,
                    jogo_id: 1,
                    jogo: "Bacuri",
                    estrelas: 5,
                    comentario: "Incrível representação da cultura brasileira! A trilha sonora é fantástica e a história muito envolvente.",
                    data: "2024-01-15T10:30:00Z",
                    curtidas: 23,
                    util: true
                },
                {
                    id: 2,
                    usuario_id: 1,
                    jogo_id: 2,
                    jogo: "UNSIGHTED",
                    estrelas: 5,
                    comentario: "Mecânicas de tempo únicas que realmente fazem você pensar em cada decisão. Arte pixel perfeita!",
                    data: "2024-01-10T14:20:00Z",
                    curtidas: 18,
                    util: true
                },
                {
                    id: 3,
                    usuario_id: 1,
                    jogo_id: 3,
                    jogo: "Pocket Bravery",
                    estrelas: 4,
                    comentario: "Ótimo jogo de luta com personagens carismáticos. Poderia ter mais modos de jogo.",
                    data: "2024-01-05T16:45:00Z",
                    curtidas: 12,
                    util: true
                },
                {
                    id: 4,
                    usuario_id: 2,
                    jogo_id: 1,
                    jogo: "Bacuri",
                    estrelas: 4,
                    comentario: "Bela homenagem ao folclore brasileiro. Algumas partes são um pouco lentas, mas vale a pena.",
                    data: "2024-01-12T09:15:00Z",
                    curtidas: 15,
                    util: true
                },
                {
                    id: 5,
                    usuario_id: 2,
                    jogo_id: 4,
                    jogo: "Celeste",
                    estrelas: 5,
                    comentario: "Não é apenas um jogo de plataforma, é uma experiência emocional profunda. Recomendo demais!",
                    data: "2024-01-08T11:30:00Z",
                    curtidas: 31,
                    util: true
                },
                {
                    id: 6,
                    usuario_id: 3,
                    jogo_id: 5,
                    jogo: "Hollow Knight",
                    estrelas: 5,
                    comentario: "Obra-prima do gênero metroidvania. Atmosfera sombria perfeita e gameplay impecável.",
                    data: "2024-01-03T13:20:00Z",
                    curtidas: 28,
                    util: true
                }
            ]
        };
    }

    // Simula delay de rede
    async _simulateNetworkDelay(customDelay = null) {
        const delay = customDelay || this.baseDelay;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Simula possíveis erros de rede
    _simulateNetworkError(errorRate = 0.05) {
        return Math.random() < errorRate;
    }

    // GET /api/usuarios/:id
    async getUsuario(id) {
        await this._simulateNetworkDelay();
        
        if (this._simulateNetworkError()) {
            throw new Error('Erro de rede: Não foi possível carregar os dados do usuário');
        }

        const usuario = this.data.usuarios.find(u => u.id === parseInt(id));
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        return {
            success: true,
            data: usuario,
            timestamp: new Date().toISOString()
        };
    }

    // GET /api/usuarios/:id/reviews
    async getReviewsUsuario(id) {
        await this._simulateNetworkDelay();
        
        if (this._simulateNetworkError()) {
            throw new Error('Erro de rede: Não foi possível carregar as reviews');
        }

        const reviews = this.data.reviews.filter(r => r.usuario_id === parseInt(id));
        const reviewsComJogos = reviews.map(review => {
            const jogo = this.data.jogos.find(j => j.id === review.jogo_id);
            return {
                ...review,
                jogo: jogo ? jogo.nome : 'Jogo não encontrado'
            };
        });

        return {
            success: true,
            data: reviewsComJogos,
            total: reviewsComJogos.length,
            timestamp: new Date().toISOString()
        };
    }

    // GET /api/jogos
    async getJogos(filtros = {}) {
        await this._simulateNetworkDelay();
        
        if (this._simulateNetworkError()) {
            throw new Error('Erro de rede: Não foi possível carregar os jogos');
        }

        let jogos = [...this.data.jogos];

        // Aplicar filtros
        if (filtros.categoria) {
            jogos = jogos.filter(j => j.categoria.toLowerCase().includes(filtros.categoria.toLowerCase()));
        }
        if (filtros.preco_max) {
            jogos = jogos.filter(j => j.preco <= filtros.preco_max);
        }
        if (filtros.preco_min) {
            jogos = jogos.filter(j => j.preco >= filtros.preco_min);
        }
        if (filtros.busca) {
            jogos = jogos.filter(j => 
                j.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                j.desenvolvedor.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                j.tags.some(tag => tag.toLowerCase().includes(filtros.busca.toLowerCase()))
            );
        }

        // Ordenação
        if (filtros.ordenar) {
            switch (filtros.ordenar) {
                case 'preco_asc':
                    jogos.sort((a, b) => a.preco - b.preco);
                    break;
                case 'preco_desc':
                    jogos.sort((a, b) => b.preco - a.preco);
                    break;
                case 'avaliacao':
                    jogos.sort((a, b) => b.avaliacao - a.avaliacao);
                    break;
                case 'nome':
                    jogos.sort((a, b) => a.nome.localeCompare(b.nome));
                    break;
                case 'lancamento':
                    jogos.sort((a, b) => new Date(b.lancamento) - new Date(a.lancamento));
                    break;
            }
        }

        // Paginação
        const limite = parseInt(filtros.limite) || 10;
        const pagina = parseInt(filtros.pagina) || 1;
        const inicio = (pagina - 1) * limite;
        const fim = inicio + limite;
        
        const jogosPaginados = jogos.slice(inicio, fim);

        return {
            success: true,
            data: jogosPaginados,
            meta: {
                total: jogos.length,
                pagina: pagina,
                limite: limite,
                total_paginas: Math.ceil(jogos.length / limite)
            },
            filtros_aplicados: filtros,
            timestamp: new Date().toISOString()
        };
    }

    // GET /api/jogos/:id
    async getJogo(id) {
        await this._simulateNetworkDelay();
        
        if (this._simulateNetworkError()) {
            throw new Error('Erro de rede: Não foi possível carregar o jogo');
        }

        const jogo = this.data.jogos.find(j => j.id === parseInt(id));
        if (!jogo) {
            throw new Error('Jogo não encontrado');
        }

        // Buscar reviews do jogo
        const reviews = this.data.reviews.filter(r => r.jogo_id === parseInt(id));
        const reviewsComUsuarios = reviews.map(review => {
            const usuario = this.data.usuarios.find(u => u.id === review.usuario_id);
            return {
                ...review,
                usuario: usuario ? usuario.nome : 'Usuário não encontrado'
            };
        });

        return {
            success: true,
            data: {
                ...jogo,
                reviews: reviewsComUsuarios
            },
            timestamp: new Date().toISOString()
        };
    }

    // POST /api/usuarios/:id
    async atualizarUsuario(id, dadosAtualizados) {
        await this._simulateNetworkDelay(800); // Operações de escrita são mais lentas
        
        if (this._simulateNetworkError(0.02)) { // Menor chance de erro em operações críticas
            throw new Error('Erro de rede: Não foi possível salvar os dados');
        }

        const usuarioIndex = this.data.usuarios.findIndex(u => u.id === parseInt(id));
        if (usuarioIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        // Atualizar dados
        this.data.usuarios[usuarioIndex] = {
            ...this.data.usuarios[usuarioIndex],
            ...dadosAtualizados,
            id: parseInt(id) // Garantir que o ID não seja alterado
        };

        return {
            success: true,
            data: this.data.usuarios[usuarioIndex],
            message: 'Usuário atualizado com sucesso',
            timestamp: new Date().toISOString()
        };
    }

    // POST /api/reviews
    async criarReview(dadosReview) {
        await this._simulateNetworkDelay(600);
        
        if (this._simulateNetworkError(0.03)) {
            throw new Error('Erro de rede: Não foi possível salvar a review');
        }

        const novaReview = {
            id: this.data.reviews.length + 1,
            ...dadosReview,
            data: new Date().toISOString().split('T')[0],
            curtidas: 0,
            util: 0
        };

        this.data.reviews.push(novaReview);

        return {
            success: true,
            data: novaReview,
            message: 'Review criada com sucesso',
            timestamp: new Date().toISOString()
        };
    }

    // Método para resetar dados (útil para testes)
    resetData() {
        // Recarregar dados originais se necessário
        console.log('Dados da API simulada resetados');
    }

    // Método para obter estatísticas da API
    getStats() {
        return {
            total_usuarios: this.data.usuarios.length,
            total_jogos: this.data.jogos.length,
            total_reviews: this.data.reviews.length,
            timestamp: new Date().toISOString()
        };
    }
}

// Instância global da API simulada
window.apiSimulator = new APISimulator();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APISimulator;
}