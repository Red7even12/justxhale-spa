<template>
  <!-- frontend-spa\src\views\RemindersDashboard.vue -->
  <div class="p-4 sm:p-6 lg:p-8">

    <!-- Filter Controls Panel -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="filter-group">
          <label for="case_search" class="block text-sm font-medium text-gray-700">Search Case File</label>
          <input id="case_search" type="text" v-model="filters.case_search" placeholder="e.g., Williams H" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div class="filter-group">
          <label for="task_search" class="block text-sm font-medium text-gray-700">Task Keyword</label>
          <input id="task_search" type="text" v-model="filters.task_search" placeholder="e.g., Coded" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div class="filter-group">
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" v-model="filters.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm bg-white">
            <option value="">All Open</option>
            <option value="overdue">Overdue</option>
            <option value="1">Pending</option>
            <option value="2">Completed</option>
            <option value="3">Cancelled</option>
            <option value="4">Escalated</option>
            <option value="all" :disabled="!canShowAll">
                {{ canShowAll ? 'Show All (Disregard Dates)' : 'Show All (Search Case First)' }}
            </option>
          </select>
        </div>

        <!-- From Date Filter -->
        <div class="filter-group" :class="{'opacity-50 pointer-events-none': filters.status === 'all'}">
          <label for="from_date" class="block text-sm font-medium text-gray-700">From</label>
          
          <div class="relative mt-1 group">
            <!-- Display Layer (Finesse Style) -->
            <div class="flex items-center justify-between w-full px-3 h-[38px] bg-white border border-gray-300 rounded-md shadow-sm group-hover:border-brand-blue-500 transition-colors">
              <span class="text-sm font-bold uppercase tracking-tight" :class="filters.from_date ? 'text-brand-blue-700' : 'text-gray-400'">
                {{ filters.from_date ? $formatDate(filters.from_date) : 'Pick Date' }}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-brand-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <!-- Hidden Native Picker -->
            <input 
              id="from_date" 
              type="date" 
              v-model="filters.from_date" 
              :disabled="filters.status === 'all'" 
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <!-- To Date Filter -->
        <div class="filter-group" :class="{'opacity-50 pointer-events-none': filters.status === 'all'}">
          <label for="to_date" class="block text-sm font-medium text-gray-700">To</label>
          
          <div class="relative mt-1 group">
            <!-- Display Layer (Finesse Style) -->
            <div class="flex items-center justify-between w-full px-3 h-[38px] bg-white border border-gray-300 rounded-md shadow-sm group-hover:border-brand-blue-500 transition-colors">
              <span class="text-sm font-bold uppercase tracking-tight" :class="filters.to_date ? 'text-brand-blue-700' : 'text-gray-400'">
                {{ filters.to_date ? $formatDate(filters.to_date) : 'Pick Date' }}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-brand-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <!-- Hidden Native Picker -->
            <input 
              id="to_date" 
              type="date" 
              v-model="filters.to_date" 
              :disabled="filters.status === 'all'" 
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Checkbox Group -->
        <div class="filter-group flex items-end">
          <div class="flex items-center h-10">
            <input 
              id="my_tagged_only" 
              type="checkbox" 
              v-model="filters.my_tagged_only" 
              class="h-4 w-4 text-brand-blue-600 focus:ring-brand-blue-500 border-gray-300 rounded" 
            />
            <label for="my_tagged_only" class="ml-2 block text-sm text-gray-900 font-medium">My Tagged Only</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <div v-if="loading" class="text-center p-12 text-gray-500">Loading reminders...</div>
        <div v-if="error" class="text-center p-12 text-red-600">Error fetching reminders: {{ error }}</div>
        
        <table v-if="!loading && reminders.data && reminders.data.length" class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" @click="handleSort('due_date')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20">Due Date ⇅</th>
              <th scope="col" @click="handleSort('case_name')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Case File ⇅</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Tagged For</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="reminder in reminders.data" :key="reminder.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getDateStatusClass(reminder)">{{ $formatDate(reminder.dueDate || reminder.due_date) }}</td>
              <td class="px-6 py-4">
                <!-- Dynamic Style Injection -->
                <div 
                  :style="reminder.classBgColor ? { backgroundColor: reminder.classBgColor, color: reminder.classTextColor } : {}"
                  :class="[
                    'text-sm font-bold transition-all', 
                    reminder.classBgColor ? 'px-2 py-1 rounded shadow-sm inline-block' : 'text-gray-900'
                  ]"
                >
                  {{ reminder.caseName || reminder.case_name }}
                </div>
                
                <div class="text-[10px] text-gray-400 font-mono mt-0.5">
                  Ref: {{ reminder.caseReference || reminder.case_reference }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ reminder.taskContext || reminder.task_context }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                <span v-if="reminder.taggedUser || reminder.tagged_user" class="text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                  {{ (reminder.taggedUser || reminder.tagged_user).firstName || (reminder.taggedUser || reminder.tagged_user).first_name }}
                  {{ (reminder.taggedUser || reminder.tagged_user).lastName || (reminder.taggedUser || reminder.tagged_user).last_name }}
                </span>
                <span v-else class="text-gray-300 italic">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="getBusinessStatusClass(reminder)">
                  {{ getBusinessStatusLabel(reminder) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-3">
                    
                    <!-- Open Case Button -->
                    <!-- Navigates to the specific tab (Workflow/Documents/Details) based on context -->
                    <button 
                        @click="goToCase(reminder.caseFileId || reminder.case_file_id, reminder.uiTab || reminder.ui_tab)" 
                        class="text-brand-primary hover:text-blue-800 font-bold text-xs uppercase tracking-wide border border-transparent hover:border-blue-200 px-2 py-1 rounded transition-colors"
                    >
                        Open Case
                    </button>
                    
                    <!-- Edit Reminder Details -->
                    <button 
                        @click="openReminderModal(reminder.id)"
                        class="text-gray-500 hover:text-gray-800"
                        title="Edit Reminder Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </button>
                    
                    <!-- Add Note (Context Aware) -->
                    <button 
                        @click="addNote(reminder)" 
                        class="text-gray-400 hover:text-brand-primary"
                        title="Add Note to Context"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
                        </svg>
                    </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="!loading && (!reminders.data || reminders.data.length === 0)" class="text-center p-12 text-gray-500">
          No reminders found matching your criteria.
        </div>
      </div>
    </div>

    <!-- Pagination & Display Controls -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200" 
         v-if="reminders.meta || reminders.total">
        
        <!-- Left: Rows Per Page -->
        <div class="flex items-center text-sm text-gray-700">
            <span class="mr-2">Show</span>
            <select v-model="filters.per_page" class="form-select rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 py-1 text-sm">
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
            </select>
            <span class="ml-2">entries</span>
        </div>

        <!-- Right: Pagination Buttons -->
        <div class="flex items-center space-x-2" v-if="(reminders.meta?.lastPage || reminders.lastPage) > 1">
            <button 
                @click="changePage(filters.page - 1)" 
                :disabled="filters.page <= 1" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>
            
            <span class="text-sm text-gray-700 font-medium">
                Page {{ reminders.meta?.currentPage || reminders.currentPage || filters.page }} of {{ reminders.meta?.lastPage || reminders.lastPage }}
            </span>
            
            <button 
                @click="changePage(filters.page + 1)" 
                :disabled="filters.page >= (reminders.meta?.lastPage || reminders.lastPage)" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </div>
        
        <!-- Fallback text if only 1 page exists -->
        <div v-else class="text-sm text-gray-500">
            Returned: {{ reminders.meta?.total || reminders.total }} Results
        </div>
    </div>
  </div>

  <!-- Notes Modal -->
  <Modal :show="isNotesModalOpen" @close="isNotesModalOpen = false">
    <template #title>{{ notesContext.title }}</template>
    <div class="p-6">
      <NotesPanel
        v-if="notesContext.noteableType && notesContext.noteableId"
        :key="notesContext.noteableId"
        :initial-notes="notesContext.initialNotes"
        :noteable-type="notesContext.noteableType"
        :noteable-id="notesContext.noteableId"
        :context-url="notesContext.contextUrl" 
        :current-team-id="notesContext.currentTeamId"
        @note-added="isNotesModalOpen = false"
        @cancel="isNotesModalOpen = false"
      />
    </div>
  </Modal>

  <ManageReminderModal
    :show="isManageModalOpen"
    :reminder-id="selectedReminderId"
    @close="isManageModalOpen = false"
    @reminder-updated="handleReminderUpdated"
  />

</template>

<script setup>
import { ref, reactive, watch, onMounted, computed, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import reminderService from '@/services/reminderService';
import { debounce } from 'lodash-es';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue';
import ManageReminderModal from '@/components/reminders/ManageReminderModal.vue'; 
import noteService from '@/services/noteService';
import { formatDate } from '@/utils/formatters';
import { useRoute } from 'vue-router'; // Add useRoute
import apiClient from '@/services/api'; // Use generic client instead of reminderService

const route = useRoute(); // Initialize useRoute to access route params
const router = useRouter();

const reminders = ref({});
const loading = ref(true);
const error = ref(null);

const isManageModalOpen = ref(false);
const selectedReminderId = ref(null);

const filters = reactive({
  case_search: '',
  task_search: '',
  status: '', 
  from_date: '',
  to_date: '',
  my_tagged_only: false,
  sort_by: 'due_date',
  sort_dir: 'asc', 
  page: 1,
  per_page: 15 // Default value
});

// Guard: Only allow "Show All" if a Case File search term is provided (prevents DB overload)
const canShowAll = computed(() => filters.case_search.trim().length >= 2);

// Watch for Case search clearing while in "Show All" mode
watch(() => filters.case_search, (newSearch) => {
    if (!newSearch.trim() && filters.status === 'all') {
        filters.status = ''; // Reset to "All Open" to prevent broad queries
    }
});

const isNotesModalOpen = ref(false);
const notesContext = reactive({
  title: '',
  noteableType: null,
  noteableId: null,
  contextUrl: '', 
  currentTeamId: null,
  initialNotes: [],
});

const fetchReminders = async () => {
  loading.value = true;
  error.value = null;
  try {
    const queryParams = { ...toRaw(filters) };
    
    // If status is 'all', disregard dates as requested
    if (queryParams.status === 'all') {
      delete queryParams.from_date;
      delete queryParams.to_date;
    }

    // Clean empty filters
    for (const key in queryParams) {
      if (queryParams[key] === '' || queryParams[key] === null) {
        delete queryParams[key];
      }
    }

    // V2 CALL: /{productSlug}/reminders
    const { data } = await apiClient.get(`/${route.params.productSlug}/reminders`, {
        params: queryParams
    });
    
    reminders.value = data;
  } catch (err) {
    error.value = err.response?.data?.message || 'An unknown error occurred.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await reminderService.getDefaultToDate();
    filters.to_date = response.data.date;
  } catch (err) {
    console.error("Could not fetch default date.", err);
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 3);
    filters.to_date = fallbackDate.toISOString().split('T')[0];
  }
});

const debounceFetch = debounce(() => {
    fetchReminders();
}, 300);

// 1. Reset page to 1 when filters change
watch([
  () => filters.case_search,
  () => filters.task_search,
  () => filters.status,
  () => filters.from_date,
  () => filters.to_date,
  () => filters.per_page,
  () => filters.my_tagged_only
], () => {
    if (filters.page !== 1) {
        filters.page = 1;
    } else {
        debounceFetch();
    }
});

// 2. Just fetch when page or sorting changes
watch([
  () => filters.page,
  () => filters.sort_by,
  () => filters.sort_dir
], () => {
    debounceFetch();
});


const getBusinessStatusLabel = (reminder) => {
  if (reminder.status?.name) return reminder.status.name;
  if (reminder.statusName) return reminder.statusName;
  if (reminder.status_name) return reminder.status_name;

  const statusId = reminder.reminderStatusId || reminder.reminder_status_id;
  if (statusId === 1) return 'Pending';
  if (statusId === 2) return 'Completed';
  if (statusId === 3) return 'Cancelled';
  if (statusId === 4) return 'Escalated';

  if (reminder.completedAt || reminder.completed_at) return 'Completed';

  return 'Pending';
};

const getBusinessStatusClass = (reminder) => {
  const baseClasses = 'px-2 py-0.5 inline-flex items-center text-[10px] uppercase tracking-wider font-bold rounded';
  const label = getBusinessStatusLabel(reminder).toLowerCase();
  switch (label) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
    case 'cancelled':
      return `${baseClasses} bg-gray-100 text-gray-500 border border-gray-200`;
    case 'escalated':
      return `${baseClasses} bg-amber-100 text-orange-800 border border-amber-200`;
    case 'pending':
    default:
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
  }
};

