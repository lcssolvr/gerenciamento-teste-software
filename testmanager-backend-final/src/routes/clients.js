const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const clientService = require('../services/clientService');

// Criar cliente (admin/collaborator)
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'client') return res.status(403).json({ success:false, message:'Clientes não podem criar clientes' });
    const created = await clientService.createClient(req.body || {});
    res.status(201).json({ success:true, data: created });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao criar cliente' });
  }
});

// Listar clientes
router.get('/', verifyToken, async (req, res) => {
  try {
    // client role: pode listar apenas o seu clientId se existir
    if (req.user.role === 'client' && req.user.clientId) {
      const me = await clientService.getClient(req.user.clientId);
      return res.json({ success:true, data: me ? [me] : [] });
    }
    const list = await clientService.listClients();
    res.json({ success:true, data: list });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao listar clientes' });
  }
});

// Obter cliente
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const c = await clientService.getClient(req.params.id);
    if (!c) return res.status(404).json({ success:false, message:'Cliente não encontrado' });
    // se for client role, só pode acessar o seu
    if (req.user.role === 'client' && req.user.clientId !== req.params.id) {
      return res.status(403).json({ success:false, message:'Acesso negado' });
    }
    res.json({ success:true, data: c });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao obter cliente' });
  }
});

// Atualizar cliente (admin/collaborator)
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'client') return res.status(403).json({ success:false, message:'Clientes não podem editar' });
    const updated = await clientService.updateClient(req.params.id, req.body || {});
    res.json({ success:true, data: updated });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao atualizar cliente' });
  }
});

// Deletar cliente (admin/collaborator)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'client') return res.status(403).json({ success:false, message:'Clientes não podem excluir' });
    await clientService.deleteClient(req.params.id);
    res.json({ success:true, data: { id: req.params.id } });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erro ao excluir cliente' });
  }
});

module.exports = router;
