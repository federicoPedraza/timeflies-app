import { createApp } from 'vue'
import './assets/main.css'

import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

const auth = useAuthStore()
auth.persistToken()

app.use(router)

app.mount('#app')
