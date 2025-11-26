# 🎯 Guia do Dashboard de Administração

## 📋 Visão Geral

O Dashboard Admin oferece controlo completo sobre utilizadores, produtos, pedidos e todas as operações do sistema.

## 🔐 Acesso ao Painel Admin

### Credenciais Padrão
```
Email: admin@aui.com
Password: admin123
```

⚠️ **IMPORTANTE:** Altere a password após o primeiro login!

### Níveis de Acesso
- **Admin**: Acesso total ao sistema
- **Manager**: Pode gerir produtos e pedidos
- **User**: Acesso normal (sem painel admin)

## 🚀 Como Usar

### 1. Fazer Login como Admin

1. Aceda a `http://localhost:3000/login.html`
2. Use as credenciais de admin
3. Será automaticamente redirecionado para `admin.html`

### 2. Criar Novo Admin (Terminal)

```bash
npm run create-admin
```

Este comando cria um utilizador admin com:
- Email: admin@aui.com
- Password: admin123
- Role: admin
- Todas as permissões ativadas

## 📊 Funcionalidades do Dashboard

### Dashboard Principal
- **Estatísticas em tempo real:**
  - Total de utilizadores
  - Total de produtos
  - Total de pedidos
  - Receita total
- **Alertas:**
  - Produtos com stock baixo
  - Pedidos pendentes

### 👥 Gestão de Utilizadores

**Funcionalidades:**
- ✅ Ver todos os utilizadores
- ✅ Editar roles (User, Manager, Admin)
- ✅ Atribuir permissões específicas:
  - Gerir Utilizadores
  - Gerir Produtos
  - Gerir Pedidos
  - Ver Relatórios
  - Gerir Definições
- ✅ Ativar/Desativar utilizadores
- ✅ Eliminar utilizadores

**Como dar permissões a um utilizador:**
1. Vá para a secção "Utilizadores"
2. Clique no ícone de edição (📝) ao lado do utilizador
3. Selecione o Role desejado
4. Marque as permissões específicas
5. Clique em "Guardar"

### 📦 Gestão de Produtos / Stock

**Funcionalidades:**
- ✅ Adicionar novos produtos
- ✅ Editar produtos existentes
- ✅ Gerir stock
- ✅ Definir preços
- ✅ Categorizar produtos
- ✅ Ativar/Desativar produtos
- ✅ Eliminar produtos

**Campos do Produto:**
- Nome
- SKU (código único)
- Descrição
- Preço (€)
- Stock (quantidade)
- Categoria
- URL da Imagem

**Como adicionar um produto:**
1. Vá para a secção "Produtos / Stock"
2. Clique em "Adicionar Produto"
3. Preencha todos os campos obrigatórios (*)
4. Clique em "Guardar"

**Alertas de Stock:**
- Produtos com menos de 10 unidades aparecem com badge vermelho
- O dashboard mostra alertas de stock baixo

### 🛒 Gestão de Pedidos

**Funcionalidades:**
- ✅ Ver todos os pedidos
- ✅ Criar novos pedidos
- ✅ Atualizar status dos pedidos:
  - Pendente
  - A Processar
  - Enviado
  - Entregue
  - Cancelado
- ✅ Ver detalhes completos
- ✅ Gerir status de pagamento:
  - Pendente
  - Pago
  - Falhou
  - Reembolsado

**Como processar um pedido:**
1. Vá para a secção "Pedidos"
2. Localize o pedido na tabela
3. Use o dropdown para alterar o status
4. O sistema atualiza automaticamente

**Informações do Pedido:**
- Número do pedido
- Cliente
- Total
- Status
- Pagamento
- Data de criação

## 🔒 Sistema de Permissões

### Roles e Permissões

#### Admin
- Acesso total
- Todas as permissões automaticamente
- Pode gerir outros admins

#### Manager
- Pode ter permissões específicas:
  - `manage_users` - Gerir utilizadores
  - `manage_products` - Gerir produtos
  - `manage_orders` - Gerir pedidos
  - `view_reports` - Ver relatórios
  - `manage_settings` - Gerir definições

#### User
- Sem acesso ao painel admin
- Redireccionado para dashboard normal

## 🔧 Estrutura Técnica

### Modelos de Dados

