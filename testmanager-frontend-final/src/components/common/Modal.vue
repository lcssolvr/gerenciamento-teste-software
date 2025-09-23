
<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close" @keydown.esc.prevent="close" tabindex="0">
      <div class="modal" :style="{ width }" role="dialog" aria-modal="true">
        <div class="header">
          <h3 class="title">{{ title }}</h3>
          <button class="icon-btn" @click="close" aria-label="Fechar">×</button>
        </div>
        <div class="body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: '' },
    width: { type: String, default: '560px' }
  },
  emits: ['update:modelValue', 'close'],
  mounted() { if (this.modelValue) this.$el?.focus?.() },
  methods: {
    close() {
      this.$emit('update:modelValue', false)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.overlay{
  position: fixed; inset: 0; background: rgba(15, 23, 42, .6);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal{
  background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;
  box-shadow: 0 20px 60px rgba(2,6,23,.25); max-height: 90vh; overflow: auto;
}
.header{
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #e5e7eb;
}
.title{ margin: 0; font-size: 16px; }
.icon-btn{
  background: transparent; border: 0; font-size: 22px; line-height: 1; cursor: pointer; padding: 2px 6px;
}
.body{ padding: 16px; }
.footer{
  padding: 12px 16px; border-top: 1px solid #e5e7eb;
  display: flex; justify-content: flex-end; gap: 8px;
}
.btn{ padding: 10px 14px; border-radius: 8px; border: 1px solid #e5e7eb; cursor: pointer; }
.btn-primary{ background: #2563eb; color: #fff; border-color: #2563eb; }
.btn:disabled{ opacity: .6; cursor: not-allowed; }
.form-row{ display: grid; gap: 6px; margin-bottom: 12px; }
label{ font-size: 13px; color: #334155; }
input, select, textarea{
  border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; font-size: 14px; width: 100%;
}
.small{ font-size: 12px; color: #64748b; }
.error{ color: #dc2626; font-size: 13px; }
.grid-2{ display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
</style>