<template>
  <!-- Using your existing, common Modal component as a base -->
  <Modal :show="true" @close="emit('close')">
    <template #title>
      History for: <span class="text-brand-blue-600 font-semibold">{{ documentTypeLabel }}</span>
    </template>
    
    <!-- Main Content Slot -->
    <div class="p-6">
      <div v-if="isLoading" class="text-center py-10">
        <p class="text-gray-500">Loading history...</p>
      </div>
      <div v-else-if="!logEntries.length" class="text-center py-10">
        <p class="text-gray-500">No submission history found.</p>
      </div>
      
      <!-- ============================================= -->
      <!-- START: CORRECTED COLUMNAR LAYOUT              -->
      <!-- ============================================= -->
      <div v-else>
        <!-- This single parent div is now the grid container for everything -->
        <div class="grid grid-cols-3 gap-x-4 border-b-2 border-gray-200">
          
          <!-- Header Row -->
          <div class="font-bold text-sm text-gray-600 uppercase tracking-wider py-2 col-span-1">Status</div>
          <div class="font-bold text-sm text-gray-600 uppercase tracking-wider py-2 col-span-1 text-center">Value</div>
          <div class="font-bold text-sm text-gray-600 uppercase tracking-wider py-2 col-span-1 text-right">Date Updated</div>

        </div>

        <!-- Log Entry Rows will be appended here by the loop -->
        <div class="max-h-96 overflow-y-auto">
            <div v-for="entry in logEntries" :key="entry.id" class="grid grid-cols-3 gap-x-4 py-3 border-b items-center">
                <!-- Column 1: Status & User -->
                <div class="col-span-1">
                    <p class="text-sm font-semibold uppercase text-gray-800">{{ entry.statusAtReceipt }}</p>
                    <p class="text-xs text-gray-500 mt-1">By: {{ entry.receivedByUser?.name || 'System' }}</p>
                </div>

                <!-- Column 2: Value -->
                <div class="col-span-1 text-center">
                    <p v-if="entry.actionFieldValue" class="text-sm font-medium text-gray-900">{{ entry.actionFieldValue }}</p>
                    <span v-else class="text-xs text-gray-400 italic">N/A</span>
                </div>

                <!-- Column 3: Timestamp -->
                <div class="col-span-1 text-right">
                    <p class="text-sm text-gray-700">{{ formatTimestamp(entry.receivedAt) }}</p>
                </div>
            </div>
        </div>
      </div>
      <!-- ============================================= -->
      <!-- END: CORRECTED COLUMNAR LAYOUT                -->
      <!-- ============================================= -->
    </div>

    <!-- Footer with Close button -->
    <div class="bg-gray-100 px-6 py-3 flex justify-end">
      <button type="button" class="btn-secondary" @click="emit('close')">
        Close
      </button>
    </div>
  </Modal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import estateService from '@/services/estateService';
import Modal from '@/components/common/Modal.vue';

const props = defineProps({
  documentRequirementId: { type: Number, required: true },
  documentTypeLabel: { type: String, required: true }
});

const emit = defineEmits(['close']);

const logEntries = ref([]);
const isLoading = ref(true);

const fetchLog = async () => {
  isLoading.value = true;
  try {
    const response = await estateService.getDocumentLogHistory(props.documentRequirementId);
    logEntries.value = response.data;
  } catch (error) {
    console.error("Failed to fetch document log history:", error);
  } finally {
    isLoading.value = false;
  }
};

// Helper function to format the timestamp nicely
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

onMounted(fetchLog);
</script>