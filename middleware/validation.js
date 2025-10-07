const { body, param, query, validationResult } = require('express-validator');
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};
const validateUserRegistration = [
    body('nome')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ser válido'),
    body('senha')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('whatsapp')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('WhatsApp deve conter apenas números, espaços e símbolos válidos'),
    body('sobre')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Sobre deve ter no máximo 500 caracteres'),
    body('expertise')
        .optional()
        .isArray()
        .withMessage('Expertise deve ser um array'),
    body('expertise.*')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Cada expertise deve ter entre 1 e 50 caracteres'),
    handleValidationErrors
];
const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ser válido'),
    body('senha')
        .notEmpty()
        .withMessage('Senha é obrigatória'),
    handleValidationErrors
];
const validateUserUpdate = [
    body('nome')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('whatsapp')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('WhatsApp deve conter apenas números, espaços e símbolos válidos'),
    body('sobre')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Sobre deve ter no máximo 500 caracteres'),
    body('expertise')
        .optional()
        .isArray()
        .withMessage('Expertise deve ser um array'),
    body('expertise.*')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Cada expertise deve ter entre 1 e 50 caracteres'),
    handleValidationErrors
];
const validatePasswordChange = [
    body('senha_atual')
        .notEmpty()
        .withMessage('Senha atual é obrigatória'),
    body('senha_nova')
        .isLength({ min: 6 })
        .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
    handleValidationErrors
];
const validateGameCreation = [
    body('nome')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Nome do jogo deve ter entre 1 e 200 caracteres'),
    body('desenvolvedor')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Desenvolvedor deve ter entre 1 e 100 caracteres'),
    body('categoria')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Categoria deve ter entre 1 e 50 caracteres'),
    body('preco')
        .isFloat({ min: 0 })
        .withMessage('Preço deve ser um número positivo'),
    body('descricao')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    body('data_lancamento')
        .optional()
        .isISO8601()
        .withMessage('Data de lançamento deve estar no formato ISO 8601'),
    body('plataformas')
        .optional()
        .isArray()
        .withMessage('Plataformas deve ser um array'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags deve ser um array'),
    handleValidationErrors
];
const validateGameUpdate = [
    body('nome')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Nome do jogo deve ter entre 1 e 200 caracteres'),
    body('desenvolvedor')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Desenvolvedor deve ter entre 1 e 100 caracteres'),
    body('categoria')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Categoria deve ter entre 1 e 50 caracteres'),
    body('preco')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Preço deve ser um número positivo'),
    body('descricao')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Descrição deve ter no máximo 1000 caracteres'),
    body('data_lancamento')
        .optional()
        .isISO8601()
        .withMessage('Data de lançamento deve estar no formato ISO 8601'),
    body('plataformas')
        .optional()
        .isArray()
        .withMessage('Plataformas deve ser um array'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags deve ser um array'),
    handleValidationErrors
];
const validateReviewCreation = [
    body('game_id')
        .isInt({ min: 1 })
        .withMessage('ID do jogo deve ser um número inteiro positivo'),
    body('estrelas')
        .isInt({ min: 1, max: 5 })
        .withMessage('Estrelas deve ser um número entre 1 e 5'),
    body('comentario')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Comentário deve ter no máximo 1000 caracteres'),
    handleValidationErrors
];
const validateReviewUpdate = [
    body('estrelas')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Estrelas deve ser um número entre 1 e 5'),
    body('comentario')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Comentário deve ter no máximo 1000 caracteres'),
    body('util')
        .optional()
        .isBoolean()
        .withMessage('Util deve ser um valor booleano'),
    handleValidationErrors
];
const validateIdParam = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID deve ser um número inteiro positivo'),
    handleValidationErrors
];
const validateGameIdParam = [
    param('gameId')
        .isInt({ min: 1 })
        .withMessage('ID do jogo deve ser um número inteiro positivo'),
    handleValidationErrors
];
const validateUserIdParam = [
    param('userId')
        .isInt({ min: 1 })
        .withMessage('ID do usuário deve ser um número inteiro positivo'),
    handleValidationErrors
];
const validatePaginationQuery = [
    query('limite')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve ser um número entre 1 e 100'),
    query('pagina')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número positivo'),
    handleValidationErrors
];
const validateGameListQuery = [
    query('limite')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve ser um número entre 1 e 100'),
    query('pagina')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número positivo'),
    query('busca')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Busca deve ter no máximo 200 caracteres'),
    query('categoria')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Categoria deve ter no máximo 50 caracteres'),
    query('preco_min')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Preço mínimo deve ser um número positivo'),
    query('preco_max')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Preço máximo deve ser um número positivo'),
    query('ordenacao')
        .optional()
        .isIn(['nome', 'preco_asc', 'preco_desc', 'avaliacao', 'lancamento'])
        .withMessage('Ordenação deve ser: nome, preco_asc, preco_desc, avaliacao ou lancamento'),
    handleValidationErrors
];
const validateReviewListQuery = [
    query('limite')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve ser um número entre 1 e 100'),
    query('pagina')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número positivo'),
    query('estrelas_min')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Estrelas mínimas deve ser um número entre 1 e 5'),
    query('ordenacao')
        .optional()
        .isIn(['recente', 'estrelas_desc', 'estrelas_asc', 'curtidas'])
        .withMessage('Ordenação deve ser: recente, estrelas_desc, estrelas_asc ou curtidas'),
    handleValidationErrors
];
module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdate,
    validatePasswordChange,
    validateGameCreation,
    validateGameUpdate,
    validateReviewCreation,
    validateReviewUpdate,
    validateIdParam,
    validateGameIdParam,
    validateUserIdParam,
    validatePaginationQuery,
    validateGameListQuery,
    validateReviewListQuery
};
