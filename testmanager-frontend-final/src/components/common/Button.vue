<template>
  <button 
    :class="buttonClasses" 
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'danger', 'outline'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  computed: {
    buttonClasses() {
      return [
        'btn',
        `btn-${this.variant}`,
        `btn-${this.size}`,
        {
          'btn-disabled': this.disabled,
          'btn-full-width': this.fullWidth
        }
      ]
    }
  }
}
</script>

<style scoped>
.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-family: inherit;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Variants */
.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: #545b62;
  transform: translateY(-1px);
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(.btn-disabled) {
  background-color: #1e7e34;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(.btn-disabled) {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn-outline {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover:not(.btn-disabled) {
  background-color: #007bff;
  color: white;
  transform: translateY(-1px);
}

/* Sizes */
.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-medium {
  padding: 10px 20px;
  font-size: 14px;
}

.btn-large {
  padding: 14px 28px;
  font-size: 16px;
}

/* States */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-full-width {
  width: 100%;
}
</style>

