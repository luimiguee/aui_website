// ============================================
// SIDEBAR MENU LATERAL
// ============================================

class Sidebar {
    constructor() {
        this.sidebar = null;
        this.toggle = null;
        this.overlay = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        // Criar elementos se não existirem
        this.createSidebar();
        this.setupEventListeners();
        this.updateUserInfo();
        this.setActivePage();
        this.renderNavigation();
    }

    createSidebar() {
        // Verificar se já existe
        if (document.querySelector('.sidebar')) {
            this.sidebar = document.querySelector('.sidebar');
            this.toggle = document.querySelector('.sidebar-toggle');
            this.overlay = document.querySelector('.sidebar-overlay');
            return;
        }

        // Criar HTML do sidebar
        const sidebarHTML = `
            <!-- Toggle Button -->
            <button class="sidebar-toggle" id="sidebarToggle">
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>

            <!-- Sidebar -->
            <aside class="sidebar" id="sidebar">
                <!-- Header -->
                <div class="sidebar-header">
                    <div class="sidebar-brand">
                        <i class="fas fa-store"></i>
                        <span>AUI Store</span>
                    </div>
                    <div class="sidebar-subtitle">Loja Online Premium</div>
                </div>

                <!-- User Info -->
                <div class="sidebar-user" id="sidebarUser">
                    <div class="sidebar-user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="sidebar-user-info">
                        <div class="sidebar-user-name">Visitante</div>
                        <div class="sidebar-user-role">Guest</div>
                    </div>
                </div>

                <!-- Navigation -->
                <nav class="sidebar-nav" id="sidebarNav">
                    <!-- Conteúdo será preenchido dinamicamente baseado no estado de autenticação -->
                </nav>

                <!-- Footer -->
                <div class="sidebar-footer">
                    <button class="sidebar-footer-btn" id="sidebarLogout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <!-- Overlay -->
            <div class="sidebar-overlay" id="sidebarOverlay"></div>
        `;

        // Adicionar ao body
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        // Guardar referências
        this.sidebar = document.getElementById('sidebar');
        this.toggle = document.getElementById('sidebarToggle');
        this.overlay = document.getElementById('sidebarOverlay');
    }

