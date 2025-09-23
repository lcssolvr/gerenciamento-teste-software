<template>
  <div class="home">
    <h2>Dashboard</h2>
    <p v-if="loading">Carregando...</p>
    <div v-else>
      <p><strong>Status API:</strong> {{ health?.message }}</p>
      <p><strong>Usuário:</strong> {{ me?.data?.profile?.fullName || me?.data?.email || '—' }}</p>
    </div>
    <button @click="doLogout">Sair</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

const store = useAuthStore()
const loading = ref(true)
const health = ref(null)
const me = ref(null)

onMounted(async () => {
  await store.initAuth()
  const token = store.token
  health.value = await api('/health')
  me.value = await api('/api/auth/me', { token: token.value })
  loading.value = false
})

async function doLogout() {
  await store.logout()
  window.location.href = '/login'
}
</script>

<style scoped>
.home { max-width: 720px; margin: 6vh auto; display: grid; gap: 14px; }
button { padding: 10px; cursor: pointer; width: 160px; }
</style>
