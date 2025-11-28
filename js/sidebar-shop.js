// ============================================
// SIDEBAR MENU DE NAVEGAÇÃO - PRODUTOS
// ============================================

class ShopSidebar {
    constructor() {
        this.sidebar = null;
        this.toggle = null;
        this.overlay = null;
        this.isOpen = false;
        this.filters = {
            category: 'all',
            priceMin: '',
            priceMax: '',
            brands: [],
            search: ''
        };
        this.init();
    }

    init() {
        this.createSidebar();
        this.setupEventListeners();
        this.loadCategories();
    }

    createSidebar() {
        // Verificar se já existe
        if (document.querySelector('.shop-sidebar')) {
            this.sidebar = document.querySelector('.shop-sidebar');
            this.toggle = document.querySelector('.shop-sidebar-toggle');
            this.overlay = document.querySelector('.shop-sidebar-overlay');
            return;
        }

        const sidebarHTML = `
            <!-- Toggle Button -->
            <button class="shop-sidebar-toggle" id="shopSidebarToggle">
                <i class="fas fa-filter"></i>
            </button>

            <!-- Sidebar -->
            <aside class="shop-sidebar" id="shopSidebar">
                <!-- Header -->
                <div class="shop-sidebar-header">
                    <div class="shop-sidebar-title">
                        <i class="fas fa-store"></i>
                        <span>Produtos</span>
                    </div>
                    <div class="shop-sidebar-subtitle">Navegue por categorias</div>
                </div>

                <!-- Search -->
                <div class="shop-sidebar-search">
                    <div class="shop-search-box">
                        <input 
                            type="text" 
                            id="shopSearchInput" 
                            placeholder="Pesquisar produtos..."
                        >
                        <i class="fas fa-search"></i>
                    </div>
                </div>

                <!-- Categorias -->
                <div class="shop-sidebar-section">
                    <h3 class="shop-section-title">
                        <i class="fas fa-th-large"></i>
                        Categorias
                    </h3>
                    <ul class="shop-categories-list" id="shopCategoriesList">
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link active" data-category="all">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-layer-group"></i>
                                    </div>
                                    <span>Todas</span>
                                </div>
                                <span class="shop-category-count" id="allCount">0</span>
                            </a>
                        </li>
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link" data-category="Computadores">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-laptop"></i>
                                    </div>
                                    <span>Computadores</span>
                                </div>
                                <span class="shop-category-count" id="computadoresCount">0</span>
                            </a>
                        </li>
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link" data-category="Smartphones">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <span>Smartphones</span>
                                </div>
                                <span class="shop-category-count" id="smartphonesCount">0</span>
                            </a>
                        </li>
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link" data-category="Tablets">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-tablet-alt"></i>
                                    </div>
                                    <span>Tablets</span>
                                </div>
                                <span class="shop-category-count" id="tabletsCount">0</span>
                            </a>
                        </li>
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link" data-category="Áudio">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-headphones"></i>
                                    </div>
                                    <span>Áudio</span>
                                </div>
                                <span class="shop-category-count" id="audioCount">0</span>
                            </a>
                        </li>
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link" data-category="Wearables">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-watch"></i>
                                    </div>
                                    <span>Wearables</span>
                                </div>
                                <span class="shop-category-count" id="wearablesCount">0</span>
                            </a>
                        </li>
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link" data-category="Periféricos">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-keyboard"></i>
                                    </div>
                                    <span>Periféricos</span>
                                </div>
                                <span class="shop-category-count" id="perifericosCount">0</span>
                            </a>
                        </li>
                        <li class="shop-category-item">
                            <a href="#" class="shop-category-link" data-category="Gaming">
                                <div class="shop-category-left">
                                    <div class="shop-category-icon">
                                        <i class="fas fa-gamepad"></i>
                                    </div>
                                    <span>Gaming</span>
                                </div>
                                <span class="shop-category-count" id="gamingCount">0</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <!-- Filtro de Preço -->
                <div class="shop-sidebar-section">
                    <h3 class="shop-section-title">
                        <i class="fas fa-euro-sign"></i>
                        Preço
                    </h3>
                    <div class="shop-price-filter">
                        <div class="shop-price-inputs">
                            <div class="shop-price-input">
                                <label>Mínimo</label>
                                <input type="number" id="priceMin" placeholder="0€" min="0">
                            </div>
                            <div class="shop-price-input">
                                <label>Máximo</label>
                                <input type="number" id="priceMax" placeholder="5000€" min="0">
                            </div>
                        </div>
                        <button class="shop-filter-btn" id="applyPriceFilter">
                            <i class="fas fa-check"></i>
                            Aplicar Filtro
                        </button>
                    </div>
                </div>

                <!-- Marcas -->
                <div class="shop-sidebar-section">
                    <h3 class="shop-section-title">
                        <i class="fas fa-tags"></i>
                        Marcas
                    </h3>
                    <ul class="shop-brands-list">
                        <li class="shop-brand-item">
                            <div class="shop-brand-checkbox">
                                <input type="checkbox" id="brand-apple" value="Apple">
                                <label for="brand-apple">Apple</label>
                            </div>
                        </li>
                        <li class="shop-brand-item">
                            <div class="shop-brand-checkbox">
                                <input type="checkbox" id="brand-samsung" value="Samsung">
                                <label for="brand-samsung">Samsung</label>
                            </div>
                        </li>
                        <li class="shop-brand-item">
                            <div class="shop-brand-checkbox">
                                <input type="checkbox" id="brand-sony" value="Sony">
                                <label for="brand-sony">Sony</label>
                            </div>
                        </li>
                        <li class="shop-brand-item">
                            <div class="shop-brand-checkbox">
                                <input type="checkbox" id="brand-dell" value="Dell">
                                <label for="brand-dell">Dell</label>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Ações -->
                <div class="shop-sidebar-actions">
                    <button class="shop-action-btn shop-action-btn-secondary" id="clearFilters">
                        <i class="fas fa-redo"></i>
                        Limpar Filtros
                    </button>
                </div>
            </aside>

            <!-- Overlay -->
            <div class="shop-sidebar-overlay" id="shopSidebarOverlay"></div>
        `;

        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        this.sidebar = document.getElementById('shopSidebar');
        this.toggle = document.getElementById('shopSidebarToggle');
        this.overlay = document.getElementById('shopSidebarOverlay');
    }

