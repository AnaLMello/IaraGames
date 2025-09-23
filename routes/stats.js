const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const Review = require('../models/Review');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/stats/general - Estatísticas gerais da plataforma
router.get('/general', async (req, res) => {
    try {
        // Contar totais
        const totalUsers = await User.count();
        const totalGames = await Game.count();
        const totalReviews = await Review.count();

        // Estatísticas de reviews
        const reviewStats = await Review.getGeneralStats();

        // Jogos mais bem avaliados
        const topRatedGames = await Game.getTopRated(5);

        // Usuários mais ativos (com mais reviews)
        const topReviewers = await User.getTopReviewers(5);

        res.json({
            success: true,
            data: {
                totals: {
                    users: totalUsers,
                    games: totalGames,
                    reviews: totalReviews
                },
                review_stats: reviewStats,
                top_rated_games: topRatedGames,
                top_reviewers: topReviewers
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas gerais:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/games - Estatísticas de jogos
router.get('/games', async (req, res) => {
    try {
        const gameStats = await Game.getStats();

        res.json({
            success: true,
            data: {
                stats: gameStats
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de jogos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/users - Estatísticas de usuários
router.get('/users', async (req, res) => {
    try {
        const userStats = await User.getStats();

        res.json({
            success: true,
            data: {
                stats: userStats
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/reviews - Estatísticas de reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviewStats = await Review.getDetailedStats();

        res.json({
            success: true,
            data: {
                stats: reviewStats
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/trending - Jogos em tendência
router.get('/trending', async (req, res) => {
    try {
        const period = req.query.period || '7d'; // 7d, 30d, 90d
        const limit = parseInt(req.query.limit) || 10;

        const trendingGames = await Game.getTrending(period, limit);

        res.json({
            success: true,
            data: {
                trending_games: trendingGames,
                period: period
            }
        });
    } catch (error) {
        console.error('Erro ao buscar jogos em tendência:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/categories - Estatísticas por categoria
router.get('/categories', async (req, res) => {
    try {
        const categoryStats = await Game.getCategoryStats();

        res.json({
            success: true,
            data: {
                category_stats: categoryStats
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas por categoria:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/admin - Estatísticas administrativas (apenas admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Estatísticas detalhadas para administradores
        const adminStats = {
            users: {
                total: await User.count(),
                active_last_30_days: await User.countActiveUsers(30),
                new_this_month: await User.countNewUsers(30),
                by_registration_date: await User.getRegistrationStats()
            },
            games: {
                total: await Game.count(),
                by_category: await Game.getCategoryStats(),
                by_rating: await Game.getRatingDistribution(),
                recently_added: await Game.getRecentlyAdded(10)
            },
            reviews: {
                total: await Review.count(),
                by_rating: await Review.getRatingDistribution(),
                recent_activity: await Review.getRecentActivity(20),
                most_reviewed_games: await Game.getMostReviewed(10)
            },
            system: {
                database_size: await getDatabaseSize(),
                uptime: process.uptime(),
                memory_usage: process.memoryUsage()
            }
        };

        res.json({
            success: true,
            data: adminStats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas administrativas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/user/:userId - Estatísticas de um usuário específico
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        // Verificar se o usuário existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const userStats = await User.getUserDetailedStats(userId);

        res.json({
            success: true,
            data: {
                user_stats: userStats
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET /api/stats/game/:gameId - Estatísticas de um jogo específico
router.get('/game/:gameId', async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId);
        
        // Verificar se o jogo existe
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Jogo não encontrado'
            });
        }

        const gameStats = await Game.getGameDetailedStats(gameId);

        res.json({
            success: true,
            data: {
                game_stats: gameStats
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas do jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Função auxiliar para obter tamanho do banco de dados
async function getDatabaseSize() {
    try {
        const fs = require('fs');
        const path = require('path');
        const dbPath = process.env.DATABASE_PATH || './database/iaragames.db';
        
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            return {
                size_bytes: stats.size,
                size_mb: (stats.size / (1024 * 1024)).toFixed(2)
            };
        }
        
        return { size_bytes: 0, size_mb: '0.00' };
    } catch (error) {
        console.error('Erro ao obter tamanho do banco:', error);
        return { size_bytes: 0, size_mb: '0.00' };
    }
}

module.exports = router;