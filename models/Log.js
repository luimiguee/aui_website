const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug', 'success'],
    default: 'info',
    required: true
  },
  type: {
    type: String,
    enum: ['auth', 'user', 'product', 'order', 'system', 'api', 'database', 'security'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String
  },
  userEmail: {
    type: String
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  method: {
    type: String
  },
  url: {
    type: String
  },
  statusCode: {
    type: Number
  },
  duration: {
    type: Number // em ms
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    message: String,
    stack: String,
    code: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índices para melhor performance
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ type: 1, timestamp: -1 });
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

// Método estático para criar log
logSchema.statics.createLog = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Erro ao criar log:', error);
  }
};

// Método estático para buscar logs com filtros
logSchema.statics.getLogs = async function(filters = {}, options = {}) {
  const {
    level,
    type,
    userId,
    startDate,
    endDate,
    limit = 100,
    skip = 0,
    sort = { timestamp: -1 }
  } = options;

  const query = {};

  if (level) query.level = level;
  if (type) query.type = type;
  if (userId) query.userId = userId;
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return await this.find(query)
    .populate('userId', 'name email')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Método estático para estatísticas
logSchema.statics.getStats = async function(startDate, endDate) {
  const match = {};
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = new Date(startDate);
    if (endDate) match.timestamp.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);

  const typeStats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    byLevel: stats,
    byType: typeStats
  };
};

// Limpar logs antigos (mais de 90 dias)
logSchema.statics.cleanOldLogs = async function(days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });

  return result.deletedCount;
};

module.exports = mongoose.model('Log', logSchema);





