const admin = require('../config/firebase')

/**
 * Extrai claims do token (com defaults) e retorna um objeto "flat".
 */
function claimsFromDecoded(decoded) {
  return {
    uid: decoded.uid,
    email: decoded.email || null,
    role: decoded.role || 'collaborator',   // default seguro
    clientId: decoded.clientId || null,
  }
}

/**
 * Middleware principal de autenticação via Firebase ID Token (Bearer).
 * - Verifica o token
 * - Preenche req.user com { uid, email, role, clientId, fullName? }
 * - (Opcional) Carrega dados do Firestore ('users/{uid}') para enriquecer (ex.: fullName)
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token não fornecido' })
    }

    const token = authHeader.slice(7)
    // Obs.: não passe {checkRevoked:true} aqui para não degradar performance
    const decoded = await admin.auth().verifyIdToken(token)

    // Base: claims do token
    const baseUser = claimsFromDecoded(decoded)

    // Enriquecer com Firestore (fullName, cpfCnpj, address, role/clientId caso ainda não estejam)
    try {
      const snap = await admin.firestore().collection('users').doc(baseUser.uid).get()
      if (snap.exists) {
        const data = snap.data() || {}
        baseUser.fullName = data.fullName || null
        baseUser.cpfCnpj  = data.cpfCnpj  || null
        baseUser.address  = data.address  || null
        // Se no doc existir role/clientId e o token ainda não tiver (ou divergir), preferimos o doc
        if (data.role && data.role !== baseUser.role)      baseUser.role = data.role
        if (data.clientId && data.clientId !== baseUser.clientId) baseUser.clientId = data.clientId
      }
    } catch (e) {
      // não falha a request por causa do Firestore; apenas loga
      console.warn('[auth] Falha ao enriquecer user do Firestore:', e.message)
    }

    // flags úteis
    baseUser.isAdmin = baseUser.role === 'admin'

    req.user = baseUser
    return next()
  } catch (error) {
    console.error('Erro de autenticação:', error)
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado' })
  }
}

/**
 * Garante que a rota só é acessada por usuário autenticado (usa req.user do verifyToken).
 */
function requireAuth(req, res, next) {
  if (!req.user?.uid) {
    return res.status(401).json({ success: false, message: 'Não autenticado' })
  }
  next()
}

/**
 * Garante que a rota só é acessada por ADMIN.
 */
function requireAdmin(req, res, next) {
  if (!req.user?.uid) {
    return res.status(401).json({ success: false, message: 'Não autenticado' })
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Permissão negada (admin apenas)' })
  }
  next()
}

module.exports = { verifyToken, requireAuth, requireAdmin }
