const { connectDB, runQuery, getQuery, allQuery } = require('../database/init');

class Game {
    constructor(data = {}) {
        this.id = data.id;
        this.nome = data.nome;
        this.desenvolvedor = data.desenvolvedor;
        this.categoria = data.categoria;
        this.preco = data.preco;
        this.descricao = data.descricao;
        this.imagem_url = data.imagem_url;
        this.avaliacao_media = data.avaliacao_media;
        this.total_reviews = data.total_reviews;
        this.data_lancamento = data.data_lancamento;
        this.plataformas = data.plataformas ? JSON.parse(data.plataformas) : [];
        this.requisitos_minimos = data.requisitos_minimos;
        this.requisitos_recomendados = data.requisitos_recomendados;
        this.tags = data.tags ? JSON.parse(data.tags) : [];
        this.ativo = data.ativo;
        this.data_criacao = data.data_criacao;
        this.data_atualizacao = data.data_atualizacao;
    }

    // Criar novo jogo
    static async create(gameData) {
        const db = await connectDB();
        try {
            const result = await runQuery(db, `
                INSERT INTO games (
                    nome, desenvolvedor, categoria, preco, descricao, imagem_url,
                    data_lancamento, plataformas, requisitos_minimos, requisitos_recomendados, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                gameData.nome,
                gameData.desenvolvedor,
                gameData.categoria,
                gameData.preco,
                gameData.descricao || null,
                gameData.imagem_url || null,
                gameData.data_lancamento || null,
                JSON.stringify(gameData.plataformas || []),
                gameData.requisitos_minimos || null,
                gameData.requisitos_recomendados || null,
                JSON.stringify(gameData.tags || [])
            ]);

            return await Game.findById(result.id);
        } finally {
            db.close();
        }
    }

    // Buscar jogo por ID
    static async findById(id) {
        const db = await connectDB();
        try {
            const gameData = await getQuery(db, `
                SELECT * FROM games WHERE id = ? AND ativo = 1
            `, [id]);

            if (!gameData) return null;
            
            return new Game(gameData);
        } finally {
            db.close();
        }
    }

    // Buscar jogo por ID com reviews
    static async findByIdWithReviews(id) {
        const db = await connectDB();
        try {
            const gameData = await getQuery(db, `
                SELECT * FROM games WHERE id = ? AND ativo = 1
            `, [id]);

            if (!gameData) return null;

            const game = new Game(gameData);

            // Buscar reviews do jogo
            const reviews = await allQuery(db, `
                SELECT r.*, u.nome as usuario_nome, u.avatar_url as usuario_avatar
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.game_id = ?
                ORDER BY r.data_criacao DESC
            `, [id]);

            game.reviews = reviews;
            
            return game;
        } finally {
            db.close();
        }
    }

    // Listar jogos com filtros e paginação
    static async list(options = {}) {
        const {
            limite = 20,
            pagina = 1,
            busca = '',
            categoria = '',
            preco_min = null,
            preco_max = null,
            tags = [],
            ordenacao = 'nome'
        } = options;

        const offset = (pagina - 1) * limite;
        const db = await connectDB();
        
        try {
            let whereConditions = ['ativo = 1'];
            let params = [];

            // Filtro de busca
            if (busca) {
                whereConditions.push('(nome LIKE ? OR desenvolvedor LIKE ? OR descricao LIKE ?)');
                params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
            }

            // Filtro de categoria
            if (categoria) {
                whereConditions.push('categoria = ?');
                params.push(categoria);
            }

            // Filtro de preço mínimo
            if (preco_min !== null) {
                whereConditions.push('preco >= ?');
                params.push(preco_min);
            }

            // Filtro de preço máximo
            if (preco_max !== null) {
                whereConditions.push('preco <= ?');
                params.push(preco_max);
            }

            // Filtro de tags
            if (tags.length > 0) {
                const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
                whereConditions.push(`(${tagConditions})`);
                tags.forEach(tag => params.push(`%"${tag}"%`));
            }

            // Ordenação
            let orderBy = 'nome ASC';
            switch (ordenacao) {
                case 'preco_asc':
                    orderBy = 'preco ASC';
                    break;
                case 'preco_desc':
                    orderBy = 'preco DESC';
                    break;
                case 'avaliacao':
                    orderBy = 'avaliacao_media DESC';
                    break;
                case 'lancamento':
                    orderBy = 'data_lancamento DESC';
                    break;
                case 'nome':
                default:
                    orderBy = 'nome ASC';
                    break;
            }

            const whereClause = whereConditions.join(' AND ');
            
            // Buscar jogos
            const games = await allQuery(db, `
                SELECT * FROM games 
                WHERE ${whereClause}
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?
            `, [...params, limite, offset]);

            // Contar total
            const totalResult = await getQuery(db, `
                SELECT COUNT(*) as total FROM games WHERE ${whereClause}
            `, params);

            const gameInstances = games.map(game => new Game(game));

            return {
                jogos: gameInstances,
                meta: {
                    total: totalResult.total,
                    pagina: pagina,
                    limite: limite,
                    total_paginas: Math.ceil(totalResult.total / limite)
                }
            };
        } finally {
            db.close();
        }
    }

    // Buscar categorias disponíveis
    static async getCategories() {
        const db = await connectDB();
        try {
            const categories = await allQuery(db, `
                SELECT DISTINCT categoria FROM games WHERE ativo = 1 ORDER BY categoria
            `);
            
            return categories.map(c => c.categoria);
        } finally {
            db.close();
        }
    }

    // Buscar tags disponíveis
    static async getTags() {
        const db = await connectDB();
        try {
            const games = await allQuery(db, `
                SELECT tags FROM games WHERE ativo = 1 AND tags IS NOT NULL
            `);
            
            const allTags = new Set();
            games.forEach(game => {
                if (game.tags) {
                    try {
                        const tags = JSON.parse(game.tags);
                        tags.forEach(tag => allTags.add(tag));
                    } catch (e) {
                        // Ignorar tags malformadas
                    }
                }
            });
            
            return Array.from(allTags).sort();
        } finally {
            db.close();
        }
    }

    // Atualizar jogo
    async update(updateData) {
        const db = await connectDB();
        try {
            const fields = [];
            const values = [];

            const allowedFields = [
                'nome', 'desenvolvedor', 'categoria', 'preco', 'descricao', 
                'imagem_url', 'data_lancamento', 'requisitos_minimos', 'requisitos_recomendados'
            ];

            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(updateData[field]);
                    this[field] = updateData[field];
                }
            });

            // Campos especiais que precisam de JSON.stringify
            if (updateData.plataformas !== undefined) {
                fields.push('plataformas = ?');
                values.push(JSON.stringify(updateData.plataformas));
                this.plataformas = updateData.plataformas;
            }

            if (updateData.tags !== undefined) {
                fields.push('tags = ?');
                values.push(JSON.stringify(updateData.tags));
                this.tags = updateData.tags;
            }

            if (fields.length > 0) {
                fields.push('data_atualizacao = CURRENT_TIMESTAMP');
                values.push(this.id);
                
                await runQuery(db, `
                    UPDATE games SET ${fields.join(', ')} WHERE id = ?
                `, values);
            }

            return true;
        } finally {
            db.close();
        }
    }

    // Atualizar avaliação média
    async updateRating() {
        const db = await connectDB();
        try {
            const result = await getQuery(db, `
                SELECT 
                    AVG(CAST(estrelas AS REAL)) as media,
                    COUNT(*) as total
                FROM reviews 
                WHERE game_id = ?
            `, [this.id]);

            const avaliacao_media = result.media ? parseFloat(result.media.toFixed(1)) : 0;
            const total_reviews = result.total || 0;

            await runQuery(db, `
                UPDATE games 
                SET avaliacao_media = ?, total_reviews = ?, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [avaliacao_media, total_reviews, this.id]);

            this.avaliacao_media = avaliacao_media;
            this.total_reviews = total_reviews;

            return true;
        } finally {
            db.close();
        }
    }

