// Dashboard do Utilizador - Completo e Funcional

let currentUser = null;
let allOrders = [];
let allAddresses = [];
let allPayments = [];
let favorites = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserData();
    setupMenuNavigation();
    setupEventListeners();
    loadFavorites();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    
    // Redirecionar admin/manager para painel admin
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        window.location.href = 'admin.html';
        return;
    }
}

// Load User Data
async function loadUserData() {
    try {
        // Atualizar informações do header
        document.getElementById('sidebarUserName').textContent = currentUser.name;
        document.getElementById('sidebarUserEmail').textContent = currentUser.email;
        
        // Carregar dados
        await Promise.all([
            loadOrders(),
            loadAddresses(),
            loadStats(),
            loadPaymentMethods()
        ]);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Setup Menu Navigation
function setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Se não tem data-section, é um link externo - deixar funcionar normalmente
            if (!item.dataset.section) {
                return; // Não fazer preventDefault, deixar navegação normal
            }
            
            e.preventDefault();
            
            // Remove active de todos
            menuItems.forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            
            // Adiciona active ao clicado
            item.classList.add('active');
            const sectionId = 'section-' + item.dataset.section;
            document.getElementById(sectionId).classList.add('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Load Orders
async function loadOrders() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar pedidos');
        
        allOrders = await response.json();
        
        // Atualizar contadores
        document.getElementById('ordersCount').textContent = allOrders.length;
        
        // Atualizar contadores de filtros
        const statusCounts = {
            all: allOrders.length,
            pending: allOrders.filter(o => o.status === 'pending').length,
            processing: allOrders.filter(o => o.status === 'processing').length,
            shipped: allOrders.filter(o => o.status === 'shipped').length,
            delivered: allOrders.filter(o => o.status === 'delivered').length,
            cancelled: allOrders.filter(o => o.status === 'cancelled').length
        };
        
        Object.keys(statusCounts).forEach(status => {
            const elem = document.getElementById(`filter${status.charAt(0).toUpperCase() + status.slice(1)}Count`);
            if (elem) elem.textContent = statusCounts[status];
        });
        
        // Mostrar pedidos recentes (últimos 5)
        displayRecentOrders();
        
        // Mostrar todos os pedidos
        displayAllOrders();
        
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao carregar pedidos');
    }
}

// Display Recent Orders
function displayRecentOrders() {
    const container = document.getElementById('recentOrdersList');
    const recentOrders = allOrders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-bag"></i><p>Ainda não tens pedidos</p><a href="index.html" class="btn btn-primary">Começar a Comprar</a></div>';
        return;
    }
    
    container.innerHTML = recentOrders.map(order => createOrderCard(order)).join('');
}

// Display All Orders
function displayAllOrders(filter = 'all') {
    const container = document.getElementById('allOrdersList');
    let filteredOrders = allOrders;
    
    if (filter !== 'all') {
        filteredOrders = allOrders.filter(o => o.status === filter);
    }
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Nenhum pedido encontrado</p></div>';
        return;
    }
    
    container.innerHTML = filteredOrders.map(order => createOrderCard(order)).join('');
}

// Create Order Card
function createOrderCard(order) {
    const statusText = {
        pending: 'Pendente',
        processing: 'Em Processamento',
        shipped: 'Enviado',
        delivered: 'Entregue',
        cancelled: 'Cancelado'
    };
    
    const date = new Date(order.createdAt).toLocaleDateString('pt-PT');
    
    return `
        <div class="order-card ${order.status}">
            <div class="order-header">
                <div>
                    <div class="order-number">${order.orderNumber || order._id}</div>
                    <div class="order-date">${date}</div>
                </div>
                <span class="order-status ${order.status}">${statusText[order.status]}</span>
            </div>
            
            <div class="order-items">
                ${(order.items || []).slice(0, 3).map(item => `
                    <img src="${item.product?.imageUrl || '/assets/images/placeholder.jpg'}" 
                         alt="${item.product?.name || 'Produto'}" 
                         class="order-item-preview">
                `).join('')}
                ${(order.items || []).length > 3 ? `<div class="more-items">+${(order.items || []).length - 3}</div>` : ''}
            </div>
            
            <div class="order-footer">
                <div class="order-total">${order.totalAmount.toFixed(2)}€</div>
                <div class="order-actions">
                    <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${order._id}')">
                        <i class="fas fa-eye"></i> Ver Detalhes
                    </button>
                    ${order.status === 'pending' || order.status === 'processing' ? `
                        <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order._id}')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// View Order Details
