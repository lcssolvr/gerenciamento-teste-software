const { db } = require('../config/firebase');
const { COLLECTIONS, firestoreUtils } = require('../config/database');

// Listar todos os projetos
const getProjects = async (req, res, next) => {
  try {
    const { q, status, priority, page = 1, limit = 10 } = req.query;
    
    let query = db.collection(COLLECTIONS.PROJECTS);
    
    // Aplicar filtros
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (priority) {
      query = query.where('priority', '==', priority);
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
    let projects = firestoreUtils.convertCollection(snapshot);
    
    // Aplicar filtro de busca por nome (se fornecido)
    if (q) {
      const searchTerm = q.toLowerCase();
      projects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Buscar dados dos responsáveis e clientes
    const enrichedProjects = await Promise.all(projects.map(async (project) => {
      // Buscar dados do responsável
      if (project.responsibleId) {
        try {
          const responsibleDoc = await db.collection(COLLECTIONS.USERS).doc(project.responsibleId).get();
          if (responsibleDoc.exists) {
            const responsibleData = responsibleDoc.data();
            project.responsible = {
              id: responsibleDoc.id,
              name: responsibleData.name,
              email: responsibleData.email
            };
          }
        } catch (error) {
          console.error('Erro ao buscar responsável:', error);
        }
      }
      
      // Buscar dados dos clientes
      if (project.clients && Array.isArray(project.clients)) {
        try {
          const clientPromises = project.clients.map(async (clientId) => {
            const clientDoc = await db.collection(COLLECTIONS.CLIENTS).doc(clientId).get();
            if (clientDoc.exists) {
              const clientData = clientDoc.data();
              return {
                id: clientDoc.id,
                name: clientData.name,
                email: clientData.email,
                company: clientData.company
              };
            }
            return null;
          });
          
          const clientsData = await Promise.all(clientPromises);
          project.clientsData = clientsData.filter(client => client !== null);
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
          project.clientsData = [];
        }
      }
      
      return project;
    }));
    
    // Contar total de projetos (para paginação)
    const totalSnapshot = await db.collection(COLLECTIONS.PROJECTS).get();
    const total = totalSnapshot.size;
    
    res.json({
      success: true,
      data: {
        projects: enrichedProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    next(error);
  }
};

// Obter projeto por ID
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const projectDoc = await db.collection(COLLECTIONS.PROJECTS).doc(id).get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }
    
    const project = firestoreUtils.convertDoc(projectDoc);
    
    // Buscar dados do responsável
    if (project.responsibleId) {
      try {
        const responsibleDoc = await db.collection(COLLECTIONS.USERS).doc(project.responsibleId).get();
        if (responsibleDoc.exists) {
          const responsibleData = responsibleDoc.data();
          project.responsible = {
            id: responsibleDoc.id,
            name: responsibleData.name,
            email: responsibleData.email,
            role: responsibleData.role
          };
        }
      } catch (error) {
        console.error('Erro ao buscar responsável:', error);
      }
    }
    
    // Buscar dados dos clientes
    if (project.clients && Array.isArray(project.clients)) {
      try {
        const clientPromises = project.clients.map(async (clientId) => {
          const clientDoc = await db.collection(COLLECTIONS.CLIENTS).doc(clientId).get();
          if (clientDoc.exists) {
            const clientData = clientDoc.data();
            return {
              id: clientDoc.id,
              name: clientData.name,
              email: clientData.email,
              company: clientData.company,
              phone: clientData.phone
            };
          }
          return null;
        });
        
        const clientsData = await Promise.all(clientPromises);
        project.clientsData = clientsData.filter(client => client !== null);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        project.clientsData = [];
      }
    }
    
    res.json({
      success: true,
      data: {
        project
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    next(error);
  }
};

// Criar novo projeto
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, clients, responsibleId } = req.body;
    
    // Verificar se o responsável existe
    if (responsibleId) {
      const responsibleDoc = await db.collection(COLLECTIONS.USERS).doc(responsibleId).get();
      if (!responsibleDoc.exists) {
        return res.status(400).json({
          success: false,
          message: 'Responsável não encontrado'
        });
      }
    }
    
    // Verificar se os clientes existem
    if (clients && Array.isArray(clients)) {
      for (const clientId of clients) {
        const clientDoc = await db.collection(COLLECTIONS.CLIENTS).doc(clientId).get();
        if (!clientDoc.exists) {
          return res.status(400).json({
            success: false,
            message: `Cliente com ID ${clientId} não encontrado`
          });
        }
      }
    }
    
    // Preparar dados do projeto
    const projectData = firestoreUtils.addTimestamps({
      name: name.trim(),
      description: description?.trim() || '',
      status,
      priority,
      clients: clients || [],
      responsibleId,
      createdBy: req.user.uid
    });
    
    // Criar projeto no Firestore
    const projectRef = await db.collection(COLLECTIONS.PROJECTS).add(projectData);
    const newProjectDoc = await projectRef.get();
    const newProject = firestoreUtils.convertDoc(newProjectDoc);
    
    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: {
        project: newProject
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    next(error);
  }
};

// Atualizar projeto
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, clients, responsibleId } = req.body;
    
    // Verificar se o projeto existe
    const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(id);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }
    
    // Verificar se o responsável existe (se fornecido)
    if (responsibleId) {
      const responsibleDoc = await db.collection(COLLECTIONS.USERS).doc(responsibleId).get();
      if (!responsibleDoc.exists) {
        return res.status(400).json({
          success: false,
          message: 'Responsável não encontrado'
        });
      }
    }
    
    // Verificar se os clientes existem (se fornecidos)
    if (clients && Array.isArray(clients)) {
      for (const clientId of clients) {
        const clientDoc = await db.collection(COLLECTIONS.CLIENTS).doc(clientId).get();
        if (!clientDoc.exists) {
          return res.status(400).json({
            success: false,
            message: `Cliente com ID ${clientId} não encontrado`
          });
        }
      }
    }
    
    // Preparar dados para atualização
    const updateData = firestoreUtils.addTimestamps({
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(clients && { clients }),
      ...(responsibleId && { responsibleId }),
      updatedBy: req.user.uid
    }, true);
    
    // Atualizar projeto
    await projectRef.update(updateData);
    
    // Buscar projeto atualizado
    const updatedProjectDoc = await projectRef.get();
    const updatedProject = firestoreUtils.convertDoc(updatedProjectDoc);
    
    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: {
        project: updatedProject
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    next(error);
  }
};