const getDateStatusClass = (reminder) => {
  const status = getBusinessStatusLabel(reminder).toLowerCase();
  
  // If the reminder is already Completed or Cancelled, temporal urgency is no longer active
  if (status === 'completed' || status === 'cancelled') {
    return 'text-gray-400 font-medium';
  }

  const rawDueDate = reminder.dueDate || reminder.due_date;
  if (!rawDueDate) return 'text-gray-500 font-medium';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueDate;
  if (typeof rawDueDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rawDueDate)) {
      const parts = rawDueDate.split(' ')[0].split('-');
      dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
      dueDate = new Date(rawDueDate);
  }
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return 'text-red-600 font-bold'; // Overdue (Red)
  } else if (dueDate.getTime() === today.getTime()) {
    return 'text-green-600 font-bold'; // Due Today (Green)
  } else {
    return 'text-brand-blue-600 font-semibold'; // Due in Future (Blue)
  }
};

const handleSort = (field) => {
  if (filters.sort_by === field) {
    filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    filters.sort_by = field;
    filters.sort_dir = 'asc';
  }
  // No need to call fetchReminders(), the watcher detects the change.
};

const changePage = (newPage) => {
    // Determine the meta object (Resource wrapped or raw paginator)
    const meta = reminders.value.meta || reminders.value;
    const lastPage = meta.lastPage || meta.last_page;

    if (newPage > 0 && lastPage && newPage <= lastPage) {
        filters.page = newPage;
    }
}

