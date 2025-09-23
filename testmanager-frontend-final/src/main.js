import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@/assets/layout-fixes.css'
import './assets/css/main.css'
import './style.css'
createApp(App).use(router).mount('#app')

