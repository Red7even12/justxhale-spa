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
    <div v-if="isLoading">Loading companies...</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="!isLoading && companies.length === 0" class="text-center text-gray-500 py-4">
      No companies found for the selected filters.
    </div>

    <!-- Company Table -->
    <table v-if="companies.length" class="min-w-full bg-white">
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
            <tr v-for="company in companies" :key="company.id">
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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import companyService from '@/services/companyService';
import teamService from '@/services/teamService'; // Import teamService
import { useAuthStore } from '@/store/auth';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';
import { debounce } from 'lodash';

const authStore = useAuthStore();
const uiStore = useUiStore();
const router = useRouter();
const navigateToCreate = () => {
  router.push({ name: 'companies.create' });
};
const companies = ref([]);
const teamList = ref([]); // New ref for teams
const isLoading = ref(true);
const error = ref(null);
const isModalVisible = ref(false);
const companyToDeactivate = ref(null);

const filters = ref({
  search: '',
  status: 'active',
  team_id: null, // New filter
  is_shared_within_subscriber: false, // New filter
});

const fetchCompanies = async () => {
  try {
    isLoading.value = true;
    const response = await companyService.getCompanies(filters.value);
    // As per your project spec, the middleware converts snake_case to camelCase
    companies.value = response.data.data; 
  } catch (err) {
    error.value = 'Failed to load companies.';
  } finally {
    isLoading.value = false;
  }
};

// New function to fetch teams
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

// Use a watcher to react to filter changes
// Debounce the search input to avoid excessive API calls
watch(() => filters.value.search, debounce((newValue, oldValue) => {
    fetchCompanies();
}, 300)); // 300ms delay

watch(() => filters.value.status, (newValue, oldValue) => {
    fetchCompanies();
});

// New watchers for team_id and is_shared_within_subscriber
watch(() => filters.value.team_id, (newValue, oldValue) => {
    fetchCompanies();
});

watch(() => filters.value.is_shared_within_subscriber, (newValue, oldValue) => {
    fetchCompanies();
});

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