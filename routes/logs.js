const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { protect, authorize } = require('../middleware/auth');

// Todas as rotas requerem admin
router.use(protect, authorize('admin', 'manager'));

// Listar logs com filtros
router.get('/', async (req, res) => {
  try {
    const {
      level,
      type,
      userId,
      startDate,
      endDate,
      limit = 100,
      page = 1
    } = req.query;

    const skip = (page - 1) * limit;

    const logs = await Log.getLogs({}, {
      level,
      type,
      userId,
      startDate,
      endDate,
      limit: parseInt(limit),
      skip,
      sort: { timestamp: -1 }
    });

    const total = await Log.countDocuments({
      ...(level && { level }),
      ...(type && { type }),
      ...(userId && { userId }),
      ...((startDate || endDate) && {
        timestamp: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      })
    });

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar logs',
      error: error.message
    });
  }
});

// Obter estatísticas dos logs
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Log.getStats(startDate, endDate);

    // Total de logs
    const total = await Log.countDocuments({
      ...((startDate || endDate) && {
        timestamp: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      })
    });

    // Logs por dia (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logsByDay = await Log.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Erros recentes
    const recentErrors = await Log.find({ level: 'error' })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('message action timestamp type');

    res.json({
      success: true,
      stats: {
        total,
        byLevel: stats.byLevel,
        byType: stats.byType,
        byDay: logsByDay,
        recentErrors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

// Limpar logs antigos
router.delete('/cleanup', async (req, res) => {
  try {
    const { days = 90 } = req.body;

    const deletedCount = await Log.cleanOldLogs(days);

    res.json({
      success: true,
      message: `${deletedCount} logs antigos foram removidos`,
      deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar logs',
      error: error.message
    });
  }
});

// Obter um log específico
router.get('/:id', async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).populate('userId', 'name email');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log não encontrado'
      });
    }

    res.json({
      success: true,
      log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar log',
      error: error.message
    });
  }
});

// Exportar logs (CSV)
router.get('/export/csv', async (req, res) => {
  try {
    const { startDate, endDate, level, type } = req.query;

    const logs = await Log.getLogs({}, {
      level,
      type,
      startDate,
      endDate,
      limit: 10000
    });

    // Criar CSV
    let csv = 'Timestamp,Level,Type,Action,Message,User,IP\n';
    
    logs.forEach(log => {
      csv += `${log.timestamp},${log.level},${log.type},${log.action},"${log.message}",${log.userName || 'N/A'},${log.ip || 'N/A'}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=logs-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar logs',
      error: error.message
    });
  }
});

module.exports = router;





