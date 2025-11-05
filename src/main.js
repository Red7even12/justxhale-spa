import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './store/auth' // Assuming @ alias is set up


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize the auth store AFTER Pinia is used
const authStore = useAuthStore()

// Call the new, correct action to check for an existing session
authStore.checkAuth().then(() => {
  // Mount the app only after the auth check is complete
  app.mount('#app')
});
