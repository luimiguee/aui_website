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


```


## 📚 Próximos Passos

- [ ] Adicionar recuperação de senha
- [ ] Implementar refresh tokens
- [ ] Adicionar middleware de autenticação para rotas protegidas
- [ ] Criar mais endpoints da API
- [ ] Adicionar testes automatizados
