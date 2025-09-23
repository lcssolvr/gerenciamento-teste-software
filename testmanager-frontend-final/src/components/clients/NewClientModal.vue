<template>
  <Modal v-model="open" title="Novo cliente" width="520px" @close="reset">
    <div class="form-row">
      <label>Nome *</label>
      <input v-model.trim="form.name" placeholder="Empresa XYZ" />
    </div>
    <div class="form-row">
      <label>E-mail *</label>
      <input v-model.trim="form.email" type="email" placeholder="contato@empresa.com" />
    </div>
    <div class="grid-2">
      <div class="form-row">
        <label>CPF / CNPJ</label>
        <input v-model.trim="form.cpfCnpj" />
      </div>
      <div class="form-row">
        <label>Telefone</label>
        <input v-model.trim="form.phone" />
      </div>
    </div>
    <div class="form-row">
      <label>Endereço</label>
      <input v-model.trim="form.address" />
    </div>
    <div class="form-row">
      <label>Notas</label>
      <textarea v-model.trim="form.notes" rows="3" />
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
import { ref, reactive, watch } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { api } from '@/services/api'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['update:open', 'saved', 'save'])
const open = ref(props.open)
watch(() => props.open, v => open.value = v)
watch(open, v => emit('update:open', v))

const loading = ref(false)
const error = ref('')
const form = reactive({ name: '', email: '', cpfCnpj: '', phone: '', address: '', notes: '' })

function reset(){ error.value=''; Object.assign(form, { name:'', email:'', cpfCnpj:'', phone:'', address:'', notes:'' }) }
function close(){ open.value=false }

async function save(){
  error.value = ''
  if(!form.name || !form.email){ error.value='Preencha nome e e-mail.'; return }
  loading.value = true
  try{
    await api.post('/api/clients', { ...form })
    emit('saved'); emit('save'); close(); reset()
    
  }catch(e){
    error.value = e?.response?.data?.message || 'Falha ao salvar cliente.'
  }finally{ loading.value=false }
}
</script>