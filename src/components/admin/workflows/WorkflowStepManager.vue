<template>
  <div class="flex flex-col h-full">
    <!-- Action Bar -->
    <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h4 class="text-xs font-black text-gray-500 uppercase tracking-widest">Logic Steps</h4>
        <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
            {{ steps.length }} Steps
        </span>
      </div>
      <button @click="exportSteps" :disabled="isExporting" class="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        {{ isExporting ? 'Exporting...' : 'Export to Excel' }}
      </button>
    </div>

    <!-- Bulk Import Panel -->
    <div class="p-4 bg-indigo-50/50 border-b">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1">
            <input type="file" @change="handleFileSelect" ref="fileInput" class="block w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"/>
        </div>
        <button @click="handleImport" class="bg-white border border-indigo-200 text-indigo-600 px-4 py-1 rounded text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm" :disabled="!importFile || isImporting">
          {{ isImporting ? 'Processing...' : 'Upload & Sync Steps' }}
        </button>
      </div>
      
      <!-- Feedback -->
      <div v-if="importSuccessMessage" class="mt-2 text-[10px] text-green-600 font-bold uppercase">{{ importSuccessMessage }}</div>
      <div v-if="importErrors.length > 0" class="mt-2 p-2 bg-red-50 rounded border border-red-100 max-h-24 overflow-y-auto">
          <ul class="text-[10px] text-red-600 space-y-1">
              <li v-for="(error, index) in importErrors" :key="index">Row {{ error.row }}: {{ error.message }}</li>
          </ul>
      </div>
    </div>

    <!-- Steps Table -->
    <div class="flex-1 overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
                <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th @click="sortBy('id')" class="px-6 py-3 text-left cursor-pointer hover:text-indigo-600">ID</th>
                    <th @click="sortBy('name')" class="px-6 py-3 text-left cursor-pointer hover:text-indigo-600">Step Name</th>
                    <th class="px-6 py-3 text-left">Automation Logic</th>
                    <th class="px-6 py-3 text-center">Active</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="step in steps" :key="step.id" class="hover:bg-gray-50 text-sm">
                    <td class="px-6 py-3 font-mono text-gray-400 text-xs">{{ step.id }}</td>
                    <td class="px-6 py-3 font-bold text-gray-800">{{ step.name }}</td>
                    <td class="px-6 py-3">
                        <div class="flex flex-col gap-1">
                            <span class="text-xs text-gray-600 italic">{{ step.reminderSubject || 'No Subject Defined' }}</span>
                            <span class="text-[10px] text-gray-400 uppercase font-bold">
                                {{ step.reminderMaxCycles || 0 }} Cycles / {{ step.reminderIntervalDays || 0 }} Days
                            </span>
                        </div>
                    </td>
                    <td class="px-6 py-3 text-center">
                        <span :class="step.isActive ? 'text-green-500' : 'text-red-400'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                                <path v-if="step.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="steps.length === 0" class="p-12 text-center text-gray-400 italic">No steps loaded.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  definition: { type: Object, required: true },
  slug: { type: String, required: true } // Inherited from Layout
});

const { showAlert } = useAlerts();
const steps = ref([]);
const loading = ref(false);
const isExporting = ref(false);
const isImporting = ref(false);
const importFile = ref(null);
const importSuccessMessage = ref('');
const importErrors = ref([]);

const sortState = reactive({ by: 'id', dir: 'asc' });

const fetchSteps = async () => {
    if (!props.definition?.id) return;
    loading.value = true;
    try {
        const params = { sort_by: sortState.by, sort_dir: sortState.dir };
        const { data } = await apiClient.get(`admin/products/${props.slug}/workflow-definitions/${props.definition.id}/steps`, { params });
        steps.value = data;
    } catch (e) { console.error(e); }
    loading.value = false;
};

const sortBy = (col) => {
    sortState.dir = (sortState.by === col && sortState.dir === 'asc') ? 'desc' : 'asc';
    sortState.by = col;
    fetchSteps();
};

const exportSteps = async () => {
    isExporting.value = true;
    try {
        const response = await apiClient.get(`admin/products/${props.slug}/workflow-definitions/${props.definition.id}/export`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `DNA-Steps-${props.slug}-${props.definition.id}.xlsx`);
        document.body.appendChild(link);
        link.click();
    } catch (e) { showAlert('Error', 'Export failed.'); }
    isExporting.value = false;
};

const handleFileSelect = (e) => { importFile.value = e.target.files[0]; };

const handleImport = async () => {
    if (!importFile.value) return;
    isImporting.value = true;
    const formData = new FormData();
    formData.append('file', importFile.value);

    try {
        await apiClient.post(`admin/products/${props.slug}/workflow-definitions/${props.definition.id}/import`, formData);
        showAlert('Success', 'Steps synchronized with Product DNA.');
        fetchSteps();
    } catch (e) {
        if (e.response?.status === 422) {
            importErrors.value = e.response.data.errors;
        } else {
            showAlert('Error', 'Import failed. Check file format.');
        }
    }
    isImporting.value = false;
};

watch(() => props.definition?.id, fetchSteps, { immediate: true });
</script>