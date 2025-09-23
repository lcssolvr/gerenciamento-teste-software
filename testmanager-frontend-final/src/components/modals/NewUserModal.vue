<template>
  <div class="modal">
    <div class="card">
      <h3>Novo Usuário</h3>

      <form @submit.prevent="save">
        <!-- nome -->
        <div class="form-row">
          <label>Nome</label>
          <input v-model.trim="form.fullName" required />
        </div>

        <!-- email -->
        <div class="form-row">
          <label>E-mail</label>
          <input type="email" v-model.trim="form.email" required />
        </div>

        <!-- função -->
        <div class="form-row">
          <label>Função</label>
          <select v-model="form.role">
            <option value="collaborator">Colaborador</option>
            <option value="admin">Administrador</option>
            <option value="client">Cliente</option>
          </select>
        </div>

        <!-- CPF/CNPJ (NOVO) -->
        <div class="form-row">
          <label>CPF / CNPJ</label>
          <input
            v-model="form.cpfCnpj"
            @input="form.cpfCnpj = maskCpfCnpj(form.cpfCnpj)"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        <!-- Endereço (NOVO) -->
        <div class="form-row">
          <label>Endereço</label>
          <input v-model.trim="form.address" placeholder="Rua, nº, bairro, cidade/UF" />
        </div>

        <!-- senha -->
        <div class="form-row">
          <label>Senha</label>
          <input
            type="password"
            v-model="form.password"
            placeholder="mín. 6 caracteres"
            minlength="6"
            required
          />
        </div>

        <div class="form-row">
          <label>Confirmar senha</label>
          <input
            type="password"
            v-model="confirmPassword"
            minlength="6"
            required
          />
        </div>

        <p v-if="passwordError" class="form-error">{{ passwordError }}</p>

        <div class="actions">
          <button type="button" class="btn" @click="$emit('close')">Cancelar</button>
          <button class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { api } from '@/services/api'

const emit = defineEmits(['close','created'])

const form = reactive({
  fullName: '',
  email: '',
  role: 'collaborator',
  cpfCnpj: '',   // NOVO
  address: '',   // NOVO
  password: ''
})

const confirmPassword = ref('')
const passwordError   = ref('')
const saving          = ref(false)

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
  passwordError.value = ''
  if (!form.password || form.password.length < 6) {
    passwordError.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  if (form.password !== confirmPassword.value) {
    passwordError.value = 'Senhas não conferem.'
    return
  }

  try {
    saving.value = true
    await api.post('/api/admin/users', { ...form }) // envia cpfCnpj e address também
    emit('created')
    emit('close')
  } catch (e) {
    passwordError.value = e?.response?.data?.error || 'Erro ao criar usuário'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal{position:fixed;inset:0;background:rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center;z-index:50}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:20px;min-width:520px}
.form-row{display:flex;flex-direction:column;margin-bottom:12px}
.form-row>label{font-weight:600;margin-bottom:6px}
input,select{border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px}
.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:8px}
.btn{appearance:none;border:1px solid #e5e7eb;background:#fff;border-radius:12px;padding:10px 14px;font-weight:600;cursor:pointer}
.btn-primary{background:#2563eb;color:#fff;border-color:#2563eb}
.form-error{color:#dc2626;font-size:12px;margin-top:-4px;margin-bottom:8px}
</style>
