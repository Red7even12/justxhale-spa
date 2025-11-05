<!--
  File: src/components/estates/DocumentsTable.vue
  NOTE THE NEW FILENAME
  RELOADED
-->
<template>
  <div class="documents-table">
    <h3 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Document Checklist</h3>
    
    <div v-if="isLoading" class="text-center text-gray-500 py-8">Loading requirements...</div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>

    <!-- =================================================== -->
    <!-- START: TRADITIONAL TABLE-BASED LAYOUT               -->
    <!-- =================================================== -->
    <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 documents-table-override" style="display: table;">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
            <th scope="col" class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            <th scope="col" class="px-3 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">History</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="req in requirements" :key="req.id">
            
            <!-- Column 1: Document Name -->
            <td class="px-3 py-1 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ req.documentType.label }}</div>
                  <div v-if="req.documentType.note" class="text-xs text-gray-500">{{ req.documentType.note }}</div>
                </div>
              </div>
            </td>

            <!-- Column 2: Status -->
            <td class="px-3 py-1 whitespace-nowrap">
              <span :class="getStatusInfo(req.currentStatus).textClass" class="text-sm font-semibold uppercase tracking-wider">{{ req.currentStatus.replace('_', ' ') }}</span>
            </td>

            <!-- Column 3: Action -->
            <td class="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
              <div v-if="req.currentStatus !== 'not_applicable'">
                <div v-if="req.documentType.isTimeSensitive">
                  <input type="date" v-model="submissionData[req.documentTypeId].issueDate" @change="submitDocument(req.documentTypeId)" class="form-input rounded-md border-gray-300 shadow-sm focus:border-brand-blue-300 focus:ring focus:ring-brand-blue-200 focus:ring-opacity-50 w-full py-0">
                </div>
                <div v-else>
                  <input type="checkbox" @change="submitDocument(req.documentTypeId)" class="form-checkbox h-5 w-5 text-brand-blue-600 rounded" :checked="req.currentStatus === 'received' || req.currentStatus === 'valid'">
                </div>
              </div>
            </td>

            <!-- Column 4: History Button -->
            <td class="px-3 py-1 whitespace-nowrap text-right text-sm font-medium">
              <button v-if="req.latestLogEntryId" @click="openLogModal(req.documentTypeId, req.documentType.label)" class="text-brand-blue-600 hover:text-brand-blue-900">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- =================================================== -->
    <!-- END: TRADITIONAL TABLE-BASED LAYOUT                 -->
    <!-- =================================================== -->
  </div>

  <DocumentLogModal
    v-if="modalState.isOpen"
    :estate-id="props.estateId"
    :document-type-id="modalState.documentTypeId"
    :document-type-label="modalState.documentTypeLabel"
    @close="modalState.isOpen = false"
  />
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import DocumentLogModal from '@/components/estates/DocumentLogModal.vue';
import estateService from '@/services/estateService';

const props = defineProps({ estateId: { type: [String, Number], required: true } });

const requirements = ref([]);
const isLoading = ref(true);
const error = ref(null);
const submissionData = reactive({});
const modalState = reactive({ isOpen: false, documentTypeId: null, documentTypeLabel: '' });

const fetchRequirements = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await estateService.getDocumentRequirements(props.estateId);
    requirements.value = response.data;
    requirements.value.forEach(req => {
      if (req.documentType.isTimeSensitive) {
        submissionData[req.documentTypeId] = { issueDate: null };
      }
    });
  } catch (err) {
    error.value = 'Failed to fetch document requirements.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const submitDocument = async (documentTypeId) => {
  const payload = {
    documentTypeId: documentTypeId,
    issueDate: submissionData[documentTypeId]?.issueDate || null,
  };

  try {
    await estateService.submitDocumentLog(props.estateId, payload);
    await fetchRequirements();
  } catch (err) {
    const errorMsg = err.response?.data?.errors?.issueDate?.[0] || err.response?.data?.message || 'Submission failed.';
    alert(errorMsg);
    console.error(err);
  }
};

const openLogModal = (docTypeId, docTypeLabel) => {
  modalState.documentTypeId = docTypeId;
  modalState.documentTypeLabel = docTypeLabel;
  modalState.isOpen = true;
};

const getStatusInfo = (status) => {
    const map = {
        pending: { class: 'bg-gray-400', textClass: 'text-gray-600' },
        received: { class: 'bg-green-500', textClass: 'text-green-700' },
        valid: { class: 'bg-green-500', textClass: 'text-green-700' },
        stale: { class: 'bg-yellow-500', textClass: 'text-yellow-700' },
        not_applicable: { class: 'bg-blue-400', textClass: 'text-blue-600' },
    };
    return map[status] || map.pending;
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
