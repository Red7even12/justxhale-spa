<template>
  <div class="relative p-4 sm:p-6 lg:p-8 printable-area">
    <!-- Close button (from original) -->
    <button @click="close" class="no-print absolute top-4 right-4 text-gray-400 hover:text-gray-500">
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Header for Print View (from original) -->
    <div class="print-only">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Event Timeline: {{ estateName }}</h1>
      <p class="text-sm text-gray-600 mb-6">Date Printed: {{ new Date().toLocaleDateString() }}</p>
    </div>

    <!-- Main Header for Screen View (merged) -->
    <div class="flex justify-between items-center mb-6 no-print">
      <h1 class="text-2xl font-bold text-gray-900">Event Timeline: {{ estateName }}</h1>
      <button @click="printPage" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
        <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm2 0v3h6V4H7zm6 7H7v2h6v-2z" clip-rule="evenodd" /></svg>
        <span>Print to PDF</span>
      </button>
    </div>

    <!-- 1. Filters: Brought in from our table-based version -->
    <div class="filters no-print mb-8 flex flex-wrap items-center gap-4">
      <div class="filter-group">
        <label for="origin-filter" class="text-sm font-medium text-gray-700">Filter by Type:</label>
        <input 
          id="origin-filter"
          v-model="originFilter" 
          type="text" 
          placeholder="e.g., RegRep, DEC, Cod"
          class="ml-2 border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div class="filter-group">
        <label for="description-filter" class="text-sm font-medium text-gray-700">Search Description:</label>
        <input 
          id="description-filter"
          v-model="descriptionFilter" 
          type="text" 
          placeholder="e.g., complain, coding"
          class="ml-2 border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <button @click="clearFilters" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">Clear Filters</button>
      <button @click="exportToCsv" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Export Full Data to CSV</button>
    </div>
    
    <!-- Loading/Error State -->
    <div v-if="isLoading" class="text-center text-gray-500">Loading timeline...</div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>

    <!-- 2. Main Content: Using the visual timeline layout from your original component -->
    <div v-else class="flow-root">
      <ul role="list" class="-mb-8">
        <li v-for="(event, eventIdx) in timelineEvents" :key="event.id">
          <div class="relative pb-8">
            <!-- Vertical line -->
            <span v-if="eventIdx !== timelineEvents.length - 1" class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
            <div class="relative flex space-x-3">
              <div>
                <!-- Event Type Icon -->
                <span :class="getIconBgClass(event.eventType)" class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                  <!-- Icon for Notes -->
                  <svg v-if="event.eventType.includes('Note')" class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path></svg>
                  <!-- Icon for Reminders -->
                  <svg v-else class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"></path></svg>
                </span>
              </div>
              <div class="flex min-w-0 flex-1 space-x-4 pt-1.5">
                <!-- Date/User block is first -->
              <div class="whitespace-nowrap text-left text-sm text-gray-500">
                    <!-- CHANGED: event.event_date -> event.eventDate -->
                    <time :datetime="event.eventDate">{{ formatDate(event.eventDate) }}</time>
                      <!-- CHANGED: event.user_name -> event.userName -->
                      <p class="text-xs">by {{ event.userName }}</p>
                </div>
                <!-- Details block is second, now default-aligned (left) -->
                <div>
                    <p class="text-sm text-gray-500">
                        <!-- CHANGED: event.event_type -> event.eventType -->
                        <!-- CHANGED: event.origin_label -> event.originLabel -->
                        {{ event.eventType }} on <span class="font-medium text-gray-900">{{ event.originLabel }}</span>
                    </p>
                    <p class="mt-1 text-sm text-gray-800 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">
                        {{ event.description }}
                        <!-- CHANGED: event.note_id -> event.noteId -->
                        <button v-if="event.noteId && event.description.endsWith('...')" @click="showFullNote(event.noteId)" class="ml-2 text-blue-600 hover:underline font-semibold no-print">
                          View Full Note
                        </button>
                    </p>
                </div>
              </div> 
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Full Note Modal -->
    <div v-if="isModalVisible" class="modal-overlay no-print">
      <div class="modal-content">
        <h3 class="text-lg font-bold mb-4">Full Note Content</h3>
        <div v-if="isLoadingNote" class="text-center">
          <p>Loading...</p>
        </div>
        <div v-else class="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
          {{ fullNoteContent }}
        </div>
        <button @click="isModalVisible = false" class="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Close
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// We are using axios directly now, but you can adapt this to your service layer
import estateService from '@/services/estateService'; // Still needed for estate name

// --- Props ---
const props = defineProps({
  id: { type: String, required: true }
});

