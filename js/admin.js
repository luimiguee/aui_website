// Configuração da API
const API_URL = 'http://localhost:3000/api';
let currentUser = null;

// Verificar autenticação ao carregar
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se está autenticado
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Verificar se tem permissões de admin/manager
    if (user.role !== 'admin' && user.role !== 'manager') {
        showMessage('Sem permissões para aceder ao painel admin', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }

    currentUser = user;
    document.getElementById('adminName').textContent = user.name;

    // Atualizar perfil nas definições
    if (document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        // Atualizar foto de perfil
        const photoUrl = user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=120&background=6366f1&color=fff`;
        document.getElementById('profilePhotoPreview').src = photoUrl;
    }

    // Carregar dados iniciais
    await loadDashboardStats();
    await loadUsers();
    await loadProducts();
    await loadOrders();

    // Configurar navegação
    setupNavigation();
    setupForms();
});

// Configurar navegação entre secções
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            
            // Atualizar navegação ativa
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar secção correspondente
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(`section-${section}`).classList.add('active');
            
            // Atualizar título
            const titles = {
                'dashboard': 'Dashboard',
                'users': 'Gestão de Utilizadores',
                'products': 'Gestão de Produtos',
                'orders': 'Gestão de Pedidos',
                'settings': 'Definições'
            };
            document.getElementById('pageTitle').textContent = titles[section];
        });
    });
}

// Configurar formulários
function setupForms() {
    // Form de editar role
    document.getElementById('userRoleForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await updateUserRole();
    });

    // Form de produto
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveProduct();
    });

    // Form de editar perfil
    document.getElementById('editProfileForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await updateProfile();
    });

    // Form de alterar password
    document.getElementById('changePasswordForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await changePassword();
    });

    // Upload de foto
    document.getElementById('photoUpload')?.addEventListener('change', handlePhotoUpload);
}

// ================ DASHBOARD ================

async function loadDashboardStats() {
    try {
        const response = await fetchAPI('/admin/stats');
        if (response.success) {
            const stats = response.stats;
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('totalProducts').textContent = stats.totalProducts;
            document.getElementById('totalOrders').textContent = stats.totalOrders;
            document.getElementById('totalRevenue').textContent = `${stats.totalRevenue}€`;
            document.getElementById('lowStockCount').textContent = stats.lowStockProducts;
            document.getElementById('pendingOrders').textContent = stats.pendingOrders;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// ================ GESTÃO DE UTILIZADORES ================

async function loadUsers() {
    try {
        const response = await fetchAPI('/admin/users');
        if (response.success) {
            renderUsersTable(response.users);
        }
    } catch (error) {
        console.error('Erro ao carregar utilizadores:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Erro ao carregar utilizadores</td></tr>';
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum utilizador encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge badge-${getRoleBadgeClass(user.role)}">${translateRole(user.role)}</span></td>
            <td><small>${(user.permissions || []).map(p => translatePermission(p)).join(', ') || 'Nenhuma'}</small></td>
            <td>
                <span class="badge ${user.isActive ? 'badge-success' : 'badge-danger'}">
                    ${user.isActive ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="editUserRole('${user._id}')" title="Editar Role">
                    <i class="fas fa-user-edit"></i>
                </button>
                <button class="btn-icon" onclick="toggleUserStatus('${user._id}', ${!user.isActive})" title="${user.isActive ? 'Desativar' : 'Ativar'}">
                    <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
                </button>
                ${user._id !== currentUser.id ? `
                <button class="btn-icon btn-danger" onclick="deleteUser('${user._id}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

async function editUserRole(userId) {
    try {
        const response = await fetchAPI('/admin/users');
        const user = response.users.find(u => u._id === userId);
        
        if (!user) return;

        document.getElementById('editUserId').value = userId;
        document.getElementById('userRole').value = user.role;
        
        // Marcar permissões
        document.querySelectorAll('input[name="permissions"]').forEach(checkbox => {
            checkbox.checked = (user.permissions || []).includes(checkbox.value);
        });

        openModal('userRoleModal');
    } catch (error) {
        console.error('Erro ao carregar utilizador:', error);
        showMessage('Erro ao carregar dados do utilizador', 'error');
    }
}

async function updateUserRole() {
    const userId = document.getElementById('editUserId').value;
    const role = document.getElementById('userRole').value;
    const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
        .map(cb => cb.value);

    try {
        const response = await fetchAPI(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role, permissions })
        });

        if (response.success) {
            showMessage('Utilizador atualizado com sucesso', 'success');
            closeModal('userRoleModal');
            await loadUsers();
        } else {
            showMessage(response.message || 'Erro ao atualizar utilizador', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao atualizar utilizador', 'error');
    }
}

async function toggleUserStatus(userId, isActive) {
    if (!confirm(`Tem a certeza que deseja ${isActive ? 'ativar' : 'desativar'} este utilizador?`)) {
        return;
    }

    try {
        const response = await fetchAPI(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive })
        });

        if (response.success) {
            showMessage(`Utilizador ${isActive ? 'ativado' : 'desativado'} com sucesso`, 'success');
            await loadUsers();
        } else {
            showMessage(response.message || 'Erro ao atualizar status', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao atualizar status', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Tem a certeza que deseja eliminar este utilizador? Esta ação não pode ser revertida.')) {
        return;
    }

    try {
        const response = await fetchAPI(`/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showMessage('Utilizador eliminado com sucesso', 'success');
            await loadUsers();
        } else {
            showMessage(response.message || 'Erro ao eliminar utilizador', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao eliminar utilizador', 'error');
    }
}

// ================ GESTÃO DE PRODUTOS ================

async function loadProducts() {
    try {
        const response = await fetchAPI('/admin/products');
        if (response.success) {
            renderProductsTable(response.products);
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('productsTableBody').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Erro ao carregar produtos</td></tr>';
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum produto encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.sku}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price.toFixed(2)}€</td>
            <td>
                <span class="badge ${product.stock < 10 ? 'badge-danger' : 'badge-success'}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <span class="badge ${product.isActive ? 'badge-success' : 'badge-danger'}">
                    ${product.isActive ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="editProduct('${product._id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteProduct('${product._id}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Adicionar Produto';
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    openModal('productModal');
}

async function editProduct(productId) {
    try {
        const response = await fetchAPI('/admin/products');
        const product = response.products.find(p => p._id === productId);
        
        if (!product) return;

        document.getElementById('productModalTitle').textContent = 'Editar Produto';
        document.getElementById('editProductId').value = productId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productSKU').value = product.sku;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image || '';

        openModal('productModal');
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        showMessage('Erro ao carregar dados do produto', 'error');
    }
}

async function saveProduct() {
    const productId = document.getElementById('editProductId').value;
    const productData = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSKU').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value || undefined
    };

    try {
        const url = productId ? `/admin/products/${productId}` : '/admin/products';
        const method = productId ? 'PUT' : 'POST';

        const response = await fetchAPI(url, {
            method,
            body: JSON.stringify(productData)
        });

        if (response.success) {
            showMessage(`Produto ${productId ? 'atualizado' : 'criado'} com sucesso`, 'success');
            closeModal('productModal');
            await loadProducts();
            await loadDashboardStats();
        } else {
            showMessage(response.message || 'Erro ao guardar produto', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao guardar produto', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Tem a certeza que deseja eliminar este produto?')) {
        return;
    }

    try {
        const response = await fetchAPI(`/admin/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showMessage('Produto eliminado com sucesso', 'success');
            await loadProducts();
            await loadDashboardStats();
        } else {
            showMessage(response.message || 'Erro ao eliminar produto', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao eliminar produto', 'error');
    }
}

// ================ GESTÃO DE PEDIDOS ================

async function loadOrders() {
    try {
        const response = await fetchAPI('/admin/orders');
        if (response.success) {
            renderOrdersTable(response.orders);
        }
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        document.getElementById('ordersTableBody').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Erro ao carregar pedidos</td></tr>';
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum pedido encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.orderNumber}</strong></td>
            <td>${order.customer?.name || 'N/A'}</td>
            <td>${order.totalAmount.toFixed(2)}€</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value, '${order.paymentStatus}')">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendente</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>A Processar</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregue</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                </select>
            </td>
            <td>
                <span class="badge badge-${getPaymentBadgeClass(order.paymentStatus)}">
                    ${translatePaymentStatus(order.paymentStatus)}
                </span>
            </td>
            <td>${new Date(order.createdAt).toLocaleDateString('pt-PT')}</td>
            <td>
                <button class="btn-icon" onclick="viewOrderDetails('${order._id}')" title="Ver Detalhes">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(orderId, status, paymentStatus) {
    try {
        const response = await fetchAPI(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, paymentStatus })
        });

        if (response.success) {
            showMessage('Status do pedido atualizado', 'success');
            await loadDashboardStats();
        } else {
            showMessage(response.message || 'Erro ao atualizar status', 'error');
            await loadOrders(); // Recarregar para reverter mudança visual
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao atualizar status', 'error');
        await loadOrders();
    }
}

