const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Game = require('../models/Game');
const { 
    authenticateToken, 
    canReview,
    requireReviewOwnership 
} = require('../middleware/auth');
const { 
    validateReviewCreation,
    validateReviewUpdate,
    validateIdParam,
    validateReviewListQuery
} = require('../middleware/validation');

// GET /api/reviews - Listar reviews com filtros e paginação
router.get('/', validateReviewListQuery, async (req, res) => {
    try {
        const options = {
            limite: parseInt(req.query.limite) || 20,
            pagina: parseInt(req.query.pagina) || 1,
            user_id: req.query.user_id ? parseInt(req.query.user_id) : null,
            game_id: req.query.game_id ? parseInt(req.query.game_id) : null,
            estrelas_min: req.query.estrelas_min ? parseInt(req.query.estrelas_min) : null,
            ordenacao: req.query.ordenacao || 'recente'
        };

        const result = await Review.list(options);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao listar reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/reviews/:id - Obter detalhes de uma review específica
router.get('/:id', validateIdParam, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review não encontrada'
            });
        }

        res.json({
            success: true,
            data: {
                review: review.toJSON()
            }
        });
    } catch (error) {
        console.error('Erro ao buscar review:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// POST /api/reviews - Criar nova review
router.post('/', authenticateToken, validateReviewCreation, canReview, async (req, res) => {
    try {
        const { game_id, estrelas, comentario } = req.body;

        const game = await Game.findById(game_id);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }

        const review = await Review.create({
            user_id: req.user.id,
            game_id,
            estrelas,
            comentario
        });

        res.status(201).json({
            success: true,
            message: 'Review criada com sucesso',
            data: {
                review: review.toJSON()
            }
        });
    } catch (error) {
        if (error.message === 'Usuário já fez review deste jogo') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        console.error('Erro ao criar review:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// PUT /api/reviews/:id - Atualizar review
router.put('/:id', validateIdParam, authenticateToken, requireReviewOwnership, validateReviewUpdate, async (req, res) => {
    try {
        const review = req.review;

        await review.update(req.body);

        const updatedReview = await Review.findById(review.id);

        res.json({
            success: true,
            message: 'Review atualizada com sucesso',
            data: {
                review: updatedReview.toJSON()
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar review:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// DELETE /api/reviews/:id - Deletar review
router.delete('/:id', validateIdParam, authenticateToken, requireReviewOwnership, async (req, res) => {
    try {
        const review = req.review;

        await review.delete();

        res.json({
            success: true,
            message: 'Review deletada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar review:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// POST /api/reviews/:id/like - Curtir review
router.post('/:id/like', validateIdParam, authenticateToken, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review não encontrada'
            });
        }

        if (review.user_id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Você não pode curtir sua própria review'
            });
        }

        await review.addLike();

        res.json({
            success: true,
            message: 'Review curtida com sucesso',
            data: {
                curtidas: review.curtidas
            }
        });
    } catch (error) {
        console.error('Erro ao curtir review:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// DELETE /api/reviews/:id/like - Descurtir review
router.delete('/:id/like', validateIdParam, authenticateToken, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review não encontrada'
            });
        }

        if (review.user_id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Você não pode descurtir sua própria review'
            });
        }

        await review.removeLike();

        res.json({
            success: true,
            message: 'Curtida removida com sucesso',
            data: {
                curtidas: review.curtidas
            }
        });
    } catch (error) {
        console.error('Erro ao descurtir review:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/reviews/user/:userId - Obter reviews de um usuário específico
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const limite = parseInt(req.query.limite) || 20;
        const pagina = parseInt(req.query.pagina) || 1;
        const ordenacao = req.query.ordenacao || 'recente';

        const result = await Review.list({
            limite,
            pagina,
            user_id: userId,
            ordenacao
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Erro ao buscar reviews do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/reviews/game/:gameId - Obter reviews de um jogo específico
router.get('/game/:gameId', async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const limite = parseInt(req.query.limite) || 20;
        const pagina = parseInt(req.query.pagina) || 1;
        const estrelas_min = req.query.estrelas_min ? parseInt(req.query.estrelas_min) : null;
        const ordenacao = req.query.ordenacao || 'recente';

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

// GET /api/reviews/stats/user/:userId - Estatísticas de reviews do usuário
router.get('/stats/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const stats = await Review.getUserStats(userId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/reviews/stats/game/:gameId - Estatísticas de reviews do jogo
router.get('/stats/game/:gameId', async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
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

// GET /api/reviews/check/:gameId - Verificar se usuário pode fazer review
router.get('/check/:gameId', authenticateToken, async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        const userId = req.user.id;

        const canReview = await Review.canUserReview(userId, gameId);

        res.json({
            success: true,
            data: {
                can_review: canReview,
                message: canReview ? 'Usuário pode fazer review' : 'Usuário já fez review deste jogo'
            }
        });
    } catch (error) {
        console.error('Erro ao verificar permissão de review:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;