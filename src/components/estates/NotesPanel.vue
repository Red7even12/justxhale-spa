<template>
  <div class="notes-panel">
    <h3 class="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Notes & History</h3>

    <div v-if="!isReadonly" class="mb-4">
      <div class="mb-4">
        <textarea
          ref="textareaRef"
          v-model="newNoteContent"
          class="form-input w-full"
          placeholder="Add a new note..."
          style="min-height: 80px;"
          @input="autoResize"
        ></textarea>
          <div class="mt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            v-model="newCaseNumber"
            class="form-input flex-1"
            placeholder="Case Number (optional)"
          >
          <select 
            v-if="teamMembers.length"
            v-model="taggedUserId" 
            class="form-input flex-1"
          >
            <option :value="null">Tag Team Member (optional)</option>
            <option v-for="member in teamMembers" :key="member.id" :value="member.id">
              Tag: {{ member.firstName || member.first_name }} {{ member.lastName || member.last_name }}
            </option>
          </select>
        </div>
      </div>

      
      <div v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</div>
      
      <!-- Button group with consistent top margin -->
      <div class="mt-2 flex justify-between items-center">
          <div class="space-x-2">
              <button
                  @click="submitNote"
                  :disabled="isLoading || !newNoteContent.trim()"
                  class="btn-primary"
                  :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
              >
                  {{ isLoading ? 'Saving...' : 'Save Note' }}
              </button>
              <button @click="$emit('cancel')" class="btn-secondary">Cancel</button>
              <button @click="showReminderInput = !showReminderInput" class="btn-secondary">Set Reminder</button>
          </div>


            <!-- Status Switcher (Only for Admins) -->
            <div v-if="canManageStatus" class="flex items-center gap-2 border-l pl-4 ml-4 border-gray-200">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                <select v-model="selectedStatus" class="form-input text-xs font-bold py-1 w-32 rounded-lg border-gray-200">
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                
                <button 
                    v-if="selectedStatus !== currentStatus"
                    @click="handleStatusChange" 
                    type="button"
                    :disabled="isLoading"
                    class="px-3 py-1.5 text-[10px] font-black text-white bg-brand-primary rounded-lg shadow-md hover:opacity-90 uppercase tracking-widest transition-all"
                >
                    {{ isLoading ? 'Updating...' : 'Update Status' }}
                </button>
            </div>

          <div v-else-if="currentStatus !== 'open'" class="mb-6 p-3 bg-gray-100 text-gray-500 rounded border border-dashed text-center text-sm font-semibold">
              Adding notes is disabled for inactive, closed and pending cases. 
          </div> 
        </div>
      
    </div>

    <div v-if="showReminderInput" class="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
    <label for="reminder-date" class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
        Set a follow-up date for this note:
    </label>
    
    <!-- Finesse Picker Wrapper -->
    <div class="relative group max-w-sm">
        <!-- Display Layer -->
        <div class="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm group-hover:border-brand-primary transition-colors">
        <span class="text-xs font-bold uppercase tracking-tight" :class="reminderDate ? 'text-brand-blue-700' : 'text-gray-400'">
            {{ reminderDate ? $formatDate(reminderDate) : 'Pick follow-up date...' }}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        </div>
        
        <!-- Hidden Picker Layer -->
        <input 
        id="reminder-date" 
        type="date" 
        v-model="reminderDate" 
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        >
    </div>

    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-2 italic">
        A reminder will be created automatically when you save the note.
    </p>
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
            
            <!-- Tagged User -->
            <div v-if="note.taggedUser || note.tagged_user" class="mb-2 text-xs font-bold text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded border border-orange-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Tagged: {{ (note.taggedUser || note.tagged_user).firstName || (note.taggedUser || note.tagged_user).first_name }} {{ (note.taggedUser || note.tagged_user).lastName || (note.taggedUser || note.tagged_user).last_name }}
            </div>

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
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useAuthStore } from '@/store/auth'; 
import noteService from '@/services/noteService';
import apiClient from '@/services/api'; 
import { useAlerts } from '@/composables/useAlerts'; 

// Allow noteableId to accept strings just in case Vue parses it as a string attribute
const props = defineProps({
  noteableType: { type: String, required: true },
  noteableId: { type: [Number, String], required: true }, 
  contextUrl: { type: String, required: true },
  currentTeamId: { type: [Number, String], default: null },
  isReadonly: { type: Boolean, default: false },
  currentStatus: { type: String, default: 'open' }
});

const emit = defineEmits(['note-added', 'cancel']);

const notes = ref([]);
const newNoteContent = ref('');
const newCaseNumber = ref('');
const taggedUserId = ref(null);
const teamMembers = ref([]);
const isLoading = ref(false);
const error = ref(null);

const authStore = useAuthStore();

const { showAlert, showConfirm } = useAlerts();
const selectedStatus = ref(props.currentStatus);

watch(() => props.currentStatus, (newVal) => {
    selectedStatus.value = newVal;
});

const canManageStatus = computed(() => {
    // 1. Must be in the 'case_file' context
    if (props.noteableType !== 'case_file') return false;

    // 2. Only Subscriber Admins and Case File Admins can change status
    return authStore.hasRole('Subscriber Admin') || authStore.hasRole('Case File Admin');
});

const handleStatusChange = async () => {
    // 1. Requirement Check: Note must be captured
    if (!newNoteContent.value || newNoteContent.value.trim().length < 5) {
        await showAlert('Action Required', 'A status change requires a written reason. Please type it in the note box above first.');
        return;
    }

    // 2. First styled confirmation
    const confirm1 = await showConfirm(
        'Change Case Status', 
        `Are you sure you want to change this case status to ${selectedStatus.value.toUpperCase()}?`
    );
    if (!confirm1) return;

    // 3. Double-Warning (Second styled confirmation)
    const confirm2 = await showConfirm(
        'Final Audit Confirmation', 
        'CRITICAL: This change will be logged in the permanent audit trail. Do you wish to proceed?'
    );
    if (!confirm2) return;

    isLoading.value = true;
    try {
        await apiClient.post(`/${props.contextUrl}/change-status`, {
            status: selectedStatus.value,
            note_content: newNoteContent.value
        });

        await showAlert('Success', 'The case status has been updated.');
        window.location.reload(); 

    } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update status.';
        await showAlert('Error', msg);
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

// Fetch team members if a team ID is provided
const fetchTeamMembers = async () => {
    if (!props.currentTeamId) return;
    try {
        const response = await apiClient.get(`/teams/${props.currentTeamId}`);
        // Robust extraction: check for users directly or inside a data wrapper
        const data = response.data?.data || response.data;
        const allMembers = data.users || [];
        
        // Filter: Only include active team members
        teamMembers.value = allMembers.filter(member => {
            const pivot = member.pivot || {};
            const isActive = pivot.isActive !== undefined ? pivot.isActive : pivot.is_active;
            return isActive === true || isActive === 1 || isActive === '1';
        });
    } catch (err) {
        console.error("Failed to fetch team members", err);
    }
};

onMounted(() => {
    if (props.currentTeamId) {
        fetchTeamMembers();
    }
});

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
    tagged_user_id: taggedUserId.value,
    due_date: (showReminderInput.value && reminderDate.value) ? reminderDate.value : null
  };

  try {
    const response = await apiClient.post(`/${props.contextUrl}/notes`, payload);
    const savedNote = response.data?.data || response.data;

    // Instantly add the new note to the TOP of the array
    notes.value.unshift(savedNote);
    
    // Reset Form
    newNoteContent.value = ''; 
    newCaseNumber.value = '';
    taggedUserId.value = null;
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