function openAddOrderModal() {
    showMessage('Funcionalidade de adicionar pedido em desenvolvimento', 'info');
}

function viewOrderDetails(orderId) {
    showMessage('Detalhes do pedido em desenvolvimento', 'info');
}

// ================ HELPER FUNCTIONS ================

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        ...options
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
        showMessage('Sessão expirada. Por favor, faça login novamente.', 'error');
        setTimeout(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        }, 2000);
        throw new Error('Unauthorized');
    }

    return await response.json();
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : type === 'error' ? 'background: #ef4444;' : 'background: #3b82f6;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function logout() {
    if (confirm('Tem a certeza que deseja sair?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Traduções
function translateRole(role) {
    const roles = { 'user': 'Utilizador', 'manager': 'Gestor', 'admin': 'Administrador' };
    return roles[role] || role;
}

function translatePermission(perm) {
    const perms = {
        'manage_users': 'Utilizadores',
        'manage_products': 'Produtos',
        'manage_orders': 'Pedidos',
        'view_reports': 'Relatórios',
        'manage_settings': 'Definições'
    };
    return perms[perm] || perm;
}

function translatePaymentStatus(status) {
    const statuses = {
        'pending': 'Pendente',
        'paid': 'Pago',
        'failed': 'Falhou',
        'refunded': 'Reembolsado'
    };
    return statuses[status] || status;
}

function getRoleBadgeClass(role) {
    const classes = { 'admin': 'danger', 'manager': 'warning', 'user': 'info' };
    return classes[role] || 'secondary';
}

function getPaymentBadgeClass(status) {
    const classes = { 'paid': 'success', 'pending': 'warning', 'failed': 'danger', 'refunded': 'info' };
    return classes[status] || 'secondary';
}

// ================ SETTINGS / DEFINIÇÕES ================

function openEditProfileModal() {
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editEmail').value = currentUser.email;
    openModal('editProfileModal');
}

async function updateProfile() {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;

    try {
        const response = await fetchAPI(`/admin/users/${currentUser.id}/profile`, {
            method: 'PUT',
            body: JSON.stringify({ name, email })
        });

        if (response.success) {
            currentUser.name = name;
            currentUser.email = email;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            document.getElementById('adminName').textContent = name;
            document.getElementById('profileName').textContent = name;
            document.getElementById('profileEmail').textContent = email;
            
            showMessage('Perfil atualizado com sucesso', 'success');
            closeModal('editProfileModal');
        } else {
            showMessage(response.message || 'Erro ao atualizar perfil', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao atualizar perfil', 'error');
    }
}

function openChangePasswordModal() {
    document.getElementById('changePasswordForm').reset();
    openModal('changePasswordModal');
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showMessage('As passwords não coincidem', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('A password deve ter pelo menos 6 caracteres', 'error');
        return;
    }

    try {
        const response = await fetchAPI(`/admin/users/${currentUser.id}/password`, {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (response.success) {
            showMessage('Password alterada com sucesso', 'success');
            closeModal('changePasswordModal');
            document.getElementById('changePasswordForm').reset();
        } else {
            showMessage(response.message || 'Erro ao alterar password', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao alterar password', 'error');
    }
}

async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showMessage('A imagem deve ter no máximo 2MB', 'error');
        return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
        showMessage('Por favor selecione uma imagem', 'error');
        return;
    }

    // Converter para base64 para preview
    const reader = new FileReader();
    reader.onload = function(event) {
        document.getElementById('profilePhotoPreview').src = event.target.result;
        
        // Guardar no localStorage temporariamente
        currentUser.photo = event.target.result;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        showMessage('Foto de perfil atualizada', 'success');
    };
    reader.readAsDataURL(file);
}

function saveStoreSettings() {
    const settings = {
        storeName: document.getElementById('storeName').value,
        storeEmail: document.getElementById('storeEmail').value,
        storeCurrency: document.getElementById('storeCurrency').value
    };

    localStorage.setItem('storeSettings', JSON.stringify(settings));
    showMessage('Definições da loja guardadas', 'success');
}

function clearCache() {
    if (confirm('Tem a certeza que deseja limpar a cache?')) {
        // Manter apenas o essencial
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        localStorage.clear();
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', user);
        
        showMessage('Cache limpa com sucesso', 'success');
        setTimeout(() => window.location.reload(), 1000);
    }
}

function exportData() {
    if (confirm('Deseja exportar todos os dados do sistema?')) {
        const data = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            note: 'Exportação de dados do sistema'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aui-store-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showMessage('Dados exportados com sucesso', 'success');
    }
}

