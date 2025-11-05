<template>
  <div class="documents-table">
    <div class="flex justify-between items-center mb-4 border-b pb-2">
      <h3 class="text-xl font-semibold text-gray-800">Document Checklist</h3>
      <button 
        @click="saveAllChanges" 
        :disabled="dirtyRequirementIds.size === 0"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Changes
      </button>
    </div>
    
    <div v-if="isLoading" class="text-center text-gray-500 py-8">Loading requirements...</div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>

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
          <!-- The v-if="submissionData[req.id]" has been removed from here -->
          <tr v-for="req in requirements" :key="req.id">
            
            <td class="px-3 py-1 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ req.documentType.label }}</div>
                  <div v-if="req.documentType.note" class="text-xs text-gray-500">{{ req.documentType.note }}</div>
                </div>
              </div>
            </td>

            <td class="px-3 py-1 whitespace-nowrap">
              <span :class="getStatusInfo(req.currentStatus).textClass" class="text-sm font-semibold uppercase tracking-wider">{{ req.currentStatus.replace('_', ' ') }}</span>
            </td>

            <td class="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
              <!-- This v-if block now also checks that the data model is ready -->
              <div v-if="req.currentStatus !== 'not_applicable' && submissionData[req.id]">
                
                <div v-if="req.documentType.actionFieldType === 'expiry_date' || req.documentType.actionFieldType === 'date'">
                  <input 
                    type="date"
                    :placeholder="req.documentType.actionFieldLabel || 'yyyy-mm-dd'"
                    v-model="submissionData[req.id].value" 
                    @change="handleInputChange(req.id)"
                    class="form-input rounded-md border-gray-300 shadow-sm focus:border-brand-blue-300 focus:ring focus:ring-brand-blue-200 focus:ring-opacity-50 w-full py-1 text-sm"
                  >
                </div>

                <div v-else-if="req.documentType.actionFieldType === 'text'">
                  <input 
                    type="text" 
                    :placeholder="req.documentType.actionFieldLabel || 'Enter value'"
                    v-model="submissionData[req.id].value"
                    @input="handleInputChange(req.id)"
                    class="form-input rounded-md border-gray-300 shadow-sm focus:border-brand-blue-300 focus:ring focus:ring-brand-blue-200 focus:ring-opacity-50 w-full py-1 text-sm"
                  >
                </div>

                <div v-else-if="req.documentType.actionFieldType === 'sourced_dropdown'">
                  <select
                    v-model="submissionData[req.id].value"
                    @change="handleInputChange(req.id)"
                    class="form-select rounded-md border-gray-300 shadow-sm focus:border-brand-blue-300 focus:ring focus:ring-brand-blue-200 focus:ring-opacity-50 w-full py-1 text-sm"
                  >
                    <option value="">-- Select an option --</option>
                    <option v-for="item in sourcedData[req.documentType.recordSource]" :key="item.id" :value="item.optionValue">
                      {{ item.optionValue }}
                    </option>
                  </select>
                </div>

                <div v-else>
                  <input 
                    type="checkbox"
                    v-model="submissionData[req.id].isChecked"
                    @change="handleInputChange(req.id)"
                    class="form-checkbox h-5 w-5 text-brand-blue-600 rounded"
                  >
                </div>

              </div>
            </td>

            <td class="px-3 py-1 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-3">
                <button
                  @click="$emit('open-notes', { type: 'estate_document_requirement', id: req.id, name: req.documentType.label })"
                  class="text-gray-400 hover:text-brand-blue-600 transition"
                  title="View/Add Notes"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path></svg>
                </button>
                <button v-if="req.latestLogEntryId" @click="openLogModal(req.id, req.documentType.label)" class="text-brand-blue-600 hover:text-brand-blue-900">View</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <DocumentLogModal
    v-if="modalState.isOpen"
    :estate-id="props.estateId"
    :document-requirement-id="modalState.documentRequirementId"
    :document-type-label="modalState.documentTypeLabel"
    @close="modalState.isOpen = false"
  />
</template>


<script setup>
import { ref, onMounted, reactive } from 'vue';
import DocumentLogModal from '@/components/estates/DocumentLogModal.vue';
import estateService from '@/services/estateService';
import adminService from '@/services/adminService'; // Import adminService
import apiClient from '@/services/api'; // Import apiClient directly

const props = defineProps({ estateId: { type: [String, Number], required: true } });
defineEmits(['open-notes']); 

const requirements = ref([]);
const isLoading = ref(true);
const error = ref(null);
const submissionData = reactive({});
const modalState = reactive({ isOpen: false, documentRequirementId: null, documentTypeLabel: '' });
const dirtyRequirementIds = reactive(new Set());

// New reactive stores for dynamic data
const sourcedData = ref({});

const fetchSourcedData = async () => {
    const sourcesToFetch = new Set(
        requirements.value
            .map(req => req.documentType.recordSource)
            .filter(Boolean) // Filter out null/empty recordsources
    );

    for (const source of sourcesToFetch) {
        if (!sourcedData.value[source]) { // Fetch only if not already fetched
            try {
                const response = await adminService.getOptionsForSource(source);
                sourcedData.value[source] = response.data;
            } catch (err) {
                console.error(`Failed to fetch data for source: ${source}`, err);
                error.value = `Failed to load dropdown data for ${source}.`; // Inform user
            }
        }
    }
};

const fetchRequirements = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await estateService.getDocumentRequirements(props.estateId);
    requirements.value = response.data;
    
    dirtyRequirementIds.clear();
    requirements.value.forEach(req => {
      submissionData[req.id] = {
        value: req.latestLogEntry?.actionFieldValue || '',
        isChecked: ['received', 'valid'].includes(req.currentStatus),
      };
    });

    // After requirements are fetched, fetch the necessary sourced data
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

  const payload = [];
  dirtyRequirementIds.forEach(id => {
    const data = submissionData[id];
    const requirement = requirements.value.find(r => r.id === id);
    if (!requirement) return;

    let valueToSend = null;
    if (requirement.documentType.actionFieldType === 'none') {
      valueToSend = data.isChecked ? 'received' : null;
    } else {
      valueToSend = data.value;
    }
    
    payload.push({
      id: id,
      actionFieldValue: valueToSend,
    });
  });

  try {
    await estateService.batchUpdateDocumentRequirements(props.estateId, payload);
    alert('Changes saved successfully!');
    await fetchRequirements(); // Refetch all data
  } catch (err) {
    alert('Failed to save changes.');
    console.error(err);
  }
};

const openLogModal = (reqId, docTypeLabel) => {
  modalState.documentRequirementId = reqId;
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