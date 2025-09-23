// src/services/api.js
import axios from 'axios'
import { auth } from './firebase' // <<< AQUI! (era ../firebase)

// axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
})

// anexa o ID token do Firebase (se estiver logado)
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// helper compatível com assinatura antiga { method, body }
export async function $api (url, opts = {}) {
  const { method = 'GET', body, params, headers } = opts
  const res = await api.request({
    url,
    method,
    data: body,
    params,
    headers,
  })
  return res.data
}

export default api
