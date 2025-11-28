// Tickets System - Complete & Modern

let allTickets = [];
let currentFilter = 'all';
let currentTicket = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTickets();
    loadStats();
    setupEventListeners();
});

// Check Authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
}

// Load Tickets
async function loadTickets() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/tickets', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar tickets');

        allTickets = await response.json();
        displayTickets();

    } catch (error) {
        console.error('Error:', error);
        showError('Erro ao carregar tickets');
    }
}

// Display Tickets
function displayTickets(filter = 'all') {
    const container = document.getElementById('ticketsList');
    let filteredTickets = allTickets;

    if (filter !== 'all') {
        filteredTickets = allTickets.filter(t => t.status === filter);
    }

    if (filteredTickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state animate-fadeIn">
                <i class="fas fa-inbox"></i>
                <h3>Nenhum ticket encontrado</h3>
                <p>Crie um novo ticket para obter ajuda</p>
                <button class="btn-modern btn-primary" onclick="showNewTicketModal()">
                    <i class="fas fa-plus"></i> Criar Ticket
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTickets.map((ticket, index) => `
        <div class="ticket-card animate-slideUp" style="animation-delay: ${index * 50}ms" onclick="viewTicketDetails('${ticket._id}')">
            <div class="ticket-header">
                <div class="ticket-number">
                    <i class="fas fa-ticket-alt"></i>
                    ${ticket.ticketNumber}
                </div>
                <div class="ticket-badges">
                    ${getPriorityBadge(ticket.priority)}
                    ${getStatusBadge(ticket.status)}
                </div>
            </div>

            <div class="ticket-title">${ticket.subject}</div>
            <div class="ticket-description">${ticket.description}</div>

            ${getCategoryBadge(ticket.category)}

            <div class="ticket-footer">
                <div class="ticket-meta">
                    <span>
                        <i class="fas fa-calendar"></i>
                        ${formatDate(ticket.createdAt)}
                    </span>
                    <span>
                        <i class="fas fa-comments"></i>
                        ${ticket.messages ? ticket.messages.length : 0}
                    </span>
                </div>
                <button class="btn-modern btn-secondary btn-sm" onclick="event.stopPropagation(); viewTicketDetails('${ticket._id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </div>
        </div>
    `).join('');
}

// Get Priority Badge
function getPriorityBadge(priority) {
    const badges = {
        low: '<span class="priority-badge badge-low"><i class="fas fa-arrow-down"></i> Baixa</span>',
        medium: '<span class="priority-badge badge-medium"><i class="fas fa-minus"></i> Média</span>',
        high: '<span class="priority-badge badge-high"><i class="fas fa-arrow-up"></i> Alta</span>',
        urgent: '<span class="priority-badge badge-urgent"><i class="fas fa-fire"></i> Urgente</span>'
    };
    return badges[priority] || '';
}

// Get Status Badge
function getStatusBadge(status) {
    const badges = {
        open: '<span class="status-badge badge-status-open">Aberto</span>',
        in_progress: '<span class="status-badge badge-status-in_progress">Em Progresso</span>',
        waiting_response: '<span class="status-badge badge-status-waiting_response">Aguardando</span>',
        resolved: '<span class="status-badge badge-status-resolved">Resolvido</span>',
        closed: '<span class="status-badge badge-status-closed">Fechado</span>'
    };
    return badges[status] || '';
}

// Get Category Badge
function getCategoryBadge(category) {
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
    return `<span class="category-badge">${categories[category]}</span>`;
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-PT', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Load Stats
async function loadStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/tickets/stats/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar estatísticas');

        const stats = await response.json();

        document.getElementById('totalTickets').textContent = stats.total || 0;
        document.getElementById('openTickets').textContent = stats.open || 0;
        document.getElementById('resolvedTickets').textContent = stats.resolved || 0;

    } catch (error) {
        console.error('Error:', error);
    }
}

// Show New Ticket Modal
function showNewTicketModal() {
    document.getElementById('newTicketModal').classList.add('active');
}

// Close New Ticket Modal
function closeNewTicketModal() {
    document.getElementById('newTicketModal').classList.remove('active');
    document.getElementById('newTicketForm').reset();
}

