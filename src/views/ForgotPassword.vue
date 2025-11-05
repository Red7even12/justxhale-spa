<template>
   <!--frontend-spa\src\views\ForgotPassword.vue -->
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Forgot Your Password?
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we will send you a link to reset your password.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
          <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        </div>

        <form v-else class="space-y-6" @submit.prevent="submitRequest">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          
          <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

          <div>
            <button type="submit" :disabled="isLoading" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
              Send Reset Link
            </button>
          </div>
        </form>
        
        <div class="mt-6 text-center">
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Back to login
            </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import passwordService from '@/services/passwordService';

const email = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

const submitRequest = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    const response = await passwordService.forgotPassword(email.value);
    successMessage.value = response.data.message; // Display the success message from the API
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};
</script>