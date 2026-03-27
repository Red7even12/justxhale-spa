<template>
  <!--frontend-spa\src\components\cases\CaseDocumentsTable.vue-->
  <div class="documents-table h-full flex flex-col">
    <!-- Header -->

    <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-2 shrink-0">
      <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tight">Document Checklist</h3>
      <div class="flex items-center gap-2">
        <button 
          @click="openRequestModal" 
          class="bg-brand-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow hover:opacity-90 transition-all">
          Request Documents
        </button>
        <button 
          @click="saveAllChanges" 
          :disabled="dirtyRequirementIds.size === 0"
          class="bg-brand-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          Save Changes
        </button>
      </div>
    </div>
    
    <!-- Loading / Error States -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center text-gray-400 text-sm font-bold">
      Loading requirements...
    </div>
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>

    <!-- The V1 Table Layout -->
    <div v-else class="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white relative">
      <table class="min-w-full divide-y divide-gray-200 documents-table-override">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Document</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 w-1/3">Input Data</th>
            <th scope="col" class="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="req in requirements" :key="req.id">
            
            <!-- Document Name & Note -->
            <td class="px-3 py-2 whitespace-nowrap align-top">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-bold text-gray-900">{{ req.documentType?.label }}</div>
                  <div v-if="req.documentType?.note" class="text-xs text-gray-500 mt-0.5">{{ req.documentType.note }}</div>
                  <!-- Required Badge -->
                  <span v-if="req.is_required" class="text-[9px] text-red-500 font-bold uppercase tracking-wide border border-red-100 px-1 rounded ml-1">Req</span>
                </div>
              </div>
            </td>

            <!-- Status Badge -->
            <td class="px-3 py-2 whitespace-nowrap align-top">
              <span :class="[getStatusInfo(req.currentStatus).class, getStatusInfo(req.currentStatus).textClass]" 
                    class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                {{ (req.currentStatus || 'pending').replace('_', ' ') }}
              </span>
            </td>

            <!-- Input / Actions -->
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 align-top">
              <div v-if="req.currentStatus !== 'not_applicable' && submissionData[req.id]">
                
                <!-- Date Inputs -->
                <div v-if="['expiry_date', 'date'].includes(req.documentType?.actionFieldType)">
                  <input 
                    type="date"
                    :placeholder="req.documentType.actionFieldLabel || 'yyyy-mm-dd'"
                    v-model="submissionData[req.id].value" 
                    @change="handleInputChange(req.id)"
                    class="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-xs"
                  >
                </div>

                <!-- Text Input -->
                <div v-else-if="req.documentType?.actionFieldType === 'text'">
                  <input 
                    type="text" 
                    :placeholder="req.documentType.actionFieldLabel || 'Enter value'"
                    v-model="submissionData[req.id].value"
                    @input="handleInputChange(req.id)"
                    class="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-xs"
                  >
                </div>

                <!-- Sourced Dropdown -->
                <div v-else-if="req.documentType?.actionFieldType === 'sourced_dropdown'">
                  <select
                    v-model="submissionData[req.id].value"
                    @change="handleInputChange(req.id)"
                    class="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-xs"
                  >
                    <option value="">-- Select --</option>
                    <option v-for="item in sourcedData[req.documentType.recordsource] || []" :key="item.id" :value="item.optionValue">
                      {{ item.optionValue }}
                    </option>
                  </select>
                </div>

                <!-- Checkbox (None) -->
                <div v-else>
                  <input 
                    type="checkbox"
                    v-model="submissionData[req.id].isChecked"
                    @change="handleInputChange(req.id)"
                    class="form-checkbox h-5 w-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                  >
                </div>

              </div>
            </td>

            <!-- History / Notes / Files Actions -->
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium align-top">
             <div class="flex items-center justify-end gap-2">
                
                <!-- FILES BUTTON -->
                <button 
                    @click="openFiles(req)" 
                    class="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors border"
                    :class="req.files && req.files.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'"
                    title="Manage Files"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span v-if="req.files && req.files.length > 0">{{ req.files.length }}</span>
                </button>

                <!-- NOTES BUTTON -->
                <button @click="openNotes(req)" class="text-gray-400 hover:text-brand-primary transition p-1 rounded hover:bg-gray-50" title="View/Add Notes">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path></svg>
                </button>
             </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- NOTES MODAL -->
  <Modal :show="showNotesModal" @close="showNotesModal = false">
    <template #title>
      <span class="text-brand-primary font-bold">{{ currentNoteContext.title }}</span>
    </template>
    <div class="p-6">
      <NotesPanel 
          :initial-notes="currentNotes"
          :noteable-type="currentNoteContext.type"
          :noteable-id="currentNoteContext.id"
          :context-url="`${route.params.productSlug}/cases/${props.caseId}`" 
          @note-added="(n) => currentNotes.unshift(n)"
          @cancel="showNotesModal = false"
      />
    </div>
  </Modal>

  <!-- FILES MODAL -->
  <Modal :show="showFilesModal" @close="showFilesModal = false">
    <template #title>
        <span class="text-gray-800 font-bold">Files: {{ activeFileReq?.documentType?.label }}</span>
    </template>
    <div class="p-6">
        
        <!-- Upload Section -->
        <div class="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center hover:bg-gray-100 transition-colors relative group">
            <input 
                type="file" 
                ref="fileInput"
                @change="handleFileUpload"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                :disabled="isUploading"
            >
            <div v-if="isUploading" class="text-brand-primary font-bold animate-pulse text-lg">
                Uploading...
            </div>
            <div v-else>
                <p class="text-base font-bold text-gray-700 group-hover:text-brand-primary transition-colors">Click or Drag to Upload File</p>
                <p class="text-sm text-gray-500 mt-2 font-medium">PDF, Word, Excel, Images, Zip (Max 25MB)</p>
            </div>
        </div>