async function viewOrderDetails(orderId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar detalhes');
        
        const order = await response.json();
        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('orderDetailsContent');
        
        content.innerHTML = `
            <div class="order-details-full">
                <div class="order-summary">
                    <h3>Informações do Pedido</h3>
                    <p><strong>Número:</strong> ${order.orderNumber || order._id}</p>
                    <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString('pt-PT')}</p>
                    <p><strong>Estado:</strong> <span class="order-status ${order.status}">${order.status}</span></p>
                    <p><strong>Pagamento:</strong> ${order.paymentMethod}</p>
                </div>
                
                <div class="shipping-info">
                    <h3>Morada de Entrega</h3>
                    <p>${order.shippingAddress.name}</p>
                    <p>${order.shippingAddress.street}</p>
                    <p>${order.shippingAddress.postalCode} ${order.shippingAddress.city}</p>
                    <p>${order.shippingAddress.country}</p>
                    <p>Tel: ${order.shippingAddress.phone}</p>
                </div>
                
                <div class="order-items-detail">
                    <h3>Produtos</h3>
                    ${(order.items || []).map(item => `
                        <div class="item-detail">
                            <img src="${item.product?.imageUrl || '/assets/images/placeholder.jpg'}" alt="">
                            <div>
                                <strong>${item.product?.name || 'Produto'}</strong>
                                <p>Quantidade: ${item.quantity}</p>
                                <p>Preço: ${item.price.toFixed(2)}€</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-totals">
                    <div><span>Subtotal:</span> <strong>${(order.subtotal || 0).toFixed(2)}€</strong></div>
                    <div><span>Envio:</span> <strong>${(order.shippingCost || 0).toFixed(2)}€</strong></div>
                    ${order.discount > 0 ? `<div><span>Desconto:</span> <strong>-${order.discount.toFixed(2)}€</strong></div>` : ''}
                    <div class="total-line"><span>Total:</span> <strong>${order.totalAmount.toFixed(2)}€</strong></div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao carregar detalhes do pedido');
    }
}

// Cancel Order
async function cancelOrder(orderId) {
    if (!confirm('Tem a certeza que deseja cancelar este pedido?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erro ao cancelar pedido');
        
        showSuccess('Pedido cancelado com sucesso!');
        await loadOrders();
        
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao cancelar pedido');
    }
}

// Load Stats
async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders/stats/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');
        
        const stats = await response.json();
        
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalSpent').textContent = `${(stats.totalSpent || 0).toFixed(2)}€`;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
        document.getElementById('completedOrders').textContent = stats.completedOrders || 0;
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Load Addresses
async function loadAddresses() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/addresses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar moradas');
        
        allAddresses = await response.json();
        
        document.getElementById('addressesCount').textContent = allAddresses.length;
        displayAddresses();
        
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao carregar moradas');
    }
}

