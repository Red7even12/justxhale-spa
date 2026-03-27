<template>
  <!-- frontend-spa\src\components\admin\UserRolesModal.vue -->
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      
      <!-- Modal Panel -->
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">Edit Roles for {{ user.name }}</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">Select the roles this user should have.</p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveRoles">
          <div class="mt-4 space-y-4">
            <div v-if="loadingRoles" class="text-gray-500">Loading roles...</div>
            <div v-else-if="rolesError" class="text-red-500">{{ rolesError }}</div>
            
            <!-- Checkbox List -->
            <fieldset v-else class="border-t border-b border-gray-200">
              <legend class="sr-only">Roles</legend>
              <div class="divide-y divide-gray-200">
                <div v-for="role in availableRoles" :key="role.id" class="relative flex items-start py-4">
                  <div class="min-w-0 flex-1 text-sm">
                    <label :for="`role-${role.id}`" class="font-medium text-gray-700 select-none">{{ role.name }}</label>
                  </div>
                  <div class="ml-3 flex h-5 items-center">
                    <input 
                      :id="`role-${role.id}`" 
                      :value="role.name"
                      v-model="selectedRoles"
                      type="checkbox" 
                      class="h-4 w-4 rounded border-gray-300 text-[var(--c-primary-action)] focus:ring-[var(--c-primary-action)]"
                    >
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          <!-- Action Buttons -->
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button type="submit" class="inline-flex w-full justify-center rounded-md border border-transparent bg-[var(--c-primary-action)] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[var(--c-primary-action-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--c-primary-action)] focus:ring-offset-2 sm:col-start-2 sm:text-sm">
              Save
            </button>
            <button @click="$emit('close')" type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm">
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
import { ref, onMounted } from 'vue';
import apiClient from '../../services/api';

// Define props and emits
const props = defineProps({
  user: {
    type: Object,
    required: true,
  }
});
const emit = defineEmits(['close', 'user-updated']);

// State for this component
const availableRoles = ref([]);
const selectedRoles = ref([]);
const loadingRoles = ref(true);
const rolesError = ref(null);
const saveError = ref(null);

// When the component mounts, fetch roles and set initial state
onMounted(async () => {
  // Pre-select the roles the user already has
  selectedRoles.value = (props.user.roles || []).map(role => role.name);

  // Fetch all available roles from the API
  try {
    const response = await apiClient.get('/roles');
    availableRoles.value = response.data;
  } catch (err) {
    rolesError.value = 'Failed to load roles.';
  } finally {
    loadingRoles.value = false;
  }
});

// Save the updated roles
const saveRoles = async () => {
  saveError.value = null;
  try {
    const response = await apiClient.put(`/users/${props.user.id}/roles`, {
      roles: selectedRoles.value
    });
    // Emit event to parent with the updated user data
    emit('user-updated', response.data);
    emit('close');
  } catch (err) {
    saveError.value = 'Failed to save roles. Please try again.';
  }
};
</script>