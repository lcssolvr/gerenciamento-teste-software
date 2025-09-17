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
            <span class="text-gray-700">Perfil</span>
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
    <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Meu Perfil</h2>
          <p class="mt-1 text-sm text-gray-600">
            Gerencie suas informações pessoais
          </p>
        </div>

        <!-- Profile Info -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informações Pessoais
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
              <div>
                <dt class="text-sm font-medium text-gray-500">Departamento</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.department || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Telefone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ authStore.user?.phone || 'N/A' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Account Status -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Status da Conta
            </h3>
            <div class="flex items-center">
              <span :class="authStore.user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                {{ authStore.user?.isActive ? 'Conta Ativa' : 'Conta Inativa' }}
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              Sua conta foi criada em {{ formatDate(authStore.user?.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('pt-BR')
    }

    return {
      authStore,
      handleLogout,
      formatDate
    }
  }
}
</script>

