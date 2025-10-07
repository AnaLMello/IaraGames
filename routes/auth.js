const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { 
    validateUserRegistration, 
    validateUserLogin,
    validatePasswordChange 
} = require('../middleware/validation');
router.post('/register', validateUserRegistration, async (req, res) => {
    try {
        const { nome, email, senha, whatsapp, sobre, expertise } = req.body;
        const emailExists = await User.emailExists(email);
        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: 'Email já está em uso'
            });
        }
        const user = await User.create({
            nome,
            email,
            senha,
            whatsapp,
            sobre,
            expertise
        });
        const token = user.generateToken();
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/login', validateUserLogin, async (req, res) => {
    try {
        const { email, senha } = req.body;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
        const isValidPassword = await user.verifyPassword(senha);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
        const token = user.generateToken();
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/me', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user.toJSON()
            }
        });
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/change-password', authenticateToken, validatePasswordChange, async (req, res) => {
    try {
        const { senha_atual, senha_nova } = req.body;
        const isValidPassword = await req.user.verifyPassword(senha_atual);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }
        await req.user.changePassword(senha_nova);
        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/verify-token', authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                user: req.user.toJSON()
            }
        });
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        await req.user.deactivate();
        res.json({
            success: true,
            message: 'Conta desativada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao desativar conta:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
module.exports = router;
