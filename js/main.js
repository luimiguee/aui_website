// Main JavaScript - Homepage
const API_URL = 'http://localhost:3000/api';

// Estado Global
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentCategory = 'all';
let currentSort = 'newest';

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
    setupEventListeners();
    updateCartCount();
    updateFavoritesCount();
    checkUserAuth();
});

// ================ SETUP ================

function setupEventListeners() {
    // Pesquisa
    document.getElementById('searchInput')?.addEventListener('input', debounce(handleSearch, 300));
    
    // Ordenação
    document.getElementById('sortSelect')?.addEventListener('change', handleSort);
    
    // Carrinho
    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeCart')?.addEventListener('click', closeCart);
    document.getElementById('cartBackdrop')?.addEventListener('click', closeCart);
    
    // Favoritos
    document.getElementById('favoritesBtn')?.addEventListener('click', showFavorites);
    
    // Newsletter
    document.querySelector('.newsletter-form')?.addEventListener('submit', handleNewsletter);
    
    // Formulário de contacto
    document.getElementById('contactForm')?.addEventListener('submit', handleContactForm);
}

// ================ PRODUTOS ================

async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>A carregar produtos...</p></div>';
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/products`);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Products data:', data);
        
        if (data.success && data.products) {
            products = data.products.filter(p => p.isActive);
            console.log('Products loaded:', products.length);
            renderCategories();
            renderProducts();
            loadCarousel(); // Carregar carousel com produtos em destaque
        } else {
            console.error('No products or not successful');
            showEmptyState();
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showEmptyState();
        showToast('Erro ao carregar produtos. Verifique se o servidor está ativo.', 'error');
    }
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    // Obter categorias únicas
    const categories = ['all', ...new Set(products.map(p => p.category))];
    
    grid.innerHTML = categories.map(category => `
        <div class="category-card ${category === currentCategory ? 'active' : ''}" 
             onclick="filterByCategory('${category}')">
            <div class="category-icon">
                <i class="fas fa-${getCategoryIcon(category)}"></i>
            </div>
            <h3>${category === 'all' ? 'Todos' : category}</h3>
        </div>
    `).join('');
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;
    
    // Filtrar produtos
    let filteredProducts = products;
    
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }
    
    // Pesquisa
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Ordenar
    filteredProducts = sortProducts(filteredProducts, currentSort);
    
    // Renderizar
    if (filteredProducts.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="viewProduct('${product._id}')">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Produto'">
                ${product.stock < 10 ? '<span class="product-badge">Últimas Unidades</span>' : ''}
                <button class="product-favorite ${favorites.includes(product._id) ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite('${product._id}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-body">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || 'Produto de qualidade premium'}</p>
                <div class="product-footer">
                    <div>
                        <div class="product-price">${product.price.toFixed(2)}€</div>
                        <div class="product-stock ${product.stock < 10 ? 'low' : ''}">
                            ${product.stock > 0 ? `Stock: ${product.stock}` : 'Esgotado'}
                        </div>
                    </div>
                </div>
            </div>
            <div style="padding: 0 var(--space-5) var(--space-5);">
                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${product._id}')" 
                        ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${product.stock === 0 ? 'Esgotado' : 'Adicionar'}
                </button>
            </div>
        </div>
    `).join('');
}

function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'newest':
        default:
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

function filterByCategory(category) {
    currentCategory = category;
    renderCategories();
    renderProducts();
}

function handleSearch() {
    renderProducts();
}

function handleSort(e) {
    currentSort = e.target.value;
    renderProducts();
}

function showEmptyState() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
}

function getCategoryIcon(category) {
    const icons = {
        'all': 'th',
        'Eletrónicos': 'laptop',
        'Computadores': 'desktop',
        'Periféricos': 'keyboard',
        'Gaming': 'gamepad',
        'Áudio': 'headphones',
        'Acessórios': 'plug',
        'Smartphones': 'mobile-alt'
    };
    return icons[category] || 'box';
}

// ================ MODAL DE PRODUTO ================

