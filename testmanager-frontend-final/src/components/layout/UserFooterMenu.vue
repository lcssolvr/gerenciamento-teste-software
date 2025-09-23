<template>
  <div class="user-footer" ref="wrap">
    <div class="user-chip" @click="toggle">
      <div class="avatar">{{ initials }}</div>
      <div class="meta">
        <strong class="name">{{ userEmail || 'Usuário' }}</strong>
        <small class="role">{{ roleLabel }}</small>
      </div>
      <button class="gear" type="button" aria-label="Abrir menu">⚙️</button>
    </div>

    <div v-if="open" class="dropdown">
      <button class="item" @click="goProfile">Editar perfil</button>
      <button class="item danger" @click="logout">Sair</button>
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
const wrap = ref(null)

const userEmail = computed(() => auth.currentUser?.email || '')
const initials = computed(() => (userEmail.value ? userEmail.value[0].toUpperCase() : 'U'))

const roleLabel = ref('Usuário')
async function loadClaims () {
  try {
    const { data } = await api.get('/api/auth/me')
    const r = data?.data?.role
    roleLabel.value =
      r === 'admin' ? 'Administrador' :
      r === 'collaborator' ? 'Colaborador' :
      r === 'client' ? 'Cliente' : 'Usuário'
  } catch {}
}

function toggle(){ open.value = !open.value }
function onDocClick(e){ if (wrap.value && !wrap.value.contains(e.target)) open.value = false }
function goProfile(){ open.value = false; router.push('/profile') }
async function logout(){ open.value = false; try{ await signOut(auth) } finally { router.push('/login') } }

onMounted(()=>{ loadClaims(); document.addEventListener('click', onDocClick) })
onBeforeUnmount(()=> document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.user-footer{position:relative}
.user-chip{
  display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;cursor:pointer;
}
.avatar{
  width:34px;height:34px;border-radius:999px;display:flex;align-items:center;justify-content:center;
  background:#3498db;color:#0f172a;font-weight:800;
}
.meta{min-width:0}
.name{display:block;font-size:12px;line-height:1.1;color:#fff}
.role{color:#cbd5e1;font-size:11px}
.gear{margin-left:auto;background:transparent;border:0;color:#cbd5e1;cursor:pointer}
.dropdown{
  position:absolute;left:0;right:0;bottom:56px;background:#fff;border:1px solid #e5e7eb;
  border-radius:12px;box-shadow:0 10px 24px rgba(2,6,23,.14);padding:6px;z-index:20;
}
.item{
  display:block;width:100%;text-align:left;padding:10px;border:0;background:transparent;border-radius:8px;cursor:pointer
}
.item:hover{background:#f1f5f9}
.item.danger{color:#dc2626}
</style>
