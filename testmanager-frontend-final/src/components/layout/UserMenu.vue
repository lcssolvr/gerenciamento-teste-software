<template>
  <div class="user-menu" ref="menuRef">
    <button class="avatar-btn" @click="toggle" title="Conta">
      <span class="avatar">{{ initials }}</span>
      <span class="caret">▾</span>
    </button>

    <div v-if="open" class="dropdown">
      <div class="dropdown-header">
        <div class="avatar sm">{{ initials }}</div>
        <div class="info">
          <strong>{{ userEmail }}</strong>
          <small>{{ roleLabel }}</small>
        </div>
      </div>

      <button class="item" @click="goProfile">Editar perfil</button>
      <button class="item" @click="logout">Sair</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { api } from '@/services/api'

const router = useRouter()
const open = ref(false)
const menuRef = ref(null)
const userEmail = computed(() => auth.currentUser?.email || '')

const initials = computed(() => {
  const e = userEmail.value
  return e ? e[0].toUpperCase() : 'U'
})

const roleLabel = ref('Usuário')

const loadClaims = async () => {
  try {
    const { data } = await api.get('/api/auth/me')
    const r = data?.data?.role
    roleLabel.value =
      r === 'admin' ? 'Administrador' :
      r === 'collaborator' ? 'Colaborador' :
      r === 'client' ? 'Cliente' : 'Usuário'
  } catch {}
}

const toggle = () => (open.value = !open.value)

const onDocClick = (e) => {
  if (!menuRef.value) return
  if (!menuRef.value.contains(e.target)) open.value = false
}

const goProfile = () => { open.value = false; router.push('/profile') }
const logout = async () => { open.value = false; try{ await signOut(auth) } finally { router.push('/login') } }

onMounted(() => {
  loadClaims()
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.user-menu { position: relative; }
.avatar-btn{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--border);padding:6px 10px;border-radius:999px;cursor:pointer}
.avatar{width:32px;height:32px;border-radius:999px;background:#e2e8f0;color:#0f172a;display:flex;align-items:center;justify-content:center;font-weight:700}
.avatar.sm{width:28px;height:28px;font-size:12px}
.caret{font-size:12px;color:#64748b}
.dropdown{position:absolute;right:0;top:42px;width:220px;background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 24px rgba(2,6,23,.08);padding:8px;z-index:50}
.dropdown-header{display:flex;align-items:center;gap:8px;padding:8px 8px 6px;border-bottom:1px solid var(--border);margin-bottom:6px}
.item{width:100%;text-align:left;background:transparent;border:0;padding:10px 8px;border-radius:8px;cursor:pointer}
.item:hover{background:#f1f5f9}
</style>
