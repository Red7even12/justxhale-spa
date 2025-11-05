<template>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form @submit.prevent="createTeam">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">Add New Team</h3>
              <div class="mt-4">
                <label for="team-name" class="block text-sm font-medium leading-6 text-gray-900">Team Name</label>
                <div class="mt-2">
                  <input
                    v-model="teamName"
                    type="text"
                    name="team-name"
                    id="team-name"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue-600 sm:text-sm sm:leading-6"
                    placeholder="e.g., Pretoria Branch"
                    required
                  />
                </div>
                <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="submit" :disabled="loading" class="inline-flex w-full justify-center rounded-md bg-brand-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50">
                {{ loading ? 'Saving...' : 'Save Team' }}
              </button>
              <button @click="$emit('close')" type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import apiClient from '../../services/api';

const emit = defineEmits(['close', 'team-created']);

const teamName = ref('');
const loading = ref(false);
const error = ref(null);

const createTeam = async () => {
  if (!teamName.value) return;
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.post('/teams', { name: teamName.value });
    emit('team-created', response.data);
  } catch (err) {
    if (err.response && err.response.status === 422) {
      error.value = err.response.data.message; // "The name has already been taken."
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }
    console.error('Failed to create team:', err);
  } finally {
    loading.value = false;
  }
};
</script>