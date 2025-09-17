<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Novo Cliente</h2>
        <button class="modal-close" @click="closeModal">
          <svg fill="currentColor" viewBox="0 0 24 24" class="close-icon">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="createClient" class="modal-body">
        <Input
          v-model="form.name"
          label="Nome"
          placeholder="Digite o nome do cliente"
          required
          :error="errors.name"
        />

        <Input
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="Digite o email"
          required
          :error="errors.email"
        />

        <div class="form-row">
          <div class="form-col">
            <Input
              v-model="form.company"
              label="Empresa"
              placeholder="Digite o nome da empresa"
              :error="errors.company"
            />
          </div>
          <div class="form-col">
            <Input
              v-model="form.phone"
              label="Telefone"
              placeholder="Digite o telefone"
              :error="errors.phone"
            />
          </div>
        </div>

        <Input
          v-model="form.address"
          label="Endereço"
          placeholder="Digite o endereço completo"
          :error="errors.address"
        />

        <div class="form-group">
          <label class="form-label">Observações</label>
          <textarea
            v-model="form.notes"
            class="form-textarea"
            placeholder="Digite observações sobre o cliente..."
            rows="4"
          ></textarea>
        </div>

        <div class="modal-footer">
          <Button variant="secondary" @click="closeModal" type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Criando...' : 'Criar Cliente' }}
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
  name: 'NewClientModal',
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
  emits: ['close', 'client-created'],
  data() {
    return {
      isLoading: false,
      form: {
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        notes: ''
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
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        notes: ''
      }
      this.errors = {}
    },
    
    validateForm() {
      this.errors = {}
      let isValid = true
      
      if (!this.form.name.trim()) {
        this.errors.name = 'Nome é obrigatório'
        isValid = false
      }
      
      if (!this.form.email.trim()) {
        this.errors.email = 'Email é obrigatório'
        isValid = false
      } else if (!this.isValidEmail(this.form.email)) {
        this.errors.email = 'Digite um email válido'
        isValid = false
      }
      
      return isValid
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    async createClient() {
      if (!this.validateForm()) {
        return
      }
      
      this.isLoading = true
      
      try {
        // Simular criação de cliente - aqui será integrado com Firebase
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newClient = {
          id: Date.now(),
          name: this.form.name,
          email: this.form.email,
          company: this.form.company,
          phone: this.form.phone,
          address: this.form.address,
          notes: this.form.notes
        }
        
        this.$emit('client-created', newClient)
        this.closeModal()
      } catch (error) {
        console.error('Error creating client:', error)
        this.errors.general = 'Erro ao criar cliente. Tente novamente.'
      } finally {
        this.isLoading = false
      }
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-col {
  margin-bottom: 0;
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

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
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
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-col {
    margin-bottom: 20px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: 8px;
  }
}
</style>

