<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">TestManager</h1>
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
          <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p class="mt-1 text-sm text-gray-600">
            Bem-vindo ao sistema de gerenciamento de testes
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span class="text-white text-sm font-medium">U</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total de Usuários
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats.users || 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span class="text-white text-sm font-medium">C</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total de Clientes
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats.clients || 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span class="text-white text-sm font-medium">P</span>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total de Projetos
                    </dt>
                    <dd class="text-lg font-medium text-gray-900">
                      {{ stats.projects || 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <router-link
                v-if="authStore.isAdmin"
                to="/users"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Gerenciar Usuários
              </router-link>
              <router-link
                to="/clients"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                Gerenciar Clientes
              </router-link>
              <router-link
                to="/projects"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
              >
                Gerenciar Projetos
              </router-link>
            </div>
          </div>
        </div>

        <div class="mt-8 bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informações do Usuário
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Nome</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Função</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.role }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Empresa</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.company || 'N/A' }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { userService, clientService, projectService } from '../services/api'

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const stats = ref({
      users: 0,
      clients: 0,
      projects: 0
    })

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    const loadStats = async () => {
      try {
        const clientStatsResponse = await clientService.getStats()
        stats.value.clients = clientStatsResponse.data.data.total

        const projectStatsResponse = await projectService.getStats()
        stats.value.projects = projectStatsResponse.data.data.total

        if (authStore.isAdmin) {
          const usersResponse = await userService.getUsers({ limit: 1 })
          stats.value.users = usersResponse.data.data.pagination.total
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      authStore,
      stats,
      handleLogout
    }
  }
}
</script>

