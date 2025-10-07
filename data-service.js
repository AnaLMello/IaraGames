class DataService {
    constructor() {
        this.useSimulator = false;
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.currentUser = null;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
    }
    setUseSimulator(useSimulator) {
        this.useSimulator = useSimulator;
        this.clearCache();
    }
    _getCacheKey(endpoint, params = {}) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }
    _setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    _getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    clearCache() {
        this.cache.clear();
    }
    async _makeRequest(endpoint, options = {}) {
        if (this.useSimulator) {
            return this._makeSimulatedRequest(endpoint, options);
        } else {
            return this._makeRealRequest(endpoint, options);
        }
    }
    async _makeSimulatedRequest(endpoint, options = {}) {
        if (!window.apiSimulator) {
            throw new Error('API Simulator não está disponível');
        }
        const { method = 'GET', data } = options;
        try {
            switch (endpoint) {
                case 'usuario':
                    return await window.apiSimulator.getUsuario(data?.id || 1);
                case 'usuario-reviews':
                    return await window.apiSimulator.getReviewsUsuario(data?.id || 1);
                case 'jogos':
                    return await window.apiSimulator.getJogos(data?.filtros || {});
                case 'jogo':
                    return await window.apiSimulator.getJogo(data?.id);
                case 'atualizar-usuario':
                    return await window.apiSimulator.atualizarUsuario(data?.id || 1, data?.dados);
                case 'criar-review':
                    return await window.apiSimulator.criarReview(data);
                case 'stats':
                    return await window.apiSimulator.getStats();
                default:
                    throw new Error(`Endpoint não suportado: ${endpoint}`);
            }
        } catch (error) {
            console.error('Erro na API simulada:', error);
            throw error;
        }
    }
    async _makeRealRequest(endpoint, options = {}) {
        const { method = 'GET', data } = options;
        const url = `${this.apiBaseUrl}/${endpoint}`;
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.getAuthToken() ? `Bearer ${this.getAuthToken()}` : undefined
            }
        };
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erro na API real:', error);
            throw error;
        }
    }
    getAuthToken() {
        return localStorage.getItem('authToken');
    }
    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }
    removeAuthToken() {
        localStorage.removeItem('authToken');
    }
    async carregarUsuario(id = null) {
        const userId = id || this.getCurrentUserId();
        const cacheKey = this._getCacheKey('usuario', { id: userId });
        const cached = this._getCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const endpoint = userId ? `users/${userId}` : 'auth/me';
            const response = await this._makeRequest(endpoint);
            this._setCache(cacheKey, response);
            if (response.success) {
                this.currentUser = response.data;
            }
            return response;
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            return this._getFallbackUserData();
        }
    }
    async carregarReviewsUsuario(id = null) {
        const userId = id || this.getCurrentUserId();
        const cacheKey = this._getCacheKey('usuario-reviews', { id: userId });
        const cached = this._getCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await this._makeRequest(`users/${userId}/reviews`);
            this._setCache(cacheKey, response);
            return response;
        } catch (error) {
            console.error('Erro ao carregar reviews:', error);
            return { success: false, data: [], error: error.message };
        }
    }
    async carregarJogos(filtros = {}) {
        const cacheKey = this._getCacheKey('jogos', filtros);
        const cached = this._getCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key] !== undefined && filtros[key] !== null) {
                    queryParams.append(key, filtros[key]);
                }
            });
            const endpoint = `games${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await this._makeRequest(endpoint);
            this._setCache(cacheKey, response);
            return response;
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            return { success: false, data: [], error: error.message };
        }
    }
    async carregarJogo(id) {
        const cacheKey = this._getCacheKey('jogo', { id });
        const cached = this._getCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await this._makeRequest(`games/${id}`);
            this._setCache(cacheKey, response);
            return response;
        } catch (error) {
            console.error('Erro ao carregar jogo:', error);
            return { success: false, data: null, error: error.message };
        }
    }
    async atualizarUsuario(dados) {
        const userId = this.getCurrentUserId();
        try {
            const response = await this._makeRequest(`users/${userId}`, {
                method: 'PUT',
                data: dados
            });
            this.cache.forEach((value, key) => {
                if (key.includes('usuario')) {
                    this.cache.delete(key);
                }
            });
            this.currentUser = response.data;
            localStorage.setItem('currentUser', JSON.stringify(response.data));
            return response;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }
    async criarReview(dadosReview) {
        try {
            const response = await this._makeRequest('reviews', {
                method: 'POST',
                data: dadosReview
            });
            this.cache.forEach((value, key) => {
                if (key.includes('reviews')) {
                    this.cache.delete(key);
                }
            });
            return response;
        } catch (error) {
            console.error('Erro ao criar review:', error);
            throw error;
        }
    }
    getCurrentUserId() {
        if (this.currentUser?.id) {
            return this.currentUser.id;
        }
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            return userData.id || 1;
        }
        return 1;
    }
    _getFallbackUserData() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            return {
                success: true,
                data: {
                    id: userData.id || 1,
                    nome: userData.nome || 'Usuário',
                    email: userData.email || 'usuario@email.com',
                    whatsapp: userData.whatsapp || '',
                    sobre: userData.sobre || '',
                    detalhes_jogador: userData.detalhes_jogador || {
                        expertise: [],
                        anos_experiencia: 'Não informado',
                        avaliacao: 0,
                        reviews_recebidos: []
                    }
                },
                source: 'localStorage'
            };
        }
        return {
            success: false,
            data: null,
            error: 'Nenhum dado de usuário encontrado'
        };
    }
    async obterEstatisticas() {
        try {
            return await this._makeRequest('stats/general');
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return { success: false, error: error.message };
        }
    }
    async testarConexao() {
        try {
            const response = await this._makeRequest('health');
            return {
                success: true,
                source: this.useSimulator ? 'simulator' : 'api',
                timestamp: new Date().toISOString(),
                health: response
            };
        } catch (error) {
            return {
                success: false,
                source: this.useSimulator ? 'simulator' : 'api',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    async login(email, senha) {
        try {
            const response = await this._makeRequest('auth/login', {
                method: 'POST',
                data: { email, senha }
            });
            if (response.success && response.data.token) {
                this.setAuthToken(response.data.token);
                this.currentUser = response.data.user;
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }
    async register(dadosUsuario) {
        try {
            const response = await this._makeRequest('auth/register', {
                method: 'POST',
                data: dadosUsuario
            });
            if (response.success && response.data.token) {
                this.setAuthToken(response.data.token);
                this.currentUser = response.data.user;
                localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        }
    }
    async logout() {
        try {
            await this._makeRequest('auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Erro no logout:', error);
        } finally {
            this.removeAuthToken();
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.clearCache();
        }
    }
}
window.dataService = new DataService();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
}
