const { db } = require('../config/firebase');
const { COLLECTIONS, firestoreUtils } = require('../config/database');
const bcrypt = require('bcryptjs');

// Listar todos os usuários
const getUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    let query = db.collection(COLLECTIONS.USERS);
    
    // Aplicar filtro de busca se fornecido
    if (q) {
      // Firestore não suporta busca full-text nativa, então vamos buscar por email
      // Em produção, considere usar Algolia ou Elasticsearch para busca avançada
      query = query.where('email', '>=', q.toLowerCase())
                   .where('email', '<=', q.toLowerCase() + '\uf8ff');
    }
    
    // Ordenar por data de criação
    query = query.orderBy('createdAt', 'desc');
    
    // Aplicar paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    const users = firestoreUtils.convertCollection(snapshot);
    
    // Remover dados sensíveis
    const sanitizedUsers = users.map(user => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });
    
    // Contar total de usuários (para paginação)
    const totalSnapshot = await db.collection(COLLECTIONS.USERS).get();
    const total = totalSnapshot.size;
    
    res.json({
      success: true,
      data: {
        users: sanitizedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    next(error);
  }
};

// Obter usuário por ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const user = firestoreUtils.convertDoc(userDoc);
    
    // Remover dados sensíveis
    const { passwordHash, ...safeUser } = user;
    
    res.json({
      success: true,
      data: {
        user: safeUser
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    next(error);
  }
};

// Criar novo usuário
const createUser = async (req, res, next) => {
  try {
    const { name, email, role, phone, company, department, password, isActive = true } = req.body;
    
    // Verificar se o email já existe
    const existingUserQuery = await db.collection(COLLECTIONS.USERS)
      .where('email', '==', email.toLowerCase())
      .get();
    
    if (!existingUserQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }
    
    // Preparar dados do usuário
    const userData = firestoreUtils.addTimestamps({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      department: department?.trim() || '',
      isActive,
      provider: password ? 'email' : 'admin_created'
    });
    
    // Adicionar hash da senha se fornecida
    if (password) {
      const saltRounds = 12;
      userData.passwordHash = await bcrypt.hash(password, saltRounds);
    }
    
    // Criar usuário no Firestore
    const userRef = await db.collection(COLLECTIONS.USERS).add(userData);
    const newUserDoc = await userRef.get();
    const newUser = firestoreUtils.convertDoc(newUserDoc);
    
    // Remover dados sensíveis da resposta
    const { passwordHash, ...safeUser } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: safeUser
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    next(error);
  }
};

// Atualizar usuário
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, phone, company, department, isActive } = req.body;
    
    // Verificar se o usuário existe
    const userRef = db.collection(COLLECTIONS.USERS).doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Preparar dados para atualização
    const updateData = firestoreUtils.addTimestamps({
      ...(name && { name: name.trim() }),
      ...(role && { role }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(company !== undefined && { company: company.trim() }),
      ...(department !== undefined && { department: department.trim() }),
      ...(isActive !== undefined && { isActive })
    }, true);
    
    // Atualizar usuário
    await userRef.update(updateData);
    
    // Buscar usuário atualizado
    const updatedUserDoc = await userRef.get();
    const updatedUser = firestoreUtils.convertDoc(updatedUserDoc);
    
    // Remover dados sensíveis
    const { passwordHash, ...safeUser } = updatedUser;
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: {
        user: safeUser
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    next(error);
  }
};

// Deletar usuário
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userRef = db.collection(COLLECTIONS.USERS).doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se não é o próprio usuário tentando se deletar
    if (id === req.user.uid) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }
    
    // Verificar se o usuário tem projetos vinculados
    const projectsQuery = await db.collection(COLLECTIONS.PROJECTS)
      .where('responsibleId', '==', id)
      .get();
    
    if (!projectsQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar usuário que possui projetos vinculados'
      });
    }
    
    // Deletar usuário
    await userRef.delete();
    
    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    next(error);
  }
};

// Buscar usuários
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Termo de busca deve ter pelo menos 2 caracteres'
      });
    }
    
    const searchTerm = q.toLowerCase().trim();
    
    // Buscar por email (Firestore suporta busca por prefixo)
    const emailQuery = db.collection(COLLECTIONS.USERS)
      .where('email', '>=', searchTerm)
      .where('email', '<=', searchTerm + '\uf8ff')
      .limit(10);
    
    const emailSnapshot = await emailQuery.get();
    let users = firestoreUtils.convertCollection(emailSnapshot);
    
    // Se não encontrou por email, buscar por nome (menos eficiente)
    if (users.length === 0) {
      const allUsersSnapshot = await db.collection(COLLECTIONS.USERS).get();
      const allUsers = firestoreUtils.convertCollection(allUsersSnapshot);
      
      users = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.company.toLowerCase().includes(searchTerm) ||
        user.department.toLowerCase().includes(searchTerm)
      ).slice(0, 10);
    }
    
    // Remover dados sensíveis
    const sanitizedUsers = users.map(user => {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    });
    
    res.json({
      success: true,
      data: {
        users: sanitizedUsers,
        total: sanitizedUsers.length
      }
    });
    
  } catch (error) {
    console.error('Erro na busca de usuários:', error);
    next(error);
  }
};

// Alterar senha do usuário
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Verificar se é o próprio usuário ou um admin
    if (id !== req.user.uid && req.userRole !== 'Administrador') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }
    
    const userRef = db.collection(COLLECTIONS.USERS).doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const userData = userDoc.data();
    
    // Verificar senha atual (se não for admin)
    if (req.userRole !== 'Administrador' && userData.passwordHash) {
      const isValidPassword = await bcrypt.compare(currentPassword, userData.passwordHash);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }
    }
    
    // Hash da nova senha
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Atualizar senha
    await userRef.update({
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  changePassword
};

