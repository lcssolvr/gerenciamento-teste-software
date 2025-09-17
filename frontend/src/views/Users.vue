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
            <span class="text-gray-700">Usuários</span>
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
          <h2 class="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h2>
          <p class="mt-1 text-sm text-gray-600">
            Gerencie os usuários do sistema
          </p>
        </div>

        <!-- Users Table -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="mb-4">
              <button
                @click="showCreateModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Criar Usuário
              </button>
            </div>

            <div v-if="loading" class="text-center py-4">
              Carregando usuários...
            </div>

            <div v-else-if="users.length === 0" class="text-center py-4 text-gray-500">
              Nenhum usuário encontrado
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
                      Função
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in users" :key="user.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ user.name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.email }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.role }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ user.isActive ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        @click="editUser(user)"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        @click="deleteUser(user)"
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

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Criar Novo Usuário</h3>
          <form @submit.prevent="createUser">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Nome</label>
              <input
                v-model="newUser.name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="newUser.email"
                type="email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Senha</label>
              <input
                v-model="newUser.password"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Função</label>
              <select
                v-model="newUser.role"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Usuário">Usuário</option>
                <option value="Gerente">Gerente</option>
                <option value="Administrador">Administrador</option>
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
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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
import { userService } from '../services/api'

export default {
  name: 'Users',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const users = ref([])
    const loading = ref(false)
    const showCreateModal = ref(false)
    const newUser = ref({
      name: '',
      email: '',
      password: '',
      role: 'Usuário'
    })

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await userService.getUsers()
        users.value = response.data.data.users
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      } finally {
        loading.value = false
      }
    }

    const createUser = async () => {
      try {
        await userService.createUser(newUser.value)
        showCreateModal.value = false
        newUser.value = {
          name: '',
          email: '',
          password: '',
          role: 'Usuário'
        }
        loadUsers()
      } catch (error) {
        console.error('Erro ao criar usuário:', error)
        alert('Erro ao criar usuário')
      }
    }

    const editUser = (user) => {
      // Implementar edição de usuário
      console.log('Editar usuário:', user)
    }

    const deleteUser = async (user) => {
      if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
        try {
          await userService.deleteUser(user.id)
          loadUsers()
        } catch (error) {
          console.error('Erro ao excluir usuário:', error)
          alert('Erro ao excluir usuário')
        }
      }
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      authStore,
      users,
      loading,
      showCreateModal,
      newUser,
      handleLogout,
      createUser,
      editUser,
      deleteUser
    }
  }
}
</script>

