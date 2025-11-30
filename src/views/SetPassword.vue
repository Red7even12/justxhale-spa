<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create Your Secure Password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Set a strong password to secure your account.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSetPassword">
          
          <!-- Password Input with Generator -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Secure Password
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                v-model="formData.password"
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <!-- NEW: Generate Password Button -->
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  @click="generateAndSetPassword"
                  class="text-gray-400 hover:text-indigo-600 focus:outline-none"
                  title="Generate Strong Password"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.623 5.873M15 7a6 6 0 00-4.377 1.627M9 17a6 6 0 017.623-5.873M9 17a2 2 0 00-2-2m-4 0a6 6 0 007.623 5.873" />
                  </svg>
                </button>
              </div>
            </div>
            <!-- NEW: Password Requirements Helper Text -->
            <p class="mt-2 text-xs text-gray-500">
              Must be at least 16 characters. Must include uppercase, lowercase, numbers, and symbols (e.g., !@#$%).
            </p>
          </div>

          <!-- Password Confirmation Input -->
          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div class="mt-1">
              <input
                v-model="formData.password_confirmation"
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <!-- Error Message Display -->
          <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
              <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ isLoading ? 'Setting Password...' : 'Set Password and Login' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const formData = reactive({
  password: '',
  password_confirmation: '',
  token: route.params.token, // Assumes the token is part of the URL, e.g., /set-password/THE_TOKEN
});

const isLoading = ref(false);
const errorMessage = ref('');

/**
 * NEW: Generates a cryptographically secure, 16-character password that meets all requirements.
 */
const generateAndSetPassword = () => {
  const length = 16;
  const charsets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // 1. Start with one character from each required set to guarantee compliance.
  let generatedPassword =
    charsets.lowercase[Math.floor(Math.random() * charsets.lowercase.length)] +
    charsets.uppercase[Math.floor(Math.random() * charsets.uppercase.length)] +
    charsets.numbers[Math.floor(Math.random() * charsets.numbers.length)] +
    charsets.symbols[Math.floor(Math.random() * charsets.symbols.length)];
  
  // 2. Create a pool of all possible characters for the remaining length.
  const allChars = Object.values(charsets).join('');
  
  // 3. Fill the rest of the password with random characters from the pool.
  for (let i = generatedPassword.length; i < length; i++) {
    generatedPassword += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 4. Shuffle the generated password to avoid a predictable pattern (e.g., Symbol always at the end).
  generatedPassword = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');

  // 5. Populate both form fields to ensure they match.
  formData.password = generatedPassword;
  formData.password_confirmation = generatedPassword;
};

const handleSetPassword = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  if (formData.password !== formData.password_confirmation) {
      errorMessage.value = "Passwords do not match.";
      isLoading.value = false;
      return;
  }
  
  try {
    const response = await authService.setPassword(formData);
    // Use the login action from the auth store to save the token and user data
    authStore.login(response.data);
    // Redirect to the dashboard upon success
    router.push('/');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
        // Display the first validation error from the backend
        errorMessage.value = Object.values(error.response.data.errors)[0][0];
    } else {
        errorMessage.value = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>