<!-- File List -->
        <div v-if="activeFileReq?.files?.length > 0" class="space-y-3">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-1">Uploaded Files</h4>
            <div v-for="file in activeFileReq.files" :key="file.id" class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="bg-gray-100 p-2 rounded text-gray-600">
                        <!-- Icon based on type (simplified) -->
                        <svg v-if="file.mime_type?.includes('pdf')" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <svg v-else-if="file.mime_type?.includes('image')" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div class="min-w-0">
                        <!-- PREVIEW LINK (New Tab) -->
                        <a 
                            :href="getFileUrl(file, 'preview')" 
                            target="_blank" 
                            class="text-sm font-bold text-gray-900 hover:text-brand-primary hover:underline truncate block"
                            title="Preview File"
                        >
                            {{ file.file_name || file.fileName }}
                        </a>
                        <div class="text-xs text-gray-500 font-medium mt-0.5">
                            {{ formatSize(file.size_kb || file.sizeKb) }} • {{ formatDate(file.created_at || file.createdAt) }}
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-1">
                    <!-- DOWNLOAD BUTTON -->
                    <a 
                        :href="getFileUrl(file, 'download')" 
                        class="text-gray-400 hover:text-brand-primary p-2 transition-colors rounded hover:bg-gray-50"
                        title="Download File"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </a>

                    <!-- DELETE BUTTON -->
                    <button 
                        @click="deleteFile(file.id)" 
                        class="text-gray-400 hover:text-red-500 p-2 transition-colors rounded hover:bg-red-50"
                        title="Delete File"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="text-center py-6 text-gray-500 text-sm italic bg-gray-50 rounded border border-gray-100">
            No files uploaded yet.
        </div>

        <div class="mt-6 flex justify-end">
            <button @click="showFilesModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded font-bold hover:bg-gray-200">Close</button>
        </div>
    </div>
  </Modal>

<Modal :show="isRequestModalOpen" @close="closeRequestModal">
    <template #title>Request Documents via Secure Portal</template>
    
    <div class="p-6">
        <p class="text-sm text-gray-600 mb-6">
            Select the required documents and choose who should receive the secure upload link. They will receive a passwordless Magic Link to upload these files directly from their phone or computer.
        </p>

        <!-- Step 1: Select Recipient -->
        <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">1. Who are you requesting these from?</label>
            <div v-if="isLoadingParticipants" class="text-xs text-gray-500">Loading contacts...</div>
            <select 
                v-else 
                v-model="requestPayload.participantId" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
            >
                <option :value="null" disabled>-- Select a Contact --</option>
                <option 
                    v-for="p in availableParticipants" 
                    :key="p.id" 
                    :value="p.id"
                >
                    {{ p.isPrimaryContact ? '⭐ ' : '' }}{{ p.entity?.name }} ({{ p.roleKey }}) - {{ p.entity?.email || p.entity?.phonePrimary || 'No Contact Info' }}
                </option>
            </select>
        </div>

        <!-- Step 2: Select Documents -->
        <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">2. Which pending documents do you need?</label>
            
            <div v-if="pendingDocuments.length === 0" class="p-4 bg-gray-50 text-sm text-gray-500 rounded-md border">
                There are no pending documents available to request.
            </div>
            
            <div v-else class="max-h-60 overflow-y-auto border rounded-md divide-y">
                <label 
                    v-for="doc in pendingDocuments" 
                    :key="doc.id" 
                    class="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                >
                    <input 
                        type="checkbox" 
                        :value="doc.id" 
                        v-model="requestPayload.documentIds" 
                        class="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                    >
                    <span class="ml-3 text-sm text-gray-700">
                        {{ doc.documentType?.label || doc.documentType?.name }}
                    </span>
                </label>
            </div>
            <div class="mt-2 text-xs text-gray-500 flex justify-between">
                <span>{{ requestPayload.documentIds.length }} selected</span>
                <button type="button" @click="selectAllDocs" class="text-brand-primary hover:underline">Select All</button>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
            <button 
                @click="closeRequestModal" 
                class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                Cancel
            </button>
            <button 
                @click="sendDocumentRequest" 
                :disabled="isSendingRequest || !requestPayload.participantId || requestPayload.documentIds.length === 0"
                class="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg v-if="isSendingRequest" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ isSendingRequest ? 'Generating Link...' : 'Send Secure Link' }}
            </button>
        </div>
    </div>
