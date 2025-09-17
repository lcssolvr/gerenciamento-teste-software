<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/dashboard" class="text-xl font-semibold text-gray-900">
              TestManager
            </router-link>
            <span class="text-gray-500">/</span>
            <span class="text-gray-700">Projetos</span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              Olá, {{ authStore.user?.name }}
            </span>
            <button
              @click="handleLogout"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Gerenciamento de Projetos</h2>
          <p class="mt-1 text-sm text-gray-600">
            Gerencie os projetos do sistema
          </p>
        </div>

        <!-- Projects Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="mb-4">
              <button
                @click="showCreateModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              >
                Criar Projeto
              </button>
            </div>

            <div v-if="loading" class="text-center py-4">
              Carregando projetos...
            </div>

            <div v-else-if="projects.length === 0" class="text-center py-4 text-gray-500">
              Nenhum projeto encontrado
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="project in projects" :key="project.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ project.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusColor(project.status)" 
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ project.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getPriorityColor(project.priority)" 
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ project.priority }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ project.responsible?.name || 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        @click="editProject(project)"
                        class="text-yellow-600 hover:text-yellow-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        @click="deleteProject(project)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Criar Novo Projeto</h3>
          <form @submit.prevent="createProject">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Nome</label>
              <input
                v-model="newProject.name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                v-model="newProject.description"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              ></textarea>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="newProject.status"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="Planejamento">Planejamento</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Pausado">Pausado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Prioridade</label>
              <select
                v-model="newProject.priority"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { projectService } from '../services/api'

export default {
  name: 'Projects',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const projects = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const newProject = ref({
      name: '',
      description: '',
      status: 'Planejamento',
      priority: 'Média'
    })

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    const loadProjects = async () => {
      loading.value = true
      try {
        const response = await projectService.getProjects()
        projects.value = response.data.data.projects
      } catch (error) {
        console.error('Erro ao carregar projetos:', error)
      } finally {
        loading.value = false
      }
    }

    const createProject = async () => {
      try {
        await projectService.createProject(newProject.value)
        showCreateModal.value = false
        newProject.value = {
          name: '',
          description: '',
          status: 'Planejamento',
          priority: 'Média'
        }
        loadProjects()
      } catch (error) {
        console.error('Erro ao criar projeto:', error)
        alert('Erro ao criar projeto')
      }
    }

    const editProject = (project) => {
      // Implementar edição de projeto
      console.log('Editar projeto:', project)
    }

    const deleteProject = async (project) => {
      if (confirm(`Tem certeza que deseja excluir o projeto ${project.name}?`)) {
        try {
          await projectService.deleteProject(project.id)
          loadProjects()
        } catch (error) {
          console.error('Erro ao excluir projeto:', error)
          alert('Erro ao excluir projeto')
        }
      }
    }

    const getStatusColor = (status) => {
      const colors = {
        'Planejamento': 'bg-blue-100 text-blue-800',
        'Em Andamento': 'bg-yellow-100 text-yellow-800',
        'Concluído': 'bg-green-100 text-green-800',
        'Pausado': 'bg-gray-100 text-gray-800',
        'Cancelado': 'bg-red-100 text-red-800'
      }
      return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityColor = (priority) => {
      const colors = {
        'Baixa': 'bg-green-100 text-green-800',
        'Média': 'bg-yellow-100 text-yellow-800',
        'Alta': 'bg-orange-100 text-orange-800',
        'Crítica': 'bg-red-100 text-red-800'
      }
      return colors[priority] || 'bg-gray-100 text-gray-800'
    }

    onMounted(() => {
      loadProjects()
    })

    return {
      authStore,
      projects,
      loading,
      showCreateModal,
      newProject,
      handleLogout,
      createProject,
      editProject,
      deleteProject,
      getStatusColor,
      getPriorityColor
    }
  }
}
</script>

