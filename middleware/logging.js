const logger = require('../utils/logger');

// Middleware para logging de todas as requests
exports.requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Interceptar o fim da response
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    // Não logar requests de assets estáticos
    if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf)$/)) {
      return;
    }

    // Logar a request
    await logger.logRequest(req, res, duration);
  });

  next();
};

// Middleware para logging de erros
exports.errorLogger = async (err, req, res, next) => {
  await logger.error(
    'system',
    'error',
    err.message || 'Erro não identificado',
    err,
    {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?._id,
      userName: req.user?.name
    }
  );

  next(err);
};

// Log de ação com sucesso
exports.logSuccess = (type, action, getMessage) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = async function(data) {
      if (data.success) {
        const message = typeof getMessage === 'function' 
          ? getMessage(req, data) 
          : getMessage;

        await logger.success(
          type,
          action,
          message,
          {
            userId: req.user?._id,
            userName: req.user?.name,
            userEmail: req.user?.email,
            ip: req.ip
          }
        );
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};





