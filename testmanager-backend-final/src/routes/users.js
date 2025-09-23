// src/routes/users.js
const express = require('express')
const admin = require('firebase-admin')
const router = express.Router()
const { requireAuth, requireAdmin } = require('../middleware/auth')

// lista usuários (tela Users) – ADMIN
router.get('/', requireAdmin, async (req, res) => {
  try {
    const ref = admin.firestore().collection('users').orderBy('createdAt', 'desc')
    const snap = await ref.get()
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return res.json({ ok: true, data: items })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// dados do próprio usuário
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { uid, role, clientId, email } = req.user
    const snap = await admin.firestore().collection('users').doc(uid).get()
    const data = snap.exists ? snap.data() : {}
    return res.json({ ok: true, data: { uid, email, role, clientId, ...data } })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// atualizar o próprio usuário
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { uid, role, clientId } = req.user
    const { fullName, cpfCnpj, address } = req.body || {}

    const toUpdate = {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(cpfCnpj !== undefined ? { cpfCnpj } : {}),
      ...(address  !== undefined ? { address  } : {}),
      updatedAt: new Date(),
    }
    if (Object.keys(toUpdate).length === 1) {
      return res.status(400).json({ ok: false, error: 'nada para atualizar' })
    }

    await admin.firestore().collection('users').doc(uid).set(toUpdate, { merge: true })

    if (role === 'client' && clientId) {
      const clientUpdate = {
        ...(fullName !== undefined ? { name: fullName } : {}),
        ...(cpfCnpj !== undefined ? { cpfCnpj } : {}),
        ...(address  !== undefined ? { address  } : {}),
        updatedAt: new Date(),
      }
      await admin.firestore().collection('clients').doc(clientId).set(clientUpdate, { merge: true })
    }

    return res.json({ ok: true })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

module.exports = router