**User (Utilizador)**
```javascript
{
  name: String,
  email: String,
  password: String (encriptada),
  role: 'user' | 'manager' | 'admin',
  permissions: Array,
  isActive: Boolean
}
```

**Product (Produto)**
```javascript
{
  name: String,
  sku: String (único),
  description: String,
  price: Number,
  stock: Number,
  category: String,
  image: String,
  isActive: Boolean,
  createdBy: User
}
```

**Order (Pedido)**
```javascript
{
  orderNumber: String (gerado automaticamente),
  customer: User,
  items: [{
    product: Product,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  shippingAddress: Object,
  notes: String
}
```

### Rotas da API

**Admin - Utilizadores**
- `GET /api/admin/users` - Listar utilizadores
- `PUT /api/admin/users/:id/role` - Atualizar role
- `PUT /api/admin/users/:id/status` - Ativar/Desativar
- `DELETE /api/admin/users/:id` - Eliminar

**Admin - Produtos**
- `GET /api/admin/products` - Listar produtos
- `POST /api/admin/products` - Criar produto
- `PUT /api/admin/products/:id` - Atualizar produto
- `DELETE /api/admin/products/:id` - Eliminar produto

**Admin - Pedidos**
- `GET /api/admin/orders` - Listar pedidos
- `POST /api/admin/orders` - Criar pedido
- `PUT /api/admin/orders/:id/status` - Atualizar status

**Admin - Estatísticas**
- `GET /api/admin/stats` - Obter estatísticas do dashboard

### Middleware de Autenticação

**`protect`** - Verifica se o utilizador está autenticado
**`authorize(...roles)`** - Verifica se tem o role necessário
**`checkPermission(permission)`** - Verifica permissão específica

## 📱 Interface

### Design Responsivo
- Desktop: Sidebar lateral fixa
- Tablet: Sidebar adaptável
- Mobile: Menu responsivo

### Cores e Badges
- 🟢 Verde: Ativo, Sucesso, Pago
- 🔴 Vermelho: Inativo, Erro, Stock baixo
- 🟡 Amarelo: Pendente, Aviso
- 🔵 Azul: Info, Manager

## 🎨 Personalização

### Adicionar Nova Permissão

1. Atualize o modelo User em `models/User.js`:
```javascript
permissions: [{
  type: String,
  enum: [..., 'nova_permissao']
}]
```

2. Use no middleware:
```javascript
router.get('/rota', checkPermission('nova_permissao'), async (req, res) => {
  // ...
});
```

3. Adicione ao formulário em `admin.html`

### Adicionar Nova Estatística

1. Atualize a rota `/api/admin/stats` em `routes/admin.js`
2. Adicione novo stat-card em `admin.html`
3. Atualize `loadDashboardStats()` em `js/admin.js`

## 🔥 Dicas e Boas Práticas

1. **Segurança:**
   - Altere sempre a password padrão do admin
   - Use passwords fortes
   - Reveja permissões regularmente

2. **Gestão de Stock:**
   - Monitore os alertas de stock baixo
   - Atualize o stock após cada pedido
   - Use SKUs únicos e descritivos

3. **Pedidos:**
   - Processe pedidos pendentes rapidamente
   - Mantenha clientes informados sobre o status
   - Verifique pagamentos antes de enviar

4. **Utilizadores:**
   - Atribua apenas permissões necessárias
   - Desative contas em vez de eliminar (mantém histórico)
   - Reveja roles periodicamente

## 🆘 Resolução de Problemas

### Não consigo aceder ao painel admin
- ✅ Verifique se tem role 'admin' ou 'manager'
- ✅ Confirme que está autenticado
- ✅ Limpe o localStorage e faça login novamente

### Token expirado
- ✅ Faça logout e login novamente
- ✅ Tokens expiram após 7 dias

### Erro ao criar produto/pedido
- ✅ Verifique se tem a permissão necessária
- ✅ Confirme que todos os campos obrigatórios estão preenchidos
- ✅ Verifique a conexão com o servidor

### Stock não atualiza
- ✅ Verifique se o produto existe
- ✅ Confirme que o valor é positivo
- ✅ Recarregue a página

## 📞 Suporte

Para questões técnicas ou bugs, contacte o administrador do sistema.

---

Criado com ❤️ para AUI Website

