import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Serviços de autenticação
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  loginWithFirebase: (idToken) => api.post('/api/auth/firebase', { idToken }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  createUser: (userData) => api.post('/api/auth/create-user', userData)
}

// Serviços de usuários
export const userService = {
  getUsers: (params) => api.get('/api/users', { params }),
  getUserById: (id) => api.get(`/api/users/${id}`),
  createUser: (userData) => api.post('/api/users', userData),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  changePassword: (id, passwordData) => api.put(`/api/users/${id}/password`, passwordData),
  searchUsers: (query) => api.get('/api/users/search', { params: { q: query } })
}

// Serviços de clientes
export const clientService = {
  getClients: (params) => api.get('/api/clients', { params }),
  getClientById: (id) => api.get(`/api/clients/${id}`),
  createClient: (clientData) => api.post('/api/clients', clientData),
  updateClient: (id, clientData) => api.put(`/api/clients/${id}`, clientData),
  deleteClient: (id) => api.delete(`/api/clients/${id}`),
  searchClients: (query) => api.get('/api/clients/search', { params: { q: query } }),
  getStats: () => api.get('/api/clients/stats')
}

// Serviços de projetos
export const projectService = {
  getProjects: (params) => api.get('/api/projects', { params }),
  getProjectById: (id) => api.get(`/api/projects/${id}`),
  createProject: (projectData) => api.post('/api/projects', projectData),
  updateProject: (id, projectData) => api.put(`/api/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/api/projects/${id}`),
  searchProjects: (query) => api.get('/api/projects/search', { params: { q: query } }),
  getStats: () => api.get('/api/projects/stats')
}

