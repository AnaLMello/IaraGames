const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Review = require('../models/Review');
const { 
    authenticateToken, 
    optionalAuth,
    requireAdmin 
} = require('../middleware/auth');
const { 
    validateGameCreation,
    validateGameUpdate,
    validateIdParam,
    validateGameListQuery
} = require('../middleware/validation');
router.get('/', validateGameListQuery, async (req, res) => {
    try {
        const options = {
            limite: parseInt(req.query.limite) || 20,
            pagina: parseInt(req.query.pagina) || 1,
            busca: req.query.busca || '',
            categoria: req.query.categoria || '',
            preco_min: req.query.preco_min ? parseFloat(req.query.preco_min) : null,
            preco_max: req.query.preco_max ? parseFloat(req.query.preco_max) : null,
            tags: req.query.tags ? (Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]) : [],
            ordenacao: req.query.ordenacao || 'nome'
        };
        const result = await Game.list(options);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao listar jogos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/categories', async (req, res) => {
    try {
        const categories = await Game.getCategories();
        res.json({
            success: true,
            data: {
                categories
            }
        });
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/tags', async (req, res) => {
    try {
        const tags = await Game.getTags();
        res.json({
            success: true,
            data: {
                tags
            }
        });
    } catch (error) {
        console.error('Erro ao buscar tags:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:id', validateIdParam, optionalAuth, async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const game = await Game.findByIdWithReviews(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }
        const reviewStats = await Review.getGameStats(gameId);
        const similarGames = await game.getSimilarGames(5);
        let userReview = null;
        if (req.user) {
            userReview = await Review.findByUserAndGame(req.user.id, gameId);
        }
        res.json({
            success: true,
            data: {
                jogo: game.toJSON(),
                reviews: game.reviews,
                estatisticas: reviewStats,
                jogos_similares: similarGames.map(g => g.toJSON()),
                user_review: userReview ? userReview.toJSON() : null
            }
        });
    } catch (error) {
        console.error('Erro ao buscar jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/', authenticateToken, requireAdmin, validateGameCreation, async (req, res) => {
    try {
        const nameExists = await Game.nameExists(req.body.nome);
        if (nameExists) {
            return res.status(409).json({
                success: false,
                message: 'Já existe um jogo com este nome'
            });
        }
        const game = await Game.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Jogo criado com sucesso',
            data: {
                jogo: game.toJSON()
            }
        });
    } catch (error) {
        console.error('Erro ao criar jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.put('/:id', validateIdParam, authenticateToken, requireAdmin, validateGameUpdate, async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }
        if (req.body.nome && req.body.nome !== game.nome) {
            const nameExists = await Game.nameExists(req.body.nome);
            if (nameExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Já existe um jogo com este nome'
                });
            }
        }
        await game.update(req.body);
        const updatedGame = await Game.findById(gameId);
        res.json({
            success: true,
            message: 'Jogo atualizado com sucesso',
            data: {
                jogo: updatedGame.toJSON()
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.delete('/:id', validateIdParam, authenticateToken, requireAdmin, async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }
        await game.delete();
        res.json({
            success: true,
            message: 'Jogo deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:id/reviews', validateIdParam, async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const limite = parseInt(req.query.limite) || 20;
        const pagina = parseInt(req.query.pagina) || 1;
        const estrelas_min = req.query.estrelas_min ? parseInt(req.query.estrelas_min) : null;
        const ordenacao = req.query.ordenacao || 'recente';
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }
        const result = await Review.list({
            limite,
            pagina,
            game_id: gameId,
            estrelas_min,
            ordenacao
        });
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao buscar reviews do jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:id/stats', validateIdParam, async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }
        const stats = await Review.getGameStats(gameId);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas do jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:id/similar', validateIdParam, async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);
        const limite = parseInt(req.query.limite) || 5;
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }
        const similarGames = await game.getSimilarGames(limite);
        res.json({
            success: true,
            data: {
                jogos_similares: similarGames.map(g => g.toJSON())
            }
        });
    } catch (error) {
        console.error('Erro ao buscar jogos similares:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
module.exports = router;
