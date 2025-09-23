<template>
  <div class="page">
    <div class="card" style="max-width:560px">
      <h1 class="title">Editar perfil</h1>
      <form @submit.prevent="save">
        <div class="row">
          <label>E-mail</label>
          <input type="email" v-model="email" disabled />
        </div>

        <div class="row">
          <label>Nome</label>
          <input type="text" v-model="fullName" placeholder="Seu nome" />
        </div>

        <div class="row">
          <label>CPF / CNPJ</label>
          <input
            type="text"
            v-model="cpfCnpj"
            @input="cpfCnpj = maskCpfCnpj(cpfCnpj)"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        <div class="row">
          <label>Endereço</label>
          <input type="text" v-model="address" placeholder="Rua, nº, bairro, cidade/UF" />
        </div>

        <div class="actions">
          <button class="btn btn-primary" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>

        <p v-if="msg" class="msg">{{ msg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const email    = ref('')
const fullName = ref('')
const cpfCnpj  = ref('')
const address  = ref('')
const saving   = ref(false)
const msg      = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/api/users/me')
    const u = data?.data || {}
    email.value    = u.email || ''
    fullName.value = u.fullName || u.name || ''
    cpfCnpj.value  = u.cpfCnpj || ''
    address.value  = u.address || ''
  } catch {}
})

function maskCpfCnpj(v) {
  const d = (v || '').replace(/\D/g, '')
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4')
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2}).*/, '$1.$2.$3/$4-$5')
}

const save = async () => {
  saving.value = true; msg.value = ''
  try {
    await api.put('/api/users/me', {
      fullName: fullName.value || '',
      cpfCnpj:  cpfCnpj.value || '',
      address:  address.value || ''
    })
    msg.value = 'Dados atualizados!'
  } catch {
    msg.value = 'Não foi possível salvar.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page{max-width:920px;margin:0 auto}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;box-shadow:0 8px 24px rgba(2,6,23,.06)}
.title{font-size:22px;margin:0 0 12px}
.row{margin-bottom:12px}
.row>label{display:block;margin-bottom:6px;font-weight:600;color:#0f172a}
.row>input{width:100%;background:#fff;color:#0f172a;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px}
.actions{margin-top:12px}
.btn{appearance:none;border:0;border-radius:12px;padding:12px 16px;font-weight:600;cursor:pointer}
.btn-primary{background:#2563eb;color:#fff}
.msg{color:#64748b;margin-top:10px}
</style>
