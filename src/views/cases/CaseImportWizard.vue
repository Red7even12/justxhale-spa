<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Tab Headers -->
    <div class="flex space-x-4 mb-6 border-b border-gray-200">
        <button @click="activeTab = 'import'" :class="activeTab === 'import' ? 'border-brand-blue-500 text-brand-blue-600' : 'border-transparent text-gray-500'" class="pb-2 px-1 border-b-2 font-medium text-sm">New Import</button>
        <button @click="fetchHistory" :class="activeTab === 'history' ? 'border-brand-blue-500 text-brand-blue-600' : 'border-transparent text-gray-500'" class="pb-2 px-1 border-b-2 font-medium text-sm">Import History & Rollback</button>
    </div>

    <!-- TAB 1: IMPORT WIZARD (Your existing code goes here inside a v-if) -->
    <div v-if="activeTab === 'import'">

      <!-- STEP 1: CONTEXT -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Step 1: Select Case Type</h2>
        <div class="w-full sm:w-1/2">
          <label class="block text-sm font-medium text-gray-700">Case File Type</label>
          <select 
            v-model="selectedFileTypeId" 
            @change="resetUpload"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm"
          >
            <option :value="null" disabled>Select a file type...</option>
            <option v-for="ft in fileTypes" :key="ft.id" :value="ft.id">{{ ft.name }}</option>
          </select>
        </div>
      </div>

      <!-- STEP 2: DOWNLOAD TEMPLATE -->
      <div class="bg-white shadow rounded-lg p-6" :class="{ 'opacity-50 pointer-events-none': !selectedFileTypeId }">
        <h2 class="text-lg font-medium text-gray-900 mb-2">Step 2: Download Template</h2>
        <p class="text-sm text-gray-500 mb-4">
          Download the CSV/Excel template specifically generated for the selected case type. Do not alter the first two header rows.
        </p>
        <button 
          @click="downloadTemplate" 
          :disabled="isDownloading"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-brand-blue-700 bg-brand-blue-100 hover:bg-brand-blue-200 focus:outline-none disabled:opacity-50"
        >
          <svg v-if="isDownloading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ isDownloading ? 'Generating...' : 'Download Template' }}
        </button>
      </div>

      <!-- STEP 3: UPLOAD & VALIDATE -->
      <div class="bg-white shadow rounded-lg p-6" :class="{ 'opacity-50 pointer-events-none': !selectedFileTypeId }">
        <h2 class="text-lg font-medium text-gray-900 mb-2">Step 3: Upload & Validate</h2>
        <p class="text-sm text-gray-500 mb-4">
          Select the Team these cases will belong to, then upload your populated file for a Dry Run validation.
        </p>
        
        <!-- NEW: TEAM SELECTOR -->
        <div class="mb-4 w-full sm:w-1/2">
          <label class="block text-sm font-medium text-gray-700">Assign Cases to Team</label>
          <select 
            v-model="selectedTeamId" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm"
          >
            <option :value="null" disabled>Select a team...</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>




        <div class="flex items-center space-x-4">
          <input 
            type="file" 
            ref="fileInputRef" 
            @change="handleFileChange" 
            accept=".xlsx, .csv"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue-50 file:text-brand-blue-700 hover:file:bg-brand-blue-100 cursor-pointer"
          />
          <!-- Disabled unless both file AND team are selected -->
          <button 
            @click="runDryRun" 
            :disabled="!selectedFile || !selectedTeamId || isUploading"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none disabled:opacity-50 whitespace-nowrap"
          >
            {{ isUploading ? 'Validating...' : 'Run Validator' }}
          </button>
        </div>
      </div>

      <!-- VALIDATION RESULTS PANEL -->
      <div v-if="results" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200 bg-gray-50">
          <h3 class="text-lg font-medium text-gray-900">Validation Results</h3>
          <div class="mt-4 flex space-x-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              Total Rows: {{ results.summary.total_processed || results.summary.totalProcessed }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Valid: {{ results.summary.valid_count || results.summary.validCount }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="invalidCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'">
              Invalid: {{ invalidCount }}
            </span>
          </div>
        </div>

        <!-- Errors Table -->
        <div v-if="invalidCount > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-red-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider w-24">Excel Row</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Case Reference / Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Errors Detected</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="row in (results.invalid_rows || results.invalidRows)" :key="row.row_number || row.rowNumber" class="hover:bg-red-50/50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Row {{ row.row_number || row.rowNumber }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ row.file_name || row.fileName }}</td>
                <td class="px-6 py-4 text-sm text-red-600">
                  <ul class="list-disc pl-5">
                    <li v-for="(err, idx) in row.errors" :key="idx">{{ err }}</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="invalidCount === 0 && (results.summary.valid_count || results.summary.validCount) > 0" class="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Data is clean!</h3>
          <p class="mt-1 text-sm text-gray-500">All rows passed validation. You are ready to commit this data to the database.</p>
          
          <!-- Phase 3 Hook -->
          <button 
            @click="commitImport"
            :disabled="isCommitting"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
          >
            <svg v-if="isCommitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isCommitting ? 'Importing to Database...' : 'Commit Import' }}
          </button>
          <div v-if="successBatchId" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p class="text-sm text-yellow-800 mb-2">Import Successful! Batch ID: <strong>{{ successBatchId }}</strong></p>
            <button 
                @click="rollbackBatch"
                class="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
            >
                Undo this Import
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- TAB 2: HISTORY & ROLLBACK -->
    <div v-if="activeTab === 'history'" class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team / Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="batch in history" :key="batch.batchId" class="hover:bg-gray-50">
                <!-- Date: Keep nowrap because dates are short -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ batch.createdAt }}
                </td>

                <!-- File Name: ALLOW WRAP + BREAK LONG WORDS -->
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs break-all">
                    {{ batch.fileName }}
                </td>

                <!-- Team / Type: ALLOW WRAP -->
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {{ batch.teamName }} <br>
                    <span class="text-xs text-gray-400">{{ batch.fileTypeName }}</span>
                </td>

                <!-- Count: Keep small -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-center">
                    {{ batch.caseCount }}
                </td>

                <!-- Action: Keep nowrap so the button stays on one line -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                        @click="rollbackBatch(batch.batchId)" 
                        class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md border border-red-200 font-bold uppercase text-xs transition-colors"
                    >
                        Rollback
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

