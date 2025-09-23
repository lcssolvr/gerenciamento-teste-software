function isAdmin(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success:false, message: "Usuário não autenticado" });
    if (req.user.role !== "admin") {
      return res.status(403).json({ success:false, message: "Acesso negado. Somente administradores." });
    }
    next();
  } catch (error) {
    console.error("Erro no middleware isAdmin:", error);
    return res.status(500).json({ success:false, message: "Erro interno no servidor" });
  }
}

module.exports = isAdmin;
