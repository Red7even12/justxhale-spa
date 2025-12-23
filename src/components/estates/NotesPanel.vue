<template>

  <div class="notes-panel">
    <h3 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Notes & History</h3>

    <div class="mb-4">
      <textarea
        ref="textareaRef"
        v-model="newNoteContent"
        class="form-input w-full"
        placeholder="Add a new note..."
        style="min-height: 80px;"
        @input="autoResize"
      ></textarea>
        <div class="mt-2">
        <input
          type="text"
          v-model="newCaseNumber"
          class="form-input w-full sm:w-1/2"
          placeholder="Case Number (optional)"
        >
      </div>
      <div v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</div>
      
      <!-- Button group with consistent top margin -->
      <div class="mt-2 space-x-2">
        <button
          @click="submitNote"
          :disabled="isLoading || !newNoteContent.trim()"
          class="btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
        >
          {{ isLoading ? 'Saving...' : 'Save Note' }}
        </button>
        <button @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button @click="showReminderInput = !showReminderInput" class="btn-secondary">
          Set Reminder
        </button>
      </div>
    </div>

    <div v-if="showReminderInput" class="mb-4 bg-gray-50 p-3 rounded-md border">
      <label for="reminder-date" class="form-label">Set a follow-up date for this note:</label>
      <input id="reminder-date" type="date" v-model="reminderDate" class="form-input mt-1">
      <p class="text-xs text-gray-500 mt-1">A reminder will be created when you save the note.</p>
    </div>

    <!-- List of existing notes Old 
    <div class="space-y-4">
      <p v-if="notes.length === 0" class="text-gray-500">No notes have been added yet.</p>
      
      <div v-for="note in notes" :key="note.id" class="bg-gray-50 p-4 rounded-lg border">
        <div v-if="note.caseNumber" class="mb-2">
          <p class="font-semibold text-brand-blue-600">Case Number: {{ note.caseNumber }}</p>
        </div>
        <p class="text-gray-800 whitespace-pre-wrap">{{ note.content }}</p>
        <div class="text-xs text-gray-500 mt-2 text-right">
          by <strong>{{ note.user?.firstName || 'Unknown User' }}</strong> - {{ note.createdAtHuman }}
        </div>
      </div>
    </div>  -->
    <!-- List of existing notes -->
    <div class="space-y-4">
      <p v-if="notes.length === 0" class="text-gray-500">No notes have been added yet.</p>
      
      <div v-for="note in notes" :key="note.id" class="bg-gray-50 p-4 rounded-lg border relative">
        <!-- Content -->
        <p class="text-gray-800 whitespace-pre-wrap mb-2">{{ note.content }}</p>
        
        <!-- Case Number (Data Style) -->
        <div v-if="note.caseNumber" class="mb-2 text-sm text-brand-blue-600 bg-brand-blue-50 inline-block px-2 py-1 rounded">
          <strong>CN:</strong> {{ note.caseNumber }}
        </div>

        <!-- Footer Row: Origin (Left) | User Info (Right) -->
        <div class="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
            <!-- Left: Origin Context -->
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span v-if="note.origin" class="bg-gray-200 px-2 py-1 rounded text-gray-600">
                    {{ note.origin }}
                </span>
            </div>

            <!-- Right: User & Date -->
            <div class="text-xs text-gray-500">
                by <strong>{{ note.user?.name || note.user?.firstName || 'Unknown' }}</strong> - {{ note.createdAtHuman || note.created_at }}
            </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// 1. IMPORTS
import { ref, watch, nextTick } from 'vue';
import noteService from '@/services/noteService';


// 2. PROPS & EMITS
const props = defineProps({
  initialNotes: { type: Array, required: true, default: () => [] },
  noteableType: { type: String, required: true },
  noteableId: { type: Number, required: true },
});

const emit = defineEmits(['note-added', 'cancel']);


// 3. STATE MANAGEMENT (REFS)
// All reactive variables are declared here first.
const notes = ref([]);
const newNoteContent = ref('');
const newCaseNumber = ref('');
const isLoading = ref(false);
const error = ref(null);
const showReminderInput = ref(false);
const reminderDate = ref('');

// Ref for the textarea element to enable auto-resizing
const textareaRef = ref(null);


// 4. FUNCTIONS
const autoResize = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    // Reset height to auto to correctly calculate scrollHeight when text is deleted
    textarea.style.height = 'auto';
    // Set the height to match the full content height
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};

const submitNote = async () => {
  if (!newNoteContent.value.trim()) return;
  isLoading.value = true;
  error.value = null;

// To this object with snake_case keys:
const payload = {
  noteable_type: props.noteableType,
  noteable_id: props.noteableId,
  content: newNoteContent.value,
  case_number: newCaseNumber.value || null, 
  due_date: reminderDate.value || null, 
};

  try {
    const response = await noteService.createNote(payload);
    notes.value.unshift(response.data.data);
    
    // Reset form state
    newNoteContent.value = ''; 
    newCaseNumber.value = '';
    reminderDate.value = '';
    showReminderInput.value = false;

    emit('note-added', response.data.data);
  } catch (err) {
    error.value = 'Failed to save the note. Please try again.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};


// 5. WATCHERS (REACTIVE LOGIC)
// This runs when the 'initialNotes' prop changes.
watch(() => props.initialNotes, (newNotes) => {
  notes.value = newNotes ? [...newNotes] : [];
}, { immediate: true });

// This runs when the 'newNoteContent' model changes programmatically.
watch(newNoteContent, () => {
  // Use nextTick to ensure the DOM has updated before resizing
  nextTick(() => {
    autoResize();
  });
});
</script>

<style scoped>
/* Scoped styles remain unchanged */
.form-input {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm;
}
</style>