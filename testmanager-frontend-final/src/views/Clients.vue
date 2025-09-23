<template>
  <div class="page-fluid">
    <div class="header-row">
      <h1>Clientes</h1>
      <div class="actions">
        <input class="search" v-model="q" placeholder="Buscar por nome, e-mail, CPF/CNPJ..." />
        <button class="btn btn-primary" @click="openNew = true">Novo cliente</button>
      </div>
    </div>

    <Card class="full-card">
      <template #header>
        <strong>Lista de clientes</strong>
      </template>

      <div v-if="loading" class="muted">Carregando...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF/CNPJ</th>
              <th>Endereço</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="muted">Nenhum cliente encontrado.</td>
            </tr>
            <tr v-for="c in filtered" :key="c.id">
              <td>{{ c.name }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.cpfCnpj || '—' }}</td>
              <td>{{ c.address || '—' }}</td>
              <td>
                <span class="badge" :class="c.isActive ? 'ok':'off'">{{ c.isActive ? 'Ativo' : 'Inativo' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <NewClientModal v-model="openNew" @save="fetchClients" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import Card from '@/components/common/Card.vue'
import NewClientModal from '@/components/clients/NewClientModal.vue'

const openNew = ref(false)
const q = ref('')
const rows = ref([])
const loading = ref(false)
const error = ref('')

async function fetchClients () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/clients')
    rows.value = data?.data ?? []
  } catch (e) {
    error.value = e?.response?.data?.message || 'Falha ao listar clientes.'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(c =>
    [c.name, c.email, c.cpfCnpj, c.address]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(term))
  )
})

onMounted(fetchClients)
</script>

<style scoped>
.page-fluid{display:flex;flex-direction:column;gap:16px}
.header-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.actions{display:flex;gap:8px;align-items:center}
.search{border:1px solid #e5e7eb;border-radius:8px;padding:8px 10px;min-width:280px}
.btn{padding:10px 14px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
.btn-primary{background:#2563eb;border-color:#2563eb;color:#fff}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left}
.muted{color:#64748b}
.error{color:#dc2626}
.badge{font-size:12px;padding:3px 8px;border-radius:999px;border:1px solid #e5e7eb}
.badge.ok{background:#ecfdf5;border-color:#10b981;color:#065f46}
.badge.off{background:#fff7ed;border-color:#f59e0b;color:#92400e}
</style>

