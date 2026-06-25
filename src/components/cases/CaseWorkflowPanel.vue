<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <h3 class="text-lg font-bold text-gray-800 uppercase tracking-tight mb-4 border-b border-gray-100 pb-2 shrink-0">
      Workflow Checklist
    </h3>
    
    <!-- Loading / Error States -->
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400 text-sm font-bold">
      Loading workflow...
    </div>
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
    </div>
    
    <!-- The V1 List Layout -->
    <div v-else class="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white relative">
      <table class="min-w-full divide-y divide-gray-200 workflow-table-override">
        <tbody class="divide-y divide-gray-100">
          <tr v-for="process in visibleProcesses" :key="process.id" class="hover:bg-gray-50 transition-colors group">
            
            <!-- Column 1: Step Name & Status -->
            <td class="px-3 py-3 w-1/3 align-middle bg-white group-hover:bg-gray-50">
              <p class="text-sm font-bold text-gray-800">{{ process.workflowStep?.label }}</p>
              
              <!-- Subtext: Active but waiting for input -->
              <p v-if="process.status === 'active' && !process.isActionable" class="text-[10px] text-gray-400 italic mt-0.5">
                {{ process.workflowStep?.actionLabelActive || 'Pending...' }}
              </p>
            </td>

            <!-- Column 2: Action / Data Input -->
            <td class="px-3 py-3 w-1/2 align-middle bg-white group-hover:bg-gray-50">
              
              <!-- STATE: COMPLETED -->
              <div v-if="process.status === 'completed'" class="flex items-center justify-between group/undo">
                <div class="text-xs font-bold text-green-600 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                  <span v-if="process.dataValue && process.dataValue !== '1'" class="truncate max-w-[120px]" :title="process.dataValue">
                    {{ process.dataValue }}
                  </span>
                  <span v-else>{{ process.workflowStep?.actionLabelCompleted || 'Done' }}</span>
                </div>
                
                <!-- The Undo Button: Hidden by default, shows on row hover -->
                <button 
                  @click="revertStep(process)" 
                  title="Undo / Revert Step"
                  class="opacity-0 group-hover/undo:opacity-100 text-gray-400 hover:text-orange-500 transition-all p-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                </button>
              </div>
              

              <!-- STATE: ACTIVE / ACTIONABLE -->
              <div v-else-if="process.isActionable" class="flex items-center gap-2 w-full">
                
                <!-- Input Type: DATE / TIMESTAMP -->
                <div v-if="['date', 'timestamptz'].includes(process.workflowStep?.dataType)" class="flex w-full gap-2 items-center">
                  <input 
                    type="date" 
                    v-model="inputData[process.id]" 
                    class="flex-1 text-xs border-gray-300 rounded shadow-sm focus:ring-brand-primary focus:border-brand-primary py-1"
                  >
                  <button @click="saveStep(process)" class="bg-white border border-gray-300 text-gray-600 hover:text-brand-primary hover:border-brand-primary text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-colors">
                    Save
                  </button>
                </div>

                <!-- Input Type: TEXT -->
                <div v-else-if="process.workflowStep?.dataType === 'text'" class="flex w-full gap-2 items-center">
                  <input 
                    type="text" 
                    v-model="inputData[process.id]" 
                    class="flex-1 text-xs border-gray-300 rounded shadow-sm focus:ring-brand-primary focus:border-brand-primary py-1"
                    placeholder="Enter value..."
                  >
                  <button @click="saveStep(process)" class="bg-white border border-gray-300 text-gray-600 hover:text-brand-primary hover:border-brand-primary text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-colors">
                    Save
                  </button>
                </div>

                <!-- Input Type: BOOLEAN / NONE (Checkbox Style) -->
                <div v-else class="flex items-center gap-2">
                   <input 
                      type="checkbox" 
                      @change="saveStep(process, true)"
                      class="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                   >
                   <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {{ process.workflowStep?.actionLabelActive || 'Yes / Done' }}
                   </span>
                </div>

              </div>

              <!-- STATE: PENDING (Dependency) -->
              <div v-else class="text-xs text-gray-300 italic">
                --
              </div>
            </td>

            <!-- Column 3: History Icon (V1 Style) -->
            <td class="px-3 py-3 text-center align-middle w-10 bg-white group-hover:bg-gray-50">
                <button @click="openNotes(process)" class="text-gray-400 hover:text-brand-primary transition-colors"  title="View History">
                  <svg class="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path></svg>
                </button>  
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- NOTES MODAL -->
  <Modal :show="showNotesModal" @close="showNotesModal = false">
    
    <!-- NEW: Inject the Title into the Slot -->
    <template #title>
      <span class="text-brand-primary font-bold">{{ currentNoteContext.title }}</span>
    </template>

    <div class="p-6">
      <NotesPanel 
          :noteable-type="currentNoteContext.type"
          :noteable-id="currentNoteContext.id"
          :context-url="`${route.params.productSlug}/cases/${props.caseId}`" 
          :current-team-id="props.currentTeamId"
          @note-added="(n) => {
              // Ensure currentNotes is an array before calling unshift
              if (!Array.isArray(currentNotes)) {
                  currentNotes = [];
              }
              currentNotes.unshift(n);
          }"
          @cancel="showNotesModal = false"
      />
    </div>
  </Modal>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue'; // Reuse V1 Panel
