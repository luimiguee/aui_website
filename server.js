const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const { requestLogger, errorLogger } = require('./middleware/logging');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Local URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aui_website';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use(requestLogger);

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Conectar ao MongoDB Local
console.log('🔌 Conectando ao MongoDB Local...');
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Conectado ao MongoDB');
  await logger.logSystem('startup', 'Servidor iniciado e conectado ao MongoDB');
})
.catch(async (err) => {
  console.error('❌ Erro ao conectar ao MongoDB:', err);
  await logger.error('database', 'connection', 'Erro ao conectar ao MongoDB', err);
});

// Importar rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const logsRoutes = require('./routes/logs');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Middleware de erro (deve ser o último)
app.use(errorLogger);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Acesse: http://localhost:${PORT}`);
  await logger.logSystem('startup', `Servidor iniciado na porta ${PORT}`, { port: PORT });
});


