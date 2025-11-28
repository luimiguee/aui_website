# 🎨 GUIA DO MENU LATERAL (SIDEBAR)

## 📋 VISÃO GERAL

Menu lateral moderno e responsivo com animações suaves, suporte a usuários logados/visitantes, e badges dinâmicos.

---

## ✨ CARACTERÍSTICAS

- ✅ Design moderno com gradiente roxo
- ✅ Animações suaves e fluidas
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Detecta usuário logado automaticamente
- ✅ Badges dinâmicos (carrinho, tickets)
- ✅ Overlay com blur
- ✅ Fecha com ESC ou clique fora
- ✅ Ícone hamburger animado
- ✅ Página ativa destacada

---

## 🚀 COMO USAR

### 1. Adicionar CSS e JavaScript

Adicione estas linhas no `<head>` da sua página HTML:

```html
<!-- CSS do Sidebar -->
<link rel="stylesheet" href="css/sidebar.css">

<!-- Font Awesome (se ainda não tiver) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

Adicione antes do fechamento do `</body>`:

```html
<!-- JavaScript do Sidebar -->
<script src="js/sidebar.js"></script>
```

### 2. Pronto! 🎉

O sidebar será criado automaticamente. Não precisa adicionar HTML!

---

## 📝 EXEMPLO COMPLETO

```html
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minha Página</title>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Sidebar CSS -->
    <link rel="stylesheet" href="css/sidebar.css">
    
    <!-- Seus outros estilos -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Seu conteúdo aqui -->
    <h1>Conteúdo da Página</h1>
    
    <!-- Sidebar JavaScript -->
    <script src="js/sidebar.js"></script>
    
    <!-- Seus outros scripts -->
    <script src="js/main.js"></script>
</body>
</html>
```

---

## 🎨 ESTRUTURA DO MENU

### **Seção Principal:**
- 🏠 Home
- 📊 Dashboard
- 🎫 Suporte (com badge de tickets abertos)

### **Administração:**
- 🛡️ Admin Panel (apenas para admins)

### **Conta:**
- 👤 Perfil
- ⚙️ Configurações
- 🛒 Carrinho (com badge de itens)

---

## 🔧 PERSONALIZAÇÃO

### Alterar Cores

Edite as variáveis CSS em `css/sidebar.css`:

```css
:root {
    --sidebar-width: 280px;
    --sidebar-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --sidebar-text: #ffffff;
    --sidebar-hover: rgba(255, 255, 255, 0.1);
    --sidebar-active: rgba(255, 255, 255, 0.2);
}
```

### Adicionar Novo Item de Menu

Edite `js/sidebar.js` e adicione na seção desejada:

```javascript
<li class="sidebar-menu-item">
    <a href="nova-pagina.html" class="sidebar-menu-link" data-page="nova">
        <i class="fas fa-star sidebar-menu-icon"></i>
        <span class="sidebar-menu-text">Nova Página</span>
    </a>
</li>
```

### Usar Via JavaScript

```javascript
// Abrir sidebar
window.sidebarInstance.openSidebar();

// Fechar sidebar
window.sidebarInstance.closeSidebar();

// Toggle sidebar
window.sidebarInstance.toggleSidebar();

// Atualizar informações do usuário
window.sidebarInstance.updateUserInfo();

// Atualizar badges
window.sidebarInstance.updateBadges();
```

---

## 🎯 FUNCIONALIDADES AUTOMÁTICAS

### 1. Detecção de Usuário

O sidebar verifica automaticamente se há um usuário logado:

- ✅ **Logado**: Mostra nome, role e opções de conta
- ✅ **Visitante**: Mostra "Visitante" e oculta opções de conta

### 2. Badges Dinâmicos

- 🛒 **Carrinho**: Conta itens do localStorage
- 🎫 **Tickets**: Busca tickets abertos via API

### 3. Página Ativa

Automaticamente destaca o item do menu da página atual.

### 4. Role-Based Access

- Itens de admin só aparecem para usuários com `role: 'admin'`

---

## 📱 RESPONSIVIDADE

### Desktop (> 768px)
- Sidebar: 280px de largura
- Toggle button: canto superior esquerdo

### Mobile (< 768px)
- Sidebar: 280px de largura (overlay total)
- Toggle button: menor e mais compacto

### Small Mobile (< 480px)
- Sidebar: 85vw (máximo 280px)

---

## ⌨️ ATALHOS DE TECLADO

- **ESC**: Fecha o sidebar
- **Clique fora**: Fecha o sidebar

---

## 🎭 ANIMAÇÕES

### Entrada do Sidebar
- Desliza da esquerda com easing
- Itens aparecem em sequência (cascata)

### Hover nos Itens
- Deslocamento para direita
- Barra lateral azul

### Toggle Button
- Transformação do hamburger em X
- Escala no hover

---

## 🔒 SEGURANÇA

- ✅ Verifica token JWT automaticamente
- ✅ Oculta itens sensíveis para visitantes
- ✅ Validação de role no frontend e backend

---

## 🐛 TROUBLESHOOTING

### Sidebar não aparece?

1. Verifique se os arquivos CSS e JS estão carregando:
```html
<link rel="stylesheet" href="css/sidebar.css">
<script src="js/sidebar.js"></script>
```

2. Verifique o console do navegador (F12)

3. Certifique-se que Font Awesome está carregado

### Informações do usuário não aparecem?

1. Verifique se o token está no localStorage:
```javascript
console.log(localStorage.getItem('token'));
```

2. Verifique se a API `/api/auth/verify` está funcionando

### Badges não atualizam?

```javascript
// Forçar atualização manual
window.sidebarInstance.updateBadges();
```

---

## 📚 ARQUIVOS NECESSÁRIOS

```
aui_website/
├── css/
│   └── sidebar.css         ← Estilos do sidebar
├── js/
│   └── sidebar.js          ← Lógica do sidebar
└── [sua-pagina].html       ← Adicionar links CSS/JS
```

---

## 🎨 PREVIEW

```
┌─────────────────────────┐
│  🏪 AUI Store          │
│  Loja Online Premium   │
├─────────────────────────┤
│  👤 Miguel Pato        │
│     Administrador      │
├─────────────────────────┤
│  🏠 Home               │
│  📊 Dashboard          │
│  🎫 Suporte        [2] │
├─────────────────────────┤
│  ADMINISTRAÇÃO         │
│  🛡️ Admin Panel        │
├─────────────────────────┤
│  CONTA                 │
│  👤 Perfil             │
│  ⚙️ Configurações       │
│  🛒 Carrinho       [3] │
├─────────────────────────┤
│  🚪 Sair               │
└─────────────────────────┘
```

---

## 💡 DICAS

1. **Performance**: O sidebar é criado uma vez e reutilizado
2. **SEO**: Não afeta SEO (injetado via JS)
3. **Acessibilidade**: Use ESC para fechar
4. **Mobile**: Funciona com gestos de toque
5. **Updates**: Chame `updateBadges()` após ações

---

## 🚀 PRÓXIMOS PASSOS

- [ ] Adicionar submenu com dropdown
- [ ] Tema claro/escuro
- [ ] Notificações no sidebar
- [ ] Histórico de navegação
- [ ] Favoritos rápidos

---

**Criado em**: 27 Nov 2025  
**Versão**: 1.0.0  
**Autor**: Sistema AUI


