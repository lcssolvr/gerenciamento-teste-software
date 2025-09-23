const { db } = require('../config/firebase');
const { COLLECTIONS, firestoreUtils } = require('../config/database');

// Listar todos os clientes
const getClients = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    let query = db.collection(COLLECTIONS.CLIENTS);
    
    // Aplicar filtro de busca se fornecido
    if (q) {
      const searchTerm = q.toLowerCase();
      query = query.where('email', '>=', searchTerm)
                   .where('email', '<=', searchTerm + '\uf8ff');
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
    const clients = firestoreUtils.convertCollection(snapshot);
    
    // Contar total de clientes (para paginação)
    const totalSnapshot = await db.collection(COLLECTIONS.CLIENTS).get();
    const total = totalSnapshot.size;
    
    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    next(error);
  }
};

// Obter cliente por ID
const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const clientDoc = await db.collection(COLLECTIONS.CLIENTS).doc(id).get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const client = firestoreUtils.convertDoc(clientDoc);
    
    res.json({
      success: true,
      data: {
        client
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    next(error);
  }
};

// Criar novo cliente
const createClient = async (req, res, next) => {
  try {
    const { name, email, company, phone, address, notes } = req.body;
    
    // Verificar se o email já existe
    const existingClientQuery = await db.collection(COLLECTIONS.CLIENTS)
      .where('email', '==', email.toLowerCase())
      .get();
    
    if (!existingClientQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }
    
    // Preparar dados do cliente
    const clientData = firestoreUtils.addTimestamps({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company?.trim() || '',
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      notes: notes?.trim() || '',
      createdBy: req.user.uid
    });
    
    // Criar cliente no Firestore
    const clientRef = await db.collection(COLLECTIONS.CLIENTS).add(clientData);
    const newClientDoc = await clientRef.get();
    const newClient = firestoreUtils.convertDoc(newClientDoc);
    
    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: {
        client: newClient
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    next(error);
  }
};

// Atualizar cliente
const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, company, phone, address, notes } = req.body;
    
    // Verificar se o cliente existe
    const clientRef = db.collection(COLLECTIONS.CLIENTS).doc(id);
    const clientDoc = await clientRef.get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Verificar se o email já existe em outro cliente
    if (email) {
      const existingClientQuery = await db.collection(COLLECTIONS.CLIENTS)
        .where('email', '==', email.toLowerCase())
        .get();
      
      const existingClient = existingClientQuery.docs.find(doc => doc.id !== id);
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso por outro cliente'
        });
      }
    }
    
    // Preparar dados para atualização
    const updateData = firestoreUtils.addTimestamps({
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(company !== undefined && { company: company.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(address !== undefined && { address: address.trim() }),
      ...(notes !== undefined && { notes: notes.trim() }),
      updatedBy: req.user.uid
    }, true);
    
    // Atualizar cliente
    await clientRef.update(updateData);
    
    // Buscar cliente atualizado
    const updatedClientDoc = await clientRef.get();
    const updatedClient = firestoreUtils.convertDoc(updatedClientDoc);
    
    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: {
        client: updatedClient
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    next(error);
  }
};

// Deletar cliente
const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o cliente existe
    const clientRef = db.collection(COLLECTIONS.CLIENTS).doc(id);
    const clientDoc = await clientRef.get();
    
    if (!clientDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Verificar se o cliente tem projetos vinculados
    const projectsQuery = await db.collection(COLLECTIONS.PROJECTS)
      .where('clients', 'array-contains', id)
      .get();
    
    if (!projectsQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar cliente que possui projetos vinculados'
      });
    }
    
    // Deletar cliente
    await clientRef.delete();
    
    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    next(error);
  }
};

// Buscar clientes
const searchClients = async (req, res, next) => {
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
    const emailQuery = db.collection(COLLECTIONS.CLIENTS)
      .where('email', '>=', searchTerm)
      .where('email', '<=', searchTerm + '\uf8ff')
      .limit(10);
    
    const emailSnapshot = await emailQuery.get();
    let clients = firestoreUtils.convertCollection(emailSnapshot);
    
    // Se não encontrou por email, buscar por nome (menos eficiente)
    if (clients.length === 0) {
      const allClientsSnapshot = await db.collection(COLLECTIONS.CLIENTS).get();
      const allClients = firestoreUtils.convertCollection(allClientsSnapshot);
      
      clients = allClients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.company.toLowerCase().includes(searchTerm)
      ).slice(0, 10);
    }
    
    res.json({
      success: true,
      data: {
        clients,
        total: clients.length
      }
    });
    
  } catch (error) {
    console.error('Erro na busca de clientes:', error);
    next(error);
  }
};

// Obter estatísticas de clientes
const getClientStats = async (req, res, next) => {
  try {
    const clientsSnapshot = await db.collection(COLLECTIONS.CLIENTS).get();
    const total = clientsSnapshot.size;
    
    // Contar clientes ativos (que têm projetos)
    const projectsSnapshot = await db.collection(COLLECTIONS.PROJECTS).get();
    const projects = firestoreUtils.convertCollection(projectsSnapshot);
    
    const clientsWithProjects = new Set();
    projects.forEach(project => {
      if (project.clients && Array.isArray(project.clients)) {
        project.clients.forEach(clientId => clientsWithProjects.add(clientId));
      }
    });
    
    const active = clientsWithProjects.size;
    
    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas de clientes:', error);
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats
};

