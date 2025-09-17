const admin = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Acesso negado. Nenhum token fornecido.');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('Token inválido.');
  }
};

const verifyAdmin = async (req, res, next) => {
  if (req.user && req.user.admin === true) {
    next();
  } else {
    res.status(403).send('Acesso negado. Requer privilégios de administrador.');
  }
};

module.exports = {
  verifyToken,
  verifyAdmin
};