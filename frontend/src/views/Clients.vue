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
            <span class="text-gray-700">Clientes</span>
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

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Gerenciamento de Clientes</h2>
          <p class="mt-1 text-sm text-gray-600">
            Gerencie os clientes do sistema
          </p>
        </div>

        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="mb-4">
              <button
                @click="showCreateModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Criar Cliente
              </button>
            </div>

            <div v-if="loading" class="text-center py-4">
              Carregando clientes...
            </div>

            <div v-else-if="clients.length === 0" class="text-center py-4 text-gray-500">
              Nenhum cliente encontrado
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="client in clients" :key="client.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ client.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ client.email }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ client.company }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ client.phone }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        @click="editClient(client)"
                        class="text-green-600 hover:text-green-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        @click="deleteClient(client)"
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

    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Criar Novo Cliente</h3>
          <form @submit.prevent="createClient">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Nome</label>
              <input
                v-model="newClient.name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="newClient.email"
                type="email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Empresa</label>
              <input
                v-model="newClient.company"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                v-model="newClient.phone"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
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
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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
import { clientService } from '../services/api'

export default {
  name: 'Clients',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const clients = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const newClient = ref({
      name: '',
      email: '',
      company: '',
      phone: ''
    })

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    const loadClients = async () => {
      loading.value = true
      try {
        const response = await clientService.getClients()
        clients.value = response.data.data.clients
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      } finally {
        loading.value = false
      }
    }

    const createClient = async () => {
      try {
        await clientService.createClient(newClient.value)
        showCreateModal.value = false
        newClient.value = {
          name: '',
          email: '',
          company: '',
          phone: ''
        }
        loadClients()
      } catch (error) {
        console.error('Erro ao criar cliente:', error)
        alert('Erro ao criar cliente')
      }
    }

    const editClient = (client) => {
      console.log('Editar cliente:', client)
    }

    const deleteClient = async (client) => {
      if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
        try {
          await clientService.deleteClient(client.id)
          loadClients()
        } catch (error) {
          console.error('Erro ao excluir cliente:', error)
          alert('Erro ao excluir cliente')
        }
      }
    }

    onMounted(() => {
      loadClients()
    })

    return {
      authStore,
      clients,
      loading,
      showCreateModal,
      newClient,
      handleLogout,
      createClient,
      editClient,
      deleteClient
    }
  }
}
</script>

