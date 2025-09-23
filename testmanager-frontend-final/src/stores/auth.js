import { reactive, computed } from 'vue'
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged,
  onIdTokenChanged, signOut, setPersistence, browserLocalPersistence
} from 'firebase/auth'
import { app } from '@/services/firebase'

const state = reactive({ user: null, token: null, ready: false })

export function useAuthStore () {
  const auth = getAuth(app)

  async function initAuth () {
    if (state.ready) return
    await setPersistence(auth, browserLocalPersistence)

    await new Promise((resolve) => {
      const un = onAuthStateChanged(auth, async (u) => {
        state.user = u
        state.token = u ? await u.getIdToken() : null
        state.ready = true
        un()
        resolve()
      })
    })

    onIdTokenChanged(auth, async (u) => {
      state.user = u
      state.token = u ? await u.getIdToken() : null
    })
  }

  async function signIn (email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    state.user = cred.user
    state.token = await cred.user.getIdToken(true)
  }

  async function logout () {
    await signOut(auth)
    state.user = null
    state.token = null
  }

  return {
    initAuth, signIn, logout,
    user: computed(() => state.user),
    token: computed(() => state.token),
    isAuthenticated: computed(() => !!state.user),
  }
}
