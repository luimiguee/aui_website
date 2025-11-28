# 🗄️ GUIA DA BASE DE DADOS

## 📊 INFORMAÇÕES GERAIS

- **Tipo**: MongoDB Local
- **URI**: `mongodb://localhost:27017/aui_website`
- **Nome**: `aui_website`
- **Status**: ✅ Ativo

---

## 🔍 COMO VISUALIZAR A BASE DE DADOS

### 1️⃣ MongoDB Compass (Interface Gráfica) - **RECOMENDADO** ✨

O MongoDB Compass é a melhor forma de visualizar e editar dados.

**Abrir:**
```bash
open -a "MongoDB Compass"
```

**Conectar:**
1. Connection String: `mongodb://localhost:27017`
2. Clique em **"Connect"**
3. Selecione a base de dados **"aui_website"**

---

### 2️⃣ Script Personalizado (Terminal)

Execute este comando para ver um resumo completo:

```bash
cd /Users/miguelpato/aui_website
node view-database.js
```

**Mostra:**
- Total de coleções
- Total de documentos
- Primeiros registros de cada coleção

---

### 3️⃣ MongoDB Shell (mongosh)

Para usuários avançados que preferem linha de comando:

```bash
# Conectar
mongosh aui_website

# Ver coleções
show collections

# Ver produtos
db.products.find().pretty()

# Ver usuários
db.users.find().pretty()

# Contar documentos
db.products.countDocuments()
db.users.countDocuments()

# Encontrar produto específico
db.products.findOne({ sku: "MAC-PRO-14-001" })

# Sair
exit
```

---

## 📚 COLEÇÕES NA BASE DE DADOS

| Coleção | Descrição | Campos Principais |
|---------|-----------|-------------------|
| **users** | Usuários do sistema | name, email, password, role |
| **products** | Produtos da loja | name, price, stock, category |
| **orders** | Pedidos realizados | items, totalAmount, status |
| **tickets** | Tickets de suporte | subject, status, priority |
| **logs** | Logs do sistema | type, action, timestamp |

---

## 👤 CREDENCIAIS ADMIN

```
Email: adminmp@aui.com
Senha: admin123
```

---

## 🛠️ COMANDOS ÚTEIS

### Verificar se MongoDB está rodando:
```bash
brew services list | grep mongodb
```

### Iniciar MongoDB:
```bash
brew services start mongodb/brew/mongodb-community@8.0
```

### Parar MongoDB:
```bash
brew services stop mongodb/brew/mongodb-community@8.0
```

### Reiniciar MongoDB:
```bash
brew services restart mongodb/brew/mongodb-community@8.0
```

### Ver dados da base:
```bash
node view-database.js
```

### Repopular base de dados:
```bash
node populate-db.js
```

---

## 🔄 BACKUP E RESTORE

### Fazer backup:
```bash
mongodump --db=aui_website --out=/Users/miguelpato/backups/mongodb/
```

### Restaurar backup:
```bash
mongorestore --db=aui_website /Users/miguelpato/backups/mongodb/aui_website/
```

---

## 🌐 ACESSO AO WEBSITE

- **URL**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html
- **Login**: http://localhost:3000/login.html

---

## 📝 POPULAÇÃO INICIAL

A base de dados foi populada com:
- ✅ 1 usuário admin (adminmp@aui.com)
- ✅ 10 produtos exemplo
- ✅ Sistema de autenticação configurado
- ✅ Sistema de logs ativo

---

## 🆘 PROBLEMAS COMUNS

### MongoDB não conecta:
```bash
# Verificar se está rodando
brew services list | grep mongodb

# Se não estiver, iniciar
brew services start mongodb/brew/mongodb-community@8.0
```

### Base de dados vazia:
```bash
# Repopular
node populate-db.js
```

### Porta 27017 ocupada:
```bash
# Ver o que está usando
lsof -i :27017

# Matar processo se necessário
kill -9 [PID]
```

---

## 📚 RECURSOS ADICIONAIS

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)
- [Mongoose Documentation](https://mongoosejs.com/)

---

**Criado em**: 27 Nov 2025  
**Última atualização**: 27 Nov 2025


