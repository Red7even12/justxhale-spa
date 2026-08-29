<template>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form @submit.prevent="createTeam">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 space-y-4">
              <h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">Add New Team</h3>
              
              <!-- 1. Team Name Input -->
              <div>
                <label for="team-name" class="block text-xs font-black text-gray-500 uppercase">Team Name</label>
                <div class="mt-1">
                  <input
                    v-model="teamName"
                    type="text"
                    name="team-name"
                    id="team-name"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue-600 sm:text-sm sm:leading-6 font-bold"
                    placeholder="e.g., Pretoria Branch or Occupational Health"
                    required
                  />
                </div>
              </div>

              <!-- 2. Team Type Radio Button Structure (Strict A vs B) -->
              <div>
                <label class="block text-xs font-black text-gray-500 uppercase mb-2">Team Purpose & Scope</label>
                <div class="space-y-3">
                  
                  <!-- Option A: Case Ownership Team -->
                  <label :class="teamType === 'ownership' ? 'border-brand-blue-600 bg-blue-50/50' : 'border-gray-200'" class="flex items-start p-3 border rounded-xl cursor-pointer transition-all">
                    <input type="radio" v-model="teamType" value="ownership" class="mt-1 text-brand-blue-600 focus:ring-brand-blue-500">
                    <div class="ml-3">
                      <span class="block text-xs font-black text-gray-900 uppercase">Case Ownership / Regional Branch</span>
                      <span class="block text-[11px] text-gray-500 mt-0.5 leading-snug">
                        Controls matter ownership on the Dashboard index dropdowns (e.g., <em>Pretoria Branch, Midrand Hub</em>).
                      </span>
                    </div>
                  </label>

                  <!-- Option B: Functional Access Team -->
                  <label :class="teamType === 'functional' ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200'" class="flex items-start p-3 border rounded-xl cursor-pointer transition-all">
                    <input type="radio" v-model="teamType" value="functional" class="mt-1 text-emerald-600 focus:ring-emerald-500">
                    <div class="ml-3">
                      <span class="block text-xs font-black text-gray-900 uppercase">Functional Domain Access</span>
                      <span class="block text-[11px] text-gray-500 mt-0.5 leading-snug">
                        Controls Niche Tab access inside a case file (e.g., <em>Occupational Health, Fleet & Workshop</em>).
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              <p v-if="error" class="text-sm text-red-600 font-bold">{{ error }}</p>
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
const teamType = ref('ownership'); // Default to Ownership
const loading = ref(false);
const error = ref(null);

const createTeam = async () => {
  if (!teamName.value) return;
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.post('/teams', { 
      name: teamName.value,
      team_type: teamType.value 
    });
    emit('team-created', response.data);
  } catch (err) {
    if (err.response && err.response.status === 422) {
      error.value = err.response.data.message;
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }
    console.error('Failed to create team:', err);
  } finally {
    loading.value = false;
  }
};
</script>