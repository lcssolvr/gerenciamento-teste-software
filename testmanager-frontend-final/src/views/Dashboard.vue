<!-- src/views/Dashboard.vue -->
<template>
  <div class="page-fluid">
    <h1>Dashboard</h1>
    <p class="muted">Bem-vindo, Usuário! Aqui está uma visão geral do sistema.</p>

    <div class="stats-grid">
      <Card class="full-card">
        <template #header>Clientes</template>
        <div class="stat-value">{{ totals.clients }}</div>
      </Card>

      <Card class="full-card">
        <template #header>Projetos</template>
        <div class="stat-value">{{ totals.projects }}</div>
      </Card>

      <Card class="full-card">
        <template #header>Membros</template>
        <div class="stat-value">{{ totals.members }}</div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import Card from '@/components/common/Card.vue'
import { reactive, onMounted } from 'vue'
import { api } from '@/services/api'

const totals = reactive({ clients: 0, projects: 0, members: 0 })

onMounted(async () => {
  try {
    const [c, p, u] = await Promise.all([
      api.get('/api/clients').catch(() => ({ data: { data: [] } })),
      api.get('/api/projects').catch(() => ({ data: { data: [] } })), // se não tiver rota, tratamos
      api.get('/api/users').catch(() => ({ data: { data: [] } })),
    ])
    totals.clients  = (c.data?.data ?? []).length
    totals.projects = (p.data?.data ?? []).length
    totals.members  = (u.data?.data ?? []).length
  } catch {
    // mantém 0 se falhar
  }
})
</script>

<style scoped>
.stat-value{ font-size:36px; font-weight:700 }
</style>
