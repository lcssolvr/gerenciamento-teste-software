<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Novo Projeto</h2>
        <button class="modal-close" @click="closeModal">
          <svg fill="currentColor" viewBox="0 0 24 24" class="close-icon">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="createProject" class="modal-body">
        <Input
          v-model="form.name"
          label="Nome do Projeto"
          placeholder="Digite o nome do projeto"
          required
          :error="errors.name"
        />

        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="Descreva o projeto..."
            rows="4"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select" required>
                <option value="">Selecione o status</option>
                <option value="Planejamento">Planejamento</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Pausado">Pausado</option>
              </select>
              <div v-if="errors.status" class="input-error">{{ errors.status }}</div>
            </div>
          </div>
          <div class="form-col">
            <div class="form-group">
              <label class="form-label">Prioridade</label>
              <select v-model="form.priority" class="form-select" required>
                <option value="">Selecione a prioridade</option>
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
              <div v-if="errors.priority" class="input-error">{{ errors.priority }}</div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Vincular Clientes</label>
          <div class="clients-selector">
            <div class="clients-search">
              <Input
                v-model="clientSearch"
                placeholder="Selecione os clientes..."
                icon="search"
                @focus="showClientDropdown = true"
              />
            </div>
            <div v-if="showClientDropdown" class="clients-dropdown">
              <div
                v-for="client in filteredClients"
                :key="client.id"
                class="client-option"
                @click="toggleClient(client)"
              >
                <input
                  type="checkbox"
                  :checked="isClientSelected(client)"
                  class="client-checkbox"
                />
                <span class="client-name">{{ client.name }}</span>
              </div>
              <div v-if="filteredClients.length === 0" class="no-clients">
                Nenhum cliente encontrado
              </div>
            </div>
            <div v-if="form.selectedClients.length > 0" class="selected-clients">
              <div
                v-for="client in form.selectedClients"
                :key="client.id"
                class="selected-client"
              >
                {{ client.name }}
                <button type="button" @click="removeClient(client)" class="remove-client">
                  <svg fill="currentColor" viewBox="0 0 24 24" class="remove-icon">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Responsável</label>
          <select v-model="form.responsible" class="form-select" required>
            <option value="">Selecione um responsável</option>
            <option value="Rilston Raine">Rilston Raine</option>
            <option value="João Silva">João Silva</option>
            <option value="Maria Santos">Maria Santos</option>
          </select>
          <div v-if="errors.responsible" class="input-error">{{ errors.responsible }}</div>
        </div>

        <div class="modal-footer">
          <Button variant="secondary" @click="closeModal" type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit" :disabled="isLoading">
            {{ isLoading ? 'Criando...' : 'Criar Projeto' }}
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
  name: 'NewProjectModal',
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
  emits: ['close', 'project-created'],
  data() {
    return {
      isLoading: false,
      showClientDropdown: false,
      clientSearch: '',
      form: {
        name: '',
        description: '',
        status: '',
        priority: '',
        selectedClients: [],
        responsible: ''
      },
      errors: {},
      availableClients: [
        { id: 1, name: 'René' },
        { id: 2, name: 'João Silva' },
        { id: 3, name: 'Maria Santos' },
        { id: 4, name: 'Pedro Costa' }
      ]
    }
  },
  computed: {
    filteredClients() {
      if (!this.clientSearch) {
        return this.availableClients
      }
      return this.availableClients.filter(client =>
        client.name.toLowerCase().includes(this.clientSearch.toLowerCase())
      )
    }
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    closeModal() {
      this.resetForm()
      this.$emit('close')
    },
    
    resetForm() {
      this.form = {
        name: '',
        description: '',
        status: '',
        priority: '',
        selectedClients: [],
        responsible: ''
      }
      this.errors = {}
      this.clientSearch = ''
      this.showClientDropdown = false
    },
    
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {
        this.showClientDropdown = false
      }
    },
    
    toggleClient(client) {
      const index = this.form.selectedClients.findIndex(c => c.id === client.id)
      if (index > -1) {
        this.form.selectedClients.splice(index, 1)
      } else {
        this.form.selectedClients.push(client)
      }
    },
    
    isClientSelected(client) {
      return this.form.selectedClients.some(c => c.id === client.id)
    },
    
    removeClient(client) {
      const index = this.form.selectedClients.findIndex(c => c.id === client.id)
      if (index > -1) {
        this.form.selectedClients.splice(index, 1)
      }
    },
    
    validateForm() {
      this.errors = {}
      let isValid = true
      
      if (!this.form.name.trim()) {
        this.errors.name = 'Nome do projeto é obrigatório'
        isValid = false
      }
      
      if (!this.form.status) {
        this.errors.status = 'Status é obrigatório'
        isValid = false
      }
      
      if (!this.form.priority) {
        this.errors.priority = 'Prioridade é obrigatória'
        isValid = false
      }
      
      if (!this.form.responsible) {
        this.errors.responsible = 'Responsável é obrigatório'
        isValid = false
      }
      
      return isValid
    },
    
    async createProject() {
      if (!this.validateForm()) {
        return
      }
      
      this.isLoading = true
      
      try {
        // Simular criação de projeto - aqui será integrado com Firebase
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newProject = {
          id: Date.now(),
          name: this.form.name,
          description: this.form.description,
          status: this.form.status,
          priority: this.form.priority,
          clients: this.form.selectedClients.map(c => c.name),
          responsible: this.form.responsible
        }
        
        this.$emit('project-created', newProject)
        this.closeModal()
      } catch (error) {
        console.error('Error creating project:', error)
        this.errors.general = 'Erro ao criar projeto. Tente novamente.'
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
  max-width: 600px;
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

.clients-selector {
  position: relative;
}

.clients-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.client-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.client-option:hover {
  background-color: #f8f9fa;
}

.client-checkbox {
  margin-right: 8px;
}

.client-name {
  font-size: 14px;
  color: #333;
}

.no-clients {
  padding: 12px 16px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.selected-clients {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.selected-client {
  display: flex;
  align-items: center;
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  color: #495057;
}

.remove-client {
  background: none;
  border: none;
  margin-left: 4px;
  cursor: pointer;
  color: #666;
  padding: 2px;
  border-radius: 2px;
  transition: color 0.2s ease;
}

.remove-client:hover {
  color: #dc3545;
}

.remove-icon {
  width: 12px;
  height: 12px;
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
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: 8px;
  }
}
</style>


<script setup>
import { ref } from 'vue'
import Input from '../common/Input.vue'
import { useUI } from '../../stores/ui'
import { required } from '../../utils/validators'

const props = defineProps({ clients: { type:Array, default: () => [] }, users: { type:Array, default: () => [] } })
const emit = defineEmits(['close','save'])
const show = true
const { pushToast } = useUI()

const form = ref({
  name:'',
  description:'',
  clients: [],
  members: []
})

function createProject(){
  if (!required(form.value.name)) return pushToast({type:'error', title:'Dados inválidos', message:'Nome do projeto é obrigatório'})
  const payload = {
    name: form.value.name,
    description: form.value.description,
    clients: form.value.clients.map(c => c.id || c),
    members: form.value.members.map(u => u.id || u),
  }
  emit('save', payload)
}
function closeModal(){ emit('close') }
</script>
