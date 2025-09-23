const express = require('express')
const admin = require('firebase-admin')
const router = express.Router()

function requireAdmin (req, res, next) {
  const user = req.user
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'forbidden' })
  }
  next()
}

// criar usuário com senha + claims + doc em Firestore
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const {
      email, password, fullName, role = 'collaborator',
      clientId = null, isActive = true,
      cpfCnpj = '', address = ''
    } = req.body

    if (!email || !password) return res.status(400).json({ ok: false, error: 'email/password required' })

    const userRecord = await admin.auth().createUser({ email, password })
    await admin.auth().setCustomUserClaims(userRecord.uid, { role, clientId: clientId || null })

    const userDoc = {
      email, fullName: fullName || '', role, clientId: clientId || null, isActive,
      cpfCnpj, address,  // NOVO
      createdAt: new Date(), updatedAt: new Date()
    }
    await admin.firestore().collection('users').doc(userRecord.uid).set(userDoc)

    return res.json({ ok: true, uid: userRecord.uid, data: userDoc })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// criar cliente e, opcionalmente, credenciais para login
router.post('/clients', requireAdmin, async (req, res) => {
  try {
    const {
      name, email, password, createCredentials = false,
      cpfCnpj = '', address = '', ...rest
    } = req.body

    if (!name) return res.status(400).json({ ok: false, error: 'name required' })

    const clientRef = admin.firestore().collection('clients').doc()
    await clientRef.set({
      name, email: email || '', cpfCnpj, address,
      ...rest,
      isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    })

    let authUid = null
    if (createCredentials && email && password) {
      const userRecord = await admin.auth().createUser({ email, password })
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'client', clientId: clientRef.id })

      // cria também o doc em 'users' com cpfCnpj/address para o cliente
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email, fullName: name, role: 'client', clientId: clientRef.id, isActive: true,
        cpfCnpj, address,  // NOVO
        createdAt: new Date(), updatedAt: new Date()
      })
      authUid = userRecord.uid
    }

    return res.json({ ok: true, clientId: clientRef.id, authUid })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

module.exports = router
