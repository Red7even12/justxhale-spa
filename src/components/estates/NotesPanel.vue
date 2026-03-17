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

    <!-- List of existing notes -->
    <div class="space-y-4">
      <p v-if="notes.length === 0" class="text-gray-500">No notes have been added yet.</p>
      
      <!-- Loop through unified notes & emails -->
      <!-- Change background color if it's an email for visual distinction -->
      <div 
        v-for="note in notes" 
        :key="note.id" 
        class="p-4 rounded-lg border relative"
        :class="note.type === 'email' ? 'bg-brand-blue-50 border-brand-blue-200' : 'bg-gray-50 border-gray-200'"
      >
        
        <!-- ============================================== -->
        <!-- SCENARIO A: STANDARD TEXT NOTE                 -->
        <!-- ============================================== -->
        <template v-if="note.type !== 'email'">
            <p class="text-gray-800 whitespace-pre-wrap mb-2">{{ note.content }}</p>
            
            <!-- Case Number (Data Style) -->
            <div v-if="note.caseNumber || note.case_number" class="mb-2 text-sm text-brand-blue-600 bg-brand-blue-50 inline-block px-2 py-1 rounded">
                <strong>CN:</strong> {{ note.caseNumber || note.case_number }}
            </div>
        </template>

        <!-- ============================================== -->
        <!-- SCENARIO B: SYSTEM EMAIL CARD                  -->
        <!-- ============================================== -->
        <template v-else>
            <!-- Email Header -->
            <div class="mb-3 pb-3 border-b border-brand-blue-200 text-sm text-brand-blue-900 bg-white p-3 rounded shadow-sm">
                <div class="flex items-center mb-2 text-brand-blue-600">
                    <!-- Simple Mail Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="font-bold text-xs uppercase tracking-wider">Automated Email Sent</span>
                </div>
                <!-- Accommodate both camelCase and snake_case API mappings -->
                <div class="mt-1">
                    <strong>To:</strong> 
                    {{ note.emailMeta?.toName || note.emailMeta?.to_name || note.email_meta?.to_name }} 
                    &lt;{{ note.emailMeta?.toEmail || note.emailMeta?.to_email || note.email_meta?.to_email }}&gt;
                </div>
                <div>
                    <strong>Subject:</strong> 
                    {{ note.emailMeta?.subject || note.email_meta?.subject }}
                </div>
            </div>
            
            <!-- Email Body (Rendered HTML) -->
            <div class="text-sm text-gray-700 email-body-wrapper" v-html="note.content"></div>
        </template>
        <!-- ============================================== -->

        <!-- Footer Row: Origin (Left) | User Info (Right) -->
        <div class="flex justify-between items-center mt-3 pt-2 border-t" :class="note.type === 'email' ? 'border-brand-blue-200' : 'border-gray-200'">
            <!-- Left: Origin Context -->
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span v-if="note.origin" class="px-2 py-1 rounded text-gray-600" :class="note.type === 'email' ? 'bg-brand-blue-100' : 'bg-gray-200'">
                    {{ note.origin }}
                </span>
            </div>

            <!-- Right: User & Date -->
            <div class="text-xs text-gray-500">
                by <strong>{{ note.user?.name || note.user?.firstName || note.user?.first_name || 'System' }}</strong> - {{ note.createdAtHuman || note.created_at }}
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
import apiClient from '@/services/api'; 


// 2. PROPS & EMITS
const props = defineProps({
  initialNotes: { type: Array, required: true, default: () => [] },
  noteableType: { type: String, required: true },
  noteableId: { type: Number, required: true },
  contextUrl: { type: String, default: null } 
});

const emit = defineEmits(['note-added', 'cancel']);


// 3. STATE MANAGEMENT (REFS)
const notes = ref([]);
const newNoteContent = ref('');
const newCaseNumber = ref('');
const isLoading = ref(false);
const error = ref(null);
const showReminderInput = ref(false);
const reminderDate = ref('');
const textareaRef = ref(null);


// 4. FUNCTIONS
const autoResize = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};

const submitNote = async () => {
  if (!newNoteContent.value.trim()) return;
  isLoading.value = true;
  error.value = null;

  const payload = {
    noteable_type: props.noteableType,
    noteable_id: props.noteableId,
    content: newNoteContent.value,
    case_number: newCaseNumber.value || null,
  };

  try {
    const response = await noteService.createNote(payload, props.contextUrl);
    const savedNote = response.data?.data || response.data;

    if (!savedNote || !savedNote.id) {
        throw new Error("Invalid response from server");
    }

    notes.value.unshift(savedNote);
    
    if (showReminderInput.value && reminderDate.value) {
        try {
            const reminderPayload = {
                due_date: reminderDate.value,
                notes: newNoteContent.value,
                note_id: savedNote.id, 
                case_workflow_process_id: props.noteableType === 'case_workflow_process' ? props.noteableId : null,
                case_document_requirement_id: props.noteableType === 'case_document_requirement' ? props.noteableId : null
            };

            await apiClient.post(`/${props.contextUrl}/reminders`, reminderPayload);
            
        } catch (remErr) {
            console.error("Failed to create reminder", remErr);
        }
    }

    newNoteContent.value = ''; 
    newCaseNumber.value = '';
    reminderDate.value = '';
    showReminderInput.value = false;

    emit('note-added', savedNote);

  } catch (err) {
    error.value = 'Failed to save the note. Please try again.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};


// 5. WATCHERS
watch(() => props.initialNotes, (newNotes) => {
  notes.value = newNotes ? [...newNotes] : [];
}, { immediate: true });

watch(newNoteContent, () => {
  nextTick(() => {
    autoResize();
  });
});
</script>

<style scoped>
.form-input {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm;
}

/* Add margin to injected Markdown paragraphs so they don't squish together */
.email-body-wrapper :deep(p) {
    margin-bottom: 0.75rem;
}
.email-body-wrapper :deep(p:last-child) {
    margin-bottom: 0;
}
</style>