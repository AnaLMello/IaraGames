const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: {
        error: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
    }
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:8000', 'http://127.0.0.1:8000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const statsRoutes = require('./routes/stats');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'IaraGames API está funcionando!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            games: '/api/games',
            reviews: '/api/reviews',
            stats: '/api/stats',
            health: '/api/health'
        }
    });
});

// Middleware de tratamento de erros
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

app.use((error, req, res, next) => {
    console.error('Erro na API:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Dados inválidos',
            details: error.message
        });
    }
    
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }
    
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado'
        });
    }
    
    res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Erro interno do servidor' 
            : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
});

// Inicialização do servidor
const { initializeDatabase } = require('./database/init');

async function startServer() {
    try {
        await initializeDatabase();
        console.log('✅ Banco de dados inicializado com sucesso');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor IaraGames API rodando na porta ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de sinais de encerramento
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT, encerrando servidor...');
    process.exit(0);
});

startServer();

module.exports = app;