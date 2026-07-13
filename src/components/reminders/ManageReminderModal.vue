<template>
  <Modal :show="show" @close="$emit('close')">
    <template #title>Manage Task</template>
    
    <div class="p-6">
      <div v-if="loading" class="text-gray-500">Loading details...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      
      <div v-else-if="reminder">
        <!-- V2 Generic Case Details Display -->
        <div class="mb-6 space-y-2 text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
          <p><strong>Case Reference:</strong> {{ reminder.caseFile?.fileReference || reminder.caseName || 'Unknown Case' }}</p>
          <p><strong>Task:</strong> {{ reminder.taskContext || reminder.title || 'General Task' }}</p>
          <p><strong>Current Due Date:</strong> {{ $formatDate(reminder.dueDate) }}</p>
          <p>
            <strong>Status:</strong> 
            <span class="font-semibold" :class="statusClass">{{ reminder.status?.name || 'Unknown' }}</span>
          </p>
        </div>

        <!-- NEW V2: DYNAMIC SUGGESTED ACTION SECTION -->
        <div v-if="isActionable && reminder.suggestedEmailAction" class="mb-8 p-4 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
            <h4 class="text-sm font-bold text-brand-blue-800 uppercase mb-2">Automated Email Task</h4>
            
            <!-- Step 1: Initial Prompt -->
            <div v-if="!showEmailForm">
                <p class="text-xs text-brand-blue-700 mb-4">
                    The system suggests sending a requested document email for this task.
                </p>
                <button 
                    @click="prepareEmailAction" 
                    class="w-full inline-flex justify-center items-center px-4 py-2 border border-brand-blue-600 text-sm font-medium rounded-md shadow-sm text-brand-blue-600 bg-white hover:bg-brand-blue-50 focus:outline-none"
                >
                    Prepare Email
                </button>
            </div>

            <!-- Step 2: Recipient Selection Form -->
            <div v-else>
                <label class="block text-xs font-medium text-gray-700 mb-1">Select Recipient:</label>
                
                <div v-if="isLoadingParticipants" class="text-xs text-gray-500 mb-3">Loading contacts...</div>
                
                <select 
                    v-else 
                    v-model="selectedParticipant" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm mb-4"
                >
                    <option :value="null" disabled>-- Choose a contact --</option>
                    <option 
                        v-for="p in participants" 
                        :key="p.participantId" 
                        :value="p"
                    >
                        {{ p.name }} ({{ p.roleKey }}) - {{ p.email }}
                    </option>
                </select>

                <div class="flex space-x-2">
                    <button 
                        @click="showEmailForm = false" 
                        class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button 
                        @click="executeSuggestedAction" 
                        :disabled="isExecutingAction || !selectedParticipant"
                        class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        <svg v-if="isExecutingAction" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        {{ isExecutingAction ? 'Sending...' : 'Send Email' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="!isActionable" class="bg-gray-100 p-4 rounded-md text-sm text-gray-700 mb-6">
          This task is already {{ reminder.status?.name?.toLowerCase() || 'closed' }} and cannot be modified.
        </div>

        <div v-else>
          <!-- Action 1: Change Due Date -->
          <div class="mb-6">
            <label for="new_due_date" class="form-label">Change Due Date</label>
            <p class="text-xs text-gray-500 mb-2">
              Use this to correct an error. It moves the existing task without creating a history record.
            </p>
            
            <div class="flex items-center space-x-2">
              <!-- Finesse Picker Wrapper -->
              <div class="relative group flex-grow h-[38px]">
                <div class="flex items-center justify-between w-full h-full px-3 bg-white border border-gray-300 rounded shadow-sm group-hover:border-brand-primary transition-colors">
                  <span class="text-xs font-bold uppercase tracking-tight" :class="form.newDueDate ? 'text-brand-blue-700' : 'text-gray-400'">
                    {{ form.newDueDate ? $formatDate(form.newDueDate) : 'Select Date...' }}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  id="new_due_date" 
                  type="date" 
                  v-model="form.newDueDate" 
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
              </div>
              
              <button @click="updateDueDate" class="btn-primary shrink-0" :disabled="!form.newDueDate">
                Update
              </button>
            </div>
          </div>

          <!-- Action 2: Change Status -->
          <div class="mb-6 border-t pt-4">
            <label for="reminder_status" class="form-label">Change Status</label>
            <p class="text-xs text-gray-500 mb-2">
              Update the progress or status of this task.
            </p>
            <div class="flex items-center space-x-2">
              <select id="reminder_status" v-model="form.statusId" class="form-input flex-grow bg-white">
                <option :value="1">Pending</option>
                <option :value="2">Completed</option>
                <option :value="3">Cancelled</option>
                <option :value="4">Escalated</option>
              </select>
              <button @click="updateStatus" class="btn-primary" :disabled="!form.statusId || form.statusId === reminder.reminder_status_id">Update</button>
            </div>
          </div>

          <!-- Action 3: Snooze Reminder -->
          <div class="border-t pt-4">
            <label class="form-label">Snooze Task</label>
            <p class="text-xs text-gray-500 mb-2">
              This completes the current task and creates a new follow-up for the future.
            </p>
            
            <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Action 2: Snooze -->
              <div>
                <label for="snooze_due_date" class="text-sm font-medium text-gray-700">Snooze to date</label>
                <div class="flex items-center space-x-2 mt-1">
                  
                  <!-- Finesse Picker Wrapper -->
                  <div class="relative group flex-grow h-[38px]">
                    <div class="flex items-center justify-between w-full h-full px-3 bg-white border border-gray-300 rounded shadow-sm group-hover:border-brand-primary transition-colors">
                      <span class="text-xs font-bold uppercase tracking-tight" :class="form.snoozeDueDate ? 'text-brand-blue-700' : 'text-gray-400'">
                        {{ form.snoozeDueDate ? $formatDate(form.snoozeDueDate) : 'Pick Date...' }}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input 
                      id="snooze_due_date" 
                      type="date" 
                      v-model="form.snoozeDueDate" 
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                  </div>

                  <button @click="snoozeReminder" class="btn-secondary shrink-0" :disabled="!form.snoozeDueDate">
                    Snooze
                  </button>
                </div>
              </div>
              <div>
                <label for="snooze_days" class="text-sm font-medium text-gray-700">Snooze by days</label>
                <div class="flex items-center space-x-2 mt-1">
                  <input id="snooze_days" type="number" v-model.number="form.snoozeDays" min="1" class="form-input w-20 text-center">
                  <span class="text-sm text-gray-600">days</span>
                  <button @click="snoozeByDays" class="btn-secondary" :disabled="!form.snoozeDays">Snooze</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import Modal from '@/components/common/Modal.vue';
import apiClient from '@/services/api'; // V2 Hotwire: Use apiClient directly

const route = useRoute();
const productSlug = computed(() => route.params.productSlug);

const props = defineProps({
  show: { type: Boolean, default: false },
  reminderId: { type: Number, default: null }
});
const emit = defineEmits(['close', 'reminder-updated']);

const reminder = ref(null);
const loading = ref(false);
const error = ref(null);

// V2 Action States
const showEmailForm = ref(false);
const isExecutingAction = ref(false);
const participants = ref([]);
const selectedParticipant = ref(null);
const isLoadingParticipants = ref(false);

const form = reactive({
  newDueDate: '',
  snoozeDueDate: '',
  snoozeDays: 1, 
  statusId: null,
});

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(`${dateString}T00:00:00Z`);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) { return ''; }
};

