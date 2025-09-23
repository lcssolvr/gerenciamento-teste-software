const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares base
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// depois do seu middleware que valida o token e popula req.user com { uid, role, clientId }
const adminRoutes = require('./routes/admin')
app.use('/api/admin', adminRoutes)


// Rotas
app.get('/health', (req, res) => res.json({
  success: true,
  message: 'TestManager API está funcionando',
  timestamp: new Date().toISOString(),
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects/:projectId/tests', require('./routes/tests'));

// 404 e erros
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
process.on('uncaughtException',  (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

module.exports = app;
