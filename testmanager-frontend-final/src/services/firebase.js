import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || 'AIzaSyDgwxjlhVvaiRjvoe51QtESZOXIHP3ZQb8',
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || 'testmanager-31b79.firebaseapp.com',
  projectId: import.meta.env.VITE_FB_PROJECT_ID || 'testmanager-31b79',
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || 'testmanager-31b79.appspot.com',
  appId: import.meta.env.VITE_FB_APP_ID || '1:701033699524:web:7ebaefbada6dc70bd39191',
  messagingSenderId: import.meta.env.VITE_FB_MSG_ID || '701033699524',
}

// evita “duplicate-app” no Vite/HMR
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)
export default app
