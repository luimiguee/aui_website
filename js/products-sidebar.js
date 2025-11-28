// ============================================
// MENU LATERAL DE PRODUTOS E CATEGORIAS
// ============================================

class ProductsSidebar {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.toggle = null;
        this.filters = {
            category: null,
            minPrice: 0,
            maxPrice: 5000,
            brands: [],
            rating: null,
            search: ''
        };
        this.init();
    }

    init() {
        this.isAuthenticated = this.checkAuthentication();
        this.createSidebar();
        this.loadCategories();
        this.setupEventListeners();
    }

    checkAuthentication() {
        const token = localStorage.getItem('token');
        const isAuth = !!token;
        console.log('🔐 Verificação de autenticação:', { token: !!token, isAuth });
        return isAuth;
    }

    createSidebar() {
        const isGuest = !this.isAuthenticated;
        console.log('📋 Criando sidebar:', { isAuthenticated: this.isAuthenticated, isGuest });
        
        const sidebarHTML = `
            <!-- Mobile Toggle -->
            <button class="sidebar-mobile-toggle" id="productsSidebarToggle">
                <i class="fas fa-filter"></i>
            </button>

            <!-- Mobile Overlay -->
            <div class="sidebar-mobile-overlay" id="productsSidebarOverlay"></div>

            <!-- Sidebar -->
            <aside class="products-sidebar" id="productsSidebar">
                <div class="sidebar-header">
                    <h2 class="sidebar-title">
                        <i class="fas fa-${isGuest ? 'th' : 'filter'}"></i>
                        ${isGuest ? 'Categorias' : 'Filtros'}
                    </h2>
                    <p class="sidebar-subtitle">${isGuest ? 'Explore nossos produtos' : 'Refine sua busca'}</p>
                </div>

                ${!isGuest ? `
                <!-- Search -->
                <div class="sidebar-search">
                    <i class="fas fa-search"></i>
                    <input type="text" id="productSearch" placeholder="Buscar produtos...">
                    <button class="clear-search" id="clearSearch">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ` : ''}

                <!-- Categorias -->
                <div class="sidebar-section">
                    <div class="section-title">
                        <span><i class="fas fa-th"></i> Categorias</span>
                        ${!isGuest ? '<button class="section-clear" id="clearCategories">Limpar</button>' : ''}
                    </div>
                    <ul class="category-list" id="categoryList">
                        <!-- Categorias serão carregadas aqui -->
                    </ul>
                </div>

                ${!isGuest ? `
                <!-- Preço -->
                <div class="sidebar-section">
                    <div class="section-title">
                        <span><i class="fas fa-euro-sign"></i> Preço</span>
                        <button class="section-clear" id="clearPrice">Limpar</button>
                    </div>
                    <div class="price-filter">
                        <div class="price-inputs">
                            <div class="price-input-group">
                                <span class="price-symbol">€</span>
                                <input type="number" id="minPrice" placeholder="Min" min="0" value="0">
                            </div>
                            <span class="price-separator">-</span>
                            <div class="price-input-group">
                                <span class="price-symbol">€</span>
                                <input type="number" id="maxPrice" placeholder="Max" min="0" value="5000">
                            </div>
                        </div>
                        <div class="price-slider">
                            <input type="range" id="priceRange" min="0" max="5000" value="5000">
                        </div>
                    </div>
                </div>

                <!-- Rating -->
                <div class="sidebar-section">
                    <div class="section-title">
                        <span><i class="fas fa-star"></i> Avaliação</span>
                        <button class="section-clear" id="clearRating">Limpar</button>
                    </div>
                    <ul class="rating-filter">
                        <li class="rating-option">
                            <a href="#" class="rating-link" data-rating="5">
                                <div class="rating-stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                                <span class="rating-text">5 Estrelas</span>
                            </a>
                        </li>
                        <li class="rating-option">
                            <a href="#" class="rating-link" data-rating="4">
                                <div class="rating-stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="far fa-star"></i>
                                </div>
                                <span class="rating-text">4+ Estrelas</span>
                            </a>
                        </li>
                        <li class="rating-option">
                            <a href="#" class="rating-link" data-rating="3">
                                <div class="rating-stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="far fa-star"></i>
                                    <i class="far fa-star"></i>
                                </div>
                                <span class="rating-text">3+ Estrelas</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Ações -->
                <div class="sidebar-actions">
                    <button class="sidebar-btn sidebar-btn-primary" id="applyFilters">
                        <i class="fas fa-check"></i>
                        Aplicar
                    </button>
                    <button class="sidebar-btn sidebar-btn-secondary" id="resetFilters">
                        <i class="fas fa-redo"></i>
                        Limpar Tudo
                    </button>
                </div>
                ` : `
                <!-- Ações para Visitantes -->
                <div class="sidebar-actions sidebar-actions-guest">
                    <a href="login.html" class="sidebar-btn sidebar-btn-primary" style="text-decoration: none; display: block; text-align: center;">
                        <i class="fas fa-sign-in-alt"></i>
                        Iniciar Sessão
                    </a>
                    <a href="register.html" class="sidebar-btn sidebar-btn-secondary" style="text-decoration: none; display: block; text-align: center; margin-top: 12px;">
                        <i class="fas fa-user-plus"></i>
                        Criar Conta
                    </a>
                </div>
                `}
            </aside>
        `;

        // Remover sidebar existente se houver
        const existingSidebar = document.getElementById('productsSidebar');
        const existingOverlay = document.getElementById('productsSidebarOverlay');
        const existingToggle = document.getElementById('productsSidebarToggle');
        
        if (existingSidebar) existingSidebar.remove();
        if (existingOverlay) existingOverlay.remove();
        if (existingToggle) existingToggle.remove();

        // Adicionar ao DOM
        const container = document.querySelector('.products-layout') || document.body;
        container.insertAdjacentHTML('afterbegin', sidebarHTML);

        this.sidebar = document.getElementById('productsSidebar');
        this.overlay = document.getElementById('productsSidebarOverlay');
        this.toggle = document.getElementById('productsSidebarToggle');
        
        console.log('✅ Sidebar criada:', { 
            sidebar: !!this.sidebar, 
            overlay: !!this.overlay, 
            toggle: !!this.toggle,
            isGuest 
        });
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/admin/products');
            const data = await response.json();

            if (data.success) {
                const categories = this.extractCategories(data.products);
                this.renderCategories(categories);
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            this.renderDefaultCategories();
        }
    }

    extractCategories(products) {
        const categoryCount = {};
        
        products.forEach(product => {
            const category = product.category || 'Outros';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        return Object.entries(categoryCount).map(([name, count]) => ({
            name,
            count,
            icon: this.getCategoryIcon(name)
        }));
    }

    getCategoryIcon(category) {
        const icons = {
            'Computadores': 'fa-laptop',
            'Smartphones': 'fa-mobile-alt',
            'Tablets': 'fa-tablet-alt',
            'Áudio': 'fa-headphones',
            'Wearables': 'fa-watch',
            'Periféricos': 'fa-keyboard',
            'Acessórios': 'fa-plug',
            'Gaming': 'fa-gamepad'
        };
        return icons[category] || 'fa-tag';
    }

    renderCategories(categories) {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';

        // Adicionar "Todas" primeiro
        const allItem = `
            <li class="category-item">
                <a href="#" class="category-link active" data-category="all">
                    <span class="category-name">
                        <i class="fas fa-th-large"></i>
                        Todas as Categorias
                    </span>
                    <span class="category-count">${categories.reduce((sum, cat) => sum + cat.count, 0)}</span>
                </a>
            </li>
        `;
        categoryList.insertAdjacentHTML('beforeend', allItem);

        // Adicionar categorias
        categories.forEach(category => {
            const item = `
                <li class="category-item">
                    <a href="#" class="category-link" data-category="${category.name}">
                        <span class="category-name">
                            <i class="fas ${category.icon}"></i>
                            ${category.name}
                        </span>
                        <span class="category-count">${category.count}</span>
                    </a>
                </li>
            `;
            categoryList.insertAdjacentHTML('beforeend', item);
        });
    }

    renderDefaultCategories() {
        const defaultCategories = [
            { name: 'Computadores', icon: 'fa-laptop', count: 0 },
            { name: 'Smartphones', icon: 'fa-mobile-alt', count: 0 },
            { name: 'Tablets', icon: 'fa-tablet-alt', count: 0 },
            { name: 'Áudio', icon: 'fa-headphones', count: 0 }
        ];
        this.renderCategories(defaultCategories);
    }

    setupEventListeners() {
        // Mobile toggle
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Overlay
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }

        // Categorias
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-link')) {
                e.preventDefault();
                this.handleCategoryClick(e.target.closest('.category-link'));
            }
        });

        // Search
        const searchInput = document.getElementById('productSearch');
        const clearSearch = document.getElementById('clearSearch');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                clearSearch.style.display = e.target.value ? 'block' : 'none';
                this.applyFilters();
            });
        }

        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                this.filters.search = '';
                clearSearch.style.display = 'none';
                this.applyFilters();
            });
        }

        // Price
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const priceRange = document.getElementById('priceRange');

        if (minPrice) {
            minPrice.addEventListener('change', () => {
                this.filters.minPrice = parseFloat(minPrice.value) || 0;
                this.applyFilters();
            });
        }

        if (maxPrice) {
            maxPrice.addEventListener('change', () => {
                this.filters.maxPrice = parseFloat(maxPrice.value) || 5000;
                this.applyFilters();
            });
        }

        if (priceRange) {
            priceRange.addEventListener('input', () => {
                maxPrice.value = priceRange.value;
                this.filters.maxPrice = parseFloat(priceRange.value);
                this.applyFilters();
            });
        }

        // Rating
        document.addEventListener('click', (e) => {
            if (e.target.closest('.rating-link')) {
                e.preventDefault();
                this.handleRatingClick(e.target.closest('.rating-link'));
            }
        });

        // Clear buttons
        document.getElementById('clearCategories')?.addEventListener('click', () => this.clearCategories());
        document.getElementById('clearPrice')?.addEventListener('click', () => this.clearPrice());
        document.getElementById('clearRating')?.addEventListener('click', () => this.clearRating());

        // Action buttons
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('resetFilters')?.addEventListener('click', () => this.resetFilters());
    }

    handleCategoryClick(link) {
        // Remove active de todos
        document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
        
        // Adiciona active ao clicado
        link.classList.add('active');
        
        // Atualiza filtro
        const category = link.dataset.category;
        this.filters.category = category === 'all' ? null : category;
        
        // Para visitantes, apenas filtrar por categoria (sem outros filtros)
        if (!this.isAuthenticated) {
            this.applyFilters();
        } else {
            this.applyFilters();
        }
        
        this.closeSidebar();
    }

    handleRatingClick(link) {
        // Remove active de todos
        document.querySelectorAll('.rating-link').forEach(l => l.classList.remove('active'));
        
        // Adiciona active ao clicado
        link.classList.add('active');
        
        // Atualiza filtro
        this.filters.rating = parseInt(link.dataset.rating);
        
        this.applyFilters();
    }

    clearCategories() {
        document.querySelectorAll('.category-link').forEach(l => l.classList.remove('active'));
        document.querySelector('[data-category="all"]')?.classList.add('active');
        this.filters.category = null;
        this.applyFilters();
    }

    clearPrice() {
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const priceRange = document.getElementById('priceRange');
        
        if (minPrice) minPrice.value = 0;
        if (maxPrice) maxPrice.value = 5000;
        if (priceRange) priceRange.value = 5000;
        
        this.filters.minPrice = 0;
        this.filters.maxPrice = 5000;
        this.applyFilters();
    }

    clearRating() {
        document.querySelectorAll('.rating-link').forEach(l => l.classList.remove('active'));
        this.filters.rating = null;
        this.applyFilters();
    }

    resetFilters() {
        this.filters = {
            category: null,
            minPrice: 0,
            maxPrice: 5000,
            brands: [],
            rating: null,
            search: ''
        };

        // Reset UI
        this.clearCategories();
        
        if (this.isAuthenticated) {
            this.clearPrice();
            this.clearRating();
            
            const searchInput = document.getElementById('productSearch');
            if (searchInput) {
                searchInput.value = '';
                const clearSearch = document.getElementById('clearSearch');
                if (clearSearch) clearSearch.style.display = 'none';
            }
        }

        this.applyFilters();
    }

    applyFilters() {
        // Disparar evento customizado com os filtros
        const event = new CustomEvent('productsFiltered', {
            detail: this.filters
        });
        document.dispatchEvent(event);

        console.log('Filtros aplicados:', this.filters);
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.sidebar.classList.contains('active') ? 'hidden' : '';
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    getFilters() {
        return this.filters;
    }
}

// Auto-inicializar se estiver em uma página de produtos
function initProductsSidebar() {
    if (document.querySelector('.products-layout')) {
        console.log('🚀 Inicializando ProductsSidebar...');
        window.productsSidebar = new ProductsSidebar();
    } else {
        console.warn('⚠️ .products-layout não encontrado');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductsSidebar);
} else {
    initProductsSidebar();
}

window.ProductsSidebar = ProductsSidebar;