    setupEventListeners() {
        // Toggle button
        this.toggle.addEventListener('click', () => this.toggleSidebar());

        // Overlay
        this.overlay.addEventListener('click', () => this.closeSidebar());

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSidebar();
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('sidebarLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Profile button
        const profileBtn = document.getElementById('sidebarProfile');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('sidebarSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Funcionalidade em desenvolvimento');
            });
        }

        // Fechar sidebar ao clicar em links
        const links = this.sidebar.querySelectorAll('.sidebar-menu-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.closeSidebar(), 300);
            });
        });
    }

    toggleSidebar() {
        if (this.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        this.toggle.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        this.toggle.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    async updateUserInfo() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            this.setGuestUser();
            return;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setLoggedInUser(data.user);
                this.updateBadges();
            } else {
                this.setGuestUser();
            }
        } catch (error) {
            console.error('Erro ao verificar usuário:', error);
            this.setGuestUser();
        }
    }

    setLoggedInUser(user) {
        const userAvatar = this.sidebar.querySelector('.sidebar-user-avatar');
        const userName = this.sidebar.querySelector('.sidebar-user-name');
        const userRole = this.sidebar.querySelector('.sidebar-user-role');
        const logoutBtn = document.getElementById('sidebarLogout');

        if (userAvatar) {
            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            userAvatar.innerHTML = initials;
        }

        if (userName) {
            userName.textContent = user.name;
        }

        if (userRole) {
            userRole.textContent = user.role === 'admin' ? 'Administrador' : 'Cliente';
        }

        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }

        // Renderizar navegação para usuário autenticado
        this.renderNavigation(false);
        
        // Mostrar/ocultar itens baseado no role
        setTimeout(() => {
            const adminItems = this.sidebar.querySelectorAll('[data-page="admin"]');
            adminItems.forEach(item => {
                item.style.display = user.role === 'admin' ? 'flex' : 'none';
            });
        }, 100);
    }

    setGuestUser() {
        const userAvatar = this.sidebar.querySelector('.sidebar-user-avatar');
        const userName = this.sidebar.querySelector('.sidebar-user-name');
        const userRole = this.sidebar.querySelector('.sidebar-user-role');
        const logoutBtn = document.getElementById('sidebarLogout');

        if (userAvatar) {
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
        }

        if (userName) {
            userName.textContent = 'Visitante';
        }

        if (userRole) {
            userRole.textContent = 'Guest';
        }

        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }

        // Renderizar navegação para visitante
        this.renderNavigation(true);
    }
    
    renderNavigation(isGuest = false) {
        const nav = document.getElementById('sidebarNav');
        if (!nav) return;

        if (isGuest) {
            // Para visitantes: apenas categorias e opções de login/registro
            nav.innerHTML = `
                <div class="sidebar-section-title">Categorias</div>
                <ul class="sidebar-menu" id="categoriesMenu">
                    <li class="sidebar-menu-item">
                        <a href="products.html" class="sidebar-menu-link">
                            <i class="fas fa-th sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Todos os Produtos</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="products.html?category=Computadores" class="sidebar-menu-link">
                            <i class="fas fa-laptop sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Computadores</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="products.html?category=Smartphones" class="sidebar-menu-link">
                            <i class="fas fa-mobile-alt sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Smartphones</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="products.html?category=Tablets" class="sidebar-menu-link">
                            <i class="fas fa-tablet-alt sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Tablets</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="products.html?category=Áudio" class="sidebar-menu-link">
                            <i class="fas fa-headphones sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Áudio</span>
                        </a>
                    </li>
                </ul>

                <div class="sidebar-divider"></div>

                <div class="sidebar-section-title">Conta</div>
                <ul class="sidebar-menu">
                    <li class="sidebar-menu-item">
                        <a href="login.html" class="sidebar-menu-link">
                            <i class="fas fa-sign-in-alt sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Iniciar Sessão</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="register.html" class="sidebar-menu-link">
                            <i class="fas fa-user-plus sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Criar Conta</span>
                        </a>
                    </li>
                </ul>
            `;
            
            // Fechar sidebar ao clicar em links para visitantes
            setTimeout(() => {
                const links = nav.querySelectorAll('.sidebar-menu-link');
                links.forEach(link => {
                    link.addEventListener('click', () => {
                        setTimeout(() => this.closeSidebar(), 300);
                    });
                });
            }, 100);
        } else {
            // Para usuários autenticados: menu completo
            nav.innerHTML = `
                <ul class="sidebar-menu">
                    <li class="sidebar-menu-item">
                        <a href="index.html" class="sidebar-menu-link" data-page="home">
                            <i class="fas fa-home sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Home</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="dashboard.html" class="sidebar-menu-link" data-page="dashboard">
                            <i class="fas fa-th-large sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Dashboard</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="tickets.html" class="sidebar-menu-link" data-page="tickets">
                            <i class="fas fa-ticket-alt sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Suporte</span>
                            <span class="sidebar-menu-badge" id="ticketsBadge" style="display: none;">0</span>
                        </a>
                    </li>
                </ul>

                <div class="sidebar-divider"></div>

                <div class="sidebar-section-title">Administração</div>
                <ul class="sidebar-menu">
                    <li class="sidebar-menu-item">
                        <a href="admin.html" class="sidebar-menu-link" data-page="admin">
                            <i class="fas fa-user-shield sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Admin Panel</span>
                        </a>
                    </li>
                </ul>

                <div class="sidebar-divider"></div>

                <div class="sidebar-section-title">Conta</div>
                <ul class="sidebar-menu">
                    <li class="sidebar-menu-item">
                        <a href="#" class="sidebar-menu-link" id="sidebarProfile">
                            <i class="fas fa-user-circle sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Perfil</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="#" class="sidebar-menu-link" id="sidebarSettings">
                            <i class="fas fa-cog sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Configurações</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="checkout.html" class="sidebar-menu-link" data-page="checkout">
                            <i class="fas fa-shopping-cart sidebar-menu-icon"></i>
                            <span class="sidebar-menu-text">Carrinho</span>
                            <span class="sidebar-menu-badge" id="cartBadge" style="display: none;">0</span>
                        </a>
                    </li>
                </ul>
            `;
            
            // Reconfigurar event listeners após renderizar
            this.setupNavEventListeners();
        }
    }
    
    setupNavEventListeners() {
        // Profile button
        const profileBtn = document.getElementById('sidebarProfile');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'dashboard.html';
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('sidebarSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Funcionalidade em desenvolvimento');
            });
        }

        // Fechar sidebar ao clicar em links
        const links = this.sidebar.querySelectorAll('.sidebar-menu-link');
        links.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => this.closeSidebar(), 300);
            });
        });
    }

    async updateBadges() {
        // Atualizar badge do carrinho
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge && cart.length > 0) {
            cartBadge.textContent = cart.length;
            cartBadge.style.display = 'block';
        }

        // Atualizar badge de tickets (se estiver logado)
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('/api/tickets/my-tickets', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const openTickets = data.tickets.filter(t => t.status !== 'fechado').length;
                    const ticketsBadge = document.getElementById('ticketsBadge');
                    
                    if (ticketsBadge && openTickets > 0) {
                        ticketsBadge.textContent = openTickets;
                        ticketsBadge.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar tickets:', error);
            }
        }
    }

    setActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = this.sidebar.querySelectorAll('.sidebar-menu-link');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    }
}

// Inicializar sidebar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sidebarInstance = new Sidebar();
    });
} else {
    window.sidebarInstance = new Sidebar();
}

// Exportar para uso global
window.Sidebar = Sidebar;


