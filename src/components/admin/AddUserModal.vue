<template>
  <!-- frontend-spa\src\components\admin\AddUserModal.vue-->
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      
      <!-- Modal Panel -->
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">Add New User</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">Enter the details for the new user. A password will be generated and sent via email.</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveUser">
          <div class="mt-4 space-y-4">
            <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
              <div>
                <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" id="first_name" v-model="newUser.firstName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
              </div>
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" id="last_name" v-model="newUser.lastName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
              </div>
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" v-model="newUser.email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
            </div>
            <div>
              <label for="cell_number" class="block text-sm font-medium text-gray-700">Cell Number</label>
              <input type="text" id="cell_number" v-model="newUser.cellNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
            </div>
            
            <fieldset class="border-t border-b border-gray-200 pt-4">
              <legend class="text-sm font-medium text-gray-900">Roles</legend>
              <div class="mt-2 divide-y divide-gray-200">
                <div v-if="loadingRoles" class="text-gray-500">Loading roles...</div>
                <div v-else-if="rolesError" class="text-red-500">{{ rolesError }}</div>
                <div v-for="role in availableRoles" :key="role.id" class="relative flex items-start py-2">
                  <div class="min-w-0 flex-1 text-sm">
                    <label :for="`add-role-${role.id}`" class="font-medium text-gray-700 select-none">{{ role.name }}</label>
                  </div>
                  <div class="ml-3 flex h-5 items-center">
                    <input :id="`add-role-${role.id}`" :value="role.name" v-model="newUser.roles" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500">
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          <!-- Action Buttons -->
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button type="submit" :disabled="isSaving" class="inline-flex w-full justify-center rounded-md border border-transparent bg-brand-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50">
              Save User
            </button>
            <button @click="$emit('close')" type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm">
              Cancel
            </button>
          </div>
          <p v-if="saveError" class="mt-2 text-sm text-red-600 text-center">{{ saveError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '../../services/api';

const emit = defineEmits(['close', 'user-added']);

const newUser = reactive({
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  cellNumber: '',
  roles: [],
});

const availableRoles = ref([]);
const loadingRoles = ref(true);
const rolesError = ref(null);
const saveError = ref(null);
const isSaving = ref(false);

onMounted(async () => {
  try {
    const response = await apiClient.get('/roles');
    availableRoles.value = response.data;
  } catch (err) {
    rolesError.value = 'Failed to load roles.';
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
    const response = await apiClient.post('/users', payload);
    emit('user-added', response.data);
    emit('close');
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
        saveError.value = err.response.data.message;
    } else {
        saveError.value = 'Failed to save user. Please try again.';
    }
  } finally {
    isSaving.value = false;
  }
};
</script>