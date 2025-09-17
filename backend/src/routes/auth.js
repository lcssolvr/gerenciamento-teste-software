const express = require('express');
const router = express.Router();


// Importar controllers
const {
  loginWithEmail,
  verifyFirebaseToken,
  getCurrentUser,
  logout,
  createUserWithPassword
} = require('../controllers/authController');


// Importar middlewares
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateLogin, validateUser } = require('../middleware/validation');

console.log('Função getCurrentUser:', getCurrentUser);
console.log('Função verifyToken:', verifyToken);

/**
 * @route   POST /api/auth/login
 * @desc    Login com email e senha
 * @access  Public
 */
router.post('/login', validateLogin, loginWithEmail);

/**
 * @route   POST /api/auth/firebase
 * @desc    Verificar token do Firebase (login com Google)
 * @access  Public
 */
router.post('/firebase', verifyFirebaseToken);

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário atual
 * @access  Private
 */
router.get('/me', verifyToken, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', verifyToken, logout);

/**
 * @route   POST /api/auth/create-user
 * @desc    Criar usuário com senha (apenas administradores)
 * @access  Private (Admin only)
 */
router.post('/create-user', verifyToken, verifyAdmin, validateUser, createUserWithPassword);

module.exports = router;

