const { auth, db } = require('../config/firebase');
const { COLLECTIONS, firestoreUtils } = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login com email e senha
const loginWithEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário no Firestore
    const usersRef = db.collection(COLLECTIONS.USERS);
    const userQuery = await usersRef.where('email', '==', email).get();

    if (userQuery.empty) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verificar se o usuário está ativo
    if (!userData.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário desativado. Entre em contato com o administrador.'
      });
    }

    // Verificar senha (se houver senha hash armazenada)
    if (userData.passwordHash) {
      const isValidPassword = await bcrypt.compare(password, userData.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }
    } else {
      // Para usuários criados via Firebase Auth, tentar autenticar via Firebase
      try {
        // Criar um token customizado para o usuário
        const customToken = await auth.createCustomToken(userDoc.id);
        
        // Retornar token customizado para o frontend usar com Firebase Auth
        return res.json({
          success: true,
          message: 'Login realizado com sucesso',
          data: {
            customToken,
            user: {
              id: userDoc.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              company: userData.company,
              department: userData.department,
              isActive: userData.isActive
            }
          }
        });
      } catch (firebaseError) {
        console.error('Erro ao criar token customizado:', firebaseError);
        return res.status(401).json({
          success: false,
          message: 'Erro na autenticação'
        });
      }
    }

    // Gerar JWT token
    const token = jwt.sign(
      {
        uid: userDoc.id,
        email: userData.email,
        role: userData.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Atualizar último login
    await userDoc.ref.update({
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          company: userData.company,
          department: userData.department,
          isActive: userData.isActive,
          lastLoginAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    next(error);
  }
};

// Verificar token Firebase (para login com Google)
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Token do Firebase é obrigatório'
      });
    }

    // Verificar token do Firebase
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Buscar ou criar usuário no Firestore
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    const userDoc = await userRef.get();

    let userData;

    if (!userDoc.exists) {
      // Criar novo usuário
      userData = {
        name: name || email.split('@')[0],
        email,
        role: 'Usuário', // Role padrão
        picture,
        provider: 'google',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };

      await userRef.set(userData);
      userData.id = uid;
    } else {
      // Usuário existente
      userData = userDoc.data();
      userData.id = userDoc.id;

      // Verificar se o usuário está ativo
      if (!userData.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuário desativado. Entre em contato com o administrador.'
        });
      }

      // Atualizar último login
      await userRef.update({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
        ...(picture && { picture }) // Atualizar foto se disponível
      });
    }

    res.json({
      success: true,
      message: 'Autenticação realizada com sucesso',
      data: {
        token: idToken, // Usar o próprio token do Firebase
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          picture: userData.picture,
          company: userData.company,
          department: userData.department,
          isActive: userData.isActive,
          provider: userData.provider || 'google'
        }
      }
    });

  } catch (error) {
    console.error('Erro na verificação do token Firebase:', error);
    
    if (error.code && error.code.startsWith('auth/')) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
    
    next(error);
  }
};

// Obter dados do usuário atual
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const userData = firestoreUtils.convertDoc(userDoc);

    res.json({
      success: true,
      data: {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          picture: userData.picture,
          company: userData.company,
          department: userData.department,
          phone: userData.phone,
          isActive: userData.isActive,
          provider: userData.provider,
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    next(error);
  }
};

// Logout (invalidar token - apenas para JWT customizado)
const logout = async (req, res, next) => {
  try {
    // Para tokens Firebase, o logout é feito no frontend
    // Para JWT customizado, podemos implementar uma blacklist se necessário
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    next(error);
  }
};

// Criar usuário com senha (para administradores)
const createUserWithPassword = async (req, res, next) => {
  try {
    const { name, email, password, role, company, department, phone } = req.body;

    // Verificar se o usuário já existe
    const existingUserQuery = await db.collection(COLLECTIONS.USERS)
      .where('email', '==', email)
      .get();

    if (!existingUserQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Criar usuário no Firestore
    const userData = firestoreUtils.addTimestamps({
      name,
      email,
      passwordHash,
      role: role || 'Usuário',
      company: company || '',
      department: department || '',
      phone: phone || '',
      isActive: true,
      provider: 'email'
    });

    const userRef = await db.collection(COLLECTIONS.USERS).add(userData);
    const newUserDoc = await userRef.get();
    const newUser = firestoreUtils.convertDoc(newUserDoc);

    // Remover passwordHash da resposta
    delete newUser.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: newUser
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    next(error);
  }
};

module.exports = {
  loginWithEmail,
  verifyFirebaseToken,
  getCurrentUser,
  logout,
  createUserWithPassword
};

