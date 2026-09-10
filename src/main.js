import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './store/auth' 
import { formatDate } from '@/utils/date'; 
import { formatDateTime} from '@/utils/date'; 
import { registerSW } from 'virtual:pwa-register';


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize the auth store AFTER Pinia is used
const authStore = useAuthStore()

// Call the new, correct action to check for an existing session
authStore.checkAuth().then(() => {
  // Mount the app only after the auth check is complete
  app.config.globalProperties.$formatDate = formatDate;
  app.config.globalProperties.$formatDateTime = formatDateTime; 
  app.mount('#app')
});

// Auto-register service worker updates
registerSW({ immediate: true });
