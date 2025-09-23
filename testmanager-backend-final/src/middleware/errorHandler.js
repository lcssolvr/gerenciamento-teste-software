// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const payload = {
    success: false,
    message: err.message || 'Erro interno do servidor',
  };
  if (err.code) payload.code = err.code;
  if (process.env.NODE_ENV !== 'production' && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
};

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Função para criar erro customizado
const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = { errorHandler, notFound, createError };