async function viewProduct(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');
    
    content.innerHTML = `
        <div class="product-modal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); padding: var(--space-8);">
            <div>
                <img src="${product.image}" alt="${product.name}" 
                     style="width: 100%; border-radius: var(--radius-xl);"
                     onerror="this.src='https://via.placeholder.com/600x600?text=Produto'">
            </div>
            <div>
                <span class="badge badge-primary">${product.category}</span>
                <h2 style="margin: var(--space-4) 0;">${product.name}</h2>
                <p style="color: var(--gray-600); margin-bottom: var(--space-6);">
                    ${product.description || 'Produto de qualidade premium com as melhores características do mercado.'}
                </p>
                
                <div style="margin-bottom: var(--space-6);">
                    <div style="font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--primary-600); margin-bottom: var(--space-3);">
                        ${product.price.toFixed(2)}€
                    </div>
                    <div style="color: ${product.stock < 10 ? 'var(--error)' : 'var(--success)'}; font-weight: var(--font-semibold);">
                        <i class="fas fa-${product.stock > 0 ? 'check-circle' : 'times-circle'}"></i>
                        ${product.stock > 0 ? `${product.stock} unidades disponíveis` : 'Esgotado'}
                    </div>
                </div>
                
                <div style="margin-bottom: var(--space-6);">
                    <p style="margin-bottom: var(--space-3);"><strong>SKU:</strong> ${product.sku}</p>
                    <p><strong>Categoria:</strong> ${product.category}</p>
                </div>
                
                <div style="display: flex; gap: var(--space-3);">
                    <button class="btn btn-primary btn-lg" onclick="addToCart('${product._id}'); closeProductModal();" 
                            style="flex: 1;" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                    </button>
                    <button class="btn btn-outline btn-lg ${favorites.includes(product._id) ? 'active' : ''}" 
                            onclick="toggleFavorite('${product._id}'); updateModalFavorite(this);">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal')?.classList.remove('active');
}

function updateModalFavorite(btn) {
    btn.classList.toggle('active');
}

// ================ CARRINHO ================

function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product || product.stock === 0) return;
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showToast('Stock insuficiente', 'warning');
            return;
        }
    } else {
        cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            maxStock: product.stock
        });
    }
    
    saveCart();
    updateCartCount();
    renderCartItems();
    showToast('Produto adicionado ao carrinho', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartCount();
    renderCartItems();
    showToast('Produto removido do carrinho', 'info');
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.productId === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.maxStock) {
        showToast('Stock insuficiente', 'warning');
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>O seu carrinho está vazio</p>
                <a href="#products" class="btn btn-primary btn-sm" onclick="closeCart()">Ver Produtos</a>
            </div>
        `;
        cartFooter.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
                 onerror="this.src='https://via.placeholder.com/80'">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)}€</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.productId}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span style="min-width: 30px; text-align: center; font-weight: var(--font-semibold);">
                        ${item.quantity}
                    </span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.productId}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.productId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('totalPrice').textContent = `${total.toFixed(2)}€`;
    cartFooter.style.display = 'block';
}

function openCart() {
    document.getElementById('cartSidebar').classList.add('active');
    document.getElementById('cartBackdrop').classList.add('active');
    renderCartItems();
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartBackdrop').classList.remove('active');
}

function checkout() {
    if (cart.length === 0) {
        showToast('O carrinho está vazio', 'warning');
        return;
    }
    
    // Verificar se está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Por favor, faça login para continuar', 'info');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=checkout';
        }, 1500);
        return;
    }
    
    // Redirecionar para checkout
    window.location.href = 'checkout.html';
}

// ================ FAVORITOS ================

function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removido dos favoritos', 'info');
    } else {
        favorites.push(productId);
        showToast('Adicionado aos favoritos', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    renderProducts();
}

function updateFavoritesCount() {
    const badge = document.getElementById('favoritesCount');
    if (badge) {
        badge.textContent = favorites.length;
        badge.style.display = favorites.length > 0 ? 'flex' : 'none';
    }
}

function showFavorites() {
    if (favorites.length === 0) {
        showToast('Ainda não tem favoritos', 'info');
        return;
    }
    
    currentCategory = 'all';
    const favProducts = products.filter(p => favorites.includes(p._id));
    
    if (favProducts.length === 0) {
        showToast('Produtos favoritos não disponíveis', 'warning');
        return;
    }
    
    // Scroll para produtos e filtrar
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = favProducts.map(product => `
        <div class="product-card" onclick="viewProduct('${product._id}')">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Produto'">
                <button class="product-favorite active" 
                        onclick="event.stopPropagation(); toggleFavorite('${product._id}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-body">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || 'Produto de qualidade premium'}</p>
                <div class="product-footer">
                    <div>
                        <div class="product-price">${product.price.toFixed(2)}€</div>
                        <div class="product-stock">Stock: ${product.stock}</div>
                    </div>
                </div>
            </div>
            <div style="padding: 0 var(--space-5) var(--space-5);">
                <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${product._id}')" 
                        ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${product.stock === 0 ? 'Esgotado' : 'Adicionar'}
                </button>
            </div>
        </div>
    `).join('');
    
    showToast(`A mostrar ${favProducts.length} favoritos`, 'success');
}

// ================ AUTENTICAÇÃO ================

function checkUserAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (token && user.name) {
        if (userDropdown) {
            userDropdown.innerHTML = `
                <div style="padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--gray-200);">
                    <div style="font-weight: var(--font-semibold);">${user.name}</div>
                    <div style="font-size: var(--text-sm); color: var(--gray-500);">${user.email}</div>
                </div>
                <a href="${user.role === 'admin' || user.role === 'manager' ? 'admin.html' : 'dashboard.html'}">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="#" onclick="event.preventDefault(); logout();">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            `;
        }
    }
}

