<template>
  <!-- frontend-spa\src\views\estates\EstatesIndex.vue -->
  <div>

    <EstatesFilter v-model="filters" />

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          
          <div v-if="loading" class="text-center py-8">Loading estates...</div>
          
          <div v-else-if="error" class="text-center py-8 text-red-600">{{ error }}</div>

          <div v-else>
            <!-- The link to the detail page is handled inside this component -->
            <EstatesTable :estates="estates" 
            @manage-estate="navigateToEditEstate" />
            <!-- <Pagination :pagination="paginationData" @page-changed="handlePageChange" /> -->
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui'; // Use @ alias
import { useAuthStore } from '@/store/auth'; // Use @ alias
import { PERMISSIONS } from '@/constants/permissions'; // Use @ alias
import apiClient from '@/services/api.js'; // Use @ alias
import EstatesTable from '@/components/estates/EstatesTable.vue'; // Use @ alias
import EstatesFilter from '@/components/estates/EstatesFilter.vue'; // Import the new filter component

// --- INITIALIZE STORES AND ROUTER ---
const uiStore = useUiStore();
const authStore = useAuthStore();
const router = useRouter();

// --- REACTIVE STATE ---
const estates = ref([]);
const paginationData = ref({});
const filters = ref({
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
});
const loading = ref(true);
const error = ref(null);

// --- NAVIGATION ---
const navigateToAddEstate = () => {
  // This must point to the route that loads EstateForm
  router.push({ name: 'estates.create' }); 
};

const navigateToEditEstate = (estateId) => {
  // This correctly points to the dashboard (EstateEditor)
  router.push({ name: 'estates.edit', params: { id: estateId } });
};

// --- DATA FETCHING LOGIC (Unchanged) ---
const fetchEstates = async (page = 1) => {
    loading.value = true;
    error.value = null;
    try {
        const params = { page, ...filters.value };
        const response = await apiClient.get('/estates', { params });
        estates.value = response.data.data;
        paginationData.value = response.data;
    } catch (err) {
        console.error('Failed to fetch estates:', err);
        if (err.response?.status === 403) {
            error.value = 'You are not authorized to view this page.';
        } else {
            error.value = 'Failed to load estates. Please try again later.';
        }
    } finally {
        loading.value = false;
    }
};

const handlePageChange = (newPage) => {
    fetchEstates(newPage);
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
    fetchEstates();
    
    // THE FIX: We now check for the specific PERMISSION.
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
  // This is correct and remains.
  uiStore.clearHeaderActions();
});

// Watcher for filters (Unchanged)
watch(filters, () => {
    fetchEstates(1);
}, { deep: true });
</script>