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
          
          <!-- Account Email (Read-only) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Account</label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                :value="formData.email"
                readonly
                class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-500 shadow-sm sm:text-sm"
                autocomplete="username"
                placeholder="Loading account..."
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              New Secure Password
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                v-model="formData.password"
                id="password"
                name="password"
                :type="uiState.visibility.password ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                <button type="button" @click="toggleVisibility('password')" class="text-gray-400 hover:text-indigo-600 focus:outline-none" :title="uiState.visibility.password ? 'Hide password' : 'Show password'">
                  <svg v-if="!uiState.visibility.password" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </button>
              </div>
            </div>
            <div class="mt-2 text-xs flex justify-between items-center">
                <span class="text-gray-500">
                    Must meet complexity rules.
                </span>
                <button type="button" @click="generateAndSetPassword" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Generate Strong Password
                </button>
            </div>
          </div>

          <!-- Password Confirmation Input -->
          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <input
                v-model="formData.password_confirmation"
                id="password_confirmation"
                name="password_confirmation"
                :type="uiState.visibility.password_confirmation ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button type="button" @click="toggleVisibility('password_confirmation')" class="text-gray-400 hover:text-indigo-600 focus:outline-none" :title="uiState.visibility.password_confirmation ? 'Hide password' : 'Show password'">
                  <svg v-if="!uiState.visibility.password_confirmation" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Error Message Display -->
          <div v-if="uiState.errorMessage" class="rounded-md bg-red-50 p-4">
              <p class="text-sm font-medium text-red-800">{{ uiState.errorMessage }}</p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="uiState.isLoading || !formData.email"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ uiState.isLoading ? 'Setting Password...' : 'Set Password and Log In' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';
import userService from '@/services/userService';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const formData = reactive({
  password: '',
  password_confirmation: '',
  token: route.params.token || '',
  email: '', // Will be populated from the API
});

const uiState = reactive({
    isLoading: false,
    errorMessage: '',
    visibility: {
        password: false,
        password_confirmation: false,
    }
});

/**
 * On component mount, fetch the email associated with the token.
 */
onMounted(async () => {
    if (!formData.token) {
        uiState.errorMessage = "No invitation token found in the link.";
        return;
    }
    try {
        const response = await userService.getEmailFromToken(formData.token);
        formData.email = response.data.email;
    } catch (error) {
        uiState.errorMessage = error.response?.data?.message || "This invitation link is invalid or has expired. Please contact your administrator.";
    }
});

/**
 * Toggles the visibility of a password field.
 */
const toggleVisibility = (field) => {
    if (field in uiState.visibility) {
        uiState.visibility[field] = !uiState.visibility[field];
    }
};

/**
 * Generates a cryptographically secure, 16-character password that meets all requirements.
 */
const generateAndSetPassword = () => {
  const length = 16;
  const charsets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  let generatedPassword =
    charsets.lowercase[Math.floor(Math.random() * charsets.lowercase.length)] +
    charsets.uppercase[Math.floor(Math.random() * charsets.uppercase.length)] +
    charsets.numbers[Math.floor(Math.random() * charsets.numbers.length)] +
    charsets.symbols[Math.floor(Math.random() * charsets.symbols.length)];
  
  const allChars = Object.values(charsets).join('');
  
  for (let i = generatedPassword.length; i < length; i++) {
    generatedPassword += allChars[Math.floor(Math.random() * allChars.length)];
  }

  generatedPassword = generatedPassword.split('').sort(() => 0.5 - Math.random()).join('');

  formData.password = generatedPassword;
  formData.password_confirmation = generatedPassword;
  
  // Auto-show password when generated so user can see/copy it
  uiState.visibility.password = true;
  uiState.visibility.password_confirmation = true;
};

const handleSetPassword = async () => {
  uiState.isLoading = true;
  uiState.errorMessage = '';

  if (formData.password !== formData.password_confirmation) {
      uiState.errorMessage = "Passwords do not match.";
      uiState.isLoading = false;
      return;
  }
  
  try {
    const response = await authService.setPassword(formData);
    // authService.setPassword already calls handleLoginSuccess
    router.push('/');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
        uiState.errorMessage = Object.values(error.response.data.errors).flat().join(' ');
    } else {
        uiState.errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
    }
  } finally {
    uiState.isLoading = false;
  }
};
</script>