// Display Addresses
function displayAddresses() {
    const container = document.getElementById('addressesList');
    
    if (allAddresses.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-map-marker-alt"></i><p>Ainda não tem moradas guardadas</p><button class="btn btn-primary" onclick="showAddAddressModal()"><i class="fas fa-plus"></i> Adicionar Morada</button></div>';
        return;
    }
    
    container.innerHTML = allAddresses.map(addr => `
        <div class="address-card ${addr.isDefault ? 'default' : ''}">
            <h4><i class="fas fa-map-marker-alt"></i> ${addr.name}</h4>
            <p>${addr.street}</p>
            <p>${addr.postalCode} ${addr.city}</p>
            <p>${addr.country}</p>
            <p><i class="fas fa-phone"></i> ${addr.phone}</p>
            <div class="address-actions">
                <button class="btn btn-outline btn-sm" onclick="editAddress('${addr._id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteAddress('${addr._id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Show Add Address Modal
function showAddAddressModal() {
    document.getElementById('addressModalTitle').textContent = 'Nova Morada';
    document.getElementById('addressForm').reset();
    document.getElementById('addressId').value = '';
    document.getElementById('addressModal').classList.add('active');
}

// Edit Address
function editAddress(addressId) {
    const address = allAddresses.find(a => a._id === addressId);
    if (!address) return;
    
    document.getElementById('addressModalTitle').textContent = 'Editar Morada';
    document.getElementById('addressId').value = address._id;
    document.getElementById('addressName').value = address.name;
    document.getElementById('addressPhone').value = address.phone;
    document.getElementById('addressStreet').value = address.street;
    document.getElementById('addressCity').value = address.city;
    document.getElementById('addressPostal').value = address.postalCode;
    document.getElementById('addressCountry').value = address.country;
    document.getElementById('addressDefault').checked = address.isDefault;
    
    document.getElementById('addressModal').classList.add('active');
}

// Delete Address
async function deleteAddress(addressId) {
    if (!confirm('Tem a certeza que deseja eliminar esta morada?')) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/addresses/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Erro ao eliminar morada');
        
        showSuccess('Morada eliminada com sucesso!');
        await loadAddresses();
        
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao eliminar morada');
    }
}

// Close Address Modal
function closeAddressModal() {
    document.getElementById('addressModal').classList.remove('active');
}

// Load Payment Methods (localStorage simulation)
function loadPaymentMethods() {
    const saved = localStorage.getItem('paymentMethods');
    allPayments = saved ? JSON.parse(saved) : [];
    
    document.getElementById('paymentsCount').textContent = allPayments.length;
    displayPaymentMethods();
}

// Display Payment Methods
function displayPaymentMethods() {
    const container = document.getElementById('paymentsList');
    
    if (allPayments.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-credit-card"></i><p>Ainda não tem métodos de pagamento guardados</p><button class="btn btn-primary" onclick="showAddPaymentModal()"><i class="fas fa-plus"></i> Adicionar Método</button></div>';
        return;
    }
    
    container.innerHTML = allPayments.map((payment, index) => `
        <div class="payment-card ${payment.isDefault ? 'default' : ''}">
            <div class="payment-type">
                <span>${getPaymentIcon(payment.type)}</span>
                <span>${payment.isDefault ? '⭐' : ''}</span>
            </div>
            <div class="payment-number">${maskPaymentNumber(payment)}</div>
            <div class="payment-details">
                <div>${payment.name || payment.type.toUpperCase()}</div>
                ${payment.expiry ? `<div>Exp: ${payment.expiry}</div>` : ''}
            </div>
            <div class="payment-actions">
                <button class="btn btn-sm" onclick="deletePayment(${index})">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        </div>
    `).join('');
}

// Get Payment Icon
function getPaymentIcon(type) {
    const icons = {
        card: '<i class="fas fa-credit-card"></i>',
        mbway: '<i class="fas fa-mobile-alt"></i>',
        paypal: '<i class="fab fa-paypal"></i>'
    };
    return icons[type] || '<i class="fas fa-wallet"></i>';
}

// Mask Payment Number
function maskPaymentNumber(payment) {
    if (payment.type === 'card') {
        return `•••• •••• •••• ${payment.number.slice(-4)}`;
    } else if (payment.type === 'mbway') {
        return `+351 ${payment.phone.slice(-3)} ••• •••`;
    } else if (payment.type === 'paypal') {
        return payment.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    }
    return '••••';
}

// Show Add Payment Modal
function showAddPaymentModal() {
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentModal').classList.add('active');
}

// Delete Payment
function deletePayment(index) {
    if (!confirm('Tem a certeza que deseja remover este método de pagamento?')) return;
    
    allPayments.splice(index, 1);
    localStorage.setItem('paymentMethods', JSON.stringify(allPayments));
    
    showSuccess('Método de pagamento removido!');
    displayPaymentMethods();
}

// Close Payment Modal
function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

// Close Order Details Modal
function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').classList.remove('active');
}

// Load Favorites
function loadFavorites() {
    const saved = localStorage.getItem('favorites');
    favorites = saved ? JSON.parse(saved) : [];
    
    document.getElementById('favoritesCount').textContent = favorites.length;
    displayFavorites();
}

// Display Favorites
async function displayFavorites() {
    const container = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-heart"></i><p>Ainda não tem favoritos</p><a href="index.html" class="btn btn-primary">Explorar Produtos</a></div>';
        return;
    }
    
    try {
        const products = await Promise.all(
            favorites.map(id => fetch(`/api/admin/products`).then(r => r.json()))
        );
        
        // Flatten e filtrar produtos existentes
        const allProducts = products[0]?.products || [];
        const favoriteProducts = allProducts.filter(p => favorites.includes(p._id));
        
        container.innerHTML = favoriteProducts.map(product => `
            <div class="favorite-card">
                <img src="${product.imageUrl || '/assets/images/placeholder.jpg'}" 
                     alt="${product.name}" 
                     class="favorite-image">
                <div class="favorite-content">
                    <h4>${product.name}</h4>
                    <div class="favorite-price">${product.price.toFixed(2)}€</div>
                    <div class="order-actions">
                        <button class="btn btn-primary btn-sm btn-full" onclick="addToCartFromFavorites('${product._id}')">
                            <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
                        </button>
                        <button class="btn btn-danger btn-sm btn-full" onclick="removeFromFavorites('${product._id}')">
                            <i class="fas fa-heart-broken"></i> Remover
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Remove from Favorites
function removeFromFavorites(productId) {
    favorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    showSuccess('Removido dos favoritos!');
    loadFavorites();
}

// Add to Cart from Favorites
function addToCartFromFavorites(productId) {
    // Lógica similar ao main.js
    showSuccess('Produto adicionado ao carrinho!');
}

// Setup Event Listeners
function setupEventListeners() {
    // Address Form
    document.getElementById('addressForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const addressId = document.getElementById('addressId').value;
        const data = {
            name: document.getElementById('addressName').value,
            phone: document.getElementById('addressPhone').value,
            street: document.getElementById('addressStreet').value,
            city: document.getElementById('addressCity').value,
            postalCode: document.getElementById('addressPostal').value,
            country: document.getElementById('addressCountry').value,
            isDefault: document.getElementById('addressDefault').checked
        };
        
        try {
            const token = localStorage.getItem('token');
            const url = addressId ? `/api/users/addresses/${addressId}` : '/api/users/addresses';
            const method = addressId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Erro ao guardar morada');
            
            showSuccess('Morada guardada com sucesso!');
            closeAddressModal();
            await loadAddresses();
            
        } catch (error) {
            console.error('Erro:', error);
            showError('Erro ao guardar morada');
        }
    });
    
    // Payment Form
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = document.getElementById('paymentType').value;
        const payment = {
            type,
            isDefault: document.getElementById('paymentDefault').checked
        };
        
        if (type === 'card') {
            payment.number = document.getElementById('cardNumber').value;
            payment.expiry = document.getElementById('cardExpiry').value;
            payment.name = document.getElementById('cardName').value;
        } else if (type === 'mbway') {
            payment.phone = document.getElementById('mbwayPhone').value;
        } else if (type === 'paypal') {
            payment.email = document.getElementById('paypalEmail').value;
        }
        
        allPayments.push(payment);
        localStorage.setItem('paymentMethods', JSON.stringify(allPayments));
        
        showSuccess('Método de pagamento adicionado!');
        closePaymentModal();
        displayPaymentMethods();
    });
    
    // Payment Type Change
    document.getElementById('paymentType').addEventListener('change', (e) => {
        const type = e.target.value;
        
        document.getElementById('cardFields').style.display = type === 'card' ? 'block' : 'none';
        document.getElementById('mbwayFields').style.display = type === 'mbway' ? 'block' : 'none';
        document.getElementById('paypalFields').style.display = type === 'paypal' ? 'block' : 'none';
    });
    
    // Profile Form
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('profileName').value,
            email: document.getElementById('profileEmail').value
        };
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Erro ao atualizar perfil');
            
            const updatedUser = await response.json();
            
            // Atualizar localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            currentUser = updatedUser;
            
            // Atualizar UI
            document.getElementById('sidebarUserName').textContent = updatedUser.name;
            document.getElementById('sidebarUserEmail').textContent = updatedUser.email;
            
            showSuccess('Perfil atualizado com sucesso!');
            
        } catch (error) {
            console.error('Erro:', error);
            showError('Erro ao atualizar perfil');
        }
    });
    
    // Password Form
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            showError('As senhas não coincidem!');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            
            if (!response.ok) throw new Error('Erro ao alterar senha');
            
            showSuccess('Senha alterada com sucesso!');
            document.getElementById('passwordForm').reset();
            
        } catch (error) {
            console.error('Erro:', error);
            showError('Erro ao alterar senha');
        }
    });
    
    // Order Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            displayAllOrders(filter);
        });
    });
    
    // Load profile data
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
}

