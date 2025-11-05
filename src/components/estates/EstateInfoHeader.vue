<template>
  <!-- frontend-spa\src/components\estates\EstateInfoHeader.vue -->
  <!-- Final 5-column (2-1-2) QuickView Panel -->

  <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
    <!-- Header Section with Title and Action Buttons (Unchanged) -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h2 class="text-xl font-bold text-gray-900 truncate">
        {{ quickViewData?.estateName }}
        <span v-if="quickViewData?.taxConsFileReference" class="text-gray-500 font-medium">
          - {{ quickViewData.taxConsFileReference }}
        </span>
      </h2>
      <div class="flex items-center space-x-3">
        <button @click="$emit('open-notes', { type: 'estate', id: estateId, name: quickViewData?.estateName })" class="btn-secondary">Notes</button>
        <button @click="$emit('view-timeline')" class="btn-secondary">Timeline</button>
        <button @click="$emit('view-case-numbers')" class="btn-secondary">Case Numbers (CN)</button>
        <button @click="$emit('edit-estate')" class="btn-primary">
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-7.536 7.536l-2.73 2.729a1 1 0 00-.283.568l-.513 2.566a1 1 0 001.26 1.26l2.566-.513a1 1 0 00.568-.283l2.729-2.73-2.828-2.828z" /></svg>
          Edit Estate
        </button>
      </div>
    </div>

    <!-- Loading and Error States (Unchanged) -->
    <div v-if="loading" class="text-center py-8"><p class="text-gray-500">Loading QuickView...</p></div>
    <div v-else-if="error" class="text-center py-8"><p class="text-red-600">Error loading estate details.</p></div>

    <!-- ============================================= -->
    <!-- START: FINAL 5-COLUMN (2-1-2) GRID LAYOUT     -->
    <!-- ============================================= -->
    <!-- Main parent grid with 5 columns on large screens -->
    <div v-else-if="quickViewData" class="grid grid-cols-1 lg:grid-cols-5 gap-4 text-sm">
      
      <!-- Block 1: Deceased & Case Details (Spans 2 of 5 columns) -->
      <div class="border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
        <!-- Deceased Info -->
        <dl class="space-y-4">
          <div>
            <dt class="font-semibold text-gray-600">Deceased</dt>
            <dd class="mt-1 text-gray-900 font-medium">{{ quickViewData.names }} {{ quickViewData.surname }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-600">ID Number</dt>
            <dd class="mt-1 text-gray-900">{{ quickViewData.deceasedIdNumber || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-600">Date of Instruction</dt>
            <dd class="mt-1 text-gray-900">{{ quickViewData.dateOfInstruction || 'N/A' }}</dd>
          </div>
        </dl>
        <!-- Case Details Info -->
        <dl class="space-y-4">
          <div>
            <dt class="font-semibold text-gray-600">Deceased Tax Number (Pre)</dt>
            <dd class="mt-1 text-gray-900">{{ quickViewData.deTaxNumberPre || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-600">Deceased Tax Number (Post)</dt>
            <dd class="mt-1 text-gray-900">{{ quickViewData.deTaxNumberPost || 'N/A' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Block 2: Executor (Spans 1 of 5 columns) -->
      <div class="border rounded-lg p-4 lg:col-span-1">
        <dl class="space-y-4">
          <div>
            <dt class="font-semibold text-gray-600">Executor</dt>
            <dd class="mt-1 text-gray-900 font-medium">{{ quickViewData.executorPersonName || 'N/A' }}</dd>
            <dd class="text-sm text-gray-700">ID: {{ quickViewData.executorPersonIdNumber || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-600">Executor Tax Number</dt>
            <dd class="mt-1 text-gray-900">{{ quickViewData.executorPersonTaxNumber || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="font-semibold text-gray-600">Executor Reference</dt>
            <dd class="mt-1 text-gray-900">{{ quickViewData.executorReference || 'N/A' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Wrapper for Blocks 3 & 4 (Spans 2 of 5 columns) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
          <!-- Attorney Frame -->
          <div class="border rounded-lg p-4">
            <dl class="space-y-4">
              <div>
                <dt class="font-semibold text-gray-600">Attorney / Practice</dt>
                <dd class="mt-1 text-gray-900 font-medium">{{ quickViewData.attorneyCompanyName || 'N/A' }}</dd>
                <dd class="text-gray-700">{{ quickViewData.attorneyPersonName }}</dd>
              </div>
               <div>
                <dt class="font-semibold text-gray-600">Attorney Tax Number</dt>
                <dd class="mt-1 text-gray-900">{{ quickViewData.attorneyPersonTaxNumber || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="font-semibold text-gray-600">Attorney Reference</dt>
                <dd class="mt-1 text-gray-900">{{ quickViewData.attorneyReference || 'N/A' }}</dd>
              </div>
            </dl>
          </div>

          <!-- POA Executor Frame -->
          <div class="border rounded-lg p-4">
            <dl class="space-y-4">
              <div>
                <dt class="font-semibold text-gray-600">POA Executor</dt>
                <dd class="mt-1 text-gray-900 font-medium">{{ quickViewData.poaExecutorPersonName || 'N/A' }}</dd>
                <dd class="text-sm text-gray-700">ID: {{ quickViewData.poaExecutorPersonIdNumber || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="font-semibold text-gray-600">POA Executor Tax Number</dt>
                <dd class="mt-1 text-gray-900">{{ quickViewData.poaExecutorPersonTaxNumber || 'N/A' }}</dd>
              </div>
            </dl>
          </div>
      </div>

    </div>
    <!-- ============================================= -->
    <!-- END: FINAL 5-COLUMN (2-1-2) GRID LAYOUT       -->
    <!-- ============================================= -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import estateService from '@/services/estateService'; // Corrected import

// Define Props
const props = defineProps({
  estateId: {
    type: Number,
    required: true
  }
});

// Define Emits
defineEmits(['edit-estate', 'open-notes', 'view-timeline', 'view-case-numbers']);

// Reactive state for data, loading, and error handling
const quickViewData = ref(null);
const loading = ref(false);
const error = ref(null);

// Function to fetch data from the new API endpoint
const fetchQuickViewData = async (id) => {
  if (!id) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await estateService.getEstateQuickView(id);
    quickViewData.value = response.data; // Adjusted to access the nested data object
  } catch (err) {
    console.error('Failed to fetch estate quick view data:', err);
    error.value = err;
  } finally {
    loading.value = false;
  }
};

// Fetch data when the component is first mounted
onMounted(() => {
  fetchQuickViewData(props.estateId);
});

// Watch for changes in estateId and refetch data if it changes
// This is useful if the component stays mounted while the route changes
watch(() => props.estateId, (newId) => {
  fetchQuickViewData(newId);
});

</script>