// Deletar projeto
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o projeto existe
    const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(id);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Projeto não encontrado'
      });
    }
    
    // Verificar se o projeto tem testes vinculados
    const testsQuery = await db.collection(COLLECTIONS.TESTS)
      .where('projectId', '==', id)
      .get();
    
    if (!testsQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar projeto que possui testes vinculados'
      });
    }
    
    // Deletar projeto
    await projectRef.delete();
    
    res.json({
      success: true,
      message: 'Projeto deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    next(error);
  }
};

// Buscar projetos
const searchProjects = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Termo de busca deve ter pelo menos 2 caracteres'
      });
    }
    
    const searchTerm = q.toLowerCase().trim();
    
    // Buscar todos os projetos e filtrar por nome/descrição
    const allProjectsSnapshot = await db.collection(COLLECTIONS.PROJECTS).get();
    const allProjects = firestoreUtils.convertCollection(allProjectsSnapshot);
    
    const projects = allProjects.filter(project => 
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm)
    ).slice(0, 10);
    
    res.json({
      success: true,
      data: {
        projects,
        total: projects.length
      }
    });
    
  } catch (error) {
    console.error('Erro na busca de projetos:', error);
    next(error);
  }
};

// Obter estatísticas de projetos
const getProjectStats = async (req, res, next) => {
  try {
    const projectsSnapshot = await db.collection(COLLECTIONS.PROJECTS).get();
    const projects = firestoreUtils.convertCollection(projectsSnapshot);
    
    const stats = {
      total: projects.length,
      byStatus: {},
      byPriority: {},
      active: 0,
      completed: 0
    };
    
    projects.forEach(project => {
      // Contar por status
      stats.byStatus[project.status] = (stats.byStatus[project.status] || 0) + 1;
      
      // Contar por prioridade
      stats.byPriority[project.priority] = (stats.byPriority[project.priority] || 0) + 1;
      
      // Contar ativos e concluídos
      if (project.status === 'Em Andamento' || project.status === 'Planejamento') {
        stats.active++;
      } else if (project.status === 'Concluído') {
        stats.completed++;
      }
    });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas de projetos:', error);
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  getProjectStats
};

