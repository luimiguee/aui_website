// Validação e interatividade do formulário de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const submitButton = loginForm?.querySelector('button[type="submit"]');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validação básica
            if (!email || !password) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Por favor, insira um email válido.', 'error');
                return;
            }
            
            // Desabilitar botão durante requisição
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Entrando...';
            }
            
            try {
                // Fazer requisição para API
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Salvar token no localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showMessage('Login realizado com sucesso!', 'success');
                    
                    // Redirecionar após 1 segundo
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showMessage(data.message || 'Erro ao fazer login', 'error');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Entrar';
                    }
                }
            } catch (error) {
                console.error('Erro:', error);
                showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Entrar';
                }
            }
        });
    }
});

// Função para exibir mensagens
function showMessage(message, type) {
    // Remove mensagem anterior se existir
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
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