const goToCase = (caseId, tab = 'details') => {
  router.push({ 
      name: 'ProductCaseWorkspace', 
      params: { 
          productSlug: route.params.productSlug, 
          id: caseId 
      },
      // If your workspace supports query params for tabs, pass them here
      query: { tab: tab } 
  });
};

const goToWorkflowStep = (estateId, processId) => {
  router.push({ 
    name: 'estates.edit', 
    params: { id: estateId }, 
    hash: `#workflow-step-${processId}` 
  });
};

const addNote = async (reminder) => {
  if (!reminder) return;

  let noteableType, noteableId, titleLabel;

  // 1. Check for Workflow Context
  if (reminder.caseWorkflowProcessId || reminder.case_workflow_process_id) {
    noteableType = 'case_workflow_process';
    noteableId = reminder.caseWorkflowProcessId || reminder.case_workflow_process_id;
    titleLabel = reminder.taskContext || reminder.task_context;
  }
  // 2. Check for Document Context
  else if (reminder.caseDocumentRequirementId || reminder.case_document_requirement_id) {
    noteableType = 'case_document_requirement';
    noteableId = reminder.caseDocumentRequirementId || reminder.case_document_requirement_id;
    titleLabel = reminder.taskContext || reminder.task_context;
  }
  // 3. Fallback: Note on the Reminder itself
  else {
    noteableType = 'reminder';
    noteableId = reminder.id;
    titleLabel = 'General Task';
  }

  // 4. Safely extract Case ID & Name
  const caseId = reminder.caseFileId || reminder.case_file_id;
  const caseName = reminder.caseName || reminder.case_name || 'Unknown Case';
  
  // 5. Set up the Modal Context (No API call needed here!)
  notesContext.title = `Notes: ${caseName} - ${titleLabel}`;
  notesContext.noteableType = noteableType;
  notesContext.noteableId = noteableId;
  notesContext.contextUrl = `${route.params.productSlug}/cases/${caseId}`;
  notesContext.currentTeamId = reminder.case_current_team_id || reminder.caseCurrentTeamId || reminder.teams_id || reminder.teamsId;
  
  // 6. Open the Modal (The NotesPanel component will auto-fetch the data now)
  isNotesModalOpen.value = true;
};

const handleNoteAdded = () => {
  fetchReminders();
};

// --- In the "Action Handlers" section of your script, update openReminderModal ---
const openReminderModal = (reminderId) => {
  selectedReminderId.value = reminderId;
  isManageModalOpen.value = true;
};

// --- ADD A NEW HANDLER to refresh the dashboard data ---
const handleReminderUpdated = () => {
  // The simplest way to see the changes is to refetch the current list
  fetchReminders();
};

</script>