<template>
  <div class="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Add New Core User</h3>
        <form @submit.prevent="saveUser" class="mt-4 space-y-4">
          <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" id="first_name" v-model="newUser.firstName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" id="last_name" v-model="newUser.lastName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
            </div>
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" v-model="newUser.email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="cell_number" class="block text-sm font-medium text-gray-700">Cell Number</label>
            <input type="text" id="cell_number" v-model="newUser.cellNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
          </div>
          <fieldset>
            <legend class="text-sm font-medium text-gray-900">Roles</legend>
            <div v-if="loadingRoles" class="text-sm text-gray-500">Loading roles...</div>
            <div v-else class="mt-2 space-y-2">
              <div v-for="role in availableRoles" :key="role.id" class="flex items-start">
                <div class="flex items-center h-5">
                  <input :id="`role-${role.id}`" :value="role.name" v-model="newUser.roles" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                </div>
                <div class="ml-3 text-sm">
                  <label :for="`role-${role.id}`" class="font-medium text-gray-700">{{ role.name }}</label>
                </div>
              </div>
            </div>
          </fieldset>
          <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
          <div class="mt-6 flex justify-end space-x-3">
            <button @click="$emit('close')" type="button" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" :disabled="isSaving" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '@/services/api';
import userService from '@/services/userService';

const emit = defineEmits(['close', 'user-added']);

const newUser = reactive({ 
  firstName: '', 
  lastName: '', 
  name: '', 
  email: '', 
  cellNumber: '', 
  roles: [] 
});
const availableRoles = ref([]);
const loadingRoles = ref(true);
const saveError = ref(null);
const isSaving = ref(false);

// Fetch the roles that a System Admin can assign
onMounted(async () => {
  try {
    // We can reuse the existing /roles endpoint.
    // Our backend logic is smart enough to give a System Admin all the roles.
    const response = await apiClient.get('/roles');
    availableRoles.value = response.data;
  } catch (err) {
    console.error("Failed to load roles", err);
  } finally {
    loadingRoles.value = false;
  }
});

const saveUser = async () => {
  saveError.value = null;
  isSaving.value = true;
  
  // Concatenate first and last names into the name field
  newUser.name = `${newUser.firstName} ${newUser.lastName}`.trim();

  // Convert to snake_case for the API
  const payload = {
    name: newUser.name,
    first_name: newUser.firstName,
    last_name: newUser.lastName,
    email: newUser.email,
    cell_number: newUser.cellNumber,
    roles: newUser.roles,
  };
  
  try {
    const response = await userService.createCoreUser(payload);
    emit('user-added', response.data);
  } catch (err) {
    saveError.value = err.response?.data?.message || 'Failed to send invitation.';
  } finally {
    isSaving.value = false;
  }
};
</script>