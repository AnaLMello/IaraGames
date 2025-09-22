// Profile Component - Conecta com perfil-usuario.json
class ProfileComponent {
    constructor() {
        this.userData = null;
        this.profileIcon = null;
        this.profileDropdown = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.createProfileIcon();
        this.setupEventListeners();
    }

    async loadUserData() {
        try {
            // Primeiro, tentar carregar dados do localStorage (usuário recém-cadastrado)
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                this.userData = {
                    nome: userData.nome,
                    email: userData.email,
                    username: userData.username,
                    sobrenome: userData.sobrenome,
                    dataNascimento: userData.dataNascimento
                };
                return;
            }

            // Se não houver dados no localStorage, carregar do JSON
            const response = await fetch('./perfil-usuario.json');
            const data = await response.json();
            this.userData = data.perfil_usuario.dados_usuario;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            // Dados padrão caso não consiga carregar
            this.userData = {
                nome: "Usuário",
                email: "usuario@email.com"
            };
        }
    }

    createProfileIcon() {
        // Criar o ícone do perfil
        this.profileIcon = document.createElement('div');
        this.profileIcon.className = 'profile-icon';
        this.profileIcon.innerHTML = `
            <div class="profile-avatar">
                <span class="profile-initial">${this.userData.nome.charAt(0).toUpperCase()}</span>
            </div>
            <span class="profile-name">${this.userData.nome}</span>
            <i class="profile-arrow">▼</i>
        `;

        // Criar o dropdown do perfil
        this.profileDropdown = document.createElement('div');
        this.profileDropdown.className = 'profile-dropdown';
        this.profileDropdown.innerHTML = `
            <div class="profile-dropdown-header">
                <div class="profile-dropdown-avatar">
                    <span class="profile-dropdown-initial">${this.userData.nome.charAt(0).toUpperCase()}</span>
                </div>
                <div class="profile-dropdown-info">
                    <h4>${this.userData.nome}</h4>
                    <p>${this.userData.email}</p>
                </div>
            </div>
            <div class="profile-dropdown-menu">
                <a href="#" class="profile-menu-item" onclick="profileComponent.goToProfile()">
                    <i>👤</i> Meu Perfil
                </a>
                <a href="#" class="profile-menu-item" onclick="profileComponent.goToOrders()">
                    <i>🛒</i> Minhas Compras
                </a>
                <a href="#" class="profile-menu-item" onclick="profileComponent.goToSettings()">
                    <i>⚙️</i> Configurações
                </a>
                <hr class="profile-menu-divider">
                <a href="#" class="profile-menu-item" onclick="profileComponent.logout()">
                    <i>🚪</i> Sair
                </a>
            </div>
        `;

        // Adicionar estilos
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .profile-icon {
                display: flex;
                align-items: center;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 8px;
                transition: background-color 0.3s;
                position: relative;
                color: white;
                height: 56px;
                line-height: 1;
                vertical-align: middle;
            }

            .profile-icon:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            .profile-avatar {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #63C9BB, #1CB80E);
                border-radius: 8px;
                margin-right: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(99, 201, 187, 0.3);
            }

            .profile-initial {
                color: white;
                font-weight: bold;
                font-size: 16px;
                text-transform: uppercase;
            }

            .profile-name {
                font-size: 14px;
                margin-right: 8px;
            }

            .profile-arrow {
                font-size: 12px;
                transition: transform 0.3s;
            }

            .profile-icon.active .profile-arrow {
                transform: rotate(180deg);
            }

            .profile-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: #1a1a1a;
                border: 1px solid #63C9BB;
                border-radius: 8px;
                min-width: 250px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                display: none;
                margin-top: 8px;
            }

            .profile-dropdown.show {
                display: block;
            }

            .profile-dropdown-header {
                display: flex;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid #333;
            }

            .profile-dropdown-avatar {
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #63C9BB, #1CB80E);
                border-radius: 12px;
                margin-right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 12px rgba(99, 201, 187, 0.4);
            }

            .profile-dropdown-initial {
                color: white;
                font-weight: bold;
                font-size: 20px;
                text-transform: uppercase;
            }

            .profile-dropdown-info h4 {
                margin: 0;
                color: white;
                font-size: 16px;
            }

            .profile-dropdown-info p {
                margin: 4px 0 0 0;
                color: #999;
                font-size: 14px;
            }

            .profile-dropdown-menu {
                padding: 8px 0;
            }

            .profile-menu-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                color: white;
                text-decoration: none;
                transition: background-color 0.3s;
            }

            .profile-menu-item:hover {
                background-color: rgba(99, 201, 187, 0.1);
                color: #63C9BB;
            }

            .profile-menu-item i {
                margin-right: 12px;
                width: 16px;
            }

            .profile-menu-divider {
                border: none;
                border-top: 1px solid #333;
                margin: 8px 0;
            }

            @media (max-width: 768px) {
                .profile-name {
                    display: none;
                }
                
                .profile-dropdown {
                    right: -50px;
                    min-width: 200px;
                }

                .profile-container {
                    margin-left: 0 !important;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        this.profileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        this.profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    toggleDropdown() {
        const isOpen = this.profileDropdown.classList.contains('show');
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.profileDropdown.classList.add('show');
        this.profileIcon.classList.add('active');
    }

    closeDropdown() {
        this.profileDropdown.classList.remove('show');
        this.profileIcon.classList.remove('active');
    }

    // Métodos de navegação
    goToProfile() {
        window.location.href = 'perfil.html';
    }

    goToOrders() {
        window.location.href = 'minhas-compras.html';
    }

    goToSettings() {
        window.location.href = 'configuracoes.html';
    }

    logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('userSession');
            localStorage.removeItem('currentUser');
            
            // Mostrar botões de login novamente
            this.showLoginButtons();
            
            window.location.href = 'login.html';
        }
    }

    // Método para salvar dados do usuário no JSON (simulação)
    async saveUserDataToJSON() {
        try {
            // Em um ambiente real, isso seria uma requisição POST para o servidor
            // Por enquanto, apenas atualizamos o localStorage
            if (this.userData) {
                localStorage.setItem('currentUser', JSON.stringify(this.userData));
                console.log('Dados do usuário salvos com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
        }
    }

    // Método para adicionar o componente à navegação
    addToNavigation(navSelector = '.menu, .header nav, nav') {
        const navElements = document.querySelectorAll(navSelector);
        
        navElements.forEach(nav => {
            const profileContainer = document.createElement('div');
            profileContainer.className = 'profile-container';
            profileContainer.style.position = 'relative';
            
            profileContainer.appendChild(this.profileIcon);
            profileContainer.appendChild(this.profileDropdown);
            
            nav.appendChild(profileContainer);
        });

        // Esconder botões de login quando usuário estiver logado
        this.hideLoginButtons();
    }

    // Método para esconder botões de login
    hideLoginButtons() {
        const loginButtons = document.querySelectorAll('#loginButton, .btn-login, .login-btn');
        loginButtons.forEach(button => {
            if (button) {
                button.style.display = 'none';
            }
        });

        // Também esconder links para páginas de login/cadastro se existirem
        const loginLinks = document.querySelectorAll('a[href*="login"], a[href*="cadastro"]');
        loginLinks.forEach(link => {
            // Só esconder se for especificamente um botão de login, não links de navegação
            if (link.textContent.toLowerCase().includes('entrar') || 
                link.textContent.toLowerCase().includes('login') ||
                link.classList.contains('btn')) {
                link.style.display = 'none';
            }
        });
    }

    // Método para mostrar botões de login (quando usuário faz logout)
    showLoginButtons() {
        const loginButtons = document.querySelectorAll('#loginButton, .btn-login, .login-btn');
        loginButtons.forEach(button => {
            if (button) {
                button.style.display = '';
            }
        });

        const loginLinks = document.querySelectorAll('a[href*="login"], a[href*="cadastro"]');
        loginLinks.forEach(link => {
            if (link.textContent.toLowerCase().includes('entrar') || 
                link.textContent.toLowerCase().includes('login') ||
                link.classList.contains('btn')) {
                link.style.display = '';
            }
        });
    }

    // Método para atualizar dados do usuário
    updateUserData(newData) {
        this.userData = { ...this.userData, ...newData };
        this.refreshDisplay();
    }

    refreshDisplay() {
        const nameElements = this.profileIcon.querySelectorAll('.profile-name');
        const emailElements = this.profileDropdown.querySelectorAll('.profile-dropdown-info p');
        const headerName = this.profileDropdown.querySelector('.profile-dropdown-info h4');
        const initialElements = this.profileIcon.querySelectorAll('.profile-initial');
        const dropdownInitialElements = this.profileDropdown.querySelectorAll('.profile-dropdown-initial');
        
        nameElements.forEach(el => el.textContent = this.userData.nome);
        emailElements.forEach(el => el.textContent = this.userData.email);
        if (headerName) headerName.textContent = this.userData.nome;
        
        // Atualizar iniciais
        const initial = this.userData.nome.charAt(0).toUpperCase();
        initialElements.forEach(el => el.textContent = initial);
        dropdownInitialElements.forEach(el => el.textContent = initial);
    }
}

// Inicializar o componente quando a página carregar
let profileComponent;

document.addEventListener('DOMContentLoaded', async () => {
    profileComponent = new ProfileComponent();
    
    // Aguardar um pouco para garantir que o componente foi criado
    setTimeout(() => {
        profileComponent.addToNavigation();
    }, 100);
});

// Exportar para uso global
window.ProfileComponent = ProfileComponent;
window.profileComponent = profileComponent;