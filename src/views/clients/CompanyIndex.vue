<template>
  <div>
    <!-- Filter and Search Controls -->
    <div class="mb-4 flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
      <div class="flex-grow">
        <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
        <input
          v-model="filters.search"
          type="text"
          id="search"
          placeholder="Search by name or email..."
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select
          v-model="filters.status"
          id="status"
          class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="all">All</option>
        </select>
      </div>
      <!-- Team Filter -->
      <div v-if="teamList.length > 0">
        <label for="team-filter" class="block text-sm font-medium text-gray-700">Team</label>
        <select
          v-model="filters.team_id"
          id="team-filter"
          class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option :value="null">All Teams</option>
          <option v-for="team in teamList" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>
      <!-- Shared Within Subscriber Filter -->
      <div class="flex items-end pb-1">
        <input
          type="checkbox"
          id="is-shared-within-subscriber"
          v-model="filters.is_shared_within_subscriber"
          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label for="is-shared-within-subscriber" class="ml-2 text-sm font-medium text-gray-700">Shared within Subscriber</label>
      </div>
    </div>

    <!-- Loading/Error States -->
    <div v-if="isLoading" class="text-center py-4">Loading companies...</div>
    <div v-if="error" class="text-center py-4 text-red-600">{{ error }}</div>
    <div v-if="!isLoading && companies.data && companies.data.length === 0" class="text-center text-gray-500 py-4">
      No companies found for the selected filters.
    </div>

    <!-- Company Table -->
    <table v-if="companies.data && companies.data.length" class="min-w-full bg-white">
        <thead>
            <tr>
                <th class="py-2 px-4">Name</th>
                <th class="py-2 px-4">Email</th>
                <th class="py-2 px-4">Owning Team</th>
                <th class="py-2 px-4">Status</th>
                <th class="py-2 px-4">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="company in companies.data" :key="company.id">
                <td class="py-2 px-4">{{ company.name }}</td>
                <td class="py-2 px-4">{{ company.email }}</td>
                <td class="py-2 px-4">{{ company.team?.name || 'N/A' }}</td>
                <td class="py-2 px-4">
                    <!-- Status Badge based on isInactive -->
                    <span :class="company.isInactive ? 'badge-danger' : 'badge-success'">
                        {{ company.isInactive ? 'Inactive' : 'Active' }}
                    </span>
                </td>
                <td class="py-2 px-4">
                    <router-link
                        v-if="!company.isInactive && authStore.hasPermission('edit companies')"
                        :to="{ name: 'companies.edit', params: { id: company.id } }"
                        class="text-blue-600 hover:underline mr-4"
                    >
                        Edit
                    </router-link>
                    
                    <!-- Conditional Activate/Deactivate Buttons -->
                    <button
                        v-if="company.isInactive && authStore.hasPermission('deactivate companies')"
                        @click="handleActivate(company.id)"
                        class="text-green-600 hover:underline"
                    >
                        Activate
                    </button>
                    <button
                        v-if="!company.isInactive && authStore.hasPermission('deactivate companies')"
                        @click="promptDeactivation(company.id)"
                        class="text-red-600 hover:underline"
                    >
                        Deactivate
                    </button>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Pagination & Display Controls -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200" 
         v-if="companies.meta">
        
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
        <div class="flex items-center space-x-2" v-if="companies.meta.lastPage > 1">
            <button 
                @click="changePage(filters.page - 1)" 
                :disabled="filters.page <= 1" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
            </button>
            
            <span class="text-sm text-gray-700 font-medium">
                Page {{ companies.meta.currentPage }} of {{ companies.meta.lastPage }}
            </span>
            
            <button 
                @click="changePage(filters.page + 1)" 
                :disabled="filters.page >= companies.meta.lastPage" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </div>
        
        <!-- Fallback text if only 1 page exists -->
        <div v-else class="text-sm text-gray-500">
            Returned: {{ companies.meta.total }} Results
        </div>
    </div>

    <ConfirmationModal
      :show="isModalVisible"
      title="Confirm Deactivation"
      message="Are you sure you want to deactivate this company?"
      confirm-button-text="Deactivate"
      @confirm="confirmDeactivation"
      @cancel="cancelDeactivation"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import companyService from '@/services/companyService';
import teamService from '@/services/teamService';
import { useAuthStore } from '@/store/auth';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';
import { debounce } from 'lodash';

const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();
const navigateToCreate = () => {
  router.push({ name: 'companies.create' });
};
const companies = ref({});
const teamList = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isModalVisible = ref(false);
const companyToDeactivate = ref(null);

const filters = reactive({
  search: '',
  status: 'active',
  team_id: null,
  is_shared_within_subscriber: false,
  page: 1,
  per_page: 15,
});

const fetchCompanies = async () => {
  try {
    isLoading.value = true;
    const queryParams = { ...filters };
    for (const key in queryParams) {
        if (queryParams[key] === '' || queryParams[key] === null) {
            delete queryParams[key];
        }
    }
    const response = await companyService.getCompanies(queryParams);
    companies.value = response.data; 
  } catch (err) {
    error.value = 'Failed to load companies.';
  } finally {
    isLoading.value = false;
  }
};

const fetchTeams = async () => {
  try {
    const response = await teamService.getTeams();
    teamList.value = response.data;
  } catch (err) {
    console.error("Failed to load teams:", err);
  }
};

const handleActivate = async (id) => {
  try {
    await companyService.activateCompany(id);
    fetchCompanies(); // Refresh list
  } catch (err) {
    alert('Failed to activate company.');
  }
};

const promptDeactivation = (id) => {
  companyToDeactivate.value = id;
  isModalVisible.value = true;
};

const confirmDeactivation = async () => {
  if (!companyToDeactivate.value) return;
  try {
    await companyService.deactivateCompany(companyToDeactivate.value);
    fetchCompanies(); // Refresh list
  } catch (err) {
    alert('Failed to deactivate company.');
  } finally {
    isModalVisible.value = false;
    companyToDeactivate.value = null;
  }
};

const cancelDeactivation = () => {
  isModalVisible.value = false;
  companyToDeactivate.value = null;
};

const changePage = (newPage) => {
    if (companies.value.meta && newPage > 0 && newPage <= companies.value.meta.lastPage) {
        filters.page = newPage;
    }
}

const debounceFetch = debounce(() => {
    fetchCompanies();
}, 300);

watch(filters, (newValues, oldValues) => {
    const hasFilterChanged = 
        newValues.search !== oldValues.search ||
        newValues.status !== oldValues.status ||
        newValues.team_id !== oldValues.team_id ||
        newValues.is_shared_within_subscriber !== oldValues.is_shared_within_subscriber ||
        newValues.per_page !== oldValues.per_page;

    if (hasFilterChanged) {
        if (filters.page !== 1) {
            filters.page = 1;
        } else {
            debounceFetch();
        }
    } else {
        debounceFetch();
    }
}, { deep: true });


onMounted(() => {
  fetchCompanies();
  fetchTeams(); // Fetch teams on mount
  if (authStore.hasPermission('create companies')) {
    uiStore.setHeaderActions([
      {
        label: 'Add New Company',
        onClick: navigateToCreate,
      },
    ]);
  }
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});
</script>