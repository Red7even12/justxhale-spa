<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800 uppercase tracking-tight">
        {{ productSlug }} Cases
      </h1>
      <button @click="showModal = true" class="bg-brand-primary text-white px-4 py-2 rounded-lg shadow-md font-bold hover:opacity-90 transition-all">
        + Create New Case
      </button>
    </div>

    <!-- Enhanced Search & Filter Console -->
    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-5">
      
      <!-- Top Row: The 3 Search Blocks -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-5">
        
        <!-- Block 1: General -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Search Case Name / File Reference</label>
          <input 
            v-model="filters.search_general" 
            @input="handleSearchInput('general')" 
            type="text" 
            placeholder="e.g. Estate Late J Doe" 
            class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-gray-50 focus:bg-white transition-colors"
          >
        </div>

        <!-- Block 2: Participant -->
        <div>
          <label class="block text-xs font-bold text-brand-primary uppercase mb-1">Search Participant</label>
          <input 
            v-model="filters.search_participant" 
            @input="handleSearchInput('participant')" 
            type="text" 
            placeholder="e.g. John Doe" 
            class="w-full border-brand-primary/30 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-blue-50/30 focus:bg-white transition-colors"
          >
        </div>

        <!-- Block 3: External Reference -->
        <div>
          <label class="block text-xs font-bold text-brand-primary uppercase mb-1">External Reference (Notes)</label>
          <input 
            v-model="filters.search_external_ref" 
            @input="handleSearchInput('external')" 
            type="text" 
            placeholder="e.g. 9123456789" 
            class="w-full border-brand-primary/30 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm bg-blue-50/30 focus:bg-white transition-colors"
          >
        </div>
      </div>

      <!-- Bottom Row: Select Filters (Disabled if Primary Search is active) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4" :class="{'opacity-50 pointer-events-none': isPrimarySearchActive}">
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
          <select v-model="filters.status" @change="applyFilters" class="w-full border-gray-300 rounded-lg text-sm">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Niche (Type)</label>
          <select v-model="filters.file_type_id" @change="applyFilters" class="w-full border-gray-300 rounded-lg text-sm">
            <option value="">All Niches</option>
            <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Team</label>
          <select v-model="filters.current_team_id" @change="applyFilters" class="w-full border-gray-300 rounded-lg text-sm">
            <option value="">All Teams</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
          </select>
        </div>
        <div class="flex gap-2 items-end">
          <button @click="clearFilters" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2 px-4 rounded-lg transition-colors text-sm border border-gray-200 pointer-events-auto">
            Reset All
          </button>
        </div>
      </div>
      
      <div v-if="isPrimarySearchActive" class="text-xs font-bold text-amber-600 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Primary search active. Standard filters are temporarily disabled.
      </div>
    </div>

    <!-- Case Table (Unchanged, uses same variables) -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden relative">
      <div v-if="isLoading" class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>

      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <!-- Sortable: Case Details -->
            <th @click="toggleSort('file_name')" class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-primary transition-colors group select-none">
              <div class="flex items-center gap-1">
                Case Details
                <span class="text-gray-300 group-hover:text-brand-primary transition-colors">
                  <svg v-if="filters.sort_by === 'file_name' && filters.sort_dir === 'asc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                  <svg v-else-if="filters.sort_by === 'file_name' && filters.sort_dir === 'desc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  <svg v-else class="w-4 h-4 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                </span>
              </div>
            </th>
            
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type / Niche</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
            
            <!-- Sortable: Created -->
            <th @click="toggleSort('created_at')" class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-primary transition-colors group select-none">
              <div class="flex items-center gap-1">
                Created
                <span class="text-gray-300 group-hover:text-brand-primary transition-colors">
                  <svg v-if="filters.sort_by === 'created_at' && filters.sort_dir === 'asc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                  <svg v-else-if="filters.sort_by === 'created_at' && filters.sort_dir === 'desc'" class="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  <svg v-else class="w-4 h-4 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                </span>
              </div>
            </th>
            
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="caseFile in cases" :key="caseFile.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="text-sm font-bold text-gray-900">{{ caseFile.fileName || caseFile.file_name }}</div>
              <div class="text-xs text-gray-400">{{ caseFile.fileReference || caseFile.file_reference || 'No Reference' }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase">
                {{ caseFile.fileType?.name || caseFile.file_type?.name }}
              </span>
            </td>
            <td class="px-6 py-4">
               <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 uppercase tracking-wide">
                {{ caseFile.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ new Date(caseFile.createdAt || caseFile.created_at).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <router-link :to="`/${productSlug}/cases/${caseFile.id}`" class="text-brand-primary hover:underline font-bold">
                View Details
              </router-link>
            </td>
          </tr>
          <tr v-if="cases.length === 0 && !isLoading">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
              No cases found matching your criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

<!-- Server-Side Pagination Controls -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-500 font-medium">
          Showing <span class="font-bold">{{ pagination.from }}</span> to <span class="font-bold">{{ pagination.to }}</span> of <span class="font-bold">{{ pagination.total }}</span> results
        </div>
        <div class="flex gap-2">
          <button 
            @click="changePage(pagination.current_page - 1)" 
            :disabled="pagination.current_page <= 1"
            class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <button 
            @click="changePage(pagination.current_page + 1)" 
            :disabled="pagination.current_page >= pagination.last_page"
            class="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>

    <!-- Create Case Modal (Unchanged structurally, just using the pre-loaded data) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="bg-brand-primary p-6 text-white">
          <h2 class="text-xl font-bold">Initialize New Case</h2>
          <p class="text-xs opacity-80 uppercase tracking-widest mt-1">Product: {{ productSlug }}</p>
        </div>
        
        <form @submit.prevent="createCase" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Classification (Niche)</label>
            <select v-model="form.fileTypeId" required class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm font-medium">
              <option value="">-- Select File Type --</option>
              <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Assigned Team</label>
            <select v-model="form.currentTeamId" required class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm font-medium">
              <option value="">-- Select Team --</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Case Name</label>
            <input v-model="form.fileName" type="text" required placeholder="e.g. Estate Late J Doe" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Internal Reference</label>
            <input v-model="form.fileReference" type="text" placeholder="REF-2026-001" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary">
          </div>

          <div class="flex justify-end gap-3 mt-8">
            <button type="button" @click="showModal = false" class="text-gray-400 font-bold hover:text-gray-600 px-4 py-2">Cancel</button>
            <button type="submit" class="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90">
              Create Case File
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import caseService from '@/services/caseService';
import teamService from '@/services/teamService';

const route = useRoute();
const productSlug = computed(() => route.params.productSlug);

const cases = ref([]);
const fileTypes = ref([]);
const teams = ref([]);
const showModal = ref(false);
const isLoading = ref(false);

// 1. Enhanced filters with standard backend parameter casing
const filters = ref({ 
  search_general: '',
  search_participant: '',
  search_external_ref: '',
  status: '',
  file_type_id: '',
  current_team_id: '',
  sort_by: 'created_at', // Default sort column
  sort_dir: 'desc',      // Default sort direction
  page: 1
});

// 2. Add the sorting toggle logic
const toggleSort = (column) => {
  if (filters.value.sort_by === column) {
    // If already sorting by this column, toggle direction
    filters.value.sort_dir = filters.value.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    // If clicking a new column, sort by it and default to ASC
    filters.value.sort_by = column;
    filters.value.sort_dir = 'asc';
  }
  
  filters.value.page = 1; // Always reset to page 1 when sorting changes
  fetchCases();
};



// Pagination Tracking Object
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0
});

const form = ref({ fileTypeId: '', currentTeamId: '', fileName: '', fileReference: '' });
let searchTimeout = null;

// Initial Load fetches both dropdown data and the first page of cases
const initializePage = async () => {
  try {
    const [ftRes, teamRes] = await Promise.all([
        caseService.getFileTypes(productSlug.value),
        teamService.getTeams()
    ]);
    fileTypes.value = ftRes.data;
    teams.value = Array.isArray(teamRes.data) ? teamRes.data : (teamRes.data.data || []);
    
    fetchCases();
  } catch (error) {
    console.error("Failed to load initial data", error);
  }
};

const fetchCases = async () => {
  isLoading.value = true;
  try {
    const { data } = await caseService.getCases(productSlug.value, filters.value);
    
    cases.value = data.data; 
    
    // Check for both snake_case and camelCase (or wrapped in a meta object)
    const meta = data.meta || data;
    const totalRecords = Number(meta.total) || 0;
    const perPage = Number(meta.per_page || meta.perPage) || 15;

    pagination.value = {
      // Use the API response if available, otherwise strictly lock it to the Vue filter state
      current_page: Number(meta.current_page || meta.currentPage) || filters.value.page,
      last_page: Number(meta.last_page || meta.lastPage) || Math.ceil(totalRecords / perPage) || 1,
      total: totalRecords,
      from: Number(meta.from) || 0,
      to: Number(meta.to) || 0
    };
  } catch (error) {
    console.error("Error fetching cases", error);
  } finally {
    isLoading.value = false;
  }
};

// Debounce search input to prevent spamming the database
const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 400); // Wait 400ms after user stops typing
};

const applyFilters = () => {
  filters.value.page = 1; // Reset to page 1 whenever a filter changes
  fetchCases();
};

// Update clearFilters to reset the sort as well
const clearFilters = () => {
  filters.value = { 
    search_general: '', search_participant: '', search_external_ref: '', 
    status: '', file_type_id: '', current_team_id: '', 
    sort_by: 'created_at', sort_dir: 'desc', page: 1 
  };
  fetchCases();
};

const changePage = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= pagination.value.last_page) {
    filters.value.page = pageNumber;
    fetchCases();
  }
};

const createCase = async () => {
  try {
    await caseService.createCase(productSlug.value, form.value);
    showModal.value = false;
    form.value = { fileTypeId: '', currentTeamId: '', fileName: '', fileReference: '' };
    filters.value.page = 1; // Reset to page 1 to see the new case
    fetchCases();
  } catch (error) {
    alert("Error creating case. Ensure all required fields are selected.");
  }
};

// If the user switches products, refresh the layout entirely
watch(productSlug, () => {
  clearFilters(); // Clear filters triggers a fetch
  initializePage();
});

onMounted(initializePage);
</script>