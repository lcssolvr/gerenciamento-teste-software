const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const userService = require('../services/userService');

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const doc = await userService.getUser(req.user.uid);
    res.json({ success:true, data: { ...req.user, profile: doc || null } });
  } catch (e) {
    res.status(500).json({ success:false, message: 'Erro ao obter usuário' });
  }
});

// POST /api/auth/logout (sem efeito no servidor)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ success:true, message:'Logout client-side. Invalide o token refazendo login.' });
});

// POST /api/auth/create-user (admin)
router.post('/create-user', verifyToken, isAdmin, async (req, res) => {
  try {
    const { email, password, fullName, role = 'collaborator', clientId = null } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Email e senha são obrigatórios' });

    const created = await admin.auth().createUser({ email, password, displayName: fullName || email.split('@')[0] });
    // Set claims
    await admin.auth().setCustomUserClaims(created.uid, { role, ...(clientId ? { clientId } : {}) });
    // Create user doc
    const profile = await userService.createUserDoc(created.uid, { email, fullName, role, clientId });

    res.status(201).json({ success:true, data: { uid: created.uid, profile } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message: 'Erro ao criar usuário' });
  }
});

module.exports = router;
