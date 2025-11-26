// Validação do formulário de cadastro
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const submitButton = registerForm?.querySelector('button[type="submit"]');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.querySelector('input[name="terms"]').checked;
            
            // Validações
            if (!name || !email || !password || !confirmPassword) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('As senhas não coincidem.', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Por favor, insira um email válido.', 'error');
                return;
            }
            
            if (!terms) {
                showMessage('Você deve aceitar os termos e condições.', 'error');
                return;
            }
            
            // Desabilitar botão durante requisição
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Cadastrando...';
            }
            
            try {
                // Fazer requisição para API
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Salvar token no localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    showMessage('Cadastro realizado com sucesso!', 'success');
                    
                    // Redirecionar para login após 2 segundos
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage(data.message || 'Erro ao cadastrar', 'error');
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Cadastrar';
                    }
                }
            } catch (error) {
                console.error('Erro:', error);
                showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Cadastrar';
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

