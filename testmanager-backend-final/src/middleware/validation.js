const { body, param, query, validationResult } = require('express-validator');

// Middleware para processar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validações para usuários
const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),
    
  body('role')
    .notEmpty()
    .withMessage('Função é obrigatória')
    .isIn(['Administrador', 'Gerente', 'Usuário'])
    .withMessage('Função deve ser: Administrador, Gerente ou Usuário'),
    
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ter um formato válido'),
    
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Empresa deve ter no máximo 100 caracteres'),
    
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Departamento deve ter no máximo 100 caracteres'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser verdadeiro ou falso'),
    
  handleValidationErrors
];

// Validações para clientes
const validateClient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),
    
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Empresa deve ter no máximo 100 caracteres'),
    
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ter um formato válido'),
    
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Endereço deve ter no máximo 200 caracteres'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres'),
    
  handleValidationErrors
];

// Validações para projetos
const validateProject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome do projeto é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
    
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['Planejamento', 'Em Andamento', 'Pausado', 'Concluído', 'Cancelado'])
    .withMessage('Status deve ser: Planejamento, Em Andamento, Pausado, Concluído ou Cancelado'),
    
  body('priority')
    .notEmpty()
    .withMessage('Prioridade é obrigatória')
    .isIn(['Baixa', 'Média', 'Alta', 'Crítica'])
    .withMessage('Prioridade deve ser: Baixa, Média, Alta ou Crítica'),
    
  body('clients')
    .optional()
    .isArray()
    .withMessage('Clientes deve ser uma lista'),
    
  body('clients.*')
    .optional()
    .isString()
    .withMessage('ID do cliente deve ser uma string'),
    
  body('responsibleId')
    .notEmpty()
    .withMessage('Responsável é obrigatório')
    .isString()
    .withMessage('ID do responsável deve ser uma string'),
    
  handleValidationErrors
];

// Validações para login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ter um formato válido')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
    
  handleValidationErrors
];

// Validações para parâmetros de ID
const validateId = [
  param('id')
    .notEmpty()
    .withMessage('ID é obrigatório')
    .isString()
    .withMessage('ID deve ser uma string válida'),
    
  handleValidationErrors
];

// Validações para query de busca
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
    
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateClient,
  validateProject,
  validateLogin,
  validateId,
  validateSearch,
  handleValidationErrors
};

