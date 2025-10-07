const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB, runQuery, getQuery, allQuery } = require('../database/init');
class User {
    constructor(data = {}) {
        this.id = data.id;
        this.nome = data.nome;
        this.email = data.email;
        this.senha_hash = data.senha_hash;
        this.whatsapp = data.whatsapp;
        this.sobre = data.sobre;
        this.avatar_url = data.avatar_url;
        this.data_criacao = data.data_criacao;
        this.data_atualizacao = data.data_atualizacao;
        this.ativo = data.ativo;
    }
    static async create(userData) {
        const db = await connectDB();
        try {
            const senha_hash = await bcrypt.hash(userData.senha, 10);
            const result = await runQuery(db, `
                INSERT INTO users (nome, email, senha_hash, whatsapp, sobre)
                VALUES (?, ?, ?, ?, ?)
            `, [
                userData.nome,
                userData.email,
                senha_hash,
                userData.whatsapp || null,
                userData.sobre || null
            ]);
            await runQuery(db, `
                INSERT INTO player_details (user_id, anos_experiencia)
                VALUES (?, ?)
            `, [result.id, userData.anos_experiencia || 'Não informado']);
            if (userData.expertise && Array.isArray(userData.expertise)) {
                for (const exp of userData.expertise) {
                    await runQuery(db, `
                        INSERT INTO player_expertise (user_id, expertise)
                        VALUES (?, ?)
                    `, [result.id, exp]);
                }
            }
            return await User.findById(result.id);
        } finally {
            db.close();
        }
    }
    static async findById(id) {
        const db = await connectDB();
        try {
            const userData = await getQuery(db, `
                SELECT u.*, pd.anos_experiencia, pd.avaliacao, pd.total_reviews_recebidos
                FROM users u
                LEFT JOIN player_details pd ON u.id = pd.user_id
                WHERE u.id = ? AND u.ativo = 1
            `, [id]);
            if (!userData) return null;
            const expertise = await allQuery(db, `
                SELECT expertise FROM player_expertise WHERE user_id = ?
            `, [id]);
            userData.expertise = expertise.map(e => e.expertise);
            return new User(userData);
        } finally {
            db.close();
        }
    }
    static async findByEmail(email) {
        const db = await connectDB();
        try {
            const userData = await getQuery(db, `
                SELECT u.*, pd.anos_experiencia, pd.avaliacao, pd.total_reviews_recebidos
                FROM users u
                LEFT JOIN player_details pd ON u.id = pd.user_id
                WHERE u.email = ? AND u.ativo = 1
            `, [email]);
            if (!userData) return null;
            const expertise = await allQuery(db, `
                SELECT expertise FROM player_expertise WHERE user_id = ?
            `, [userData.id]);
            userData.expertise = expertise.map(e => e.expertise);
            return new User(userData);
        } finally {
            db.close();
        }
    }
    async verifyPassword(senha) {
        return await bcrypt.compare(senha, this.senha_hash);
    }
    generateToken() {
        return jwt.sign(
            { 
                id: this.id, 
                email: this.email,
                nome: this.nome 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
    async update(updateData) {
        const db = await connectDB();
        try {
            const fields = [];
            const values = [];
            if (updateData.nome !== undefined) {
                fields.push('nome = ?');
                values.push(updateData.nome);
                this.nome = updateData.nome;
            }
            if (updateData.whatsapp !== undefined) {
                fields.push('whatsapp = ?');
                values.push(updateData.whatsapp);
                this.whatsapp = updateData.whatsapp;
            }
            if (updateData.sobre !== undefined) {
                fields.push('sobre = ?');
                values.push(updateData.sobre);
                this.sobre = updateData.sobre;
            }
            if (updateData.avatar_url !== undefined) {
                fields.push('avatar_url = ?');
                values.push(updateData.avatar_url);
                this.avatar_url = updateData.avatar_url;
            }
            if (fields.length > 0) {
                fields.push('data_atualizacao = CURRENT_TIMESTAMP');
                values.push(this.id);
                await runQuery(db, `
                    UPDATE users SET ${fields.join(', ')} WHERE id = ?
                `, values);
            }
            if (updateData.anos_experiencia !== undefined) {
                await runQuery(db, `
                    UPDATE player_details SET anos_experiencia = ?, data_atualizacao = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                `, [updateData.anos_experiencia, this.id]);
            }
            if (updateData.expertise && Array.isArray(updateData.expertise)) {
                await runQuery(db, `DELETE FROM player_expertise WHERE user_id = ?`, [this.id]);
                for (const exp of updateData.expertise) {
                    await runQuery(db, `
                        INSERT INTO player_expertise (user_id, expertise)
                        VALUES (?, ?)
                    `, [this.id, exp]);
                }
            }
            return true;
        } finally {
            db.close();
        }
    }
    async changePassword(novaSenha) {
        const db = await connectDB();
        try {
            const senha_hash = await bcrypt.hash(novaSenha, 10);
            await runQuery(db, `
                UPDATE users SET senha_hash = ?, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [senha_hash, this.id]);
            this.senha_hash = senha_hash;
            return true;
        } finally {
            db.close();
        }
    }
    async getReviews(limit = 10, offset = 0) {
        const db = await connectDB();
        try {
            const reviews = await allQuery(db, `
                SELECT r.*, g.nome as jogo, g.imagem_url as jogo_imagem
                FROM reviews r
                JOIN games g ON r.game_id = g.id
                WHERE r.user_id = ?
                ORDER BY r.data_criacao DESC
                LIMIT ? OFFSET ?
            `, [this.id, limit, offset]);
            return reviews;
        } finally {
            db.close();
        }
    }
    async getReviewsCount() {
        const db = await connectDB();
        try {
            const result = await getQuery(db, `
                SELECT COUNT(*) as count FROM reviews WHERE user_id = ?
            `, [this.id]);
            return result.count;
        } finally {
            db.close();
        }
    }
    async deactivate() {
        const db = await connectDB();
        try {
            await runQuery(db, `
                UPDATE users SET ativo = 0, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [this.id]);
            this.ativo = 0;
            return true;
        } finally {
            db.close();
        }
    }
    static async emailExists(email, excludeId = null) {
        const db = await connectDB();
        try {
            let query = 'SELECT id FROM users WHERE email = ? AND ativo = 1';
            let params = [email];
            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }
            const result = await getQuery(db, query, params);
            return !!result;
        } finally {
            db.close();
        }
    }
    toJSON() {
        const { senha_hash, ...userData } = this;
        return userData;
    }
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
    static async list(limit = 20, offset = 0, search = '') {
        const db = await connectDB();
        try {
            let query = `
                SELECT u.id, u.nome, u.email, u.data_criacao, u.ativo,
                       pd.avaliacao, pd.total_reviews_recebidos
                FROM users u
                LEFT JOIN player_details pd ON u.id = pd.user_id
                WHERE 1=1
            `;
            let params = [];
            if (search) {
                query += ' AND (u.nome LIKE ? OR u.email LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            query += ' ORDER BY u.data_criacao DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            const users = await allQuery(db, query, params);
            return users;
        } finally {
            db.close();
        }
    }
}
module.exports = User;
