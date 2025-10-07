const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
    authenticateToken, 
    requireOwnershipOrAdmin,
    optionalAuth 
} = require('../middleware/auth');
const { 
    validateUserUpdate,
    validateIdParam,
    validateUserIdParam,
    validatePaginationQuery
} = require('../middleware/validation');
router.get('/:id', validateIdParam, optionalAuth, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        const userData = user.toJSON();
        if (!req.user || req.user.id !== userId) {
            delete userData.email;
            delete userData.whatsapp;
        }
        res.json({
            success: true,
            data: {
                user: userData
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.put('/:id', validateIdParam, authenticateToken, requireOwnershipOrAdmin, validateUserUpdate, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.emailExists(req.body.email, userId);
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Email já está em uso'
                });
            }
        }
        await user.update(req.body);
        const updatedUser = await User.findById(userId);
        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso',
            data: {
                user: updatedUser.toJSON()
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:id/reviews', validateIdParam, validatePaginationQuery, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const limite = parseInt(req.query.limite) || 20;
        const pagina = parseInt(req.query.pagina) || 1;
        const offset = (pagina - 1) * limite;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        const reviews = await user.getReviews(limite, offset);
        const totalReviews = await user.getReviewsCount();
        res.json({
            success: true,
            data: {
                reviews,
                meta: {
                    total: totalReviews,
                    pagina: pagina,
                    limite: limite,
                    total_paginas: Math.ceil(totalReviews / limite)
                }
            }
        });
    } catch (error) {
        console.error('Erro ao buscar reviews do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:id/stats', validateIdParam, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        const Review = require('../models/Review');
        const stats = await Review.getUserStats(userId);
        res.json({
            success: true,
            data: {
                stats: {
                    ...stats,
                    anos_experiencia: user.anos_experiencia,
                    avaliacao_usuario: user.avaliacao,
                    total_reviews_recebidos: user.total_reviews_recebidos,
                    expertise: user.expertise
                }
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
router.get('/', validatePaginationQuery, async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 20;
        const pagina = parseInt(req.query.pagina) || 1;
        const busca = req.query.busca || '';
        const offset = (pagina - 1) * limite;
        const users = await User.list(limite, offset, busca);
        const totalResult = await User.list(1, 0, busca);
        const total = totalResult.length > 0 ? totalResult[0].total || users.length : 0;
        res.json({
            success: true,
            data: {
                users: users.map(user => {
                    const { email, whatsapp, ...publicData } = user;
                    return publicData;
                }),
                meta: {
                    total: total,
                    pagina: pagina,
                    limite: limite,
                    total_paginas: Math.ceil(total / limite)
                }
            }
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/:id/follow', validateIdParam, authenticateToken, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = req.user.id;
        if (targetUserId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Você não pode seguir a si mesmo'
            });
        }
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Funcionalidade de seguir usuários será implementada em breve'
        });
    } catch (error) {
        console.error('Erro ao seguir usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.delete('/:id/follow', validateIdParam, authenticateToken, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = req.user.id;
        if (targetUserId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Você não pode deixar de seguir a si mesmo'
            });
        }
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Funcionalidade de deixar de seguir usuários será implementada em breve'
        });
    } catch (error) {
        console.error('Erro ao deixar de seguir usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
module.exports = router;
