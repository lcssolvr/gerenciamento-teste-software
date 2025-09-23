<template>
  <Modal v-model="open" title="Novo projeto" width="520px" @close="reset">
    <div class="form-row">
      <label>Nome *</label>
      <input v-model.trim="form.name" placeholder="Portal do Cliente" />
    </div>

    <div class="form-row">
      <label>Cliente *</label>
      <select v-model="form.clientId">
        <option :value="null">— selecione —</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="form-row">
      <label>Descrição</label>
      <textarea v-model.trim="form.description" rows="3" />
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

const form = reactive({ name:'', clientId:null, description:'' })

function reset(){ error.value=''; Object.assign(form, { name:'', clientId:null, description:'' }) }
function close(){ open.value=false }

async function loadClients(){
  try{ const { data } = await api.get('/api/clients'); clients.value = data?.data ?? [] }catch{ clients.value = [] }
}

async function save(){
  error.value = ''
  if(!form.name || !form.clientId){ error.value='Preencha nome e cliente.'; return }
  loading.value = true
  try{
    await api.post('/api/projects', { ...form })
    emit('saved'); emit('save'); close(); reset()
  }catch(e){
    error.value = e?.response?.data?.message || 'Falha ao salvar projeto.'
  }finally{ loading.value=false }
}

onMounted(loadClients)
</script>