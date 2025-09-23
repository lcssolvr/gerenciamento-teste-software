<template>
  <div class="toaster">
    <div
      v-for="t in state.toasts"
      :key="t.id"
      class="toast"
      :data-type="t.type"
      @click="removeToast(t.id)"
    >
      <strong class="toast-title">{{ t.title }}</strong>
      <p class="toast-message">{{ t.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { useUI } from '../../stores/ui'
const { state, removeToast } = useUI()
</script>

<style scoped>
.toaster { position: fixed; right: 16px; top: 16px; display: grid; gap: 10px; z-index: 9999; }
.toast { background: #1f2937; color: #fff; padding: 12px 14px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,.25); max-width: 340px; cursor: pointer; }
.toast[data-type="error"] { background: #b91c1c; }
.toast[data-type="success"] { background: #065f46; }
.toast[data-type="info"] { background: #1e40af; }
.toast-title { margin: 0 0 4px 0; font-size: 14px; }
.toast-message { margin: 0; font-size: 13px; opacity: .95; }
</style>