function logout() {
    if (confirm('Tem a certeza que deseja sair?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Sessão terminada', 'info');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// ================ NEWSLETTER ================

function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (email) {
        showToast('Obrigado por subscrever!', 'success');
        e.target.reset();
    }
}

// ================ CONTACTO ================

async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        date: new Date().toISOString()
    };
    
    try {
        // Simular envio (em produção, enviar para o backend)
        showToast('Mensagem enviada com sucesso! Entraremos em contacto em breve.', 'success');
        document.getElementById('contactForm').reset();
        
        // Em produção, fazer:
        // const response = await fetch(`${API_URL}/contact`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData)
        // });
        
        console.log('Mensagem de contacto:', formData);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        showToast('Erro ao enviar mensagem. Tente novamente.', 'error');
    }
}

// ================ UTILIDADES ================

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : type === 'warning' ? 'var(--warning)' : 'var(--info)'};
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        animation: slideDown 0.3s ease;
        font-weight: var(--font-semibold);
        display: flex;
        align-items: center;
        gap: var(--space-3);
    `;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeProductModal();
    }
}

// ==================== CAROUSEL ====================

let carouselPosition = 0;
let carouselProducts = [];
let carouselInterval;

// Carregar carousel
async function loadCarousel() {
    try {
        // Pegar os primeiros 6 produtos para o carousel
        const productsToShow = products.slice(0, 6);
        carouselProducts = productsToShow;

        const track = document.getElementById('carouselTrack');
        const dotsContainer = document.getElementById('carouselDots');

        if (!track || !dotsContainer) return;

        // Renderizar produtos no carousel
        track.innerHTML = productsToShow.map(product => `
            <div class="carousel-item" onclick="showProductModal('${product._id}')">
                <div class="carousel-item-image">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/400x300?text=Produto'}" 
                         alt="${product.name}">
                    <span class="carousel-item-badge">⭐ Destaque</span>
                </div>
                <div class="carousel-item-content">
                    <div class="carousel-item-category">${product.category}</div>
                    <h3 class="carousel-item-title">${product.name}</h3>
                    <p class="carousel-item-description">${product.description}</p>
                    <div class="carousel-item-footer">
                        <div class="carousel-item-price">${product.price.toFixed(2)}€</div>
                        <div class="carousel-item-actions">
                            <button class="carousel-item-btn" onclick="event.stopPropagation(); toggleFavorite('${product._id}')" title="Favorito">
                                <i class="${favorites.includes(product._id) ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                            <button class="carousel-item-btn" onclick="event.stopPropagation(); addToCart('${product._id}')" title="Adicionar">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Gerar dots
        const itemsPerView = getItemsPerView();
        const dotsCount = Math.ceil(productsToShow.length / itemsPerView);
        
        dotsContainer.innerHTML = '';
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => goToSlide(i);
            dotsContainer.appendChild(dot);
        }

        // Iniciar autoplay
        startCarouselAutoplay();

    } catch (error) {
        console.error('Erro ao carregar carousel:', error);
    }
}

// Mover carousel
function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    const itemsPerView = getItemsPerView();
    const maxPosition = Math.ceil(carouselProducts.length / itemsPerView) - 1;

    carouselPosition += direction;

    if (carouselPosition < 0) {
        carouselPosition = maxPosition;
    } else if (carouselPosition > maxPosition) {
        carouselPosition = 0;
    }

    updateCarouselPosition();
}

// Ir para slide específico
function goToSlide(index) {
    carouselPosition = index;
    updateCarouselPosition();
}

// Atualizar posição do carousel
function updateCarouselPosition() {
    const track = document.getElementById('carouselTrack');
    const itemsPerView = getItemsPerView();
    const itemWidth = 100 / itemsPerView;
    const offset = -(carouselPosition * 100);

    track.style.transform = `translateX(${offset}%)`;

    // Atualizar dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === carouselPosition);
    });

    // Reiniciar autoplay
    stopCarouselAutoplay();
    startCarouselAutoplay();
}

// Itens por visualização (responsivo)
function getItemsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

// Autoplay do carousel
function startCarouselAutoplay() {
    stopCarouselAutoplay();
    carouselInterval = setInterval(() => {
        moveCarousel(1);
    }, 5000); // Muda a cada 5 segundos
}

function stopCarouselAutoplay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// Parar autoplay ao interagir
document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopCarouselAutoplay);
        carouselContainer.addEventListener('mouseleave', startCarouselAutoplay);
    }
});

// Ajustar carousel ao redimensionar janela
window.addEventListener('resize', debounce(() => {
    updateCarouselPosition();
}, 250));

