<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Core User Management</h1>
      <button
        @click="isAddUserModalOpen = true"
        class="text-[#EBF5F5] hover:text-[#72958D] bg-[#72958D] hover:bg-[#ABE0E0] border border-[#71B6B1] hover:border-[#0F2629] font-bold py-2 px-4 rounded"
      >
        Add Core User
      </button>
    </div>

    <!-- Search / Filter Console -->
    <div class="mb-4">
      <input
        v-model="searchTerm"
        @input="handleSearchInput"
        type="text"
        placeholder="Filter by name or email..."
        class="w-full sm:w-80 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-gray-50 focus:bg-white transition-colors px-3 py-2 border"
      />
    </div>

    <!-- User List -->
    <div v-if="isLoading" class="text-center text-gray-500">Loading users...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" class="divide-y divide-gray-200">
          <li v-for="user in users" :key="user.id">
            <a href="#" class="block hover:bg-gray-50">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-indigo-600 truncate">{{ user.name }}</p>
                  <div class="ml-2 flex-shrink-0 flex">
                    <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                       :class="user.invitation_token ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'">
                       {{ user.invitation_token ? 'Pending Invitation' : 'Active' }}
                    </p>
                    <button @click="openEditModal(user)" class="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
                    <button @click="handleForceReset(user)" class="text-sm font-medium text-red-600 hover:text-red-900">
                      Force Reset
                    </button>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      {{ user.email }}
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Roles: {{ user.roles && user.roles.length ? user.roles.map(role => role.name).join(', ') : 'N/A' }}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </li>
          <li v-if="users.length === 0" class="px-4 py-8 text-center text-gray-500 italic">
            No core users found matching your criteria.
          </li>
        </ul>
      </div>

      <!-- Server-Side Pagination Controls -->
      <div v-if="pagination.last_page > 1" class="bg-gray-50 mt-4 px-6 py-4 border border-gray-200 rounded-lg flex items-center justify-between">
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
    </div>

    <!-- Add User Modal -->
    <AddCoreUserModal
      v-if="isAddUserModalOpen"
      @close="isAddUserModalOpen = false"
      @user-added="handleUserAdded"
    />
      <!-- Edit User Modal -->
    <EditUserModal
      v-if="userToEdit"
      :user="userToEdit"
      context="core"
      @close="userToEdit = null"
      @user-updated="handleUserUpdated"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import userService from '@/services/userService';
import AddCoreUserModal from '@/components/admin/AddCoreUserModal.vue';
import EditUserModal from '@/components/admin/EditUserModal.vue';

const users = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isAddUserModalOpen = ref(false);
const userToEdit = ref(null);

// Server-side pagination state (backend uses Laravel's paginate())
const currentPage = ref(1);
const searchTerm = ref('');
let searchTimeout = null;
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
});

const fetchCoreUsers = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = { page: currentPage.value };
    if (searchTerm.value.trim()) {
      params.search = searchTerm.value.trim();
    }
    const response = await userService.getCoreUsers(params);
    users.value = response.data.data;

    // Store the pagination info from the Laravel paginator.
    // NOTE 1: The backend's CamelCaseResponseMiddleware converts all response
    // keys to camelCase, so accept both snake_case and camelCase keys.
    // NOTE 2: The paginator may be serialized either wrapped ({ data, links, meta })
    // or flat (currentPage/lastPage/total at the top level), so fall back to
    // the whole response body when no meta wrapper is present.
    const meta = response.data.meta || response.data;
    pagination.value = {
      current_page: Number(meta.current_page ?? meta.currentPage) || currentPage.value,
      last_page: Number(meta.last_page ?? meta.lastPage) || 1,
      total: Number(meta.total) || 0,
      from: Number(meta.from) || 0,
      to: Number(meta.to) || 0,
    };
  } catch (err) {
    error.value = 'Failed to load core users.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Debounce search input to prevent spamming the database
const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1; // Reset to page 1 whenever the search changes
    fetchCoreUsers();
  }, 400);
};

const changePage = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= pagination.value.last_page) {
    currentPage.value = pageNumber;
    fetchCoreUsers();
  }
};

const handleUserAdded = () => {
  // Reset to page 1 and re-fetch so the new user is visible and counts stay accurate
  currentPage.value = 1;
  searchTerm.value = '';
  fetchCoreUsers();
  isAddUserModalOpen.value = false;
};

// --- 3. User Edit METHODS ---
const openEditModal = (user) => {
  userToEdit.value = user;
};

const handleUserUpdated = (updatedUser) => {
  // Find the user in the list and replace them with the updated data
  const index = users.value.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users.value[index] = updatedUser;
  } else {
    // The updated user may live on a different page — refresh to stay in sync
    fetchCoreUsers();
  }
  userToEdit.value = null;
};

// --- Forced Password Reset by admins ---
const handleForceReset = async (user) => {
  if (confirm(`Are you sure you want to force a password reset for ${user.name}? This will invalidate their current password immediately.`)) {
    try {
      const response = await userService.forceCoreUserPasswordReset(user.id);
      // We can update the user's status in the list to "Pending"
      const index = users.value.findIndex(u => u.id === response.data.user.id);
      if (index !== -1) {
        users.value[index] = response.data.user;
      }
      alert(response.data.message); // Simple notification for now
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate password reset.');
    }
  }
};

onMounted(fetchCoreUsers);
</script>