// --- State ---
const timelineEvents = ref([]);
const estateName = ref('');
const isLoading = ref(true);
const error = ref(null);
const originFilter = ref('');
const descriptionFilter = ref('');
let debounceTimer;

// --- NEW MODAL STATE ---
const isModalVisible = ref(false);
const fullNoteContent = ref('');
const isLoadingNote = ref(false);

// --- Data Fetching ---

// --- Data Fetching ---
const fetchTimeline = async (truncateLimit = 150) => {
  isLoading.value = true;
  const params = new URLSearchParams();
  if (originFilter.value) params.append('origin_filter', originFilter.value);
  if (descriptionFilter.value) params.append('description_filter', descriptionFilter.value);
  params.append('truncate_limit', truncateLimit);

  try {
    const response = await estateService.getEstateTimeline(props.id, params);
    timelineEvents.value = response.data;
  } catch (err) {
    error.value = "Failed to fetch timeline events.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// NEW: Fetch estate details for the title, similar to your original component
const fetchEstateDetails = async () => {
    try {
        const estateResponse = await estateService.getEstate(props.id);
        estateName.value = estateResponse.data.data.estateName;
    } catch (err) {
        console.error("Failed to fetch estate name:", err);
        estateName.value = "Unknown Estate";
    }
}

// --- Methods ---
const clearFilters = () => {
  originFilter.value = '';
  descriptionFilter.value = '';
};

const showFullNote = async (noteId) => {
  isModalVisible.value = true;
  isLoadingNote.value = true;
  try {
    const response = await estateService.getNote(noteId);
    fullNoteContent.value = response.data.data.content;
  } catch (err) {
    console.error("Failed to fetch full note:", err);
    fullNoteContent.value = "Could not load note content. Please try again.";
  } finally {
    isLoadingNote.value = false;
  }
};

const exportToCsv = async () => {
  try {
    // 1. Fetch full, unfiltered data
    await fetchTimeline(-1); 

    if (!timelineEvents.value || timelineEvents.value.length === 0) {
      alert('No data available to export.');
      return;
    }

    // 2. Generate CSV content by sorting headers into a specific order
    const allHeaders = Object.keys(timelineEvents.value[0]);
    const priorityOrder = ['eventDate', 'userName', 'eventType', 'originLabel', 'description'];

    const sortedHeaders = [...allHeaders].sort((a, b) => {
        const aIdx = priorityOrder.indexOf(a);
        const bIdx = priorityOrder.indexOf(b);

        if (aIdx === -1 && bIdx === -1) return 0; // both not in priority, keep original relative order
        if (aIdx === -1) return 1; // a is not in priority, b is. b comes first.
        if (bIdx === -1) return -1; // b is not in priority, a is. a comes first.
        return aIdx - bIdx; // both are in priority, sort by their index in the priority list
    });

    const headers = sortedHeaders;
    const csvRows = [headers.join(',')]; // Header row

    timelineEvents.value.forEach(item => {
      const values = headers.map(header => {
        let value = item[header] === null || item[header] === undefined ? '' : item[header];
        
        // Format date specifically for CSV export
        if (header === 'eventDate' && value) {
          const d = new Date(value);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          value = `${day}/${month}/${year} ${hours}:${minutes}`;
        }

        // Escape quotes and handle commas by wrapping the value in double quotes
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""'); // Escape double quotes
          if (value.includes(',')) {
            value = `"${value}"`; // Wrap in double quotes if it contains a comma
          }
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    // 3. Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const fileName = `EstateTimeline_${props.id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Failed to export CSV:", err);
    error.value = "Could not export data. Please try again.";
  } finally {
    // 4. Re-fetch truncated data for the screen view
    await fetchTimeline(150);
  }
};

// --- Helper Functions (from original) ---
const router = useRouter();

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Use 24-hour time
  });
};

// IMPROVED: More robust icon logic
const getIconBgClass = (eventType) => {
  if (eventType.startsWith('Note') || eventType.startsWith('SARS') || eventType.startsWith('Doc')) {
    return 'bg-blue-500';
  }
  if (eventType.startsWith('Reminder')) {
    return 'bg-green-500';
  }
  return 'bg-gray-400';
};

const printPage = () => window.print();
const close = () => router.push({ name: 'estates.edit', params: { id: props.id } });

// --- Lifecycle & Watchers ---
watch([originFilter, descriptionFilter], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchTimeline();
  }, 500);
});

onMounted(() => {
  fetchTimeline();
  fetchEstateDetails(); // Also fetch the estate name on load
});
</script>

<style>
/* Print styles (from original) */
.print-only {
  display: none;
}
@media print {
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  body * {
    visibility: hidden;
  }
  .printable-area, .printable-area * {
    visibility: visible;
  }
  .printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  /* Force printing of background colors and images */
  .printable-area * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 50%;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>