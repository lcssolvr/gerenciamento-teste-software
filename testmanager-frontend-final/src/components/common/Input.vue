<template>
  <div class="input-group">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="input-wrapper">
      <input
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :class="inputClasses"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      <div v-if="icon" class="input-icon">
        <slot name="icon">
          <svg v-if="icon === 'search'" fill="currentColor" viewBox="0 0 24 24" class="icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <svg v-else-if="icon === 'email'" fill="currentColor" viewBox="0 0 24 24" class="icon">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <svg v-else-if="icon === 'lock'" fill="currentColor" viewBox="0 0 24 24" class="icon">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </slot>
      </div>
    </div>

    <div v-if="error" class="input-error">{{ error }}</div>
    <div v-else-if="hint" class="input-hint">{{ hint }}</div>
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    icon: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  data() {
    // id estável para o <label for="">
    return { inputId: `input-${Math.random().toString(36).slice(2, 11)}` }
  },
  computed: {
    inputClasses() {
      return [
        'input-field',
        {
          'input-error-state': this.error,
          'input-disabled': this.disabled,
          'input-with-icon': this.icon
        }
      ]
    }
  }
}
</script>

<style scoped>
.input-group { margin-bottom: 20px; }

.input-label {
  display:block; margin-bottom:6px; font-weight:600;
  color:#0f172a; font-size:14px;
}

.required { color:#dc2626; }

.input-wrapper { position:relative; }

/* ---- INPUT ---- */
.input-field{
  width:100%; padding:12px 16px;
  border:1px solid #e5e7eb; border-radius:12px;
  font-size:14px; background:#fff;
  color:#0f172a !important;              /* texto escuro (força contra heranças) */
  caret-color:#0f172a;
  transition:border-color .12s ease, box-shadow .12s ease;
}

/* placeholder visível */
.input-field::placeholder{ color:#64748b; opacity:1; }

/* corrige Chrome/Autofill que clareia o texto */
.input-field:-webkit-autofill,
.input-field:-webkit-autofill:hover,
.input-field:-webkit-autofill:focus{
  -webkit-text-fill-color:#0f172a !important;
  box-shadow: 0 0 0px 1000px #fff inset;
  transition: background-color 5000s ease-in-out 0s;
}

.input-field:focus{
  outline:none; border-color:#93c5fd;           /* blue-300 */
  box-shadow:0 0 0 3px rgba(147,197,253,.45);
}

.input-field:hover:not(:disabled){ border-color:#cbd5e1; }

.input-with-icon{ padding-right:45px; }

.input-icon{
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  color:#94a3b8; pointer-events:none;
}

.icon{ width:20px; height:20px; }

.input-error-state{ border-color:#dc2626; }
.input-error-state:focus{ border-color:#dc2626; box-shadow:0 0 0 3px rgba(220,38,38,.12); }

.input-disabled{ background:#f8fafc; color:#6b7280; cursor:not-allowed; }

/* mensagens */
.input-error{ margin-top:6px; font-size:12px; color:#dc2626; }
.input-hint{ margin-top:6px; font-size:12px; color:#64748b; }
</style>
