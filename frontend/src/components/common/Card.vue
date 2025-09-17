<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    },
    shadow: {
      type: String,
      default: 'medium',
      validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
    },
    padding: {
      type: String,
      default: 'medium',
      validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
    },
    hoverable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardClasses() {
      return [
        'card',
        `card-${this.variant}`,
        `card-shadow-${this.shadow}`,
        `card-padding-${this.padding}`,
        {
          'card-hoverable': this.hoverable
        }
      ]
    }
  }
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

/* Variants */
.card-default {
  border-color: #e9ecef;
}

.card-primary {
  border-left: 4px solid #007bff;
}

.card-success {
  border-left: 4px solid #28a745;
}

.card-warning {
  border-left: 4px solid #ffc107;
}

.card-danger {
  border-left: 4px solid #dc3545;
}

/* Shadows */
.card-shadow-none {
  box-shadow: none;
}

.card-shadow-small {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-shadow-medium {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-shadow-large {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Padding */
.card-padding-none .card-body {
  padding: 0;
}

.card-padding-small .card-body {
  padding: 12px;
}

.card-padding-medium .card-body {
  padding: 20px;
}

.card-padding-large .card-body {
  padding: 32px;
}

/* Hover effect */
.card-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #333;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>

