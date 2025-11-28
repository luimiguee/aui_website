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
    await loadLogsStats();

    // Configurar navegação
    setupNavigation();
    setupForms();
});

// Configurar navegação entre secções
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    
    navItems.forEach((item, index) => {
        // Adicionar animação inicial com delay
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            
            // Não fazer nada se já está ativo
            if (this.classList.contains('active')) return;
            
            // Atualizar navegação ativa com animação
            navItems.forEach(nav => {
                nav.classList.remove('active');
                nav.style.transform = 'translateX(0)';
            });
            this.classList.add('active');
            
            // Animação de saída da secção atual
            const currentSection = document.querySelector('.content-section.active');
            if (currentSection) {
                currentSection.style.animation = 'fadeOutLeft 0.3s ease';
                setTimeout(() => {
                    currentSection.classList.remove('active');
                    currentSection.style.animation = '';
                }, 300);
            }
            
            // Mostrar nova secção com animação
            setTimeout(() => {
                const newSection = document.getElementById(`section-${section}`);
                newSection.classList.add('active');
                newSection.style.animation = 'fadeInRight 0.4s ease';
            }, 300);
            
            // Carregar dados específicos da seção
            if (section === 'tickets') {
                loadTickets();
            } else if (section === 'logs') {
                loadLogs();
            }

            // Atualizar título com animação
            const titles = {
                'dashboard': 'Dashboard',
                'users': 'Gestão de Utilizadores',
                'products': 'Gestão de Produtos',
                'orders': 'Gestão de Pedidos',
                'tickets': 'Tickets de Suporte',
                'settings': 'Definições',
                'logs': 'Logs do Sistema'
            };
            const titleElement = document.getElementById('pageTitle');
            titleElement.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                titleElement.textContent = titles[section];
                titleElement.style.animation = 'fadeIn 0.3s ease';
            }, 200);
        });
        
        // Efeito de ripple ao clicar
        item.addEventListener('mousedown', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(99, 102, 241, 0.5);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                animation: rippleEffect 0.6s ease-out;
            `;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Adicionar CSS das animações dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeOutLeft {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-30px);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes rippleEffect {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

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

// ================ LOGS DO SISTEMA ================

async function loadLogs(page = 1) {
    const level = document.getElementById('logLevelFilter').value;
    const type = document.getElementById('logTypeFilter').value;
    
    try {
        let url = `/logs?page=${page}&limit=50`;
        if (level) url += `&level=${level}`;
        if (type) url += `&type=${type}`;
        
        const response = await fetchAPI(url);
        
        if (response.success) {
            renderLogsTable(response.logs);
            renderLogsPagination(response.pagination);
        }
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
    }
}

async function loadLogsStats() {
    try {
        const response = await fetchAPI('/logs/stats');
        if (response.success) {
            document.getElementById('totalLogs').textContent = response.stats.total;
            const errors = response.stats.byLevel.find(l => l._id === 'error');
            document.getElementById('errorLogs').textContent = errors ? errors.count : 0;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas dos logs:', error);
    }
}

function renderLogsTable(logs) {
    const tbody = document.getElementById('logsTableBody');
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum log encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map(log => `
        <tr>
            <td>${new Date(log.timestamp).toLocaleString('pt-PT')}</td>
            <td><span class="badge badge-${getLogLevelBadge(log.level)}">${log.level}</span></td>
            <td>${log.type}</td>
            <td><small>${log.action}</small></td>
            <td>${log.message}</td>
            <td>${log.userName || 'Sistema'}</td>
            <td>
                <button class="btn-icon" onclick="viewLogDetails('${log._id}')" title="Ver Detalhes">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderLogsPagination(pagination) {
    const container = document.getElementById('logsPagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-buttons">';
    for (let i = 1; i <= Math.min(pagination.pages, 10); i++) {
        html += `<button class="btn ${i === pagination.page ? 'btn-primary' : 'btn-secondary'}" 
                         onclick="loadLogs(${i})">${i}</button>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

function getLogLevelBadge(level) {
    const badges = {
        'info': 'info',
        'success': 'success',
        'warn': 'warning',
        'error': 'danger',
        'debug': 'secondary'
    };
    return badges[level] || 'secondary';
}

async function viewLogDetails(logId) {
    try {
        const response = await fetchAPI(`/logs/${logId}`);
        if (response.success) {
            const log = response.log;
            alert(`Log Completo:\n\n${JSON.stringify(log, null, 2)}`);
        }
    } catch (error) {
        showMessage('Erro ao carregar detalhes do log', 'error');
    }
}

async function exportLogs() {
    const level = document.getElementById('logLevelFilter').value;
    const type = document.getElementById('logTypeFilter').value;
    
    let url = '/api/logs/export/csv?';
    if (level) url += `level=${level}&`;
    if (type) url += `type=${type}&`;
    
    window.open(url, '_blank');
    showMessage('A exportar logs...', 'info');
}

// ==================== TICKETS FUNCTIONS ====================

let allTickets = [];

async function loadTickets() {
    try {
        const token = localStorage.getItem('token');
        
        // Load stats
        const statsResponse = await fetch(`${API_URL}/tickets/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('adminTotalTickets').textContent = stats.total || 0;
            document.getElementById('adminOpenTickets').textContent = stats.open || 0;
            document.getElementById('adminProgressTickets').textContent = stats.in_progress || 0;
            document.getElementById('adminUrgentTickets').textContent = stats.urgent || 0;
        }

        // Load tickets
        const response = await fetch(`${API_URL}/tickets/admin/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar tickets');

        allTickets = await response.json();
        displayTickets(allTickets);

    } catch (error) {
        console.error('Error loading tickets:', error);
        showMessage('Erro ao carregar tickets', 'error');
    }
}

function displayTickets(tickets) {
    const tbody = document.getElementById('ticketsTableBody');
    
    if (tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum ticket encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = tickets.map(ticket => `
        <tr>
            <td><strong>${ticket.ticketNumber}</strong></td>
            <td>${ticket.user?.name || 'N/A'}</td>
            <td>${ticket.subject}</td>
            <td>${getCategoryLabel(ticket.category)}</td>
            <td>${getPriorityBadge(ticket.priority)}</td>
            <td>${getStatusBadge(ticket.status)}</td>
            <td>${ticket.assignedTo?.name || '-'}</td>
            <td>${new Date(ticket.createdAt).toLocaleDateString('pt-PT')}</td>
            <td class="actions">
                <button class="btn-icon" title="Ver Detalhes" onclick="viewTicketAdmin('${ticket._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${!ticket.assignedTo ? `
                <button class="btn-icon" title="Atribuir a Mim" onclick="assignTicketToMe('${ticket._id}')">
                    <i class="fas fa-user-plus"></i>
                </button>
                ` : ''}
                ${ticket.status !== 'resolved' ? `
                <button class="btn-icon btn-success" title="Resolver" onclick="resolveTicket('${ticket._id}')">
                    <i class="fas fa-check"></i>
                </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

function getCategoryLabel(category) {
    const categories = {
        technical: '🔧 Técnico',
        billing: '💰 Faturação',
        orders: '📦 Pedidos',
        account: '👤 Conta',
        products: '🛍️ Produtos',
        shipping: '🚚 Envios',
        returns: '↩️ Devoluções',
        other: '📝 Outro'
    };
    return categories[category] || category;
}

function getPriorityBadge(priority) {
    const badges = {
        low: '<span class="badge badge-secondary">Baixa</span>',
        medium: '<span class="badge badge-info">Média</span>',
        high: '<span class="badge badge-warning">Alta</span>',
        urgent: '<span class="badge badge-error">Urgente</span>'
    };
    return badges[priority] || priority;
}

function getStatusBadge(status) {
    const badges = {
        open: '<span class="badge badge-info">Aberto</span>',
        in_progress: '<span class="badge badge-warning">Em Progresso</span>',
        waiting_response: '<span class="badge" style="background:#06b6d4;color:white;">Aguardando</span>',
        resolved: '<span class="badge badge-success">Resolvido</span>',
        closed: '<span class="badge badge-secondary">Fechado</span>'
    };
    return badges[status] || status;
}

function filterTickets() {
    const status = document.getElementById('ticketStatusFilter').value;
    const priority = document.getElementById('ticketPriorityFilter').value;
    const category = document.getElementById('ticketCategoryFilter').value;

    let filtered = allTickets;

    if (status) {
        filtered = filtered.filter(t => t.status === status);
    }
    if (priority) {
        filtered = filtered.filter(t => t.priority === priority);
    }
    if (category) {
        filtered = filtered.filter(t => t.category === category);
    }

    displayTickets(filtered);
}

async function viewTicketAdmin(ticketId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar ticket');

        const ticket = await response.json();

        let details = `
TICKET: ${ticket.ticketNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cliente: ${ticket.user?.name} (${ticket.user?.email})
Assunto: ${ticket.subject}
Categoria: ${getCategoryLabel(ticket.category)}
Prioridade: ${ticket.priority}
Estado: ${ticket.status}
Criado: ${new Date(ticket.createdAt).toLocaleString('pt-PT')}
Atribuído: ${ticket.assignedTo?.name || 'Não atribuído'}

DESCRIÇÃO:
${ticket.description}

MENSAGENS (${ticket.messages?.length || 0}):
`;

        if (ticket.messages && ticket.messages.length > 0) {
            ticket.messages.forEach(msg => {
                details += `\n[${msg.senderType === 'admin' ? 'ADMIN' : 'CLIENTE'}] ${msg.sender?.name}
${new Date(msg.createdAt).toLocaleString('pt-PT')}
${msg.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            });
        } else {
            details += '\nSem mensagens ainda.\n';
        }

        alert(details);

    } catch (error) {
        console.error('Error:', error);
        showMessage('Erro ao carregar detalhes do ticket', 'error');
    }
}

async function assignTicketToMe(ticketId) {
    if (!confirm('Atribuir este ticket a si?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tickets/${ticketId}/assign`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ adminId: currentUser._id || currentUser.id })
        });

        if (!response.ok) throw new Error('Erro ao atribuir ticket');

        showMessage('Ticket atribuído com sucesso!', 'success');
        await loadTickets();

    } catch (error) {
        console.error('Error:', error);
        showMessage('Erro ao atribuir ticket', 'error');
    }
}

async function resolveTicket(ticketId) {
    if (!confirm('Marcar este ticket como resolvido?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'resolved' })
        });

        if (!response.ok) throw new Error('Erro ao resolver ticket');

        showMessage('Ticket resolvido!', 'success');
        await loadTickets();

    } catch (error) {
        console.error('Error:', error);
        showMessage('Erro ao resolver ticket', 'error');
    }
}

