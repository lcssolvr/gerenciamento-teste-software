import { defineStore } from 'pinia'
import { authService } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'Administrador',
    isManager: (state) => ['Administrador', 'Gerente'].includes(state.user?.role),
    userRole: (state) => state.user?.role
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authService.login(credentials)
        const { token, user } = response.data.data
        
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return { success: true, user }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao fazer login'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async loginWithFirebase(idToken) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authService.loginWithFirebase(idToken)
        const { token, user } = response.data.data
        
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return { success: true, user }
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao fazer login com Google'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Erro ao fazer logout:', error)
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    async checkAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          const response = await authService.me()
          this.token = token
          this.user = response.data.data
          this.isAuthenticated = true
        } catch (error) {
          this.logout()
        }
      }
    },

    initializeAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    }
  }
})

