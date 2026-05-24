<template>
  <div class="notes-panel">
    <h3 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Notes & History XX</h3>

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
    <!-- NEW: Load More Button -->
    <div v-if="hasMore" class="mt-6 text-center pb-4">
      <button 
          @click="loadMore" 
          :disabled="isLoadingMore"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
      >
          <svg v-if="isLoadingMore" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {{ isLoadingMore ? 'Loading...' : 'Load Older Notes' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import noteService from '@/services/noteService';
import apiClient from '@/services/api'; 

// Allow noteableId to accept strings just in case Vue parses it as a string attribute
const props = defineProps({
  noteableType: { type: String, required: true },
  noteableId: { type: [Number, String], required: true }, 
  contextUrl: { type: String, required: true } 
});

const emit = defineEmits(['note-added', 'cancel']);

const notes = ref([]);
const newNoteContent = ref('');
const newCaseNumber = ref('');
const isLoading = ref(false);
const error = ref(null);

// Pagination State
const currentPage = ref(1);
const hasMore = ref(false);
const isLoadingMore = ref(false);

const showReminderInput = ref(false);
const reminderDate = ref('');
const textareaRef = ref(null);

const autoResize = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};

// --- FETCH LOGIC ---
const fetchNotes = async (page = 1) => {
    if (!props.noteableId) return;

    if (page === 1) isLoading.value = true;
    else isLoadingMore.value = true;

    try {
        const response = await apiClient.get(`/${props.contextUrl}/notes`, {
            params: {
                noteable_type: props.noteableType,
                noteable_id: Number(props.noteableId),
                page: page
            }
        });

        // 1. DIAGNOSTIC: Print the raw response to the browser console!
        console.log("Raw API Response:", response);

        // 2. AGGRESSIVE EXTRACTION
        // Sometimes interceptors unwrap 'data', sometimes they don't. We check every level.
        let payloadData = [];
        let payloadMeta = {};

        if (response.data && response.data.data) {
            // Standard Axios wrapped response
            payloadData = response.data.data;
            payloadMeta = response.data.meta || {};
        } else if (response.data && Array.isArray(response.data)) {
            // Interceptor unwrapped the first 'data' layer, but it's an array?
            payloadData = response.data;
            payloadMeta = response.meta || {};
        } else if (response.data) {
            // Interceptor unwrapped it, and it's our exact JSON object
            payloadData = response.data;
            payloadMeta = response.meta || {};
        } else {
            // Absolute fallback
            payloadData = response;
        }

        console.log("Extracted Meta:", payloadMeta);

        if (page === 1) {
            notes.value = payloadData;
        } else {
            notes.value = [...notes.value, ...payloadData];
        }

        // 3. Assign hasMore using exact boolean matching
        hasMore.value = payloadMeta.has_more === true || payloadMeta.hasMore === true;
        currentPage.value = page;

    } catch (err) {
        console.error("Failed to load notes:", err);
        error.value = "Failed to load history.";
    } finally {
        isLoading.value = false;
        isLoadingMore.value = false;
    }
};
const loadMore = () => {
    if (hasMore.value) fetchNotes(currentPage.value + 1);
};

// --- REACTIVITY: Watch for context changes (e.g., clicking a different document) ---
watch(
    () => props.noteableId, 
    (newId, oldId) => {
        if (newId && newId !== oldId) {
            // Context changed! Reset pagination and fetch fresh data
            notes.value = [];
            hasMore.value = false;
            fetchNotes(1);
        }
    }, 
    { immediate: true } // immediate: true replaces the need for onMounted!
);

// --- SUBMIT LOGIC ---
const submitNote = async () => {
  if (!newNoteContent.value.trim()) return;
  isLoading.value = true;
  error.value = null;

  const payload = {
    noteable_type: props.noteableType,
    noteable_id: Number(props.noteableId), // Force Integer for Laravel Validation
    content: newNoteContent.value,
    case_number: newCaseNumber.value || null,
  };

  try {
    const response = await apiClient.post(`/${props.contextUrl}/notes`, payload);
    const savedNote = response.data?.data || response.data;

    // Instantly add the new note to the TOP of the array
    notes.value.unshift(savedNote);
    
    // Handle Reminder
    if (showReminderInput.value && reminderDate.value) {
        try {
            const reminderPayload = {
                due_date: reminderDate.value,
                notes: newNoteContent.value,
                note_id: savedNote.id, 
                case_workflow_process_id: props.noteableType === 'case_workflow_process' ? Number(props.noteableId) : null,
                case_document_requirement_id: props.noteableType === 'case_document_requirement' ? Number(props.noteableId) : null
            };
            await apiClient.post(`/${props.contextUrl}/reminders`, reminderPayload);
        } catch (remErr) {
            console.error("Failed to create reminder", remErr);
        }
    }

    // Reset Form
    newNoteContent.value = ''; 
    newCaseNumber.value = '';
    reminderDate.value = '';
    showReminderInput.value = false;
    nextTick(autoResize);

    emit('note-added', savedNote);

  } catch (err) {
    // Show exact validation error if Laravel rejects it
    error.value = err.response?.data?.message || 'Failed to save the note. Please try again.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};
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