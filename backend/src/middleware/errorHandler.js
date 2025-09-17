// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erro de validação do Firebase
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(400).json({
      success: false,
      message: getFirebaseErrorMessage(err.code),
      code: err.code
    });
  }

  // Erro de validação do Firestore
  if (err.code && err.code.includes('firestore/')) {
    return res.status(400).json({
      success: false,
      message: 'Erro na operação do banco de dados',
      code: err.code
    });
  }

  // Erro de token JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido no corpo da requisição'
    });
  }

  // Erro customizado da aplicação
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Erro na aplicação'
    });
  }

  // Erro interno do servidor
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// Middleware para rotas não encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Função para traduzir códigos de erro do Firebase
const getFirebaseErrorMessage = (code) => {
  const errorMessages = {
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'Email já está em uso',
    'auth/weak-password': 'Senha muito fraca',
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuário desabilitado',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/invalid-credential': 'Credenciais inválidas',
    'auth/id-token-expired': 'Token expirado',
    'auth/id-token-revoked': 'Token revogado',
    'auth/invalid-id-token': 'Token inválido'
  };

  return errorMessages[code] || 'Erro de autenticação';
};

// Função para criar erro customizado
const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = {
  errorHandler,
  notFound,
  createError
};

