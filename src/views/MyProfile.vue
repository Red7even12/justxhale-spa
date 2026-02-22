<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

    <div class="bg-white shadow rounded-lg p-6">
      <form v-if="user" @submit.prevent="updateProfile">
        <div class="space-y-6">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" id="first_name" v-model="user.firstName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" id="last_name" v-model="user.lastName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
            </div>
          </div>
          
          <!-- Email (Read-only) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" id="email" :value="user.email" disabled class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm">
            <p class="mt-2 text-xs text-gray-500">Email address cannot be changed.</p>
          </div>

          <!-- Cell Number -->
          <div>
            <label for="cell_number" class="block text-sm font-medium text-gray-700">Cell Number</label>
            <input type="text" id="cell_number" v-model="user.cellNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
          </div>
        </div>

<div class="mt-8 flex justify-end items-center space-x-4">
          <button @click="closePage" type="button" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            Close
          </button>
          <button type="submit" :disabled="isSaving" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            <span v-if="isSaving">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
        <p v-if="successMessage" class="mt-4 text-sm text-green-600 text-right">{{ successMessage }}</p>
        <p v-if="errorMessage" class="mt-4 text-sm text-red-600 text-right">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import apiClient from '@/services/api';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
// Create a deep, local copy of the user from the store to prevent direct mutation
const user = ref(JSON.parse(JSON.stringify(authStore.user)));

// Rule: If firstName or lastName are missing, split from name
if (user.value && !user.value.firstName && user.value.name) {
  const parts = user.value.name.trim().split(/\s+/);
  if (parts.length > 1) {
    user.value.firstName = parts[0];
    user.value.lastName = parts.slice(1).join(' ');
  } else {
    user.value.firstName = parts[0];
  }
}

const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const closePage = () => {
  router.back(); // This is the simplest way to go to the previous page.
                 // Alternatively, you could use router.push({ name: 'Dashboard' });
};


const updateProfile = async () => {
  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  // Concatenate first and last names into the name field
  user.value.name = `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim();

  // Convert to snake_case for the API
  const payload = {
    name: user.value.name,
    first_name: user.value.firstName,
    last_name: user.value.lastName,
    cell_number: user.value.cellNumber,
  };

  try {
    const response = await apiClient.put('/user/profile', payload);
    
    // On success, update the auth store with the new user data
    authStore.user = response.data;
    localStorage.setItem('user', JSON.stringify(response.data));

    successMessage.value = 'Profile updated successfully!';
    setTimeout(() => successMessage.value = '', 3000); // Clear message after 3 seconds

  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to update profile.';
  } finally {
    isSaving.value = false;
  }
};
</script>