const activeTab = ref('import');
const history = ref([]);

const route = useRoute();
const productSlug = computed(() => route.params.productSlug);

// State
const fileTypes = ref([]);
const selectedFileTypeId = ref(null);
const selectedTeamId = ref(null);
const teams = ref([]);
const fileInputRef = ref(null);
const selectedFile = ref(null);

const isDownloading = ref(false);
const isUploading = ref(false);
const results = ref(null);
const isCommitting = ref(false);
const successBatchId = ref(null);

const invalidCount = computed(() => {
    if (!results.value) return 0;
    return results.value.summary.invalid_count || results.value.summary.invalidCount || 0;
});

// 1. Fetch File Types on Load
// (Assumes a generic endpoint exists to list active file types for this product)
onMounted(async () => {
    try {
        const res = await apiClient.get(`/${productSlug.value}/file-types`);
        fileTypes.value = res.data.data || res.data;
    } catch (error) {
        console.error("Failed to fetch file types:", error);
        // Fallback for testing if standard endpoint doesn't exist
        fileTypes.value = [{ id: 1, name: 'Deceased Estate' }]; 
    }
    
    // Fetch Teams
    try {
        const teamRes = await apiClient.get('/teams'); 
        teams.value = teamRes.data.data || teamRes.data;
    } catch (error) {
        console.error("Failed to fetch teams:", error);
    }
});

const resetUpload = () => {
    selectedFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
    results.value = null;
};

const handleFileChange = (e) => {
    results.value = null; // Clear previous results
    selectedFile.value = e.target.files[0] || null;
};

// 2. Download Template (The logic we verified earlier)
const downloadTemplate = async () => {
    if (!selectedFileTypeId.value) return;
    
    isDownloading.value = true;
    try {
        const response = await apiClient.get(`/${productSlug.value}/import/download-template`, {
            params: { file_type_id: selectedFileTypeId.value },
            responseType: 'blob' 
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'import_template.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        alert("Failed to download template.");
        console.error(error);
    } finally {
        isDownloading.value = false;
    }
};

// 3. Upload & Run Validator
const runDryRun = async () => {
    if (!selectedFile.value || !selectedFileTypeId.value) return;

    isUploading.value = true;
    results.value = null;

    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('file_type_id', selectedFileTypeId.value);
    formData.append('team_id', selectedTeamId.value);
    formData.append('import_file', selectedFile.value);

    try {
        const response = await apiClient.post(`/${productSlug.value}/import/dry-run`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        results.value = response.data;
        
    } catch (error) {
        if (error.response && error.response.status === 422) {
            alert(error.response.data.message || "Validation failed.");
        } else {
            alert("An error occurred during validation.");
        }
        console.error(error);
    } finally {
        isUploading.value = false;
    }
};

const commitImport = async () => {
    isCommitting.value = true;
    
    const formData = new FormData();
    formData.append('file_type_id', selectedFileTypeId.value);
    formData.append('team_id', selectedTeamId.value);
    formData.append('import_file', selectedFile.value);

    try {
        const response = await apiClient.post(`/${productSlug.value}/import/commit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        alert(response.data.message);
        successBatchId.value = response.data.batch_id; // Capture it!
        
        // Reset everything after success
        resetUpload();
        selectedFileTypeId.value = null;
        selectedTeamId.value = null;
        results.value = null;
        
    } catch (error) {
        alert(error.response?.data?.message || "Import failed during execution.");
        console.error(error);
    } finally {
        isCommitting.value = false;
    }
};

const fetchHistory = async () => {
    activeTab.value = 'history';
    const res = await apiClient.get(`/${productSlug.value}/import/history`);
    history.value = res.data;
};

const rollbackBatch = async (batchId) => {
    if (!confirm('Warning: This will permanently delete all cases and associated documents/notes in this batch. Continue?')) return;
    
    try {
        // The API expects 'batch_id' in the POST body usually, 
        // unless your interceptor also converts outgoing payloads.
        // Assuming outgoing stays snake_case:
        await apiClient.post(`/${productSlug.value}/import/rollback`, { 
            batch_id: batchId 
        });
        
        await fetchHistory(); // Refresh the list
        alert("Rollback successful. The batch has been removed.");
    } catch (e) { 
        alert("Rollback failed."); 
        console.error(e);
    }
};


</script>