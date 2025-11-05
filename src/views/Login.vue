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
            <input
              v-model="credentials.password"
              type="password"
              id="password"
              name="password"
              required
              autocomplete="current-password"
              class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm"
            />
          </div>
          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
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
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
// 1. Import the Logo component
import Logo from '../components/common/Logo.vue';

const authStore = useAuthStore();

const credentials = ref({
  email: '',
  password: '',
});

const handleLogin = async () => {
  await authStore.login(credentials.value);
};
</script>