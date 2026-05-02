<template>
  <!--frontend-spa\src\components\admin\ManageAdminUserModal.vue-->
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      
      <!-- Modal Panel -->
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">Manage Subscriber Admin</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">Manage the admin user for this subscriber.</p>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 mt-4">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button @click="currentTab = 'manage'" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', currentTab === 'manage' ? 'border-brand-blue-500 text-brand-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
              Manage Current
            </button>
            <button @click="currentTab = 'assign'" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', currentTab === 'assign' ? 'border-brand-blue-500 text-brand-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
              Assign Existing
            </button>
            <button @click="currentTab = 'create'" :class="['whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm', currentTab === 'create' ? 'border-brand-blue-500 text-brand-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
              Create New
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="mt-6">
          <!-- Manage Current User Tab -->
          <div v-if="currentTab === 'manage'">
            <form @submit.prevent="saveUser">
              <div class="space-y-4">
                <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="first_name" class="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" v-model="formData.firstName" id="first_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                  </div>
                  <div>
                    <label for="last_name" class="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" v-model="formData.lastName" id="last_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                  </div>
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" v-model="formData.email" id="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                </div>
                <div>
                  <label for="cell_number" class="block text-sm font-medium text-gray-700">Cell Number</label>
                  <input type="text" v-model="formData.cellNumber" id="cell_number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                </div>
              </div>
              <p v-if="saveError" class="mt-2 text-sm text-red-600 text-center">{{ saveError }}</p>

              <!-- Action Buttons -->
              <div class="mt-6 flex justify-end gap-x-3">
                <button @click="$emit('close')" type="button" class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 sm:w-auto sm:text-sm">
                  Cancel
                </button>
                <button type="submit" :disabled="isSaving" class="inline-flex w-full justify-center rounded-md border border-transparent bg-[var(--c-primary-action)] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[var(--c-primary-action-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--c-primary-action)] focus:ring-offset-2 sm:w-auto sm:text-sm" :class="{'opacity-50': isSaving}">
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Assign Existing User Tab -->
          <div v-if="currentTab === 'assign'">
            <div>
              <label for="search-users" class="block text-sm font-medium text-gray-700">Search for a user</label>
              <input type="text" v-model="searchTerm" id="search-users" placeholder="Start typing a name or email..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
            </div>

            <div class="mt-4 h-60 overflow-y-auto border rounded-md">
              <div v-if="isSearching" class="p-4 text-center text-gray-500">Searching...</div>
              <div v-else-if="!searchResults.length && searchTerm" class="p-4 text-center text-gray-500">No users found.</div>
              <ul v-else-if="searchResults.length" class="divide-y divide-gray-200">
                <li v-for="foundUser in searchResults" :key="foundUser.id" class="p-3 flex justify-between items-center">
                  <div>
                    <p class="font-medium text-gray-800">{{ foundUser.name }}</p>
                    <p class="text-sm text-gray-500">{{ foundUser.email }}</p>
                  </div>
                  <button @click="assignNewAdmin(foundUser)" :disabled="foundUser.id === user.id" class="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ foundUser.id === user.id ? 'Current' : 'Assign' }}
                  </button>
                </li>
              </ul>
            </div>
            <div class="mt-6 flex justify-end">
               <button @click="$emit('close')" type="button" class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 sm:w-auto sm:text-sm">
                  Cancel
                </button>
            </div>
          </div>

          <!-- Create New User Tab -->
          <div v-if="currentTab === 'create'">
            <form @submit.prevent="createNewAdmin">
              <div class="space-y-4">
                <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label for="new-first-name" class="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" v-model="newAdminData.firstName" id="new-first-name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                  </div>
                  <div>
                    <label for="new-last-name" class="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" v-model="newAdminData.lastName" id="new-last-name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                  </div>
                </div>
                <div>
                  <label for="new-email" class="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" v-model="newAdminData.email" id="new-email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                </div>
                <div>
                  <label for="new-cell" class="block text-sm font-medium text-gray-700">Cell Number</label>
                  <input type="text" v-model="newAdminData.cellNumber" id="new-cell" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                </div>
              </div>
              <p v-if="saveError" class="mt-2 text-sm text-red-600 text-center">{{ saveError }}</p>
              <div class="mt-6 flex justify-end gap-x-3">
                 <button @click="$emit('close')" type="button" class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                  <button type="submit" :disabled="isSaving" class="inline-flex w-full justify-center rounded-md border border-transparent bg-[var(--c-primary-action)] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[var(--c-primary-action-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--c-primary-action)] focus:ring-offset-2 sm:w-auto sm:text-sm" :class="{'opacity-50': isSaving}">
                    {{ isSaving ? 'Creating...' : 'Create and Assign' }}
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import apiClient from '../../services/api';

