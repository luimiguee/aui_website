// ============================================
// ADMIN - SISTEMA DE RESPOSTA A TICKETS
// ============================================

class TicketReplyManager {
    constructor() {
        this.currentTicketId = null;
        this.messages = [];
        this.autoRefreshInterval = null;
    }

    // Renderizar o chat completo
    renderReplyInterface(ticketId) {
        this.currentTicketId = ticketId;
        
        const html = `
            <div class="ticket-reply-container">
                <!-- Header -->
                <div class="ticket-reply-header">
                    <div class="ticket-reply-info">
                        <h3 id="ticketReplyTitle">Carregando...</h3>
                        <p id="ticketReplySubtitle">Aguarde...</p>
                    </div>
                    <div class="ticket-reply-actions">
                        <button class="ticket-header-btn" id="ticketRefreshBtn">
                            <i class="fas fa-sync-alt"></i>
                            Atualizar
                        </button>
                        <button class="ticket-header-btn" id="ticketCloseBtn">
                            <i class="fas fa-check-circle"></i>
                            Resolver
                        </button>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="ticket-messages-area" id="ticketMessagesArea">
                    <div class="ticket-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </div>

                <!-- Reply Form -->
                <div class="ticket-reply-form">
                    <div class="reply-form-container">
                        <div class="reply-textarea-container">
                            <textarea 
                                class="reply-textarea" 
                                id="ticketReplyTextarea" 
                                placeholder="Escreva sua resposta aqui..."
                                rows="3"
                            ></textarea>
                        </div>
                        <div class="reply-form-actions">
                            <div class="reply-form-tools">
                                <button class="reply-tool-btn" title="Modelo de resposta">
                                    <i class="fas fa-file-alt"></i>
                                </button>
                                <button class="reply-tool-btn" title="Emojis">
                                    <i class="fas fa-smile"></i>
                                </button>
                                <button class="reply-tool-btn" title="Anexar arquivo">
                                    <i class="fas fa-paperclip"></i>
                                </button>
                            </div>
                            <div class="reply-form-submit">
                                <button class="reply-btn reply-btn-send" id="ticketSendReplyBtn">
                                    <i class="fas fa-paper-plane"></i>
                                    Enviar Resposta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // Inicializar após renderizar
    async initialize(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container não encontrado:', containerId);
            return;
        }

        await this.loadTicketData();
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    // Carregar dados do ticket
    async loadTicketData() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tickets/${this.currentTicketId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar ticket');
            }

            const data = await response.json();
            this.updateHeader(data.ticket);
            await this.loadMessages();

        } catch (error) {
            console.error('Erro ao carregar ticket:', error);
            this.showError('Erro ao carregar dados do ticket');
        }
    }

    // Atualizar header
    updateHeader(ticket) {
        const titleEl = document.getElementById('ticketReplyTitle');
        const subtitleEl = document.getElementById('ticketReplySubtitle');

        if (titleEl) {
            titleEl.innerHTML = `
                <span class="ticket-status-badge ${ticket.status}">${this.getStatusText(ticket.status)}</span>
                ${ticket.ticketNumber} - ${ticket.subject}
            `;
        }

        if (subtitleEl) {
            const date = new Date(ticket.createdAt).toLocaleDateString('pt-PT');
            subtitleEl.textContent = `Criado por ${ticket.user.name} em ${date}`;
        }
    }

    // Carregar mensagens
    async loadMessages() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tickets/${this.currentTicketId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar mensagens');
            }

            const data = await response.json();
            this.messages = data.messages || [];
            this.renderMessages();

        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            this.showError('Erro ao carregar mensagens');
        }
    }

    // Renderizar mensagens
    renderMessages() {
        const container = document.getElementById('ticketMessagesArea');
        if (!container) return;

        if (this.messages.length === 0) {
            container.innerHTML = `
                <div class="ticket-messages-empty">
                    <i class="fas fa-comments"></i>
                    <h4>Nenhuma mensagem ainda</h4>
                    <p>Seja o primeiro a responder este ticket</p>
                </div>
            `;
            return;
        }

        const messagesHTML = this.messages.map(msg => this.renderMessage(msg)).join('');
        container.innerHTML = messagesHTML;

        // Scroll para o final
        container.scrollTop = container.scrollHeight;
    }

    // Renderizar uma mensagem
    renderMessage(message) {
        const isAdmin = message.sender.role === 'admin';
        const initials = message.sender.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const time = new Date(message.createdAt).toLocaleTimeString('pt-PT', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return `
            <div class="ticket-message ${isAdmin ? 'admin' : 'user'}">
                <div class="ticket-message-avatar">${initials}</div>
                <div class="ticket-message-content">
                    <div class="ticket-message-header">
                        <span class="ticket-message-author">${message.sender.name}</span>
                        <span class="ticket-message-role ${isAdmin ? 'admin' : 'user'}">
                            ${isAdmin ? 'Admin' : 'Cliente'}
                        </span>
                        <span class="ticket-message-time">${time}</span>
                    </div>
                    <div class="ticket-message-bubble">
                        ${this.escapeHtml(message.message)}
                    </div>
                </div>
            </div>
        `;
    }

    // Setup event listeners
    setupEventListeners() {
        // Enviar resposta
        const sendBtn = document.getElementById('ticketSendReplyBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendReply());
        }

        // Enter para enviar (Ctrl+Enter)
        const textarea = document.getElementById('ticketReplyTextarea');
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.sendReply();
                }
            });
        }

        // Atualizar
        const refreshBtn = document.getElementById('ticketRefreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadMessages());
        }

        // Resolver ticket
        const closeBtn = document.getElementById('ticketCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.resolveTicket());
        }
    }

    // Enviar resposta
    async sendReply() {
        const textarea = document.getElementById('ticketReplyTextarea');
        const sendBtn = document.getElementById('ticketSendReplyBtn');
        
        if (!textarea || !textarea.value.trim()) {
            alert('Por favor, escreva uma resposta');
            return;
        }

        const message = textarea.value.trim();

        try {
            // Desabilitar botão
            if (sendBtn) {
                sendBtn.disabled = true;
                sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tickets/${this.currentTicketId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar resposta');
            }

            // Limpar textarea
            textarea.value = '';

            // Recarregar mensagens
            await this.loadMessages();

            // Mostrar sucesso
            this.showSuccess('Resposta enviada com sucesso!');

        } catch (error) {
            console.error('Erro ao enviar resposta:', error);
            alert('Erro ao enviar resposta. Tente novamente.');
        } finally {
            // Reabilitar botão
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Resposta';
            }
        }
    }

    // Resolver ticket
    async resolveTicket() {
        if (!confirm('Tem certeza que deseja marcar este ticket como resolvido?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tickets/${this.currentTicketId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'resolved' })
            });

            if (!response.ok) {
                throw new Error('Erro ao resolver ticket');
            }

            this.showSuccess('Ticket marcado como resolvido!');
            await this.loadTicketData();

        } catch (error) {
            console.error('Erro ao resolver ticket:', error);
            alert('Erro ao resolver ticket. Tente novamente.');
        }
    }

    // Auto refresh
    startAutoRefresh() {
        // Atualizar a cada 30 segundos
        this.autoRefreshInterval = setInterval(() => {
            this.loadMessages();
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    }

    // Helpers
    getStatusText(status) {
        const statusTexts = {
            'open': 'Aberto',
            'in_progress': 'Em Progresso',
            'waiting_response': 'Aguardando Resposta',
            'resolved': 'Resolvido',
            'closed': 'Fechado'
        };
        return statusTexts[status] || status;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    showSuccess(message) {
        // Pode implementar um toast notification
        console.log('✅', message);
    }

    showError(message) {
        console.error('❌', message);
    }

    // Destruir instância
    destroy() {
        this.stopAutoRefresh();
        this.currentTicketId = null;
        this.messages = [];
    }
}

// Exportar
window.TicketReplyManager = TicketReplyManager;


