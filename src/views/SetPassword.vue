<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        Create Your Password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Set a password to activate your account.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form v-if="!successMessage" class="space-y-6" @submit.prevent="submitPassword">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input id="password" v-model="password" name="password" type="password" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label for="password-confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div class="mt-1">
              <input id="password-confirmation" v-model="passwordConfirmation" name="password_confirmation" type="password" required class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
            </div>
          </div>
          
          <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
            <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
          </div>

          <div>
            <button type="submit" :disabled="isLoading" class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
              <span v-if="isLoading">Setting Password...</span>
              <span v-else>Set Password and Log In</span>
            </button>
          </div>
        </form>

        <div v-else class="text-center">
            <p class="text-lg font-medium text-green-700">{{ successMessage }}</p>
            <p class="mt-2 text-sm text-gray-600">Redirecting you to the dashboard...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';

const route = useRoute();
const router = useRouter();

const token = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

// Extract the token from the URL when the component loads
onMounted(() => {
  token.value = route.params.token;
  if (!token.value) {
    errorMessage.value = 'Invitation token is missing or invalid.';
  }
});

const submitPassword = async () => {
  errorMessage.value = null;

  // 1. Frontend Validation
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
    // 2. Call the service and WAIT for it to complete.
    await authService.setPassword(token.value, password.value, passwordConfirmation.value);
    
    // 3. If the 'await' completes without error, it was a success.
    successMessage.value = 'Password set successfully! Redirecting...';

    // 4. Handle the redirection from within the component.
    setTimeout(() => {
        router.push('/'); // Redirect to the dashboard
    }, 1500); // Wait 1.5 seconds

  } catch (err) {
    // 5. If 'await' fails, the catch block will execute.
    console.error('An error occurred during setPassword:', err);

    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message;
    } else {
      errorMessage.value = 'An unknown error occurred. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>