// Define props and emits
const props = defineProps({
  user: {
    type: Object,
    required: true,
  }
});
const emit = defineEmits(['close', 'user-updated']);

// Component state
const currentTab = ref('manage'); // 'manage', 'assign', 'create'
const isSaving = ref(false);
const saveError = ref(null);

// --- Tab 1: Manage Current ---
const formData = reactive({
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  cellNumber: '',
});

// --- Tab 2: Assign Existing ---
const searchTerm = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
let debounceTimer = null;

// --- Tab 3: Create New ---
const newAdminData = reactive({
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  cellNumber: '',
});


// Initialize form data when component mounts
onMounted(() => {
  if (props.user) {
    formData.firstName = props.user.firstName;
    formData.lastName = props.user.lastName;
    formData.name = props.user.name;
    formData.email = props.user.email;
    formData.cellNumber = props.user.cellNumber;

    // Rule: If firstName or lastName are missing, split from name
    if (!formData.firstName && formData.name) {
      const parts = formData.name.trim().split(/\s+/);
      if (parts.length > 1) {
        formData.firstName = parts[0];
        formData.lastName = parts.slice(1).join(' ');
      } else {
        formData.firstName = parts[0];
      }
    }
  }
});

// Save the updated user details
const saveUser = async () => {
  isSaving.value = true;
  saveError.value = null;

  // Concatenate first and last names into the name field
  formData.name = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

  try {
    const response = await apiClient.put(`/users/${props.user.id}`, {
      name: formData.name,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      cell_number: formData.cellNumber,
    });
    emit('user-updated', response.data);
    emit('close');
  } catch (err) {
    console.error("Failed to save user:", err);
    saveError.value = err.response?.data?.message || 'Failed to save user details. Please try again.';
  } finally {
    isSaving.value = false;
  }
};

// Watch for changes in the search term and perform a debounced search
watch(searchTerm, (newVal) => {
  clearTimeout(debounceTimer);
  if (newVal) {
    isSearching.value = true;
    debounceTimer = setTimeout(async () => {
      try {
        const response = await apiClient.get(`/users?search=${newVal}&subscriber_id=${props.user.subscriberId}`);
        
        // FIX: Access response.data.data because the API returns a paginated object
        const usersList = response.data.data || []; 
        
        // Exclude the current admin from the search results
        searchResults.value = usersList.filter(u => u.id !== props.user.id);
        
      } catch (err) {
        console.error("Failed to search users:", err);
        searchResults.value = [];
      } finally {
        isSearching.value = false;
      }
    }, 500); // 500ms debounce
  } else {
    searchResults.value = [];
    isSearching.value = false;
  }
});

// Assign a different user as the subscriber admin
const assignNewAdmin = async (newUser) => {
  console.log('Inspecting props.user in assignNewAdmin:', props.user);
  if (!window.confirm(`Are you sure you want to make ${newUser.name} the new admin for this subscriber?`)) {
    return;
  }
  isSaving.value = true;
  saveError.value = null;
  try {
    const subscriberId = props.user.subscriberId;
    const response = await apiClient.put(`/admin/subscribers/${subscriberId}/assign-admin/${newUser.id}`);
    emit('user-updated', response); // It should not be response.data, if it is not a success
    emit('close');
  } catch (err) {
    console.error("Failed to assign new admin:", err);
    saveError.value = err.response?.data?.message || 'Failed to assign new admin. Please try again.';
  } finally {
    isSaving.value = false;
  }
};

// Create a new user and assign them as the admin
const createNewAdmin = async () => {
  isSaving.value = true;
  saveError.value = null;

  // Concatenate first and last names into the name field
  newAdminData.name = `${newAdminData.firstName || ''} ${newAdminData.lastName || ''}`.trim();

  try {
    const subscriberId = props.user.subscriberId;
    const response = await apiClient.post(`/admin/subscribers/${subscriberId}/users`, {
      name: newAdminData.name,
      first_name: newAdminData.firstName,
      last_name: newAdminData.lastName,
      email: newAdminData.email,
      cell_number: newAdminData.cellNumber,
    });
    emit('user-updated', response.data);
    emit('close');
  } catch (err) {
    console.error("Failed to create new admin:", err);
    saveError.value = err.response?.data?.message || 'Failed to create new admin. Please try again.';
  } finally {
    isSaving.value = false;
  }
};
</script>