import noteService from '@/services/noteService';

const props = defineProps({ 
  caseId: { type: [String, Number], required: true },
  currentTeamId: { type: [String, Number], default: null }
});
const route = useRoute();
const { showAlert } = useAlerts();

const showNotesModal = ref(false);
const currentNoteContext = reactive({ type: '', id: 0, title: '' });
const currentNotes = ref([]); // To hold fetched notes

const processes = ref([]);
const loading = ref(true);
const error = ref(null);
const inputData = reactive({}); // Stores temp input for each row

const visibleProcesses = computed(() => {
  return processes.value.filter(p => p.workflowStep?.isUserFacing);
});

const fetchProcesses = async (silent = false) => {
  if (!silent) loading.value = true;
  try {
    const { data } = await apiClient.get(`/${route.params.productSlug}/cases/${props.caseId}/workflow`);
    processes.value = data;
    
    // Initialize inputData for active rows
    processes.value.forEach(p => {
        if (p.isActionable) {
            // Default to empty string to ensure reactivity
            if (inputData[p.id] === undefined) {
                inputData[p.id] = ''; 
            }
        }
    });
  } catch (err) {
    error.value = 'Failed to load workflow.';
    console.error(err);
  } finally {
    if (!silent) loading.value = false;
  }
};

const saveStep = async (process, isCheckbox = false) => {
    try {
        let valueToSend = isCheckbox ? '1' : inputData[process.id];
        
        // Simple validation for text/date fields
        if (!isCheckbox && !valueToSend) {
            return showAlert('Warning', 'Please enter a value first.');
        }

        const payload = { data_value: valueToSend };

        await apiClient.post(
            `/${route.params.productSlug}/cases/${props.caseId}/workflow/${process.id}/complete`, 
            payload
        );

        // Optimistic Update (Instant Feedback)
        process.status = 'completed';
        // If it was a checkbox ('1'), show the label instead of '1'
        process.dataValue = (valueToSend === '1') ? (process.workflowStep?.actionLabelCompleted || 'Done') : valueToSend; 
        process.isActionable = false;
        
        showAlert('Success', 'Step completed!');
        
        // Refresh workflow checklist silently to show newly activated downstream steps
        await fetchProcesses(true);
    } catch (err) {
        console.error("Complete failed", err);
        showAlert('Error', 'Failed to update step.');
    }
};

const revertStep = async (process) => {
    if (!confirm('Revert this step? This will reset any reminders or steps that were automatically started by this action.')) {
        return;
    }

    try {
        await apiClient.post(
            `/${route.params.productSlug}/cases/${props.caseId}/workflow/${process.id}/revert`
        );

        // 1. Manually clear local UI state immediately
        process.status = 'pending';
        process.dataValue = null;
        process.isActionable = false;
        if (inputData[process.id]) {
            inputData[process.id] = ''; 
        }

        showAlert('Success', 'Step reverted to pending.');
        
        // 2. Re-fetch from server to sync all downstream changes
        await fetchProcesses(true);
    } catch (err) {
        console.error("Revert failed", err);
        showAlert('Error', 'Failed to revert step.');
    }
};

const openNotes = async (process) => {
    currentNoteContext.type = 'case_workflow_process'; // V2 Morph Map
    currentNoteContext.id = process.id;
    currentNoteContext.title = `Notes: ${process.workflowStep.label}`;
    
    // Construct V2 Context String
    const contextUrl = `${route.params.productSlug}/cases/${props.caseId}`;
    
    // Fetch existing notes
    try {
        const { data } = await noteService.getNotes('case_workflow_process', process.id, contextUrl);
        currentNotes.value = data;
        showNotesModal.value = true;
    } catch (err) {
        console.error("Failed to load notes", err);
        alert("Failed to load notes");
    }
};

onMounted(fetchProcesses);
</script>

<style scoped>
/* Ensure layout stability */
.workflow-table-override {
  table-layout: fixed; 
}
</style>