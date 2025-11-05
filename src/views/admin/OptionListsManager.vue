<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Option Lists Management</h1>
    <p class="text-gray-600 mb-8">Manage the sources and options for sourced dropdowns used across the application.</p>

    <div v-if="isLoading" class="text-center py-12">Loading...</div>
    <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Column 1: List of Sources -->
      <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Sources</h3>
          <button @click="handleAddNewSource" class="btn-primary">Add Source</button>
        </div>
        <ul class="space-y-2">
          <li v-for="source in sources" :key="source">
            <button 
              @click="selectSource(source)"
              :class="[
                'w-full text-left p-3 rounded-md transition-colors text-sm font-medium',
                selectedSource === source ? 'bg-brand-blue-500 text-white' : 'hover:bg-gray-100'
              ]"
            >
              {{ source }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Column 2: Options for Selected Source -->
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
        <div v-if="!selectedSource" class="flex items-center justify-center h-full">
          <p class="text-gray-500">Select a source to manage its options.</p>
        </div>
        <div v-else>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Options for <span class="text-brand-blue-500">{{ selectedSource }}</span></h2>
            <button @click="handleAddNewOption" class="btn-primary">Add Option</button>
          </div>
          
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Option Value</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="option in optionsForSelectedSource" :key="option.id">
                <td class="px-4 py-3 font-medium">{{ option.option_value }}</td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-0.5 text-xs rounded-full', option.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700']">
                    {{ option.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-3">
                  <button @click="handleEditOption(option)" class="text-brand-blue-600 hover:underline">Edit</button>
                  <button @click="handleDeleteOption(option)" class="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal for Add/Edit Option -->
  <div v-if="isModalOpen" class="fixed inset-0 z-10 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <h3 class="text-lg font-medium mb-4">{{ modalTitle }}</h3>
      <form @submit.prevent="saveOption">
        <div class="space-y-4">
          <div>
            <label for="source_name" class="block text-sm font-medium">Source Name</label>
            <input id="source_name" type="text" v-model="editableOption.source_name" class="form-input w-full" :disabled="!isCreatingNewSource">
          </div>
          <div>
            <label for="option_value" class="block text-sm font-medium">Option Value</label>
            <input id="option_value" type="text" v-model="editableOption.option_value" class="form-input w-full" required>
          </div>
          <div class="flex items-center">
            <input id="is_active" type="checkbox" v-model="editableOption.is_active" class="form-checkbox">
            <label for="is_active" class="ml-2">Active</label>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import adminService from '@/services/adminService';

const sources = ref([]);
const optionsForSelectedSource = ref([]);
const selectedSource = ref(null);
const isLoading = ref(true);
const error = ref(null);

const isModalOpen = ref(false);
const isCreatingNewSource = ref(false);
const editableOption = reactive({
  id: null,
  source_name: '',
  option_value: '',
  is_active: true,
});

const modalTitle = computed(() => editableOption.id ? 'Edit Option' : 'Add Option');

const fetchSources = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await adminService.getSourcedOptionSources();
    sources.value = response.data;
  } catch (err) {
    error.value = 'Failed to load sources.';
  } finally {
    isLoading.value = false;
  }
};

const selectSource = async (sourceName) => {
  selectedSource.value = sourceName;
  try {
    const response = await adminService.getOptionsForSource(sourceName);
    optionsForSelectedSource.value = response.data;
  } catch (err) {
    error.value = `Failed to load options for ${sourceName}.`;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleAddNewSource = () => {
  isCreatingNewSource.value = true;
  Object.assign(editableOption, {
    id: null,
    source_name: '',
    option_value: '',
    is_active: true,
  });
  isModalOpen.value = true;
};

const handleAddNewOption = () => {
  if (!selectedSource.value) return;
  isCreatingNewSource.value = false;
  Object.assign(editableOption, {
    id: null,
    source_name: selectedSource.value,
    option_value: '',
    is_active: true,
  });
  isModalOpen.value = true;
};

const handleEditOption = (option) => {
  isCreatingNewSource.value = false;
  Object.assign(editableOption, option);
  isModalOpen.value = true;
};

const saveOption = async () => {
  try {
    if (editableOption.id) { // Update
      await adminService.updateSourcedOption(editableOption.id, editableOption);
    } else { // Create
      await adminService.createSourcedOption(editableOption);
    }
    closeModal();
    if (!sources.value.includes(editableOption.source_name)) {
      await fetchSources();
    }
    await selectSource(editableOption.source_name);
  } catch (err) {
    alert('Failed to save option.');
    console.error(err);
  }
};

const handleDeleteOption = async (option) => {
  if (confirm(`Are you sure you want to delete the option "${option.option_value}"?`)) {
    try {
      await adminService.deleteSourcedOption(option.id);
      await selectSource(option.source_name);
    } catch (err) {
      alert('Failed to delete option.');
    }
  }
};

onMounted(fetchSources);
</script>
