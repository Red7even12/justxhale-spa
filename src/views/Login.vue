<template>
  <!-- frontend-spa\src\views\Login.vue -->
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <!-- We now pass a class to the component to control its size -->
      <div class="flex justify-center">
        <Logo class="h-22 w-auto" /> 
      </div>
      
      <h2 class="text-2xl font-bold text-center text-gray-900">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              v-model="credentials.email"
              type="email"
              id="email"
              autocomplete="username"
              class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <!-- NEW: Add a wrapper div for positioning the icon -->
            <div class="relative mt-1">
              <input
                v-model="credentials.password"
                :type="passwordFieldType"
                id="password"
                name="password"
                required
                autocomplete="current-password"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
              />
              <!-- NEW: Visibility Toggle Button -->
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="text-gray-400 hover:text-indigo-600 focus:outline-none"
                  :title="isPasswordVisible ? 'Hide password' : 'Show password'"
                >
                  <!-- Eye Icon (Show) -->
                  <svg v-if="!isPasswordVisible" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <!-- Eye-slashed Icon (Hide) -->
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
              Reset/Change your password.
            </router-link>
          </div>
        </div>
        <div class="mt-6">
          <button 
            type="submit" 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--c-primary-action)] hover:bg-[var(--c-primary-action-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--c-primary-action)]"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'; // <-- NEW: Import 'computed'
import { useAuthStore } from '../store/auth';
import Logo from '../components/common/Logo.vue';

const authStore = useAuthStore();

const credentials = ref({
  email: '',
  password: '',
});

// --- NEW: LOGIC FOR PASSWORD VISIBILITY ---
const isPasswordVisible = ref(false);

const passwordFieldType = computed(() => {
  return isPasswordVisible.value ? 'text' : 'password';
});

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};
// --- END OF NEW LOGIC ---

const handleLogin = async () => {
  await authStore.login(credentials.value);
};
</script>