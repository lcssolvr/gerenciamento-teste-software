<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Novo Usuário</h2>
        <button class="modal-close" @click="closeModal">
          <svg fill="currentColor" viewBox="0 0 24 24" class="close-icon">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="createUser" class="modal-body">
        <Input
          v-model="form.fullName"
          label="Nome Completo"
          placeholder="Digite o nome completo"
          required
          :error="errors.fullName"
        />

        <Input
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="Digite o email"
          required
          :error="errors.email"
        />

        <div class="form-group">
          <label class="form-label">Função no Sistema *</label>
          <select v-model="form.role" class="form-select" required>
            <option value="">Selecione uma função</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="user">Usuário</option>
          </select>
          <div v-if="errors.role" class="input-error">{{ errors.role }}</div>
        </div>

        <Input
          v-model="form.phone"
          label="Telefone"
          placeholder="Digite o telefone"
          :error="errors.phone"
        />

        <Input
          v-model="form.company"
          label="Empresa"
          placeholder="Digite o nome da empresa"
          :error="errors.company"
        />

        <Input
          v-model="form.department"
          label="Departamento"
          placeholder="Digite o departamento"
          :error="errors.department"
        />

        <div class="form-group">
          <label class="checkbox-container">
            <input type="checkbox" v-model="form.isActive" class="checkbox">
            <span class="checkmark"></span>
            Usuário ativo no sistema
          </label>
        </div>

        <div class="modal-footer">
          <Button variant="secondary" @click="closeModal" type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Criando...' : 'Criar Usuário' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Button from '../common/Button.vue'
import Input from '../common/Input.vue'

export default {
  name: 'NewUserModal',
  components: {
    Button,
    Input
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'user-created'],
  data() {
    return {
      isLoading: false,
      form: {
        fullName: '',
        email: '',
        role: '',
        phone: '',
        company: '',
        department: '',
        isActive: true
      },
      errors: {}
    }
  },
  methods: {
    closeModal() {
      this.resetForm()
      this.$emit('close')
    },
    
    resetForm() {
      this.form = {
        fullName: '',
        email: '',
        role: '',
        phone: '',
        company: '',
        department: '',
        isActive: true
      }
      this.errors = {}
    },
    
    validateForm() {
      this.errors = {}
      let isValid = true
      
      if (!this.form.fullName.trim()) {
        this.errors.fullName = 'Nome completo é obrigatório'
        isValid = false
      }
      
      if (!this.form.email.trim()) {
        this.errors.email = 'Email é obrigatório'
        isValid = false
      } else if (!this.isValidEmail(this.form.email)) {
        this.errors.email = 'Digite um email válido'
        isValid = false
      }
      
      if (!this.form.role) {
        this.errors.role = 'Função no sistema é obrigatória'
        isValid = false
      }
      
      return isValid
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    async createUser() {
      if (!this.validateForm()) {
        return
      }
      
      this.isLoading = true
      
      try {
        // Simular criação de usuário - aqui será integrado com Firebase
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newUser = {
          id: Date.now(),
          name: this.form.fullName,
          email: this.form.email,
          role: this.getRoleLabel(this.form.role),
          phone: this.form.phone,
          company: this.form.company,
          department: this.form.department,
          isActive: this.form.isActive
        }
        
        this.$emit('user-created', newUser)
        this.closeModal()
      } catch (error) {
        console.error('Error creating user:', error)
        this.errors.general = 'Erro ao criar usuário. Tente novamente.'
      } finally {
        this.isLoading = false
      }
    },
    
    getRoleLabel(role) {
      const roles = {
        admin: 'Administrador',
        manager: 'Gerente',
        user: 'Usuário'
      }
      return roles[role] || role
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #333;
  background-color: #f8f9fa;
}

.close-icon {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  transition: all 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.checkbox {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.input-error {
  margin-top: 6px;
  font-size: 12px;
  color: #dc3545;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 480px) {
  .modal {
    margin: 10px;
    max-width: none;
  }
  
  .modal-header {
    padding: 20px 20px 0 20px;
  }
  
  .modal-body {
    padding: 0 20px 20px 20px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: 8px;
  }
}
</style>

