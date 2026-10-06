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
            <div class="block hover:bg-gray-50">
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-indigo-600 truncate">{{ user.name }}</p>
                  <div class="ml-2 flex-shrink-0 flex items-center gap-2">
                    
                    <!-- Invitation Pill -->
                    <span v-if="user.invitation_token" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending Invitation
                    </span>

                    <!-- ⭐ INTERACTIVE ACTIVE TOGGLE PILL ⭐ -->
                    <button
                      type="button"
                      @click="triggerStatusToggle(user)"
                      :class="[
                        user.is_active !== false && user.isActive !== false 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200',
                        'px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full transition-all cursor-pointer'
                      ]"
                      :title="'Click to ' + (user.is_active !== false ? 'Deactivate' : 'Activate')"
                    >
                      {{ user.is_active !== false && user.isActive !== false ? 'Active' : 'Inactive' }}
                    </button>

                    <button @click="openEditModal(user)" class="text-sm font-medium text-indigo-600 hover:text-indigo-900 ml-2">
                      Edit
                    </button>
                    <button @click="triggerForceReset(user)" class="text-sm font-medium text-red-600 hover:text-red-900">
                      Force Reset
                    </button>
                    <button 
                      @click="openAuditModal(user)" 
                      class="text-xs font-medium text-gray-500 hover:text-gray-800 hover:underline mr-3"
                    >
                      Audit Trail
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
            </div>
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

    <!-- ⭐ COMPLIANCE SECURITY ACTION MODAL ⭐ -->
    <SecurityActionModal
      :show="securityModal.show"
      :title="securityModal.title"
      :actionType="securityModal.actionType"
      :targetUser="securityModal.user"
      :confirmButtonText="securityModal.confirmButtonText"
      :isSubmitting="securityModal.isSubmitting"
      @confirm="executeSecurityAction"
      @cancel="securityModal.show = false"
    />

    <UserSecurityLogModal
      :show="isAuditModalOpen"
      :user="selectedUserForAudit"
      :context="isProductContext ? 'subscriber' : 'core'"
      @close="isAuditModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import userService from '@/services/userService';
import AddCoreUserModal from '@/components/admin/AddCoreUserModal.vue';
import EditUserModal from '@/components/admin/EditUserModal.vue';
import SecurityActionModal from '@/components/modals/SecurityActionModal.vue';
import UserSecurityLogModal from '@/components/modals/UserSecurityLogModal.vue';

const users = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isAddUserModalOpen = ref(false);
const userToEdit = ref(null);

const selectedUserForAudit = ref(null);
const isAuditModalOpen = ref(false);

const openAuditModal = (user) => {
  selectedUserForAudit.value = user;
  isAuditModalOpen.value = true;
};

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

const securityModal = ref({
  show: false,
  title: '',
  actionType: '',
  user: null,
  confirmButtonText: 'Confirm',
  isSubmitting: false,
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

const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
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
  currentPage.value = 1;
  searchTerm.value = '';
  fetchCoreUsers();
  isAddUserModalOpen.value = false;
};

const openEditModal = (user) => {
  userToEdit.value = user;
};

const handleUserUpdated = (updatedUser) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users.value[index] = { ...users.value[index], ...updatedUser };
  } else {
    fetchCoreUsers();
  }
  userToEdit.value = null;
};

// --- SECURITY ACTION HANDLERS ---
const triggerStatusToggle = (user) => {
  const isCurrentlyActive = user.is_active !== false && user.isActive !== false;
  securityModal.value = {
    show: true,
    user,
    actionType: isCurrentlyActive ? 'deactivate' : 'activate',
    title: isCurrentlyActive ? 'Deactivate Core User' : 'Activate Core User',
    confirmButtonText: isCurrentlyActive ? 'Deactivate Account' : 'Activate Account',
    isSubmitting: false,
  };
};

const triggerForceReset = (user) => {
  securityModal.value = {
    show: true,
    user,
    actionType: 'force-reset',
    title: 'Force Password Reset',
    confirmButtonText: 'Wipe Password & Issue Reset',
    isSubmitting: false,
  };
};

const executeSecurityAction = async ({ user, actionType, reason }) => {
  securityModal.value.isSubmitting = true;
  try {
    if (actionType === 'activate' || actionType === 'deactivate') {
      const response = await userService.toggleUserStatus(user.id, reason, 'core');
      const updated = response.data.user;
      const index = users.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users.value[index].is_active = updated.is_active;
        users.value[index].isActive = updated.is_active;
      }
    } else if (actionType === 'force-reset') {
      await userService.forcePasswordResetWithReason(user.id, reason, 'core');
      alert(`Password reset link dispatched to ${user.email}. Previous password immediately revoked.`);
    }
    securityModal.value.show = false;
  } catch (err) {
    alert(err.response?.data?.message || 'Action failed. Please verify permissions.');
  } finally {
    securityModal.value.isSubmitting = false;
  }
};

onMounted(fetchCoreUsers);
</script>