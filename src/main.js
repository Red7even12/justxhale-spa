import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './store/auth' // Assuming @ alias is set up
import { formatDate } from '@/utils/date'; // 1. Import the utility
import { formatDateTime} from '@/utils/date'; // 1. Import the utility

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
