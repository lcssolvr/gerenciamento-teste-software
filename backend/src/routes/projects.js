const express = require("express");
const router = express.Router();

const { verifyToken, verifyAdmin } = require("../middleware/auth");


const projectService = require("../services/projectService");

router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (!req.body.clients || req.body.clients.length === 0) {
      return res.status(400).json({ error: "Um projeto deve estar vinculado a pelo menos um cliente" });
    }
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    res.status(500).json({ error: "Erro ao criar projeto" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const projects = await projectService.listProjects();
    
    if (req.user.admin === true) { 
      return res.json(projects);
    }

    const filtered = projects.filter(p =>
      (p.collaborators?.includes(req.user.uid)) || (p.clients?.includes(req.user.uid))
    );
    res.json(filtered);
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    res.status(500).json({ error: "Erro ao listar projetos" });
  }
});

router.get("/:projectId", verifyToken, async (req, res) => {
  try {
    const project = await projectService.getProject(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Projeto não encontrado" });
    
    const userHasAccess = req.user.admin === true || 
                          project.collaborators?.includes(req.user.uid) ||
                          project.clients?.includes(req.user.uid);

    if (!userHasAccess) {
      return res.status(403).json({ error: "Você não tem permissão para ver este projeto." });
    }
    
    res.json(project);
  } catch (error) {
    console.error("Erro ao buscar projeto:", error);
    res.status(500).json({ error: "Erro ao buscar projeto" });
  }
});

module.exports = router;