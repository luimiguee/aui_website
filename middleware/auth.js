const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar se o utilizador está autenticado
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se o token existe no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado. Token não fornecido.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu-secret-key-aqui');

    // Adicionar utilizador à requisição
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizador não encontrado'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

// Middleware para verificar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para aceder a este recurso'
      });
    }
    next();
  };
};

// Middleware para verificar permissões específicas
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      // Admin tem todas as permissões
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para realizar esta ação'
      });
    }
    next();
  };
};