// View Ticket Details
async function viewTicketDetails(ticketId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tickets/${ticketId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar detalhes');

        currentTicket = await response.json();
        displayTicketDetails(currentTicket);
        document.getElementById('ticketDetailsModal').classList.add('active');

    } catch (error) {
        console.error('Error:', error);
        showError('Erro ao carregar detalhes do ticket');
    }
}

// Display Ticket Details
function displayTicketDetails(ticket) {
    const content = document.getElementById('ticketDetailsContent');

    content.innerHTML = `
        <div class="ticket-details-full">
            <div class="ticket-details-header">
                <div>
                    <div class="ticket-number" style="font-size: 16px; margin-bottom: 12px;">
                        <i class="fas fa-ticket-alt"></i> ${ticket.ticketNumber}
                    </div>
                    <h2 style="margin-bottom: 16px;">${ticket.subject}</h2>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
                        ${getPriorityBadge(ticket.priority)}
                        ${getStatusBadge(ticket.status)}
                        ${getCategoryBadge(ticket.category)}
                    </div>
                </div>
            </div>

            <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--text-primary);">Descrição:</h4>
                <p style="color: var(--text-secondary); line-height: 1.8;">${ticket.description}</p>
            </div>

            <div>
                <h4 style="margin-bottom: 16px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-comments"></i> Mensagens (${ticket.messages ? ticket.messages.length : 0})
                </h4>
                ${displayMessages(ticket.messages || [])}
            </div>

            <form onsubmit="addMessage(event, '${ticket._id}')" style="margin-top: 24px;">
                <div class="form-group">
                    <label><i class="fas fa-reply"></i> Adicionar Resposta</label>
                    <textarea class="form-input" id="newMessage" rows="4" 
                              placeholder="Escreva a sua mensagem..." required></textarea>
                </div>
                <button type="submit" class="btn-modern btn-primary">
                    <i class="fas fa-paper-plane"></i> Enviar Mensagem
                </button>
            </form>
        </div>
    `;
}

// Display Messages
function displayMessages(messages) {
    if (!messages || messages.length === 0) {
        return '<p style="text-align: center; color: var(--text-tertiary); padding: 32px;">Sem mensagens ainda</p>';
    }

    return `
        <div class="messages-container">
            ${messages.map(msg => `
                <div class="message ${msg.senderType === 'admin' ? 'admin' : ''}">
                    <div class="message-avatar">
                        ${msg.senderType === 'admin' ? '<i class="fas fa-user-shield"></i>' : '<i class="fas fa-user"></i>'}
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">
                                ${msg.sender?.name || 'Utilizador'}
                                ${msg.senderType === 'admin' ? '<span class="badge-modern badge-success" style="margin-left: 8px; font-size: 10px;">ADMIN</span>' : ''}
                            </span>
                            <span class="message-time">${formatDate(msg.createdAt)}</span>
                        </div>
                        <div class="message-text">${msg.message}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Add Message
async function addMessage(event, ticketId) {
    event.preventDefault();

    const message = document.getElementById('newMessage').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tickets/${ticketId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error('Erro ao enviar mensagem');

        showSuccess('Mensagem enviada!');
        
        // Recarregar detalhes
        await viewTicketDetails(ticketId);

    } catch (error) {
        console.error('Error:', error);
        showError('Erro ao enviar mensagem');
    }
}

// Close Ticket Details Modal
function closeTicketDetailsModal() {
    document.getElementById('ticketDetailsModal').classList.remove('active');
}

// Setup Event Listeners
function setupEventListeners() {
    // New Ticket Form
    document.getElementById('newTicketForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            category: document.getElementById('ticketCategory').value,
            priority: document.querySelector('input[name="priority"]:checked').value,
            subject: document.getElementById('ticketSubject').value,
            description: document.getElementById('ticketDescription').value
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Erro ao criar ticket');

            showSuccess('Ticket criado com sucesso!');
            closeNewTicketModal();
            await loadTickets();
            await loadStats();

        } catch (error) {
            console.error('Error:', error);
            showError('Erro ao criar ticket');
        }
    });

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.dataset.filter;
            displayTickets(currentFilter);
        });
    });
}

// Show Success
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification animate-slideDown';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show Error
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification animate-slideDown';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--error);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}





