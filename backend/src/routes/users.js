const express = require("express");
const router = express.Router();

const { verifyToken, verifyAdmin } = require("../middleware/auth"); 
const userService = require("../services/userService");

router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await userService.getUser(req.user.uid);
    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário logado:", error);
    res.status(500).json({ error: "Erro ao buscar usuário logado" });
  }
});

module.exports = router;