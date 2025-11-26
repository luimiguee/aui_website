# ⚡ Início Rápido - Dashboard Admin

## 🚀 Começar em 3 Passos

### 1️⃣ Servidor já está a correr ✅
```
http://localhost:3000
```

### 2️⃣ Utilizador Admin já foi criado ✅
```
Email: admin@aui.com
Password: admin123
```

### 3️⃣ Aceder ao Dashboard Admin

1. Abra o navegador
2. Vá para: `http://localhost:3000/login.html`
3. Faça login com as credenciais admin
4. Será automaticamente redirecionado para o painel admin

## 📊 O que pode fazer

### ✅ Dashboard Principal
- Ver estatísticas em tempo real
- Monitorizar alertas de stock
- Ver pedidos pendentes

### 👥 Gerir Utilizadores
- Dar cargos: User, Manager, Admin
- Atribuir permissões específicas
- Ativar/Desativar contas
- Eliminar utilizadores

### 📦 Gerir Stock
- Adicionar produtos
- Atualizar preços
- Controlar stock
- Categorizar produtos

### 🛒 Gerir Pedidos
- Ver todos os pedidos
- Atualizar status
- Processar pagamentos
- Ver detalhes completos

## 🎯 Exemplo Prático

### Criar um Gestor de Stock
1. Login como admin
2. Ir para "Utilizadores"
3. Clicar em editar no utilizador desejado
4. Mudar role para "Manager"
5. Marcar permissão "Gerir Produtos"
6. Guardar

### Adicionar um Produto
1. Ir para "Produtos / Stock"
2. Clicar "Adicionar Produto"
3. Preencher:
   - Nome: Ex: "Teclado Mecânico"
   - SKU: Ex: "TEC-001"
   - Preço: Ex: 89.99
   - Stock: Ex: 50
   - Categoria: Ex: "Periféricos"
4. Guardar

### Processar um Pedido
1. Ir para "Pedidos"
2. Localizar pedido na lista
3. Alterar status usando o dropdown
4. Status atualiza automaticamente

## 🔒 Níveis de Acesso

| Role | Acesso |
|------|--------|
| **Admin** | ✅ Tudo (acesso total) |
| **Manager** | ✅ Conforme permissões atribuídas |
| **User** | ❌ Sem acesso ao painel admin |

## 💡 Dicas Rápidas

- Admins e Managers são automaticamente redirecionados para `admin.html`
- Users normais vão para `dashboard.html`
- Tokens de sessão duram 7 dias
- Altere a password padrão do admin!

## 📖 Documentação Completa
Veja `ADMIN_GUIDE.md` para documentação detalhada.

---

**Pronto para começar! 🎉**

