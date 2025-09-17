const admin = require("../config/firebase");

async function authorizeProjectAccess(req, res, next) {
  try {
    const user = req.user;
    const { projectId } = req.params;

    if (!user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (user.role === "admin") {
      return next();
    }

    const db = admin.firestore();
    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }

    const projectData = projectDoc.data();

    if (projectData.collaborators?.includes(user.uid)) {
      return next();
    }

    if (projectData.clients?.includes(user.uid)) {
      return next();
    }

    return res.status(403).json({ error: "Acesso negado ao projeto" });
  } catch (error) {
    console.error("Erro em authorizeProjectAccess:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

module.exports = authorizeProjectAccess;
