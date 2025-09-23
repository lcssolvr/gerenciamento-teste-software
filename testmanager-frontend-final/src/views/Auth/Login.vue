<template>
  <div class="login-container">
    <div class="card">
      <h1 class="title">Entrar</h1>
      <p class="subtitle">Acesse sua conta para continuar.</p>

      <form @submit.prevent="onSubmit">
        <Input label="E-mail" type="email" v-model.trim="email" placeholder="voce@empresa.com" autocomplete="username" required />
        <Input label="Senha" type="password" v-model="password" placeholder="••••••••" autocomplete="current-password" required />

        <div class="actions">
          <button class="btn btn-primary" :disabled="loading">{{ loading ? 'Entrando...' : 'Entrar' }}</button>
          <a href="#" @click.prevent="forgot">Esqueci minha senha</a>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { api } from '@/services/api'
import Input from '@/components/common/Input.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const onSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    const { user } = await signInWithEmailAndPassword(auth, email.value, password.value)
    await user.getIdToken(true)
    await api.get('/api/auth/me')
    router.push('/dashboard')
  } catch (e) {
    error.value = 'Não foi possível entrar. Verifique e-mail/senha.'
  } finally {
    loading.value = false
  }
}

const forgot = async () => {
  if (!email.value) { error.value = 'Digite seu e-mail e clique novamente.'; return }
  try {
    await sendPasswordResetEmail(auth, email.value)
    error.value = 'Enviamos um e-mail de redefinição (se o e-mail existir).'
  } catch (e) {
    error.value = 'Não foi possível enviar o e-mail de redefinição.'
  }
}
</script>

<style scoped>
.login-container{max-width:420px;margin:8vh auto;padding:0 16px}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;box-shadow:0 8px 24px rgba(2,6,23,0.06)}
.title{font-size:22px;margin:0 0 12px}
.subtitle{margin:0 0 20px;color:#64748b}
.actions{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:6px}
.btn{appearance:none;border:0;border-radius:12px;padding:12px 16px;font-weight:600;cursor:pointer}
.btn-primary{background:#2563eb;color:#fff}
.error{color:#dc2626;margin-top:12px}
</style>
