<template>
  <div class="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Edit User Details</h3>
        <form v-if="editableUser" @submit.prevent="saveUser" class="mt-4 space-y-4">
          <div>
            <label for="edit-name" class="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="edit-name" v-model="editableUser.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 sm:text-sm">
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
});

const saveUser = async () => {
  saveError.value = null;
  isSaving.value = true;

  // CONVERT TO SNAKE_CASE FOR THE API
  const payload = {
    name: editableUser.value.name,
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