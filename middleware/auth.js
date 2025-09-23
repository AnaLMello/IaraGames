const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso requerido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        next();
    }
};

// Middleware para verificar se é o próprio usuário ou admin
const requireOwnershipOrAdmin = (req, res, next) => {
    const targetUserId = parseInt(req.params.userId || req.params.id);
    const currentUserId = req.user.id;

    if (currentUserId !== targetUserId && !req.user.is_admin) {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado: você só pode acessar seus próprios dados'
        });
    }

    next();
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado: privilégios de administrador requeridos'
        });
    }

    next();
};

// Middleware para verificar se o usuário pode fazer review
const canReview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const gameId = parseInt(req.params.gameId || req.body.game_id);

        if (!gameId) {
            return res.status(400).json({
                success: false,
                message: 'ID do jogo é obrigatório'
            });
        }

        const Review = require('../models/Review');
        const canReview = await Review.canUserReview(userId, gameId);

        if (!canReview) {
            return res.status(409).json({
                success: false,
                message: 'Você já fez uma review para este jogo'
            });
        }

        next();
    } catch (error) {
        console.error('Erro ao verificar permissão de review:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Middleware para verificar se o usuário é dono da review
const requireReviewOwnership = async (req, res, next) => {
    try {
        const reviewId = parseInt(req.params.id || req.params.reviewId);
        const userId = req.user.id;

        const Review = require('../models/Review');
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review não encontrada'
            });
        }

        if (review.user_id !== userId && !req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado: você só pode modificar suas próprias reviews'
            });
        }

        req.review = review;
        next();
    } catch (error) {
        console.error('Erro ao verificar propriedade da review:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

// Rate limiting por usuário
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        const userId = req.user ? req.user.id : req.ip;
        const now = Date.now();
        
        if (!userRequests.has(userId)) {
            userRequests.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const userLimit = userRequests.get(userId);
        
        if (now > userLimit.resetTime) {
            userRequests.set(userId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (userLimit.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Muitas requisições. Tente novamente em alguns minutos.'
            });
        }

        userLimit.count++;
        next();
    };
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireOwnershipOrAdmin,
    requireAdmin,
    canReview,
    requireReviewOwnership,
    userRateLimit
};