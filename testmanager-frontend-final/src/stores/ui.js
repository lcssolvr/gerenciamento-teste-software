import { reactive } from 'vue'

const state = reactive({
  toasts: []
})

let idSeq = 1

export function useUI() {
  function pushToast({ title='Tudo certo', message='', type='success', timeout=3000 } = {}) {
    const id = idSeq++
    state.toasts.push({ id, title, message, type })
    if (timeout) {
      setTimeout(() => removeToast(id), timeout)
    }
  }
  function removeToast(id) {
    const i = state.toasts.findIndex(t => t.id === id)
    if (i >= 0) state.toasts.splice(i, 1)
  }
  return { state, pushToast, removeToast }
}
