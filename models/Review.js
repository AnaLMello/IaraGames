const { connectDB, runQuery, getQuery, allQuery } = require('../database/init');

class Review {
    constructor(data = {}) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.game_id = data.game_id;
        this.estrelas = data.estrelas;
        this.comentario = data.comentario;
        this.curtidas = data.curtidas;
        this.util = data.util;
        this.data_criacao = data.data_criacao;
        this.data_atualizacao = data.data_atualizacao;
        
        // Dados relacionados (quando incluídos)
        this.usuario_nome = data.usuario_nome;
        this.usuario_avatar = data.usuario_avatar;
        this.jogo_nome = data.jogo_nome;
        this.jogo_imagem = data.jogo_imagem;
    }

    // Criar nova review
    static async create(reviewData) {
        const db = await connectDB();
        try {
            // Verificar se o usuário já fez review deste jogo
            const existingReview = await getQuery(db, `
                SELECT id FROM reviews WHERE user_id = ? AND game_id = ?
            `, [reviewData.user_id, reviewData.game_id]);

            if (existingReview) {
                throw new Error('Usuário já fez review deste jogo');
            }

            const result = await runQuery(db, `
                INSERT INTO reviews (user_id, game_id, estrelas, comentario)
                VALUES (?, ?, ?, ?)
            `, [
                reviewData.user_id,
                reviewData.game_id,
                reviewData.estrelas,
                reviewData.comentario || null
            ]);

            // Atualizar avaliação média do jogo
            const Game = require('./Game');
            const game = await Game.findById(reviewData.game_id);
            if (game) {
                await game.updateRating();
            }

            return await Review.findById(result.id);
        } finally {
            db.close();
        }
    }

    // Buscar review por ID
    static async findById(id) {
        const db = await connectDB();
        try {
            const reviewData = await getQuery(db, `
                SELECT r.*, u.nome as usuario_nome, u.avatar_url as usuario_avatar,
                       g.nome as jogo_nome, g.imagem_url as jogo_imagem
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN games g ON r.game_id = g.id
                WHERE r.id = ?
            `, [id]);

            if (!reviewData) return null;
            
            return new Review(reviewData);
        } finally {
            db.close();
        }
    }

    // Buscar review por usuário e jogo
    static async findByUserAndGame(userId, gameId) {
        const db = await connectDB();
        try {
            const reviewData = await getQuery(db, `
                SELECT r.*, u.nome as usuario_nome, u.avatar_url as usuario_avatar,
                       g.nome as jogo_nome, g.imagem_url as jogo_imagem
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN games g ON r.game_id = g.id
                WHERE r.user_id = ? AND r.game_id = ?
            `, [userId, gameId]);

            if (!reviewData) return null;
            
            return new Review(reviewData);
        } finally {
            db.close();
        }
    }

    // Listar reviews com filtros e paginação
    static async list(options = {}) {
        const {
            limite = 20,
            pagina = 1,
            user_id = null,
            game_id = null,
            estrelas_min = null,
            ordenacao = 'recente'
        } = options;

        const offset = (pagina - 1) * limite;
        const db = await connectDB();
        
        try {
            let whereConditions = ['1=1'];
            let params = [];

            // Filtro por usuário
            if (user_id) {
                whereConditions.push('r.user_id = ?');
                params.push(user_id);
            }

            // Filtro por jogo
            if (game_id) {
                whereConditions.push('r.game_id = ?');
                params.push(game_id);
            }

            // Filtro por estrelas mínimas
            if (estrelas_min) {
                whereConditions.push('r.estrelas >= ?');
                params.push(estrelas_min);
            }

            // Ordenação
            let orderBy = 'r.data_criacao DESC';
            switch (ordenacao) {
                case 'estrelas_desc':
                    orderBy = 'r.estrelas DESC, r.data_criacao DESC';
                    break;
                case 'estrelas_asc':
                    orderBy = 'r.estrelas ASC, r.data_criacao DESC';
                    break;
                case 'curtidas':
                    orderBy = 'r.curtidas DESC, r.data_criacao DESC';
                    break;
                case 'recente':
                default:
                    orderBy = 'r.data_criacao DESC';
                    break;
            }

            const whereClause = whereConditions.join(' AND ');
            
            // Buscar reviews
            const reviews = await allQuery(db, `
                SELECT r.*, u.nome as usuario_nome, u.avatar_url as usuario_avatar,
                       g.nome as jogo_nome, g.imagem_url as jogo_imagem
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN games g ON r.game_id = g.id
                WHERE ${whereClause}
                ORDER BY ${orderBy}
                LIMIT ? OFFSET ?
            `, [...params, limite, offset]);

            // Contar total
            const totalResult = await getQuery(db, `
                SELECT COUNT(*) as total 
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                JOIN games g ON r.game_id = g.id
                WHERE ${whereClause}
            `, params);

            const reviewInstances = reviews.map(review => new Review(review));

            return {
                reviews: reviewInstances,
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

    // Atualizar review
    async update(updateData) {
        const db = await connectDB();
        try {
            const fields = [];
            const values = [];

            if (updateData.estrelas !== undefined) {
                fields.push('estrelas = ?');
                values.push(updateData.estrelas);
                this.estrelas = updateData.estrelas;
            }

            if (updateData.comentario !== undefined) {
                fields.push('comentario = ?');
                values.push(updateData.comentario);
                this.comentario = updateData.comentario;
            }

            if (updateData.util !== undefined) {
                fields.push('util = ?');
                values.push(updateData.util);
                this.util = updateData.util;
            }

            if (fields.length > 0) {
                fields.push('data_atualizacao = CURRENT_TIMESTAMP');
                values.push(this.id);
                
                await runQuery(db, `
                    UPDATE reviews SET ${fields.join(', ')} WHERE id = ?
                `, values);

                // Atualizar avaliação média do jogo se as estrelas mudaram
                if (updateData.estrelas !== undefined) {
                    const Game = require('./Game');
                    const game = await Game.findById(this.game_id);
                    if (game) {
                        await game.updateRating();
                    }
                }
            }

            return true;
        } finally {
            db.close();
        }
    }

    // Deletar review
    async delete() {
        const db = await connectDB();
        try {
            await runQuery(db, `DELETE FROM reviews WHERE id = ?`, [this.id]);

            // Atualizar avaliação média do jogo
            const Game = require('./Game');
            const game = await Game.findById(this.game_id);
            if (game) {
                await game.updateRating();
            }

            return true;
        } finally {
            db.close();
        }
    }

    // Adicionar curtida
    async addLike() {
        const db = await connectDB();
        try {
            await runQuery(db, `
                UPDATE reviews SET curtidas = curtidas + 1, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [this.id]);

            this.curtidas = (this.curtidas || 0) + 1;
            return true;
        } finally {
            db.close();
        }
    }

    // Remover curtida
    async removeLike() {
        const db = await connectDB();
        try {
            await runQuery(db, `
                UPDATE reviews SET curtidas = CASE 
                    WHEN curtidas > 0 THEN curtidas - 1 
                    ELSE 0 
                END, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [this.id]);

            this.curtidas = Math.max((this.curtidas || 0) - 1, 0);
            return true;
        } finally {
            db.close();
        }
    }

    // Buscar estatísticas de reviews por jogo
    static async getGameStats(gameId) {
        const db = await connectDB();
        try {
            const stats = await getQuery(db, `
                SELECT 
                    COUNT(*) as total_reviews,
                    AVG(CAST(estrelas AS REAL)) as avaliacao_media,
                    COUNT(CASE WHEN estrelas = 5 THEN 1 END) as estrelas_5,
                    COUNT(CASE WHEN estrelas = 4 THEN 1 END) as estrelas_4,
                    COUNT(CASE WHEN estrelas = 3 THEN 1 END) as estrelas_3,
                    COUNT(CASE WHEN estrelas = 2 THEN 1 END) as estrelas_2,
                    COUNT(CASE WHEN estrelas = 1 THEN 1 END) as estrelas_1
                FROM reviews 
                WHERE game_id = ?
            `, [gameId]);

            return {
                total_reviews: stats.total_reviews || 0,
                avaliacao_media: stats.avaliacao_media ? parseFloat(stats.avaliacao_media.toFixed(1)) : 0,
                distribuicao_estrelas: {
                    5: stats.estrelas_5 || 0,
                    4: stats.estrelas_4 || 0,
                    3: stats.estrelas_3 || 0,
                    2: stats.estrelas_2 || 0,
                    1: stats.estrelas_1 || 0
                }
            };
        } finally {
            db.close();
        }
    }

    // Buscar estatísticas de reviews por usuário
    static async getUserStats(userId) {
        const db = await connectDB();
        try {
            const stats = await getQuery(db, `
                SELECT 
                    COUNT(*) as total_reviews,
                    AVG(CAST(estrelas AS REAL)) as avaliacao_media,
                    SUM(curtidas) as total_curtidas
                FROM reviews 
                WHERE user_id = ?
            `, [userId]);

            return {
                total_reviews: stats.total_reviews || 0,
                avaliacao_media: stats.avaliacao_media ? parseFloat(stats.avaliacao_media.toFixed(1)) : 0,
                total_curtidas: stats.total_curtidas || 0
            };
        } finally {
            db.close();
        }
    }

    // Verificar se usuário pode fazer review (não fez ainda)
    static async canUserReview(userId, gameId) {
        const db = await connectDB();
        try {
            const existing = await getQuery(db, `
                SELECT id FROM reviews WHERE user_id = ? AND game_id = ?
            `, [userId, gameId]);

            return !existing;
        } finally {
            db.close();
        }
    }

    // Converter para objeto JSON
    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            game_id: this.game_id,
            estrelas: this.estrelas,
            comentario: this.comentario,
            curtidas: this.curtidas,
            util: this.util,
            data_criacao: this.data_criacao,
            data_atualizacao: this.data_atualizacao,
            usuario_nome: this.usuario_nome,
            usuario_avatar: this.usuario_avatar,
            jogo_nome: this.jogo_nome,
            jogo_imagem: this.jogo_imagem
        };
    }
}

module.exports = Review;