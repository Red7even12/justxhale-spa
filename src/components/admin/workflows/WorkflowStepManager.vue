<template>
  <div class="mt-4">
    <!-- Action Bar -->
    <div class="flex justify-end items-center mb-4 space-x-3">
      <button v-if="steps.length > 0" @click="exportSteps" :disabled="isExporting" class="btn-secondary">
        {{ isExporting ? 'Exporting...' : 'Export to Excel' }}
      </button>
      <!-- "Add Step" button is removed as per the plan to manage via import/export -->
    </div>

    <!-- Import Section -->
    <div class="mb-8 p-4 border rounded-lg bg-gray-50">
      <h4 class="font-medium text-gray-800">Import Steps from File</h4>
      <p class="text-sm text-gray-500 mt-1">
        Upload an .xlsx file to bulk create or update workflow steps. The file must match the format of the export.
      </p>
      <form @submit.prevent="handleImport" class="mt-4 flex items-center space-x-3">
        <input type="file" @change="handleFileSelect" ref="fileInput" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue-50 file:text-brand-blue-700 hover:file:bg-brand-blue-100"/>
        <button type="submit" class="btn-primary whitespace-nowrap" :disabled="!importFile || isImporting">
          {{ isImporting ? 'Importing...' : 'Upload & Import' }}
        </button>
      </form>
      <!-- Import Feedback -->
      <div v-if="importSuccessMessage" class="mt-3 text-sm text-green-600 font-medium">{{ importSuccessMessage }}</div>
      <div v-if="importErrors.length > 0" class="mt-3">
          <p class="text-sm text-red-600 font-bold">Import failed with the following errors:</p>
          <ul class="list-disc list-inside mt-1 text-sm text-red-600">
              <li v-for="(error, index) in importErrors" :key="index">
                  Row {{ error.row }}: {{ error.message }}
              </li>
          </ul>
      </div>
    </div>

    <!-- Table of steps -->
    <div v-if="loading" class="text-center">Loading steps...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="steps.length === 0">
      <p class="text-gray-500">No steps defined for this workflow yet.</p>
    </div>
    <div v-else class="overflow-x-auto border rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <!-- CHANGED: ID Column is now the first sortable column -->
            <th @click="sortBy('id')" class="w-20 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
              ID
              <span v-if="sortState.by === 'id'">{{ sortState.dir === 'asc' ? '▲' : '▼' }}</span>
            </th>
            
            <th @click="sortBy('name')" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
              Name
              <span v-if="sortState.by === 'name'">{{ sortState.dir === 'asc' ? '▲' : '▼' }}</span>
            </th>

            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reminders</th>

            <!-- ADDED: Reminder Subject Column -->
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reminder Subject</th>

            <!-- ADDED: Trigger Field Column -->
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Triggered By ID</th>
            
            <!-- REMOVED: Actions Column -->
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="step in steps" :key="step.id">
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ step.id }}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ step.name }}</td>
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
              {{ step.reminderMaxCycles || 0 }} cycles @ {{ step.reminderIntervalDays || 0 }} days
            </td>
            
            <!-- ADDED: Reminder Subject Data Cell -->
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{{ step.reminderSubject || 'N/A' }}</td>

            <!-- ADDED: Trigger Field Data Cell -->
            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-600 font-mono">{{ step.startsAfterStepId || 'N/A' }}</td>

            <!-- REMOVED: Actions Data Cell -->
          </tr>
        </tbody>
      </table>
    </div>

    <!-- The modal is no longer needed here as we are not editing/creating steps directly -->
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import workflowStepService from '@/services/workflowStepService';
import workflowDefinitionService from '@/services/workflowDefinitionService'; 

const props = defineProps({
  definition: { type: Object, required: true },
});

const steps = ref([]);
const loading = ref(false);
const error = ref(null);
const isExporting = ref(false);

const sortState = reactive({
  by: 'id',   // CHANGED: Default sort column is now 'id'
  dir: 'asc',
});

const importFile = ref(null);
const fileInput = ref(null);
const isImporting = ref(false);
const importSuccessMessage = ref('');
const importErrors = ref([]);

const fetchSteps = async (definitionId) => {
  if (!definitionId) return;
  loading.value = true;
  error.value = null;
  try {
    const params = { sortBy: sortState.by, sortDir: sortState.dir };
    const response = await workflowStepService.getSteps(definitionId, params);
    steps.value = response.data;
  } catch (err) {
    error.value = 'Could not load steps.';
  } finally {
    loading.value = false;
  }
};

const sortBy = (column) => {
  if (sortState.by === column) {
    sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
  } else {
    sortState.by = column;
    sortState.dir = 'asc';
  }
  fetchSteps(props.definition.id);
};

const exportSteps = async () => {
  isExporting.value = true;
  try {
    const response = await workflowDefinitionService.exportSteps(props.definition.id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const fileName = `workflow-steps-def-${props.definition.id}.xlsx`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('An error occurred during the export.');
  } finally {
    isExporting.value = false;
  }
};

const handleFileSelect = (event) => {
  importFile.value = event.target.files[0] || null;
  importSuccessMessage.value = '';
  importErrors.value = [];
};

const handleImport = async () => {
  if (!importFile.value) return;
  isImporting.value = true;
  importSuccessMessage.value = '';
  importErrors.value = [];
  try {
    const response = await workflowDefinitionService.importSteps(props.definition.id, importFile.value);
    importSuccessMessage.value = response.data.message;
    if (fileInput.value) fileInput.value.value = '';
    importFile.value = null;
    await fetchSteps(props.definition.id);
  } catch (err) {
    if (err.response?.status === 422 && err.response.data.errors) {
      importErrors.value = err.response.data.errors.map(fail => ({
        row: fail.row,
        message: `${fail.attribute}: ${fail.errors.join(', ')}`
      }));
    } else {
      importErrors.value = [{ row: 'N/A', message: 'An unexpected server error occurred.' }];
    }
  } finally {
    isImporting.value = false;
  }
};

watch(() => props.definition, (newDefinition) => {
  if (newDefinition) {
    fetchSteps(newDefinition.id);
  } else {
    steps.value = [];
  }
}, { immediate: true });
</script>