    setupEventListeners() {
        // Toggle
        this.toggle.addEventListener('click', () => this.toggleSidebar());

        // Overlay
        this.overlay.addEventListener('click', () => this.closeSidebar());

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSidebar();
            }
        });

        // Categorias
        const categoryLinks = this.sidebar.querySelectorAll('.shop-category-link');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.selectCategory(category, link);
            });
        });

        // Pesquisa
        const searchInput = document.getElementById('shopSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Filtro de preço
        const applyPriceBtn = document.getElementById('applyPriceFilter');
        if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', () => this.applyPriceFilter());
        }

        // Marcas
        const brandCheckboxes = this.sidebar.querySelectorAll('.shop-brand-checkbox input');
        brandCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateBrands());
        });

        // Limpar filtros
        const clearBtn = document.getElementById('clearFilters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }
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

    selectCategory(category, linkElement) {
        // Remover active de todos
        const allLinks = this.sidebar.querySelectorAll('.shop-category-link');
        allLinks.forEach(link => link.classList.remove('active'));

        // Adicionar active ao clicado
        linkElement.classList.add('active');

        // Atualizar filtro
        this.filters.category = category;
        this.applyFilters();
    }

    applyPriceFilter() {
        const priceMin = document.getElementById('priceMin').value;
        const priceMax = document.getElementById('priceMax').value;

        this.filters.priceMin = priceMin;
        this.filters.priceMax = priceMax;
        this.applyFilters();
    }

    updateBrands() {
        const brandCheckboxes = this.sidebar.querySelectorAll('.shop-brand-checkbox input:checked');
        this.filters.brands = Array.from(brandCheckboxes).map(cb => cb.value);
        this.applyFilters();
    }

    applyFilters() {
        // Disparar evento customizado com os filtros
        const event = new CustomEvent('shopFiltersChanged', {
            detail: this.filters
        });
        window.dispatchEvent(event);

        console.log('Filtros aplicados:', this.filters);
    }

    clearAllFilters() {
        // Limpar todos os filtros
        this.filters = {
            category: 'all',
            priceMin: '',
            priceMax: '',
            brands: [],
            search: ''
        };

        // Limpar UI
        document.getElementById('priceMin').value = '';
        document.getElementById('priceMax').value = '';
        document.getElementById('shopSearchInput').value = '';

        const brandCheckboxes = this.sidebar.querySelectorAll('.shop-brand-checkbox input');
        brandCheckboxes.forEach(cb => cb.checked = false);

        // Selecionar "Todas"
        const allLink = this.sidebar.querySelector('[data-category="all"]');
        const allLinks = this.sidebar.querySelectorAll('.shop-category-link');
        allLinks.forEach(link => link.classList.remove('active'));
        if (allLink) allLink.classList.add('active');

        this.applyFilters();
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/admin/products');
            if (response.ok) {
                const data = await response.json();
                this.updateCategoryCounts(data.products);
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    updateCategoryCounts(products) {
        // Contar produtos por categoria
        const counts = {};
        products.forEach(product => {
            const category = product.category;
            counts[category] = (counts[category] || 0) + 1;
        });

        // Atualizar badges
        document.getElementById('allCount').textContent = products.length;
        
        Object.keys(counts).forEach(category => {
            const countId = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + 'Count';
            const element = document.getElementById(countId);
            if (element) {
                element.textContent = counts[category];
            }
        });
    }
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.shopSidebarInstance = new ShopSidebar();
    });
} else {
    window.shopSidebarInstance = new ShopSidebar();
}

window.ShopSidebar = ShopSidebar;


