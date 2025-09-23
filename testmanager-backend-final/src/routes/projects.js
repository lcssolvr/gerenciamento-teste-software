const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const projectService = require('../services/projectService');

// Criar projeto (admin/collaborator)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'client') return res.status(403).json({ success:false, message:'Clientes não podem criar projetos' });
    const created = await projectService.createProject(req.body || {}, req.user.uid);
    res.status(201).json({ success:true, data: created });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao criar projeto' });
  }
});

// Listar projetos (com filtro por role)
router.get('/', verifyToken, async (req, res) => {
  try {
    const list = await projectService.listProjectsForUser(req.user);
    res.json({ success:true, data: list });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao listar projetos' });
  }
});

// Obter projeto
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const p = await projectService.getProject(req.params.id);
    if (!p) return res.status(404).json({ success:false, message:'Projeto não encontrado' });
    if (req.user.role === 'client' && Array.isArray(p.clients)) {
      if (!req.user.clientId || !p.clients.includes(req.user.clientId)) {
        return res.status(403).json({ success:false, message:'Acesso negado' });
      }
    }
    res.json({ success:true, data: p });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao obter projeto' });
  }
});

// Atualizar projeto (admin/collaborator se membro)
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const p = await projectService.getProject(req.params.id);
    if (!p) return res.status(404).json({ success:false, message:'Projeto não encontrado' });
    if (req.user.role === 'client') return res.status(403).json({ success:false, message:'Clientes não podem editar' });
    // colaborador deve ser membro
    if (req.user.role === 'collaborator' && Array.isArray(p.members) && !p.members.includes(req.user.uid)) {
      return res.status(403).json({ success:false, message:'Somente membros podem editar' });
    }
    const updated = await projectService.updateProject(req.params.id, req.body || {});
    res.json({ success:true, data: updated });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao atualizar projeto' });
  }
});

// Excluir projeto (admin/collab)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'client') return res.status(403).json({ success:false, message:'Clientes não podem excluir' });
    await projectService.deleteProject(req.params.id);
    res.json({ success:true, data: { id: req.params.id } });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao excluir projeto' });
  }
});

module.exports = router;
