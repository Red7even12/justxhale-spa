<template>
  <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Edit User Details</h3>
        <form v-if="editableUser" @submit.prevent="saveUser" class="mt-4 space-y-4">
          <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div>
              <label for="edit-first-name" class="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" id="edit-first-name" v-model="editableUser.firstName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="edit-last-name" class="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" id="edit-last-name" v-model="editableUser.lastName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
            </div>
          </div>
          <div>
            <label for="edit-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="edit-email" v-model="editableUser.email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="edit-cell" class="block text-sm font-medium text-gray-700">Cell Number</label>
            <input type="text" id="edit-cell" v-model="editableUser.cellNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
          </div>
          
          <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>

          <div class="mt-6 flex justify-end space-x-3">
            <button @click="$emit('close')" type="button" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" :disabled="isSaving" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import userService from '@/services/userService';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  // This 'context' prop tells the modal which API to use
  context: {
    type: String,
    required: true,
    validator: (value) => ['subscriber', 'core'].includes(value),
  }
});

const emit = defineEmits(['close', 'user-updated']);

const editableUser = ref(null);
const saveError = ref(null);
const isSaving = ref(false);

// Create a local, editable copy of the user prop when the component mounts
onMounted(() => {
  editableUser.value = JSON.parse(JSON.stringify(props.user));
  
  // Rule: If firstName or lastName are missing, split from name
  if (editableUser.value && !editableUser.value.firstName && editableUser.value.name) {
    const parts = editableUser.value.name.trim().split(/\s+/);
    if (parts.length > 1) {
      editableUser.value.firstName = parts[0];
      editableUser.value.lastName = parts.slice(1).join(' ');
    } else {
      editableUser.value.firstName = parts[0];
    }
  }
});

const saveUser = async () => {
  saveError.value = null;
  isSaving.value = true;

  // Concatenate first and last names into the name field
  editableUser.value.name = `${editableUser.value.firstName || ''} ${editableUser.value.lastName || ''}`.trim();

  // CONVERT TO SNAKE_CASE FOR THE API
  const payload = {
    name: editableUser.value.name,
    first_name: editableUser.value.firstName,
    last_name: editableUser.value.lastName,
    email: editableUser.value.email,
    cell_number: editableUser.value.cellNumber,
  };

  try {
    let response;
    // Use the 'context' prop to decide which service method to call
    if (props.context === 'core') {
      response = await userService.updateCoreUser(props.user.id, payload);
    } else {
      response = await userService.updateUser(props.user.id, payload);
    }
    emit('user-updated', response.data);
  } catch (err) {
    saveError.value = err.response?.data?.message || 'Failed to update user.';
  } finally {
    isSaving.value = false;
  }
};
</script>