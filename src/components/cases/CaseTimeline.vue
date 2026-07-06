<template>
  <div class="relative p-6 printable-area bg-white rounded-2xl shadow-sm border border-gray-100">
    
    <!-- Close button -->
    <button @click="$emit('close')" class="no-print absolute top-4 right-4 text-gray-400 hover:text-gray-500">
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
      <button @click="printPage" class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center shadow-sm text-sm">
        <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        <span>{{ isPrintPreview ? 'Print Preview' : 'Print Report' }}</span>
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
      <div class="filter-group">
        <label class="text-xs font-bold uppercase text-gray-500">Case Number:</label>
        <input v-model="caseNumberFilter" type="text" placeholder="e.g. CN12345" class="ml-2 border-gray-300 rounded text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary" />
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
                    <p class="text-sm text-gray-500 flex items-center flex-wrap gap-1">
                        <span class="uppercase text-[10px] font-bold tracking-wider text-gray-400">{{ event.eventType }}</span> 
                        <span class="mx-1 text-gray-300">|</span> 
                        <span class="font-bold text-gray-900">{{ event.originLabel }}</span>
                        <span v-if="event.caseNumber || event.case_number" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            CN: {{ event.caseNumber || event.case_number }}
                        </span>
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
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { formatDateTime } from '@/utils/formatters';

const props = defineProps({
  caseId: { type: [String, Number], required: true },
  caseFile: { type: Object, default: null }
});

defineEmits(['close']);

const route = useRoute();
const router = useRouter();

// Use prop caseId or fall back to route param if needed (though prop is required here)
const effectiveCaseId = computed(() => props.caseId || route.params.id);
const productSlug = computed(() => route.params.productSlug);

// State
const timelineEvents = ref([]);
const internalCaseName = ref('Loading...');
const isLoading = ref(true);
const error = ref(null);
const originFilter = ref('');
const descriptionFilter = ref('');
const caseNumberFilter = ref('');
let debounceTimer;

const caseName = computed(() => {
    if (props.caseFile?.fileName) return props.caseFile.fileName;
    return internalCaseName.value;
});

const isPrintPreview = computed(() => route.name !== 'CaseTimelineReport');

// --- API FETCH ---
const fetchTimeline = async (truncateLimit = 150) => {
  // Initialize filters from route query params when on the report page
  if (route.query.origin_filter) originFilter.value = route.query.origin_filter;
  if (route.query.description_filter) descriptionFilter.value = route.query.description_filter;
  if (route.query.case_number_filter) caseNumberFilter.value = route.query.case_number_filter;

  isLoading.value = true;
  try {
    const params = {
        origin_filter: originFilter.value,
        description_filter: descriptionFilter.value,
        case_number_filter: caseNumberFilter.value,
        truncate_limit: truncateLimit
    };

    const { data } = await apiClient.get(`/${productSlug.value}/cases/${effectiveCaseId.value}/timeline`, { params });
    timelineEvents.value = data; 
  } catch (err) {
    error.value = "Failed to fetch timeline.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const fetchCaseDetails = async () => {
    if (props.caseFile) return;
    try {
        const { data } = await apiClient.get(`/${productSlug.value}/cases/${effectiveCaseId.value}`);
        internalCaseName.value = data.fileName || data.data?.fileName;
    } catch (err) {
        internalCaseName.value = "Unknown Case";
    }
}

// --- ACTIONS ---
const clearFilters = () => {
  originFilter.value = '';
  descriptionFilter.value = '';
  caseNumberFilter.value = '';
};

const exportToCsv = async () => {
  try {
    const params = {
        origin_filter: originFilter.value,
        description_filter: descriptionFilter.value,
        case_number_filter: caseNumberFilter.value,
        truncate_limit: -1
    };

    const { data } = await apiClient.get(`/${productSlug.value}/cases/${effectiveCaseId.value}/timeline`, { params });

    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const columns = [
        { label: 'Date', key: 'eventDate' },
        { label: 'User', key: 'userName' },
        { label: 'Type', key: 'eventType' },
        { label: 'Context', key: 'originLabel' },
        { label: 'Case Number', key: 'caseNumber' },
        { label: 'Description', key: 'description' }
    ];

    const csvRows = [];
    csvRows.push(columns.map(col => col.label).join(','));

    data.forEach(row => {
      const values = columns.map(col => {
        let value = row[col.key];
        if (col.key === 'caseNumber' && value === undefined) {
            value = row['case_number'];
        }
        value = value || '';
        if (col.key === 'eventDate' && value) {
            value = formatDateTime(value);
        }
        value = String(value);
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
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

const printPage = () => {
  // If already on the report page, trigger actual print
  if (route.name === 'CaseTimelineReport') {
    window.print();
    return;
  }
  
  // Otherwise, navigate to the dedicated report page with filter state
  const query = {
    origin_filter: originFilter.value,
    description_filter: descriptionFilter.value,
    case_number_filter: caseNumberFilter.value
  };
  router.push({ 
    name: 'CaseTimelineReport', 
    params: { productSlug: productSlug.value, id: effectiveCaseId.value },
    query
  });
};

// --- WATCHERS ---
watch([originFilter, descriptionFilter, caseNumberFilter], () => {
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

<style>
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
}
</style>
