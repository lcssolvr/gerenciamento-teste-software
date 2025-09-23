const express = require('express');
const router = express.Router({ mergeParams: true });
const { verifyToken } = require('../middleware/auth');
const projectService = require('../services/projectService');
const testService = require('../services/testService');

async function canAccessProject(user, projectId) {
  const p = await projectService.getProject(projectId);
  if (!p) return { ok: false, status: 404, msg: 'Projeto não encontrado' };
  if (user.role === 'admin' || user.role === 'collaborator') return { ok: true, project: p };
  if (user.role === 'client' && user.clientId && Array.isArray(p.clients) && p.clients.includes(user.clientId)) {
    return { ok: true, project: p };
  }
  return { ok: false, status: 403, msg: 'Acesso negado' };
}

// Listar tests
router.get('/', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const access = await canAccessProject(req.user, projectId);
  if (!access.ok) return res.status(access.status).json({ success:false, message: access.msg });
  const list = await testService.list(projectId);
  res.json({ success:true, data: list });
});

// Criar test
router.post('/', verifyToken, async (req, res) => {
  const { projectId } = req.params;
  const access = await canAccessProject(req.user, projectId);
  if (!access.ok) return res.status(access.status).json({ success:false, message: access.msg });
  const created = await testService.create(projectId, req.body || {}, req.user);
  res.status(201).json({ success:true, data: created });
});

// Atualizar test
router.patch('/:testId', verifyToken, async (req, res) => {
  const { projectId, testId } = req.params;
  const access = await canAccessProject(req.user, projectId);
  if (!access.ok) return res.status(access.status).json({ success:false, message: access.msg });
  const updated = await testService.update(projectId, testId, req.body || {});
  res.json({ success:true, data: updated });
});

// Excluir test (com remoção de evidências no Storage)
router.delete('/:testId', verifyToken, async (req, res) => {
  const { projectId, testId } = req.params;
  const access = await canAccessProject(req.user, projectId);
  if (!access.ok) return res.status(access.status).json({ success:false, message: access.msg });
  const result = await testService.remove(projectId, testId, { cascadeStorage: true });
  res.json({ success:true, data: result });
});

// Adicionar evidência (metadados; upload é feito no frontend)
router.post('/:testId/evidence', verifyToken, async (req, res) => {
  const { projectId, testId } = req.params;
  const access = await canAccessProject(req.user, projectId);
  if (!access.ok) return res.status(access.status).json({ success:false, message: access.msg });
  const { path, url, contentType, size, name } = req.body || {};
  if (!path || !url) return res.status(400).json({ success:false, message:'path e url são obrigatórios' });
  const updated = await testService.addEvidence(projectId, testId, { path, url, contentType, size, name, uploadedBy: req.user.uid });
  res.status(201).json({ success:true, data: updated });
});

// Remover evidência (deleta do Storage e do doc)
router.delete('/:testId/evidence', verifyToken, async (req, res) => {
  const { projectId, testId } = req.params;
  const access = await canAccessProject(req.user, projectId);
  if (!access.ok) return res.status(access.status).json({ success:false, message: access.msg });
  const { path } = req.body || {};
  if (!path) return res.status(400).json({ success:false, message:'path é obrigatório' });
  const updated = await testService.removeEvidence(projectId, testId, path);
  res.json({ success:true, data: updated });
});

module.exports = router;
