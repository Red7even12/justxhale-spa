<template>
  <Modal :show="show" @close="closeModal">
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">
        {{ isEditMode ? 'Edit Workflow Step' : 'Create New Workflow Step' }}
      </h2>

      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <!-- Column 1: Core Details -->
          <div class="md:col-span-2">
            <label for="name" class="form-label">Step Name</label>
            <input id="name" v-model="form.name" type="text" class="form-input" required />
          </div>

          <div class="md:col-span-2">
            <label for="description" class="form-label">Description</label>
            <textarea id="description" v-model="form.description" rows="2" class="form-input"></textarea>
          </div>

          <div>
            <label for="reminder_interval_days" class="form-label">Reminder Interval (Days)</label>
            <input id="reminder_interval_days" v-model.number="form.reminderIntervalDays" type="number" min="1" class="form-input" />
          </div>

          <div>
            <label for="reminder_max_cycles" class="form-label">Max Reminder Cycles</label>
            <input id="reminder_max_cycles" v-model.number="form.reminderMaxCycles" type="number" min="1" class="form-input" />
          </div>

          <!-- Column 2: Triggering and Dependencies -->
          <div class="md:col-span-2 border-t pt-4 mt-2">
             <h3 class="text-sm font-medium text-gray-600">Logic & Dependencies</h3>
          </div>
          
          <div>
            <label for="completion_trigger_field" class="form-label">Completion Trigger Field</label>
            <input id="completion_trigger_field" v-model="form.completionTriggerField" type="text" placeholder="e.g., sars_itr_completed_date" class="form-input font-mono text-sm" />
            <p class="mt-1 text-xs text-gray-500">The database field on the estate that marks this step as complete.</p>
          </div>

          <div>
            <label for="starts_after_step_id" class="form-label">Starts After Step (Dependency)</label>
            <select id="starts_after_step_id" v-model="form.startsAfterStepId" class="form-select">
              <option :value="null">-- No dependency --</option>
              <option v-for="step in filteredSteps" :key="step.id" :value="step.id">
                {{ step.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="escalation_step_id" class="form-label">Escalation Step</label>
            <select id="escalation_step_id" v-model="form.escalationStepId" class="form-select">
              <option :value="null">-- No escalation --</option>
              <option v-for="step in filteredSteps" :key="step.id" :value="step.id">
                {{ step.name }}
              </option>
            </select>
          </div>

           <!-- UI Labels -->
          <div class="md:col-span-2 border-t pt-4 mt-2">
             <h3 class="text-sm font-medium text-gray-600">UI Button Labels</h3>
          </div>

          <div>
            <label for="action_label_pending" class="form-label">Pending Action Label</label>
            <input id="action_label_pending" v-model="form.actionLabelPending" type="text" class="form-input" />
          </div>

          <div>
            <label for="action_label_active" class="form-label">Active Action Label</label>
            <input id="action_label_active" v-model="form.actionLabelActive" type="text" class="form-input" />
          </div>

          <div>
            <label for="action_label_completed" class="form-label">Completed Action Label</label>
            <input id="action_label_completed" v-model="form.actionLabelCompleted" type="text" class="form-input" />
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <!-- Form Actions -->
        <div class="mt-8 flex justify-end space-x-3">
          <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Step' }}
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import Modal from '@/components/common/Modal.vue';
import workflowStepService from '@/services/workflowStepService';

const props = defineProps({
  show: { type: Boolean, required: true },
  definitionId: { type: [Number, String], required: true },
  stepToEdit: { type: Object, default: null },
  existingSteps: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'step-saved']);

// --- State Management ---
const isSaving = ref(false);
const errorMessage = ref(null);
const form = reactive({
  name: '',
  description: '',
  reminderIntervalDays: null,
  reminderMaxCycles: null,
  completionTriggerField: '',
  startsAfterStepId: null,
  escalationStepId: null,
  actionLabelPending: '',
  actionLabelActive: '',
  actionLabelCompleted: '',
});

// --- Computed Properties ---
const isEditMode = computed(() => !!props.stepToEdit);

// Filter the list of possible dependencies to prevent a step from depending on itself.
const filteredSteps = computed(() => {
  if (!isEditMode.value) {
    return props.existingSteps;
  }
  return props.existingSteps.filter(step => step.id !== props.stepToEdit.id);
});

// --- Logic ---
const resetForm = () => {
  Object.assign(form, {
    name: '',
    description: '',
    reminderIntervalDays: null,
    reminderMaxCycles: null,
    completionTriggerField: '',
    startsAfterStepId: null,
    escalationStepId: null,
    actionLabelPending: '',
    actionLabelActive: '',
    actionLabelCompleted: '',
  });
  errorMessage.value = null;
};

const handleSubmit = async () => {
  isSaving.value = true;
  errorMessage.value = null;

  // Convert empty strings to null for optional integer fields
  const payload = { ...form };
  ['reminderIntervalDays', 'reminderMaxCycles'].forEach(key => {
    if (payload[key] === '' || payload[key] === 0) {
      payload[key] = null;
    }
  });

  try {
    if (isEditMode.value) {
      await workflowStepService.updateStep(props.stepToEdit.id, payload);
    } else {
      await workflowStepService.createStep(props.definitionId, payload);
    }
    emit('step-saved');
  } catch (err) {
    console.error('Failed to save workflow step:', err);
    if (err.response?.data?.message) {
      errorMessage.value = `Error: ${err.response.data.message}`;
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    isSaving.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

// --- Watchers ---
// Watch for the modal opening/closing to reset or populate the form
watch(() => props.show, (newVal) => {
  if (newVal) {
    errorMessage.value = null; // Clear old errors
    if (isEditMode.value) {
      // Populate form with existing step data
      Object.assign(form, {
        name: props.stepToEdit.name,
        description: props.stepToEdit.description,
        reminderIntervalDays: props.stepToEdit.reminderIntervalDays,
        reminderMaxCycles: props.stepToEdit.reminderMaxCycles,
        completionTriggerField: props.stepToEdit.completionTriggerField,
        startsAfterStepId: props.stepToEdit.startsAfterStepId,
        escalationStepId: props.stepToEdit.escalationStepId,
        actionLabelPending: props.stepToEdit.actionLabelPending,
        actionLabelActive: props.stepToEdit.actionLabelActive,
        actionLabelCompleted: props.stepToEdit.actionLabelCompleted,
      });
    } else {
      // Reset form for creating a new step
      resetForm();
    }
  }
});

</script>

<style scoped>
/* Scoped styles for form elements if not already globally defined */
.form-label { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input, .form-select { @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm; }
</style>