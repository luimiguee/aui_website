# AUI Website

Site moderno em HTML/CSS com página de login, autenticação e conexão com banco de dados MongoDB.

## 📁 Estrutura do Projeto

```
aui_website/
├── index.html          # Página inicial
├── login.html          # Página de login
├── register.html       # Página de cadastro
├── dashboard.html      # Dashboard do usuário
├── server.js           # Servidor Express
├── package.json        # Dependências Node.js
├── models/
│   └── User.js         # Modelo de usuário (MongoDB)
├── routes/
│   └── auth.js         # Rotas de autenticação
├── css/
│   ├── style.css       # Estilos base e globais
│   ├── login.css       # Estilos da página de login
│   └── home.css        # Estilos da página inicial
├── js/
│   ├── main.js         # Scripts gerais do site
│   ├── login.js        # Validação e API do formulário de login
│   ├── register.js     # Validação e API do formulário de cadastro
│   └── dashboard.js    # Gerenciamento do dashboard
└── assets/
    └── images/         # Pasta para imagens
```

## 🚀 Recursos

- **Design Moderno**: Interface limpa e responsiva
- **Página de Login**: Formulário de login com validação
- **Página de Cadastro**: Formulário de registro completo
- **Autenticação JWT**: Sistema de autenticação seguro
- **Banco de Dados MongoDB**: Armazenamento de usuários
- **API REST**: Endpoints para login e registro
- **Dashboard**: Área privada do usuário
- **Responsivo**: Adaptável para dispositivos móveis

## 🛠️ Instalação e Configuração

### 📚 **Guias Disponíveis**

Escolha o guia adequado à sua necessidade:

#### 🌐 **Para MongoDB Atlas (Cloud - RECOMENDADO)**
- **Guia Completo**: [`GUIA_MONGODB_ATLAS.md`](./GUIA_MONGODB_ATLAS.md) - Passo a passo detalhado
- **Guia Rápido**: [`ATLAS_RAPIDO.md`](./ATLAS_RAPIDO.md) - Resumo de 5 minutos

#### 💻 **Para MongoDB Local**
- **Guia Completo**: [`GUIA_MONGODB_PASSO_A_PASSO.md`](./GUIA_MONGODB_PASSO_A_PASSO.md)
- **Guia Geral**: [`DATABASE_SETUP.md`](./DATABASE_SETUP.md)
- **Guia Rápido**: [`INICIO_RAPIDO.md`](./INICIO_RAPIDO.md)

#### 📖 **Outros**
- **Instalação Geral**: [`INSTALL.md`](./INSTALL.md)

---

### ⚡ Início Rápido (MongoDB Atlas)

#### 1️⃣ Criar conta no MongoDB Atlas
- Acesse: https://www.mongodb.com/cloud/atlas/register
- Crie um cluster **FREE (M0 Sandbox)**
- Crie um usuário e senha
- Adicione seu IP: `0.0.0.0/0` (Network Access)
- Obtenha a connection string

#### 2️⃣ Instalar dependências
```bash
npm install
```

#### 3️⃣ Criar arquivo `.env`
```bash
nano .env
```

Cole isto (substitua pela sua connection string):
```env
PORT=3000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/aui_website?retryWrites=true&w=majority
JWT_SECRET=aui_secret_key_2025_mudar_em_producao
```

Salve: `Control+O`, `Enter`, `Control+X`

#### 4️⃣ Validar configuração
```bash
node validar-atlas.js
```

#### 5️⃣ Testar conexão
```bash
node test-db.js
```

#### 6️⃣ Iniciar o servidor
```bash
npm start
```

Abra no browser: **http://localhost:3000**

---

### 🔧 Scripts Úteis

```bash
# Validar configuração do Atlas
node validar-atlas.js

# Testar conexão com MongoDB
node test-db.js

# Iniciar servidor (modo produção)
npm start

# Iniciar servidor (modo desenvolvimento - auto-reload)
npm run dev
```

## 📡 API Endpoints

### POST `/api/auth/register`
Registra um novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso",
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### POST `/api/auth/login`
Faz login do usuário

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### GET `/api/auth/verify`
Verifica se o token é válido

**Headers:**
```
Authorization: Bearer jwt_token_aqui
```

## 🔧 Tecnologias

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Tokens)
- bcryptjs (hash de senhas)

## 🔐 Segurança

- Senhas são hasheadas com bcrypt antes de serem salvas
- Tokens JWT para autenticação
- Validação de dados no frontend e backend
- CORS configurado para permitir requisições do frontend

## 📝 Como Usar

1. **Inicie o servidor:**
   ```bash
   npm start
   ```

2. **Abra o navegador:**
   - Acesse `http://localhost:3000`
   - Ou abra `index.html` diretamente

3. **Crie uma conta:**
   - Clique em "Cadastre-se" ou acesse `register.html`
   - Preencha os dados e cadastre-se

4. **Faça login:**
   - Use suas credenciais na página de login
   - Após login, você será redirecionado para o dashboard

## 🗄️ Alternativas de Banco de Dados

### MySQL/PostgreSQL

Se preferir usar SQL ao invés de MongoDB, você pode usar:

- **MySQL**: `mysql2` + `sequelize`
- **PostgreSQL**: `pg` + `sequelize`

Exemplo com Sequelize:

```javascript
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'mysql' // ou 'postgres'
});
```

## 🐛 Troubleshooting

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no arquivo `.env`
- Para MongoDB Atlas, verifique se o IP está na whitelist

### Erro CORS
- Certifique-se de que o servidor está rodando na porta 3000
- Verifique se a URL da API está correta nos arquivos JavaScript

### Porta já em uso
- Altere a porta no arquivo `.env` ou use: `PORT=3001 npm start`

## 📚 Próximos Passos

- [ ] Adicionar recuperação de senha
- [ ] Implementar refresh tokens
- [ ] Adicionar middleware de autenticação para rotas protegidas
- [ ] Criar mais endpoints da API
- [ ] Adicionar testes automatizados