    // Desativar jogo (soft delete)
    async deactivate() {
        const db = await connectDB();
        try {
            await runQuery(db, `
                UPDATE games SET ativo = 0, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [this.id]);

            this.ativo = 0;
            return true;
        } finally {
            db.close();
        }
    }

    // Buscar jogos similares
    async getSimilarGames(limit = 5) {
        const db = await connectDB();
        try {
            const similarGames = await allQuery(db, `
                SELECT * FROM games 
                WHERE categoria = ? AND id != ? AND ativo = 1
                ORDER BY avaliacao_media DESC
                LIMIT ?
            `, [this.categoria, this.id, limit]);

            return similarGames.map(game => new Game(game));
        } finally {
            db.close();
        }
    }

    // Verificar se nome já existe
    static async nameExists(nome, excludeId = null) {
        const db = await connectDB();
        try {
            let query = 'SELECT id FROM games WHERE nome = ? AND ativo = 1';
            let params = [nome];
            
            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }
            
            const result = await getQuery(db, query, params);
            return !!result;
        } finally {
            db.close();
        }
    }

    // Converter para objeto JSON
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            desenvolvedor: this.desenvolvedor,
            categoria: this.categoria,
            preco: this.preco,
            descricao: this.descricao,
            imagem_url: this.imagem_url,
            avaliacao_media: this.avaliacao_media,
            total_reviews: this.total_reviews,
            data_lancamento: this.data_lancamento,
            plataformas: this.plataformas,
            requisitos_minimos: this.requisitos_minimos,
            requisitos_recomendados: this.requisitos_recomendados,
            tags: this.tags,
            data_criacao: this.data_criacao,
            data_atualizacao: this.data_atualizacao
        };
    }
}

module.exports = Game;