<template>
  <!-- frontend-spa\src\views\estates\EstatesIndex.vue -->
  <div>

    <EstatesFilter 
        :model-value="filters" 
        @update:model-value="updateFilters"
        @apply-filters="handleApplyFilters"
        @clear-filters="handleClearFilters"
    />

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          
          <div v-if="loading" class="text-center py-8">Loading estates...</div>
          
          <div v-else-if="error" class="text-center py-8 text-red-600">{{ error }}</div>

          <div v-else-if="estates.data && estates.data.length > 0">
            <EstatesTable :estates="estates.data" @manage-estate="navigateToEditEstate" />
            
            <!-- Pagination & Display Controls -->
            <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200" v-if="estates.meta">
                
                <!-- Left: Rows Per Page -->
                <div class="flex items-center text-sm text-gray-700">
                    <span class="mr-2">Show</span>
                    <select 
                    v-model="filters.per_page" 
                    @change="handlePerPageChange" 
                    class="form-select rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 py-1 text-sm">
                        <option :value="10">10</option>
                        <option :value="15">15</option>
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                    </select>
                    <span class="ml-2">entries</span>
                </div>

                <!-- Right: Pagination Buttons -->
                <div class="flex items-center space-x-2" v-if="estates.meta.lastPage > 1">
                    <button 
                        @click="changePage(filters.page - 1)" 
                        :disabled="filters.page <= 1" 
                        class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    
                    <span class="text-sm text-gray-700 font-medium">
                        Page {{ estates.meta.currentPage }} of {{ estates.meta.lastPage }}
                    </span>
                    
                    <button 
                        @click="changePage(filters.page + 1)" 
                        :disabled="filters.page >= estates.meta.lastPage" 
                        class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
                
                <!-- Fallback text if only 1 page exists -->
                <div v-else class="text-sm text-gray-500">
                    Returned: {{ estates.meta.total }} Results
                </div>
            </div>
          </div>
          <div v-else class="text-center py-8">No estates found.</div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { PERMISSIONS } from '@/constants/permissions';
import apiClient from '@/services/api.js';
import EstatesTable from '@/components/estates/EstatesTable.vue';
import EstatesFilter from '@/components/estates/EstatesFilter.vue';

const uiStore = useUiStore();
const authStore = useAuthStore();
const router = useRouter();

const estates = ref({});
const loading = ref(false); // Changed to false so we don't show loading on empty start
const error = ref(null);

const filters = reactive({
    estate_name: '',
    executor: '',
    case_number_reported: '',
    surname: '',
    names: '',
    deceased_id_number: '',
    de_tax_number_pre: '',
    de_tax_number_post: '',
    loe_loa: '',
    date_of_death: '',
    attorney: '', // Ensure this exists
    page: 1,
    per_page: 15,
});

const navigateToAddEstate = () => {
  router.push({ name: 'estates.create' }); 
};

const navigateToEditEstate = (estateId) => {
  router.push({ name: 'estates.edit', params: { id: estateId } });
};

const fetchEstates = async () => {
    loading.value = true;
    error.value = null;
    try {
        const queryParams = { ...filters };
        
        // Ensure per_page is an integer
        queryParams.per_page = parseInt(queryParams.per_page);

        // Clean empty keys
        for (const key in queryParams) {
            if (queryParams[key] === '' || queryParams[key] === null) {
                delete queryParams[key];
            }
        }
        
        const response = await apiClient.get('/estates', { params: queryParams });
        estates.value = response.data;
    } catch (err) {
        console.error('Failed to fetch estates:', err);
        error.value = err.response?.status === 403 
            ? 'You are not authorized to view this page.' 
            : 'Failed to load estates. Please try again later.';
    } finally {
        loading.value = false;
    }
};

// --- EVENTS FROM CHILD FILTER ---

// 1. Sync State (Does NOT Fetch)
const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters);
};

// 2. Apply Button Clicked (Fetches Data)
const handleApplyFilters = () => {
    filters.page = 1; // Always reset to page 1 on new search
    fetchEstates();
};

// 3. Clear Button Clicked (Fetches Data)
const handleClearFilters = () => {
    filters.page = 1;
    // Note: The child component emits the cleared values via updateFilters first,
    // so filters is already cleared when this runs.
    fetchEstates();
};

// --- PAGINATION ---
const changePage = (newPage) => {
    if (estates.value.meta && newPage > 0 && newPage <= estates.value.meta.lastPage) {
        filters.page = newPage;
        fetchEstates();
    }
};

// --- ROWS PER PAGE ---
// Since we removed the watcher, changing the dropdown needs a trigger
const handlePerPageChange = () => {
    filters.page = 1;
    fetchEstates();
};

onMounted(() => {
    // OPTIONAL: If you want the screen to start EMPTY, remove this line.
    // If you want to show the latest 15 records, keep it.
    fetchEstates();
    
    if (authStore.hasPermission(PERMISSIONS.ESTATES_CREATE)) {
        uiStore.setHeaderActions([
          {
            label: 'Add Estate',
            onClick: navigateToAddEstate
          }
        ]);
    }
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});
</script>