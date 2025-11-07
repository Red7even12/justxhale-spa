<template>

  <!-- frontend-spa\src\components\estates\SarsWorkflowPanel.vue -->
  <div>
    <h3 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">SARS Workflow Checklist</h3>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    
    <div v-else class="overflow-x-auto">
      <table class="min-w-full">
        <tbody class="divide-y divide-gray-200">
          <!-- The v-for loop remains the same -->
            <tr 
              v-for="process in processes" 
              :key="process.id" 
              :id="`workflow-step-${process.id}`" 
              :class="{ 'opacity-60': !process.isActionable && process.status !== 'completed' }"
            >
            
            <!-- Column 1: Process Step Name (Unchanged) -->
            <td class="px-4 py-3 w-1/3">
              <p class="text-sm font-medium text-gray-900">{{ process.workflowStep.label }}</p>
            </td>

            <!-- The Status Badge Column has been REMOVED -->

            <!-- Column 2: Action / Data Input Column (UPDATED LOGIC) -->
            <td class="px-4 py-3 w-1/2">
              <!-- State 1: Completed (Now displays dataValue) -->
              <div v-if="process.status === 'completed'" class="text-sm">
                <!-- If dataValue exists and is not a simple '1' (for booleans), display the data -->
                <span v-if="process.dataValue && process.dataValue !== '1'" class="font-semibold text-gray-900">
                  {{ process.dataValue }}
                </span>
                <!-- Otherwise, fall back to the green checkmark and completed label -->
                <span v-else class="text-green-600 font-semibold">
                  ✓ {{ process.workflowStep.actionLabelCompleted || 'Completed' }}
                </span>
              </div>

              <!-- State 2: Active (Unchanged) -->
              <div v-else-if="process.status === 'active'" class="text-sm text-gray-500 italic">
                <span v-if="process.nextPendingReminder">
                  Next follow-up: {{ process.nextPendingReminder.dueDate }}
                </span>
                <span v-else>
                  {{ process.workflowStep.actionLabelActive || 'Awaiting next step' }}
                </span>
              </div>

              <!-- State 3: Actionable & Pending (Unchanged) -->
              <div v-else-if="process.isActionable">
                <button
                  v-if="!process.workflowStep.dataType && process.workflowStep.actionLabelActive"
                  @click="activate(process)"
                  class="btn-primary btn-xs"
                >
                  {{ process.workflowStep.actionLabelActive }} 
                </button>
                <div v-else-if="process.workflowStep.dataType">
                  <button
                    v-if="process.workflowStep.actionLabelPending"
                    @click="saveProcessData(process, true)"
                    class="btn-primary btn-xs"
                  >
                    {{ process.workflowStep.actionLabelPending }}
                  </button>
                  <WorkflowInput
                    v-else
                    :data-type="process.workflowStep.dataType"
                    :process-id="process.id"
                    v-model="processData[process.id]"
                    @save="saveProcessData(process, false)"
                  />
                </div>
              </div>

              <!-- State 4: Not Actionable (Unchanged) -->
              <div v-else class="text-sm text-gray-500 italic">
                Awaiting dependency
              </div>
            </td>

            <!-- Column 3: History & Notes Icons -->
            <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center space-x-3">
                  <!-- ADD THIS NOTES BUTTON/ICON -->
                  <button
                    @click="$emit('open-notes', { 
                    type: 'estate_workflow_process', 
                    id: process.id, 
                    name: process.workflowStep.label || process.workflowStep.name.replace(/_/g, ' ') 
                  })"
                    class="text-gray-400 hover:text-brand-blue-600 transition"
                    title="View/Add Notes"
                  >
                    <!-- A simple comment icon -->
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path></svg>
                  </button>  
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import estateService from '@/services/estateService'; 
import WorkflowInput from './WorkflowInput.vue';
import { useAlerts } from '@/composables/useAlerts'; // Import the composable

const props = defineProps({ estateId: { type: [String, Number], required: true } });
const emit = defineEmits(['open-notes']);

const processes = ref([]);
const loading = ref(true);
const error = ref(null);
const processData = reactive({});

const { showAlert } = useAlerts(); // Initialize the composable

// --- Utility Function for Debouncing ---
let debounceTimer;
const debounce = (func, delay) => {
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(this, args), delay);
  };
};

// --- API & LOGIC FUNCTIONS ---

const fetchProcesses = async () => {
  // This function doesn't need to set loading to true if it's just a refresh
  error.value = null;
  try {
    const response = await estateService.getWorkflowProcesses(props.estateId);
    processes.value = response.data;
  } catch (err) {
    error.value = 'Could not refresh workflow status.';
    console.error(err);
  } finally {
    // Only stop global loading on the initial fetch
    if (loading.value) {
      loading.value = false;
    }
  }
};

const activate = async (processToActivate) => {
  // ... (unchanged)
  try {
    loading.value = true;
    await estateService.activateWorkflowProcess(props.estateId, processToActivate.id);
    await fetchProcesses();
  } catch (err) { 
    showAlert('Activation Failed', 'Failed to activate process.'); 
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const saveProcessData = async (process, isShortcut = false) => {
  // --- PRIMARY BUG FIX IS HERE ---
  // The property access is now correctly camelCase.
  const fieldName = process.workflowStep.completionTriggerField; 

  if (!fieldName) {
    console.error('No completionTriggerField configured for this step.');
    showAlert('Configuration Error', 'This step is not configured correctly (missing completionTriggerField).');
    return;
  }
  
  let value;
  if (isShortcut) {
    value = new Date().toISOString().slice(0, 10);
  } else {
    value = processData[process.id];
  }

  if (value === undefined || value === null || value === '') {
    console.warn('Aborting save because value is empty or undefined.');
    return;
  }
  
  try {
    await estateService.completeWorkflowProcess(process.id, value);
    await fetchProcesses();
  } catch (err) { 
    console.error('Failed to save data via API:', err);
    showAlert('Save Failed', 'Failed to save data. Check the console for more details.'); 
  }
  // No finally block needed if we remove the loading state for background saves
};

// --- Create a debounced version of the save function ---
const handleDebouncedSave = debounce((process) => {
  // The 'isShortcut' parameter is always false when coming from WorkflowInput
  saveProcessData(process, false);
}, 750); // 750ms delay is usually a good starting point


// The getStatusClass function can be removed if not used in the template.
// If it's used elsewhere, keep it.
/*
const getStatusClass = (status) => {
    // ...
};
*/

// Fetch data when the component is first mounted
onMounted(async () => {
  loading.value = true;
  await fetchProcesses();
});
</script>