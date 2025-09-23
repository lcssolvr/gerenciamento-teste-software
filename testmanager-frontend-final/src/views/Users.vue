<template>
  <div class="page-fluid">
    <div class="header-row">
      <h1>Usuários</h1>
      <div class="actions">
        <input class="search" v-model="q" placeholder="Buscar por nome, e-mail, papel..." />
        <button class="btn btn-primary" @click="openNew = true">Novo usuário</button>
      </div>
    </div>

    <Card class="full-card">
      <template #header><strong>Lista de usuários</strong></template>

      <div v-if="loading" class="muted">Carregando...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th>CPF/CNPJ</th>
              <th>Endereço</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="muted">Nenhum usuário encontrado.</td>
            </tr>
            <tr v-for="u in filtered" :key="u.id || u.uid">
              <td>{{ u.fullName || '—' }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
              <td>{{ u.cpfCnpj || '—' }}</td>
              <td>{{ u.address || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <NewUserModal v-model="openNew" @saved="fetchUsers" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import Card from '@/components/common/Card.vue'
import NewUserModal from '@/components/users/NewUserModal.vue'

const openNew = ref(false)
const q = ref('')
const rows = ref([])
const loading = ref(false)
const error = ref('')

async function fetchUsers () {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/api/users')
    rows.value = data?.data ?? []
  } catch (e) {
    error.value = e?.response?.data?.message || 'Falha ao listar usuários.'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return rows.value
  return rows.value.filter(u =>
    [u.fullName, u.email, u.role, u.cpfCnpj, u.address]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(term))
  )
})

onMounted(fetchUsers)
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
</style>
