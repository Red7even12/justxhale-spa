<template>
  <Modal :show="show" @close="$emit('close')">
    <template #title>Manage Reminder</template>
    
    <div class="p-6">
      <div v-if="loading">Loading details...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      
      <div v-else-if="reminder">
        <!-- Reminder Details Display -->
        <div class="mb-6 space-y-2 text-sm">
          <p><strong>Estate:</strong> {{ reminder.estate.name }}</p>
          <p><strong>Task:</strong> {{ reminder.taskContext }}</p>
          <p><strong>Current Due Date:</strong> {{ reminder.dueDate }}</p>
          <p>
            <strong>Status:</strong> 
            <span class="font-semibold" :class="statusClass">{{ reminder.status.name }}</span>
          </p>
        </div>

        <!-- NEW: SUGGESTED ACTION SECTION -->
        <div v-if="isActionable && reminder.suggestedEmailAction" class="mb-8 p-4 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
            <h4 class="text-sm font-bold text-brand-blue-800 uppercase mb-2">Automation Suggestion</h4>
            <p class="text-xs text-brand-blue-700 mb-4">
                The system suggests sending a template email to the Attorney for this task.
            </p>
            <button 
                @click="handleSuggestedAction" 
                :disabled="isExecutingAction"
                class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none disabled:opacity-50"
            >
                <svg v-if="isExecutingAction" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {{ isExecutingAction ? 'Sending Email...' : 'Send Template Email to Attorney' }}
            </button>
        </div>

        <div v-if="!isActionable" class="bg-gray-100 p-4 rounded-md text-sm text-gray-700">
          This reminder is already {{ reminder.status.name.toLowerCase() }} and cannot be modified.
        </div>

        <div v-else>
          <!-- Action 1: Change Due Date -->
          <div class="mb-6">
            <label for="new_due_date" class="form-label">Change Due Date</label>
            <p class="text-xs text-gray-500 mb-2">
              Use this to correct an error. It moves the existing reminder without creating a history record.
            </p>
            <div class="flex items-center space-x-2">
              <input id="new_due_date" type="date" v-model="form.newDueDate" class="form-input flex-grow">
              <button @click="updateDueDate" class="btn-primary">Update</button>
            </div>
          </div>

          <!-- Action 2: Snooze Reminder -->
          <div class="border-t pt-4">
            <label class="form-label">Snooze Reminder</label>
            <p class="text-xs text-gray-500 mb-2">
              This completes the current reminder and creates a new follow-up.
            </p>
            
            <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="snooze_due_date" class="text-sm font-medium text-gray-700">Snooze to a specific date</label>
                <div class="flex items-center space-x-2 mt-1">
                  <input id="snooze_due_date" type="date" v-model="form.snoozeDueDate" class="form-input flex-grow">
                  <button @click="snoozeReminder" class="btn-secondary">Snooze</button>
                </div>
              </div>
              <div>
                <label for="snooze_days" class="text-sm font-medium text-gray-700">Snooze by workdays</label>
                <div class="flex items-center space-x-2 mt-1">
                  <input id="snooze_days" type="number" v-model.number="form.snoozeDays" min="1" class="form-input w-20 text-center">
                  <span class="text-sm text-gray-600">days</span>
                  <button @click="snoozeByDays" class="btn-secondary">Snooze</button>
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
import Modal from '@/components/common/Modal.vue';
import reminderService from '@/services/reminderService';

const props = defineProps({
  show: { type: Boolean, default: false },
  reminderId: { type: Number, default: null }
});
const emit = defineEmits(['close', 'reminder-updated']);

const reminder = ref(null);
const loading = ref(false);
const error = ref(null);
const isExecutingAction = ref(false); // NEW: loading state for email action

const form = reactive({
  newDueDate: '',
  snoozeDueDate: '',
  snoozeDays: 1, 
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
  return !nonActionableStatuses.includes(reminder.value.status.name);
});

const statusClass = computed(() => {
  if (!reminder.value) return 'text-gray-800';
  switch (reminder.value.status.name) {
    case 'Completed': return 'text-green-600';
    case 'Cancelled': return 'text-red-600';
    default: return 'text-gray-800';
  }
});

watch(() => props.reminderId, async (newId) => {
  if (newId) {
    loading.value = true;
    error.value = null;
    resetForm();
    try {
      const response = await reminderService.getReminder(newId);
      reminder.value = response.data.data;
      resetForm(formatDateForInput(reminder.value.dueDate)); 
    } catch (err) {
      error.value = "Failed to load reminder details.";
    } finally {
      loading.value = false;
    }
  } else {
    reminder.value = null;
    resetForm();
  }
});

// --- NEW ACTION HANDLER ---
const handleSuggestedAction = async () => {
    if (!confirm("This will send the template email to the Attorney and mark this task as Completed. Proceed?")) return;

    isExecutingAction.value = true;
    try {
        const response = await reminderService.triggerAction(props.reminderId, reminder.value.suggestedEmailAction);
        
        // --- NEW: SUCCESS FEEDBACK ---
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

const updateDueDate = async () => {
  try {
    await reminderService.updateReminder(props.reminderId, { due_date: form.newDueDate });
    emit('reminder-updated');
    emit('close');
  } catch (err) { alert("Failed to update due date."); }
};

const snoozeReminder = async () => {
  try {
    await reminderService.snoozeReminder(props.reminderId, { due_date: form.snoozeDueDate });
    emit('reminder-updated');
    emit('close');
  } catch (err) { alert("Failed to snooze reminder."); }
};

const snoozeByDays = async () => {
  if (!form.snoozeDays || form.snoozeDays < 1) {
    alert("Please enter a valid number of days to snooze.");
    return;
  }
  try {
    await reminderService.snoozeReminderByDays(props.reminderId, { days: form.snoozeDays });
    emit('reminder-updated');
    emit('close');
  } catch (err) { alert("Failed to snooze reminder."); }
};

const resetForm = (baseDate) => {
  form.newDueDate = baseDate || '';
  form.snoozeDueDate = '';
  form.snoozeDays = 1;
};
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>