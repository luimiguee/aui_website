const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');
const Log = require('../models/Log');

// Criar diretório de logs se não existir
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Formato customizado para os logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para console (mais legível)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Transport para arquivo com rotação diária
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d', // Manter logs por 30 dias
  maxSize: '20m', // Máximo 20MB por arquivo
  format: logFormat
});

// Transport para erros
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d',
  maxSize: '20m',
  format: logFormat
});

// Criar logger do Winston
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    fileRotateTransport,
    errorFileTransport
  ]
});

// Adicionar console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Logger principal que integra Winston + MongoDB
class Logger {
  constructor() {
    this.winston = winstonLogger;
  }

  // Log genérico
  async log(level, type, action, message, metadata = {}) {
    try {
      // Log no Winston (arquivo)
      this.winston.log(level, message, { type, action, ...metadata });

      // Log no MongoDB (para dashboard)
      await Log.createLog({
        level,
        type,
        action,
        message,
        ...metadata,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Erro ao criar log:', error);
    }
  }

  // Métodos de conveniência
  async info(type, action, message, metadata = {}) {
    return this.log('info', type, action, message, metadata);
  }

  async success(type, action, message, metadata = {}) {
    return this.log('success', type, action, message, metadata);
  }

  async warn(type, action, message, metadata = {}) {
    return this.log('warn', type, action, message, metadata);
  }

  async error(type, action, message, error = null, metadata = {}) {
    const errorData = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    } : {};

    return this.log('error', type, action, message, {
      ...metadata,
      ...errorData
    });
  }

  async debug(type, action, message, metadata = {}) {
    return this.log('debug', type, action, message, metadata);
  }

  // Log de autenticação
  async logAuth(action, message, userId, userName, userEmail, ip, metadata = {}) {
    return this.log('info', 'auth', action, message, {
      userId,
      userName,
      userEmail,
      ip,
      ...metadata
    });
  }

  // Log de API request
  async logRequest(req, res, duration) {
    const metadata = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    if (req.user) {
      metadata.userId = req.user._id;
      metadata.userName = req.user.name;
      metadata.userEmail = req.user.email;
    }

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    const action = `${req.method} ${req.originalUrl || req.url}`;

    return this.log(level, 'api', action, `API Request: ${action}`, metadata);
  }

  // Log de ação do utilizador
  async logUserAction(userId, userName, userEmail, action, message, metadata = {}) {
    return this.log('info', 'user', action, message, {
      userId,
      userName,
      userEmail,
      ...metadata
    });
  }

  // Log de produto
  async logProduct(action, productId, productName, userId, userName, metadata = {}) {
    return this.log('info', 'product', action, `Produto: ${productName}`, {
      userId,
      userName,
      metadata: {
        productId,
        productName,
        ...metadata
      }
    });
  }

  // Log de pedido
  async logOrder(action, orderId, orderNumber, userId, userName, metadata = {}) {
    return this.log('info', 'order', action, `Pedido: ${orderNumber}`, {
      userId,
      userName,
      metadata: {
        orderId,
        orderNumber,
        ...metadata
      }
    });
  }

  // Log de sistema
  async logSystem(action, message, metadata = {}) {
    return this.log('info', 'system', action, message, metadata);
  }

  // Log de segurança
  async logSecurity(action, message, ip, metadata = {}) {
    return this.log('warn', 'security', action, message, {
      ip,
      ...metadata
    });
  }
}

// Exportar instância singleton
module.exports = new Logger();





