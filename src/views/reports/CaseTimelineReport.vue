<template>
  <div class="relative p-4 sm:p-6 lg:p-8 printable-area bg-white min-h-screen">
    
    <!-- Close button (Returns to Workspace) -->
    <button @click="close" class="no-print absolute top-4 right-4 text-gray-400 hover:text-gray-500">
      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Header -->
    <div class="flex justify-between items-center mb-6 no-print">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Event Timeline: {{ caseName }}</h1>
        <p class="text-sm text-gray-500 mt-1">Full audit trail of all actions, notes, and reminders.</p>
      </div>
      <button @click="printPage" class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center shadow-sm">
        <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        <span>Print Report</span>
      </button>
    </div>

    <!-- Print Header -->
    <div class="print-only hidden mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ caseName }} - Timeline Report</h1>
      <p class="text-sm text-gray-600">Generated: {{ new Date().toLocaleDateString() }}</p>
    </div>

    <!-- Filters -->
    <div class="filters no-print mb-8 flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div class="filter-group">
        <label class="text-xs font-bold uppercase text-gray-500">Filter Source:</label>
        <input v-model="originFilter" type="text" placeholder="e.g. SARS, Executor" class="ml-2 border-gray-300 rounded text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary" />
      </div>
      <div class="filter-group">
        <label class="text-xs font-bold uppercase text-gray-500">Search Content:</label>
        <input v-model="descriptionFilter" type="text" placeholder="e.g. email, call" class="ml-2 border-gray-300 rounded text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary" />
      </div>
      <div class="flex gap-2 ml-auto">
        <button @click="clearFilters" class="text-gray-500 hover:text-gray-700 font-bold text-xs underline px-2">Clear Filters</button>
        <button @click="exportToCsv" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs shadow">Export CSV</button>
      </div>
    </div>
    
    <!-- Content -->
    <div v-if="isLoading" class="text-center py-12 text-gray-400 font-bold">Loading timeline...</div>
    <div v-else-if="error" class="text-center py-12 text-red-600 font-bold">{{ error }}</div>

    <div v-else class="flow-root">
      <ul role="list" class="-mb-8">
        <li v-for="(event, eventIdx) in timelineEvents" :key="event.id">
          <div class="relative pb-8">
            <span v-if="eventIdx !== timelineEvents.length - 1" class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
            <div class="relative flex space-x-3">
              <div>
                <span :class="getIconBgClass(event.eventType)" class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                  <!-- Note Icon -->
                  <svg v-if="event.eventType === 'Note Added'" class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd"></path></svg>
                  <!-- Task/Reminder Icon -->
                  <svg v-else class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
              </div>
              <div class="flex min-w-0 flex-1 space-x-4 pt-1.5">
                <div class="whitespace-nowrap text-left text-sm text-gray-500 w-32 shrink-0">
                    <div class="font-bold text-gray-700">{{ formatDateTime(event.eventDate) }}</div>
                    <div class="text-[10px] uppercase text-gray-400">by {{ event.userName }}</div>
                </div>
                <div class="grow">
                    <p class="text-sm text-gray-500">
                        <span class="uppercase text-[10px] font-bold tracking-wider text-gray-400">{{ event.eventType }}</span> 
                        <span class="mx-1 text-gray-300">|</span> 
                        <span class="font-bold text-gray-900">{{ event.originLabel }}</span>
                    </p>
                    <div class="mt-1 text-gray-800 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap font-mono text-xs">
                        {{ event.description }}
                    </div>
                </div>
              </div> 
            </div>
          </div>
        </li>
      </ul>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { formatDateTime } from '@/utils/formatters';

const route = useRoute();
const router = useRouter();

// We get the ID from the route params
const caseId = route.params.id;
const productSlug = route.params.productSlug;

// State
const timelineEvents = ref([]);
const caseName = ref('Loading...');
const isLoading = ref(true);
const error = ref(null);
const originFilter = ref('');
const descriptionFilter = ref('');
let debounceTimer;

// --- API FETCH ---
const fetchTimeline = async (truncateLimit = 150) => {
  isLoading.value = true;
  try {
    const params = {
        origin_filter: originFilter.value,
        description_filter: descriptionFilter.value,
        truncate_limit: truncateLimit
    };

    const { data } = await apiClient.get(`/${productSlug}/cases/${caseId}/timeline`, { params });
    
    // CamelCase Mapping (if Middleware handles it, great. If not, map manually)
    // Assuming Middleware maps SQL 'event_date' to 'eventDate'
    timelineEvents.value = data; 

  } catch (err) {
    error.value = "Failed to fetch timeline.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const fetchCaseDetails = async () => {
    try {
        const { data } = await apiClient.get(`/${productSlug}/cases/${caseId}`);
        caseName.value = data.fileName;
    } catch (err) {
        caseName.value = "Unknown Case";
    }
}

// --- ACTIONS ---
const clearFilters = () => {
  originFilter.value = '';
  descriptionFilter.value = '';
};

const exportToCsv = async () => {
  try {
    // 1. Fetch full, unfiltered data (limit -1)
    // We reuse the existing filters (origin/description) so the export matches what the user searched for
    const params = {
        origin_filter: originFilter.value,
        description_filter: descriptionFilter.value,
        truncate_limit: -1
    };

    const { data } = await apiClient.get(`/${productSlug}/cases/${caseId}/timeline`, { params });

    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    // 2. Define Headers & Map Data
    // We explicitly define the columns we want, rather than dumping everything
    const columns = [
        { label: 'Date', key: 'eventDate' },
        { label: 'User', key: 'userName' },
        { label: 'Type', key: 'eventType' },
        { label: 'Context', key: 'originLabel' },
        { label: 'Description', key: 'description' }
    ];

    const csvRows = [];
    
    // Add Header Row
    csvRows.push(columns.map(col => col.label).join(','));

    // Add Data Rows
    data.forEach(row => {
      const values = columns.map(col => {
        let value = row[col.key] || '';

        // Specific Formatting
        if (col.key === 'eventDate' && value) {
            value = formatDateTime(value);
        }

        // CSV Escaping: Wrap in quotes if it contains comma, newline, or double quotes
        value = String(value);
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes
        }
        
        return value;
      });
      
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');

    // 3. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Timeline_${caseName.value.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error("Failed to export CSV:", err);
    alert("Could not export data.");
  }
};

const getIconBgClass = (eventType) => {
  if (eventType === 'Note Added') return 'bg-blue-500';
  if (eventType === 'Reminder Action') return 'bg-green-500';
  return 'bg-gray-400';
};

const printPage = () => window.print();

const close = () => {
    router.push({ 
        name: 'ProductCaseWorkspace', 
        params: { productSlug, id: caseId } 
    });
};

// --- WATCHERS ---
watch([originFilter, descriptionFilter], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchTimeline();
  }, 500);
});

onMounted(() => {
  fetchTimeline();
  fetchCaseDetails();
});
</script>

<style scoped>
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
}
</style>