const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const DB_PATH = process.env.DB_PATH || './database/iaragames.db';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
function connectDB() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Erro ao conectar com o banco:', err);
                reject(err);
            } else {
                console.log('✅ Conectado ao banco SQLite');
                resolve(db);
            }
        });
    });
}
function runQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}
function getQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}
function allQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
async function createTables(db) {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            whatsapp TEXT,
            sobre TEXT,
            avatar_url TEXT,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            ativo BOOLEAN DEFAULT 1
        )`,
        `CREATE TABLE IF NOT EXISTS player_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            anos_experiencia TEXT DEFAULT 'Não informado',
            avaliacao REAL DEFAULT 0,
            total_reviews_recebidos INTEGER DEFAULT 0,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS player_expertise (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            expertise TEXT NOT NULL,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            UNIQUE(user_id, expertise)
        )`,
        `CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            desenvolvedor TEXT NOT NULL,
            categoria TEXT NOT NULL,
            preco REAL NOT NULL,
            descricao TEXT,
            imagem_url TEXT,
            avaliacao_media REAL DEFAULT 0,
            total_reviews INTEGER DEFAULT 0,
            data_lancamento DATE,
            plataformas TEXT, -- JSON array como string
            requisitos_minimos TEXT,
            requisitos_recomendados TEXT,
            tags TEXT, -- JSON array como string
            ativo BOOLEAN DEFAULT 1,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            game_id INTEGER NOT NULL,
            estrelas INTEGER NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
            comentario TEXT,
            curtidas INTEGER DEFAULT 0,
            util BOOLEAN DEFAULT 1,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE,
            UNIQUE(user_id, game_id)
        )`,
        `CREATE TABLE IF NOT EXISTS auth_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            revoked BOOLEAN DEFAULT 0,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            expires_at DATETIME NOT NULL,
            ativo BOOLEAN DEFAULT 1,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`
    ];
    for (const table of tables) {
        await runQuery(db, table);
    }
    console.log('✅ Tabelas criadas com sucesso');
}
async function createIndexes(db) {
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews(game_id)',
        'CREATE INDEX IF NOT EXISTS idx_games_categoria ON games(categoria)',
        'CREATE INDEX IF NOT EXISTS idx_games_ativo ON games(ativo)',
        'CREATE INDEX IF NOT EXISTS idx_player_details_user_id ON player_details(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_player_expertise_user_id ON player_expertise(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)'
    ];
    for (const index of indexes) {
        await runQuery(db, index);
    }
    console.log('✅ Índices criados com sucesso');
}
async function insertInitialData(db) {
    const userCount = await getQuery(db, 'SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
        console.log('📊 Dados iniciais já existem, pulando inserção');
        return;
    }
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('123456', 10);
    const userId = await runQuery(db, `
        INSERT INTO users (nome, email, senha_hash, whatsapp, sobre)
        VALUES (?, ?, ?, ?, ?)
    `, [
        'Ana Silva',
        'ana.silva@email.com',
        defaultPassword,
        '+55 11 99999-1234',
        'Apaixonada por jogos indie e narrativas envolventes.'
    ]);
    await runQuery(db, `
        INSERT INTO player_details (user_id, anos_experiencia, avaliacao)
        VALUES (?, ?, ?)
    `, [userId.id, '5 anos jogando', 5.0]);
    const expertises = ['RPG', 'Indie', 'Aventura', 'Narrativa'];
    for (const expertise of expertises) {
        await runQuery(db, `
            INSERT INTO player_expertise (user_id, expertise)
            VALUES (?, ?)
        `, [userId.id, expertise]);
    }
    const games = [
        {
            nome: 'Bacuri',
            desenvolvedor: 'Curupira Games',
            categoria: 'Aventura',
            preco: 29.99,
            descricao: 'Uma aventura amazônica única',
            data_lancamento: '2023-06-15',
            plataformas: JSON.stringify(['PC', 'Nintendo Switch']),
            tags: JSON.stringify(['indie', 'aventura', 'brasileiro']),
            avaliacao_media: 4.8
        },
        {
            nome: 'UNSIGHTED',
            desenvolvedor: 'Studio Pixel Punk',
            categoria: 'Action RPG',
            preco: 39.99,
            descricao: 'RPG de ação isométrico com mecânicas únicas',
            data_lancamento: '2021-09-30',
            plataformas: JSON.stringify(['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']),
            tags: JSON.stringify(['rpg', 'ação', 'indie']),
            avaliacao_media: 4.9
        },
        {
            nome: 'Pocket Bravery',
            desenvolvedor: 'Statera Studio',
            categoria: 'Luta',
            preco: 24.99,
            descricao: 'Jogo de luta 2D com personagens únicos',
            data_lancamento: '2022-11-20',
            plataformas: JSON.stringify(['PC', 'PlayStation', 'Xbox']),
            tags: JSON.stringify(['luta', '2d', 'competitivo']),
            avaliacao_media: 4.6
        }
    ];
    const gameIds = [];
    for (const game of games) {
        const result = await runQuery(db, `
            INSERT INTO games (nome, desenvolvedor, categoria, preco, descricao, data_lancamento, plataformas, tags, avaliacao_media)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            game.nome, game.desenvolvedor, game.categoria, game.preco,
            game.descricao, game.data_lancamento, game.plataformas, game.tags, game.avaliacao_media
        ]);
        gameIds.push(result.id);
    }
    await runQuery(db, `
        INSERT INTO reviews (user_id, game_id, estrelas, comentario)
        VALUES (?, ?, ?, ?)
    `, [
        userId.id,
        gameIds[0], // Bacuri
        5,
        'Incrível representação da cultura brasileira! A trilha sonora é fantástica e a história muito envolvente.'
    ]);
    console.log('✅ Dados iniciais inseridos com sucesso');
}
async function initializeDatabase() {
    let db;
    try {
        db = await connectDB();
        await createTables(db);
        await createIndexes(db);
        await insertInitialData(db);
        console.log('🎉 Banco de dados inicializado completamente!');
        return db;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        throw error;
    } finally {
        if (db) {
            db.close();
        }
    }
}
module.exports = {
    initializeDatabase,
    connectDB,
    runQuery,
    getQuery,
    allQuery
};
