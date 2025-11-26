// Dashboard - Verificar autenticação e exibir dados do usuário
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Se não houver token, redirecionar para login
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Se for admin ou manager, redirecionar para painel admin
    if (user.role === 'admin' || user.role === 'manager') {
        window.location.href = 'admin.html';
        return;
    }
    
    // Exibir dados do usuário
    if (user.name) {
        document.getElementById('userName').textContent = `Olá, ${user.name}!`;
        document.getElementById('userEmail').textContent = user.email;
    }
    
    // Verificar token com o servidor
    try {
        const response = await fetch('http://localhost:3000/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Atualizar dados do usuário
            document.getElementById('userName').textContent = `Olá, ${data.user.name}!`;
            document.getElementById('userEmail').textContent = data.user.email;
        } else {
            // Token inválido, redirecionar para login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        // Em caso de erro de conexão, manter dados do localStorage
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
});


