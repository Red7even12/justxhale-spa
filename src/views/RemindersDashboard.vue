<template>
  <div class="p-4 sm:p-6 lg:p-8">

    <!-- Filter Controls Panel -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="filter-group">
          <label for="search" class="block text-sm font-medium text-gray-700">Search Estate/Step</label>
          <input id="search" type="text" v-model="filters.search" placeholder="e.g., Focke123 or Await IT3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
        </div>
        <div class="filter-group">
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" v-model="filters.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
            <option value="">All Open</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="filter-group">
              <label for="from_date" class="block text-sm font-medium text-gray-700">From</label>
              <input id="from_date" type="date" v-model="filters.from_date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
            </div>
            <div class="filter-group">
              <label for="to_date" class="block text-sm font-medium text-gray-700">To</label>
              <input id="to_date" type="date" v-model="filters.to_date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" />
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
              <th scope="col" @click="handleSort('estate_name')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Estate ⇅</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="reminder in reminders.data" :key="reminder.id" :class="getRowClass(reminder)" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ formatDate(reminder.dueDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="font-medium text-gray-900">{{ reminder.estate.name }}</span>
                <!-- <span class="ml-1 text-gray-500" v-if="reminder.estate.executor_ref">({{ reminder.estate.executor_ref }})</span> -->
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ reminder.origin ? reminder.origin.label : 'General' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ reminder.status.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  
                  <!-- START: MODIFIED CODE BLOCK -->
                  <div class="flex items-center space-x-2">
                      <!-- Lock Icon (shows if estate is locked) -->
                      <div v-if="reminder.estate && reminder.estate.lock" 
                          :title="`Locked by ${reminder.estate.lock.user.name}`">
                          <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                      </div>

                      <!-- Estate Button (disabled if locked) -->
                      <button @click="goToEstate(reminder.estate.id)" 
                              :disabled="!!(reminder.estate && reminder.estate.lock)"
                              class="text-brand-blue-600 hover:text-brand-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed">
                          Estate
                      </button>
                      
                      <!-- Step Button (disabled if locked OR for invalid origin) -->
                      <button @click="goToWorkflowStep(reminder.estate.id, reminder.origin.id)" 
                              :disabled="!reminder.origin || reminder.origin.type !== 'sars_workflow' || !!(reminder.estate && reminder.estate.lock)" 
                              class="text-brand-blue-600 hover:text-brand-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed">
                          Step
                      </button>
                      
                      <!-- Manage Button (disabled if locked) -->
                      <button @click="openReminderModal(reminder.id)"
                              :disabled="!!(reminder.estate && reminder.estate.lock)"
                              class="text-brand-blue-600 hover:text-brand-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed">
                          Manage
                      </button>
                      
                      <!-- Note Button (remains enabled) -->
                      <button @click="addNote(reminder)" 
                              class="text-brand-blue-600 hover:text-brand-blue-900">
                          Note
                      </button>
                  </div>
                  <!-- END: MODIFIED CODE BLOCK -->
                  
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="!loading && (!reminders.data || reminders.data.length === 0)" class="text-center p-12 text-gray-500">
          No reminders found matching your criteria.
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="mt-4 flex items-center justify-between" v-if="reminders.meta && reminders.meta.last_page > 1">
        <button @click="changePage(reminders.meta.current_page - 1)" :disabled="!reminders.links.prev" class="btn-secondary !py-1.5 !px-3 !text-sm !normal-case" :class="{'opacity-50 cursor-not-allowed': !reminders.links.prev}">Prev</button>
        <span class="text-sm text-gray-700">Page {{ reminders.meta.current_page }} of {{ reminders.meta.last_page }}</span>
        <button @click="changePage(reminders.meta.current_page + 1)" :disabled="!reminders.links.next" class="btn-secondary !py-1.5 !px-3 !text-sm !normal-case" :class="{'opacity-50 cursor-not-allowed': !reminders.links.next}">Next</button>
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
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import reminderService from '@/services/reminderService';
import { debounce } from 'lodash-es';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue';
import ManageReminderModal from '@/components/reminders/ManageReminderModal.vue'; 
import noteService from '@/services/noteService';
import { formatDate } from '@/utils/formatters';

const router = useRouter();

const reminders = ref({});
const loading = ref(true);
const error = ref(null);

const isManageModalOpen = ref(false);
const selectedReminderId = ref(null);

const filters = reactive({
  search: '',
  status: '', 
  from_date: '',
  to_date: '',
  sort_by: 'due_date',
  sort_dir: 'asc', 
  page: 1,
  per_page: 15
});

const isNotesModalOpen = ref(false);
const notesContext = reactive({
  title: '',
  noteableType: null,
  noteableId: null,
  initialNotes: [],
});

const fetchReminders = async () => {
  loading.value = true;
  error.value = null;
  try {
    const queryParams = { ...filters };
    for (const key in queryParams) {
      if (queryParams[key] === '' || queryParams[key] === null) {
        delete queryParams[key];
      }
    }
    const response = await reminderService.getReminders(queryParams);
    reminders.value = response.data;
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

watch(filters, debounce(() => {
  if (filters.page !== 1) {
  } else {
    fetchReminders();
  }
}, 300), { deep: true });

const getRowClass = (reminder) => {
  if (reminder.status.name === 'Completed') {
    return 'bg-green-50';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(reminder.due_date);
  if (dueDate < today) {
    return 'bg-red-50';
  }
  if (dueDate.getTime() === today.getTime()) {
    return 'bg-yellow-50';
  }
  return '';
};

const handleSort = (field) => {
  if (filters.sort_by === field) {
    filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    filters.sort_by = field;
    filters.sort_dir = 'asc';
  }
  fetchReminders();
};

const changePage = (newPage) => {
    if (newPage > 0 && newPage <= reminders.value.meta.last_page) {
        filters.page = newPage;
        fetchReminders();
    }
}

const goToEstate = (estateId) => {
  router.push({ name: 'estates.edit', params: { id: estateId } });
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

  if (reminder.origin) {
    // It's a reminder linked to a workflow or document
    noteableType = reminder.origin.type;
    noteableId = reminder.origin.id;
    titleLabel = reminder.origin.label;
  } else {
    // It's a "General" reminder, so the note is on the reminder itself
    noteableType = 'reminder';
    noteableId = reminder.id;
    titleLabel = 'General';
  }

  if (!noteableType || !noteableId) {
    alert("Cannot add a note to a reminder with an unknown origin.");
    return;
  }
  
  notesContext.title = `Notes for: ${reminder.estate.name} - ${titleLabel}`;
  notesContext.noteableType = noteableType;
  notesContext.noteableId = noteableId;
  notesContext.initialNotes = [];
  isNotesModalOpen.value = true;

  try {
    const response = await noteService.getNotes(noteableType, noteableId);
    notesContext.initialNotes = response.data.data;
  } catch (err) {
    console.error("Failed to fetch notes history:", err);
    isNotesModalOpen.value = false;
    alert('Could not load notes history.');
  }
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