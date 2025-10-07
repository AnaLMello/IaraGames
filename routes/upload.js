const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadType = req.params.type;
        let uploadPath;
        switch (uploadType) {
            case 'avatar':
                uploadPath = path.join(__dirname, '../uploads/avatars');
                break;
            case 'game':
                uploadPath = path.join(__dirname, '../uploads/games');
                break;
            default:
                return cb(new Error('Tipo de upload inválido'));
        }
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'), false);
    }
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Apenas 1 arquivo por vez
    }
});
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado'
            });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Avatar enviado com sucesso',
            data: {
                avatar_url: avatarUrl,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Erro no upload de avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/game', authenticateToken, requireAdmin, upload.single('game_image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado'
            });
        }
        const imageUrl = `/uploads/games/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Imagem do jogo enviada com sucesso',
            data: {
                image_url: imageUrl,
                filename: req.file.filename,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Erro no upload de imagem do jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.delete('/avatar/:filename', authenticateToken, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../uploads/avatars', filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo não encontrado'
            });
        }
        fs.unlinkSync(filePath);
        res.json({
            success: true,
            message: 'Avatar deletado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar avatar:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.delete('/game/:filename', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../uploads/games', filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo não encontrado'
            });
        }
        fs.unlinkSync(filePath);
        res.json({
            success: true,
            message: 'Imagem do jogo deletada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar imagem do jogo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/info/:type/:filename', async (req, res) => {
    try {
        const { type, filename } = req.params;
        let filePath;
        switch (type) {
            case 'avatar':
                filePath = path.join(__dirname, '../uploads/avatars', filename);
                break;
            case 'game':
                filePath = path.join(__dirname, '../uploads/games', filename);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de arquivo inválido'
                });
        }
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo não encontrado'
            });
        }
        const stats = fs.statSync(filePath);
        res.json({
            success: true,
            data: {
                filename: filename,
                size: stats.size,
                created_at: stats.birthtime,
                modified_at: stats.mtime,
                url: `/uploads/${type}s/${filename}`
            }
        });
    } catch (error) {
        console.error('Erro ao obter informações do arquivo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Tamanho máximo: 5MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Muitos arquivos. Envie apenas 1 arquivo por vez'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Campo de arquivo inesperado'
            });
        }
    }
    if (error.message === 'Tipo de arquivo não permitido. Apenas imagens são aceitas.') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    if (error.message === 'Tipo de upload inválido') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    console.error('Erro no upload:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});
module.exports = router;