</Modal>

</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import noteService from '@/services/noteService';
import { useAlerts } from '@/composables/useAlerts';
import { useAuthStore } from '@/store/auth';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue';

const props = defineProps({ caseId: { type: [String, Number], required: true } });
const route = useRoute();
const productSlug = computed(() => route.params.productSlug);
const caseId = computed(() => route.params.id);
const { showAlert } = useAlerts();
const authStore = useAuthStore(); // Needed for API Token in downloads

const requirements = ref([]);
const isLoading = ref(true);
const error = ref(null);
const submissionData = reactive({});
const dirtyRequirementIds = reactive(new Set());
const sourcedData = ref({});

// Notes State
const showNotesModal = ref(false);
const currentNoteContext = reactive({ type: '', id: 0, title: '' });
const currentNotes = ref([]);

// Files State
const showFilesModal = ref(false);
const activeFileReq = ref(null);
const isUploading = ref(false);
const fileInput = ref(null);

// --- FILE HELPERS ---
const openFiles = (req) => {
    activeFileReq.value = req;
    showFilesModal.value = true;
};

// Document Request Modal State
const isRequestModalOpen = ref(false);
const isSendingRequest = ref(false);
const isLoadingParticipants = ref(false);
const availableParticipants = ref([]);

const requestPayload = reactive({
    participantId: null,
    documentIds: []
});

const pendingDocuments = computed(() => {
    // Only show documents that are 'pending' (or 'stale') and are actually required
    return requirements.value.filter(doc => 
        (doc.currentStatus === 'pending' || 
            doc.currentStatus === 'stale' || 
            doc.currentStatus === 'requested' 
        ) && 
        doc.isRequired !== false
    );
});

const selectAllDocs = () => {
    requestPayload.documentIds = pendingDocuments.value.map(doc => doc.id);
};

const openRequestModal = async () => {
    isRequestModalOpen.value = true;
    requestPayload.documentIds = [];
    requestPayload.participantId = null;
    isLoadingParticipants.value = true;

    try {
        // Fetch participants for this case to populate the dropdown
        const response = await apiClient.get(`/${productSlug.value}/case-files/${caseId.value}/participants`);
        
        // Filter out participants that have absolutely no contact info
        availableParticipants.value = response.data.data.filter(p => 
            p.entity?.email || p.entity?.phonePrimary
        );

        // Auto-select the Primary Contact if one exists
        const primary = availableParticipants.value.find(p => p.isPrimaryContact);
        if (primary) {
            requestPayload.participantId = primary.id;
        }
    } catch (error) {
        console.error("Failed to load participants", error);
        alert("Could not load contacts. Please ensure participants are added to the case.");
    } finally {
        isLoadingParticipants.value = false;
    }
};

const closeRequestModal = () => {
    isRequestModalOpen.value = false;
};

const sendDocumentRequest = async () => {
    isSendingRequest.value = true;
    try {
        // We will build this backend endpoint in the next step!
        const response = await apiClient.post(`/${productSlug.value}/case-files/${caseId.value}/portal-requests`, {
            participant_id: requestPayload.participantId,
            document_ids: requestPayload.documentIds
        });

        alert("Secure link generated and sent successfully!");
        
        // Update local UI state to 'requested' (Orange) so they don't have to refresh
        requestPayload.documentIds.forEach(id => {
            const doc = requirements.value.find(d => d.id === id);
            if (doc) doc.currentStatus = 'requested';
        });

        closeRequestModal();
    } catch (error) {
        console.error("Failed to send request", error);
        alert(error.response?.data?.message || "Failed to send the document request.");
    } finally {
        isSendingRequest.value = false;
    }
};

