<template>
  <Modal v-model="open" title="Novo usuário" width="560px" @close="reset">
    <div class="grid-2">
      <div class="form-row">
        <label>Nome completo *</label>
        <input v-model.trim="form.fullName" placeholder="Ex.: Maria Silva" />
      </div>
      <div class="form-row">
        <label>E-mail *</label>
        <input v-model.trim="form.email" type="email" placeholder="voce@empresa.com" />
      </div>
    </div>

    <div class="grid-2">
      <div class="form-row">
        <label>Senha *</label>
        <input v-model="form.password" type="password" placeholder="••••••••" />
      </div>
      <div class="form-row">
        <label>Papel *</label>
        <select v-model="form.role">
          <option value="collaborator">Colaborador</option>
          <option value="client">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <label>CPF / CNPJ</label>
      <input v-model.trim="form.cpfCnpj" placeholder="123.456.789-00 ou 12.345.678/0001-99" />
    </div>

    <div class="form-row">
      <label>Endereço</label>
      <input v-model.trim="form.address" placeholder="Rua, número, bairro, cidade/UF" />
    </div>

    <div v-if="form.role === 'client'" class="form-row">
      <label>Cliente (opcional)</label>
      <select v-model="form.clientId">
        <option :value="null">— sem vínculo —</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <div class="small">Vincule se o usuário for do lado do cliente.</div>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <template #footer>
      <button class="btn" @click="close">Cancelar</button>
      <button class="btn btn-primary" :disabled="loading" @click="save">
        {{ loading ? 'Salvando...' : 'Salvar' }}
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { api } from '@/services/api'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['update:open', 'saved', 'save'])

const open = ref(props.open)
watch(() => props.open, v => open.value = v)
watch(open, v => emit('update:open', v))

const loading = ref(false)
const error = ref('')
const clients = ref([])

const form = reactive({
  fullName: '', email: '', password: '',
  role: 'collaborator',
  cpfCnpj: '', address: '',
  clientId: null
})

function reset() {
  error.value = ''
  Object.assign(form, {
    fullName: '', email: '', password: '', role: 'collaborator',
    cpfCnpj: '', address: '', clientId: null
  })
}
function close(){ open.value = false; }

async function loadClients(){
  try{ const { data } = await api.get('/api/clients'); clients.value = data?.data ?? [] }catch{ clients.value = [] }
}

async function save() {
  error.value = ''
  if (!form.fullName || !form.email || !form.password) { error.value = 'Preencha nome, e-mail e senha.'; return }
  loading.value = true
  try {
    await api.post('/api/users', { ...form })
    emit('saved'); emit('save'); close(); reset()
  } catch (e) {
    error.value = e?.response?.data?.message || 'Falha ao salvar usuário.'
  } finally { loading.value = false }
}

onMounted(() => { loadClients() })
</script>

