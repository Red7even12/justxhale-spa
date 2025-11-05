<template>
    <!-- frontend-spa\src\views\ResetPassword.vue -->
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Reset Your Password
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="submitPassword">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
            <div class="mt-1">
              <input id="password" v-model="password" name="password" type="password" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password-confirmation" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div class="mt-1">
              <input id="password-confirmation" v-model="passwordConfirmation" name="password_confirmation" type="password" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          
          <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

          <div>
            <button type="submit" :disabled="isLoading" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
              Reset Password and Log In
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import passwordService from '@/services/passwordService';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const token = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const isLoading = ref(false);
const errorMessage = ref(null);

onMounted(() => {
  token.value = route.params.token;
});

const submitPassword = async () => {
  errorMessage.value = null;

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.';
    return;
  }
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  isLoading.value = true;
  try {
    const response = await passwordService.resetPassword(token.value, password.value, passwordConfirmation.value);
    
    // On success, use our existing auth store action to handle the login
    authStore.handleLoginSuccess(response.data);
    
    // Then redirect to the dashboard
    router.push('/');

  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'An unknown error occurred.';
  } finally {
    isLoading.value = false;
  }
};
</script>