const isActionable = computed(() => {
  if (!reminder.value) return false;
  const nonActionableStatuses = ['Completed', 'Cancelled'];
  return !nonActionableStatuses.includes(reminder.value.status?.name);
});

const statusClass = computed(() => {
  if (!reminder.value) return 'text-gray-800';
  switch (reminder.value.status?.name) {
    case 'Completed': return 'text-green-600';
    case 'Cancelled': return 'text-red-600';
    default: return 'text-gray-800';
  }
});

// Load the reminder directly via generic V2 endpoints
watch(() => props.reminderId, async (newId) => {
  if (newId) {
    loading.value = true;
    error.value = null;
    showEmailForm.value = false;
    selectedParticipant.value = null;
    resetForm();
    
    try {
      const response = await apiClient.get(`/${productSlug.value}/reminders/${newId}`);
      // V2 Resiliency: Support both wrapped and unwrapped responses
      reminder.value = response.data.data || response.data;
      resetForm(formatDateForInput(reminder.value.dueDate), reminder.value.reminder_status_id); 
    } catch (err) {
      error.value = "Failed to load task details.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  } else {
    reminder.value = null;
    resetForm();
  }
});

// --- V2 ACTION FLOW ---
const prepareEmailAction = async () => {
    showEmailForm.value = true;
    isLoadingParticipants.value = true;
    
    // Fallback: Check both camelCase and snake_case for the ID depending on your resource mapping
    const caseId = reminder.value.caseFile?.id || reminder.value.caseFileId || reminder.value.case_file_id;

    if (!caseId) {
        alert("Cannot find Case File context for this task.");
        isLoadingParticipants.value = false;
        return;
    }

    try {
        const response = await apiClient.get(`/${productSlug.value}/case-files/${caseId}/emailable-participants`);
        participants.value = response.data.data;
        
        // Auto-select primary contact if available
        const primary = participants.value.find(p => p.isPrimary);
        if (primary) selectedParticipant.value = primary;

    } catch (err) {
        console.error("Failed to load participants:", err);
        alert("Failed to load available email contacts.");
    } finally {
        isLoadingParticipants.value = false;
    }
};

const executeSuggestedAction = async () => {
    if (!selectedParticipant.value) return;

    isExecutingAction.value = true;
    try {
        const payload = {
            action: reminder.value.suggestedEmailAction,
            recipient_email: selectedParticipant.value.email,
            recipient_name: selectedParticipant.value.name,
            participant_role_key: selectedParticipant.value.roleKey
        };

        const response = await apiClient.post(`/${productSlug.value}/reminders/${props.reminderId}/execute`, payload);
        
        alert(response.data.message || "Email sent successfully!");
        
        emit('reminder-updated');
        emit('close');
    } catch (err) {
        console.error("Action Error:", err);
        alert(err.response?.data?.message || "Failed to execute the suggested action.");
    } finally {
        isExecutingAction.value = false;
    }
};

// --- Standard Reminder Controls ---
const updateDueDate = async () => {
  try {
    await apiClient.put(`/${productSlug.value}/reminders/${props.reminderId}`, { due_date: form.newDueDate });
    emit('reminder-updated');
    emit('close');
  } catch (err) { alert("Failed to update due date."); }
};

const updateStatus = async () => {
  try {
    await apiClient.put(`/${productSlug.value}/reminders/${props.reminderId}`, { reminder_status_id: form.statusId });
    emit('reminder-updated');
    emit('close');
  } catch (err) { alert("Failed to update status."); }
};

const snoozeReminder = async () => {
  try {
    await apiClient.post(`/${productSlug.value}/reminders/${props.reminderId}/snooze`, { due_date: form.snoozeDueDate });
    emit('reminder-updated');
    emit('close');
  } catch (err) { alert("Failed to snooze task."); }
};

const snoozeByDays = async () => {
  if (!form.snoozeDays || form.snoozeDays < 1) return;
  try {
    await apiClient.post(`/${productSlug.value}/reminders/${props.reminderId}/snooze-days`, { days: form.snoozeDays });
    emit('reminder-updated');
    emit('close');
  } catch (err) { alert("Failed to snooze task."); }
};

const resetForm = (baseDate, statusId = null) => {
  form.newDueDate = baseDate || '';
  form.snoozeDueDate = '';
  form.snoozeDays = 1;
  form.statusId = statusId;
};
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
.btn-primary { @apply inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-brand-blue-600 hover:bg-brand-blue-700 disabled:opacity-50; }
.btn-secondary { @apply inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50; }
</style>