const formatSize = (kb) => {
    if (!kb || isNaN(kb)) return '0 KB';
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getFileUrl = (file, type = 'preview') => {
    // Append Token for Authorization
    const token = authStore.token || authStore.user?.token || ''; 
    
    // type can be 'preview' or 'download'
    return `/api/v1/files/${file.id}/${type}?token=${token}`;
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeFileReq.value) return;

    isUploading.value = true;
    const formData = new FormData();
    formData.append('file', file);

    try {
        await apiClient.post(`requirements/${activeFileReq.value.id}/files`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Refresh Data
        await fetchRequirements();
        
        // Update the active modal view
        activeFileReq.value = requirements.value.find(r => r.id === activeFileReq.value.id);

        showAlert('Success', 'File uploaded successfully');
    } catch (err) {
        console.error("Upload failed", err);
        let msg = 'File upload failed';
        if (err.response?.status === 422) {
             msg = err.response.data.message || 'Invalid file type or size.';
        }
        showAlert('Error', msg);
    } finally {
        isUploading.value = false;
        if (fileInput.value) fileInput.value.value = ''; // Reset input
    }
};

const deleteFile = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
        await apiClient.delete(`files/${fileId}`);
        
        // Refresh
        await fetchRequirements();
        activeFileReq.value = requirements.value.find(r => r.id === activeFileReq.value.id);
        
        showAlert('Success', 'File deleted');
    } catch (err) {
        console.error("Delete failed", err);
        showAlert('Error', 'Failed to delete file');
    }
};

// --- NOTES LOGIC ---
const openNotes = async (req) => {
    currentNoteContext.type = 'case_document_requirement';
    currentNoteContext.id = req.id;
    currentNoteContext.title = `Notes: ${req.documentType?.label || 'Document'}`;
    const contextUrl = `${route.params.productSlug}/cases/${props.caseId}`;
    try {
        const { data } = await noteService.getNotes('case_document_requirement', req.id, contextUrl);
        currentNotes.value = data;
        showNotesModal.value = true;
    } catch (err) {
        console.error("Failed to load notes", err);
        showAlert('Error', 'Failed to load notes');
    }
};

// --- DATA FETCHING ---
const fetchSourcedData = async () => {
    const sourcesToFetch = new Set(
        requirements.value.map(req => req.documentType?.recordsource).filter(Boolean) 
    );
    for (const source of sourcesToFetch) {
        if (!sourcedData.value[source]) { 
            try {
                const { data } = await apiClient.get(`/option-lists/${encodeURIComponent(source)}`);
                sourcedData.value[source] = data; 
            } catch (err) { console.error(`Failed source: ${source}`, err); }
        }
    }
};

const fetchRequirements = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { data } = await apiClient.get(`/${route.params.productSlug}/cases/${props.caseId}/documents`);
    requirements.value = data;
    dirtyRequirementIds.clear();
    
    requirements.value.forEach(req => {
      const val = req.actionFieldValue || req.action_field_value || '';
      const status = req.currentStatus || req.current_status || 'pending';
      submissionData[req.id] = {
        value: val,
        isChecked: ['received', 'valid'].includes(status),
      };
    });

    await fetchSourcedData();
  } catch (err) {
    error.value = 'Failed to fetch document requirements.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleInputChange = (requirementId) => {
  dirtyRequirementIds.add(requirementId);
};

const saveAllChanges = async () => {
  if (dirtyRequirementIds.size === 0) return;
  const updates = [];
  dirtyRequirementIds.forEach(id => {
    const data = submissionData[id];
    updates.push({ id: id, value: data.value, is_checked: data.isChecked });
  });

  try {
    await apiClient.put(`/${route.params.productSlug}/cases/${props.caseId}/documents`, { updates });
    showAlert('Success', 'Changes saved successfully!');
    await fetchRequirements(); 
  } catch (err) {
    showAlert('Error', 'Failed to save changes.');
    console.error(err);
  }
};

const getStatusInfo = (status) => {
    if (!status) return { class: 'bg-gray-100', textClass: 'text-gray-600' };
    const normalized = status.toLowerCase();
    const map = {
        pending: { class: 'bg-gray-100', textClass: 'text-gray-600' },
        received: { class: 'bg-blue-100', textClass: 'text-blue-700' },
        valid: { class: 'bg-green-100', textClass: 'text-green-700' },
        stale: { class: 'bg-red-100', textClass: 'text-red-700' },
        not_applicable: { class: 'bg-gray-200', textClass: 'text-gray-500' },
        requested: { class: 'bg-orange-100', textClass: 'text-orange-700' },
        submitted: { class: 'bg-yellow-100', textClass: 'text-yellow-700' }
    };
    return map[normalized] || map.pending;
};

onMounted(fetchRequirements);
</script>

<style scoped>
.documents-table-override {
  display: table !important;
}
.documents-table-override th,
.documents-table-override td {
  display: table-cell !important;
}
</style>