// Cancel Profile Edit
function cancelProfileEdit() {
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
}

// Logout
function logout() {
    if (confirm('Tem a certeza que deseja sair?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// Show Success
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show Error
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #EF4444;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .empty-state {
        text-align: center;
        padding: var(--space-16);
        color: var(--gray-600);
    }
    
    .empty-state i {
        font-size: var(--text-6xl);
        margin-bottom: var(--space-4);
        background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .order-details-full h3 {
        margin: var(--space-6) 0 var(--space-4) 0;
        color: var(--gray-900);
    }
    
    .item-detail {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-4);
        background: var(--gray-50);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-3);
    }
    
    .item-detail img {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-lg);
        object-fit: cover;
    }
    
    .order-totals {
        margin-top: var(--space-6);
        padding: var(--space-4);
        background: var(--gray-50);
        border-radius: var(--radius-lg);
    }
    
    .order-totals > div {
        display: flex;
        justify-content: space-between;
        padding: var(--space-2) 0;
    }
    
    .total-line {
        border-top: 2px solid var(--gray-200);
        margin-top: var(--space-2);
        padding-top: var(--space-3) !important;
        font-size: var(--text-xl);
        font-weight: var(--font-bold);
        color: var(--primary-600);
    }
`;
document.head.appendChild(style);
