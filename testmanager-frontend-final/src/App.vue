<script setup>
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'

const authed = ref(false)
onMounted(() => {
  onAuthStateChanged(getAuth(), (u) => (authed.value = !!u))
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <!-- layout completo somente quando logado e não for rota de auth -->
    <div v-if="authed && !route.meta.guestOnly" class="layout">
      <aside class="layout-sidebar">
        <Sidebar />
      </aside>

      <section class="layout-content">
        <Topbar />
        <component :is="Component" />
      </section>
    </div>

    <!-- rotas de auth (login, etc.) -->
    <component v-else :is="Component" />
  </router-view>
</template>

<style scoped>
.layout{
  display: grid;
  grid-template-columns: 260px 1fr; /* sidebar + conteúdo */
  min-height: 100vh;
  background: var(--bg, #f6f8fb);
}

/* use uma classe diferente de ".sidebar" para não colidir com o componente */
.layout-sidebar{
  border-right: 1px solid var(--border, #e5e7eb);
}

.layout-content{
  min-width: 0; /* evita overflow do grid */
}
</style>
