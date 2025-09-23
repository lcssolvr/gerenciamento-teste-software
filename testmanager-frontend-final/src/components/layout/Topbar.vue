<template>
  <header class="topbar">
    <div class="brand">TestManager</div>
    <UserMenu />
  </header>
</template>

<script setup>
import UserMenu from './UserMenu.vue'
</script>

<style scoped>
.topbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:#fff;border-bottom:1px solid #e5e7eb;border-radius:12px}
.brand{font-weight:800;letter-spacing:.2px}
</style>
