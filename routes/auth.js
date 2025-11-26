const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'seu-secret-key-aqui', {
    expiresIn: '7d'
  });
};

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'A senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email já cadastrado' 
      });
    }

    // Criar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Criar novo usuário
    const user = new User({ 
      name, 
      email, 
      password,
      verificationToken,
      verificationTokenExpires
    });
    await user.save();

    // Gerar token JWT
    const token = generateToken(user._id);

    // Em produção, enviar email de verificação aqui
    // Para desenvolvimento, retornar o link no console
    console.log(`\n📧 Link de verificação: http://localhost:3000/verify-email.html?token=${verificationToken}\n`);

    res.status(201).json({
      success: true,
      message: 'Utilizador cadastrado! Verifique o seu email para ativar a conta.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        emailVerified: user.emailVerified
      },
      verificationLink: `http://localhost:3000/verify-email.html?token=${verificationToken}` // Apenas para desenvolvimento
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao cadastrar usuário',
      error: error.message 
    });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer login',
      error: error.message 
    });
  }
});

// Rota para verificar token (opcional)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token não fornecido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu-secret-key-aqui');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
});

// Rota para verificar email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar utilizador com o token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Verificar email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verificado com sucesso! Já pode fazer login.'
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar email',
      error: error.message
    });
  }
});

module.exports = router;


