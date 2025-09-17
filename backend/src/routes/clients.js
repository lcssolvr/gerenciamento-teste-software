// src/routes/clients.js

const express = require("express");
const router = express.Router();

// 1. CORREÇÃO: Usar o caminho correto e a desestruturação para importar
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const clientService = require("../services/clientService");

// Criar cliente (admin e colaboradores podem)
// 2. CORREÇÃO: Usar o nome correto da função 'verifyToken'
router.post("/", verifyToken, async (req, res) => {
  try {
    // Esta lógica de roles parece ok, mas certifique-se que `req.user.role` existe
    if (req.user.role === "client") {
      return res.status(403).json({ error: "Clientes não podem criar outros clientes" });
    }
    const client = await clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

// Listar clientes (apenas admin)
// 3. CORREÇÃO: Usar os nomes corretos 'verifyToken' e 'verifyAdmin'
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const clients = await clientService.listClients();
    res.json(clients);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ error: "Erro ao listar clientes" });
  }
});

// Buscar cliente por ID (admin e colaborador podem)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "client") {
      return res.status(403).json({ error: "Clientes não podem acessar dados de outros clientes" });
    }
    const client = await clientService.getClient(req.params.id);
    if (!client) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(client);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});

module.exports = router;