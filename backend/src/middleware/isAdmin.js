async function isAdmin(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }
  
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Acesso negado. Somente administradores." });
      }
  
      next();
    } catch (error) {
      console.error("Erro no middleware isAdmin:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
  
  module.exports = isAdmin;
  