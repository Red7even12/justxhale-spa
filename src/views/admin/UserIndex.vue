<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800 uppercase tracking-tight">
        {{ isProductContext ? 'Product Users' : 'Global Users Directory' }}
      </h1>
      <button @click="openAddUserModal" class="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg shadow-md font-bold hover:opacity-90 transition-all">
        + Add User
      </button>
    </div>

    <!-- Search / Filter Console -->
    <div>
      <input
        v-model="searchTerm"
        @input="handleSearchInput"
        type="text"
        placeholder="Filter by name or email..."
        class="w-full sm:w-80 border-gray-300 rounded-lg focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] text-sm bg-gray-50 focus:bg-white transition-colors px-3 py-2 border"
      />
    </div>

    <div class="mt-8 flow-root">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div v-if="loading" class="text-center py-8 text-gray-500 font-medium">Loading users...</div>
          <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th v-if="!isProductContext" scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subscriber / Org</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Roles</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status (Click to toggle)</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="user in users" :key="user.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                  {{ user.name }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {{ user.email }}
                </td>
                
                <td v-if="!isProductContext" class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span v-if="user.subscriber" class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {{ user.subscriber.name }}
                  </span>
                  <span v-else-if="user.subscribers && user.subscribers.length > 0" class="flex flex-wrap gap-1">
                    <span v-for="sub in user.subscribers" :key="sub.id" class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {{ sub.name }}
                    </span>
                  </span>
                  <span v-else class="text-xs italic text-gray-400">Platform Core</span>
                </td>

                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span v-for="role in user.roles" :key="role.id" class="mr-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">{{ role.name }}</span>
                </td>
                
                <!-- ⭐ INTERACTIVE STATUS TOGGLE PILL ⭐ -->
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <button
                    type="button"
                    @click="triggerStatusToggle(user)"
                    :class="[
                      user.isActive !== false && user.is_active !== false 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200',
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer'
                    ]"
                    :title="'Click to ' + (user.isActive !== false && user.is_active !== false ? 'Deactivate' : 'Activate')"
                  >
                    <span class="h-2 w-2 rounded-full" :class="user.isActive !== false && user.is_active !== false ? 'bg-green-600' : 'bg-red-600'"></span>
                    {{ user.isActive !== false && user.is_active !== false ? 'Active' : 'Inactive' }}
                  </button>
                </td>

                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                  <button @click="openEditUserModal(user)" class="text-[var(--c-primary-action,#2563eb)] hover:underline mr-3">Edit Details</button>
                  <button @click="openEditRolesModal(user)" class="text-[var(--c-primary-action,#2563eb)] hover:underline mr-3">Edit Roles</button>
                  <button @click="triggerForceReset(user)" class="text-sm font-medium text-red-600 hover:underline">Force Reset</button>
                  <button @click="openAuditModal(user)" class="text-xs font-medium text-gray-500 hover:text-gray-800 hover:underline mr-3">Audit Trail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Server-Side Pagination Controls -->
    <div v-if="pagination.last_page > 1" class="bg-gray-50 px-6 py-4 border border-gray-200 rounded-lg flex items-center justify-between">
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

  <!-- Modal for Editing User Roles -->
  <UserRolesModal 
    v-if="isEditRolesModalOpen" 
    :user="selectedUserForRoles" 
    @close="closeEditRolesModal" 
    @user-updated="handleUserUpdate" 
  />

  <!-- Modal for Adding a New User -->
  <AddUserModal
    v-if="isAddUserModalOpen"
    @close="closeAddUserModal"
    @user-added="handleUserAdded"
  />

  <EditUserModal
    v-if="isEditUserModalOpen"
    :user="selectedUserForEdit"
    context="subscriber"
    @close="closeEditUserModal"
    @user-updated="handleUserDetailsUpdate"
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../../services/api';
import userService from '../../services/userService';
import UserRolesModal from '../../components/admin/UserRolesModal.vue';
import AddUserModal from '../../components/admin/AddUserModal.vue';
import EditUserModal from '../../components/admin/EditUserModal.vue';
import SecurityActionModal from '../../components/modals/SecurityActionModal.vue';
import UserSecurityLogModal from '@/components/modals/UserSecurityLogModal.vue';

const route = useRoute();
const users = ref([]);
const loading = ref(true);
const error = ref(null);

const isProductContext = computed(() => !!route.params.productSlug);
const productSlug = computed(() => route.params.productSlug);

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

const isEditRolesModalOpen = ref(false);
const selectedUserForRoles = ref(null);
const isAddUserModalOpen = ref(false);
const isEditUserModalOpen = ref(false);
const selectedUserForEdit = ref(null);

const selectedUserForAudit = ref(null);
const isAuditModalOpen = ref(false);

const openAuditModal = (user) => {
  selectedUserForAudit.value = user;
  isAuditModalOpen.value = true;
};

// Security Action Modal State
const securityModal = ref({
  show: false,
  title: '',
  actionType: '',
  user: null,
  confirmButtonText: 'Confirm',
  isSubmitting: false,
});

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = { page: currentPage.value };
    if (searchTerm.value.trim()) {
      params.search = searchTerm.value.trim();
    }
    if (isProductContext.value && productSlug.value) {
      params.product_slug = productSlug.value;
    }

    const response = await apiClient.get('users', { params });
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
    console.error("Failed to fetch users:", err);
    error.value = 'Failed to load users. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchUsers();
  }, 400);
};

const changePage = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= pagination.value.last_page) {
    currentPage.value = pageNumber;
    fetchUsers();
  }
};

const openEditRolesModal = (user) => {
  selectedUserForRoles.value = JSON.parse(JSON.stringify(user));
  isEditRolesModalOpen.value = true;
};

const closeEditRolesModal = () => {
  isEditRolesModalOpen.value = false;
  selectedUserForRoles.value = null;
};

const handleUserUpdate = (updatedUser) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users.value[index] = updatedUser;
  } else {
    fetchUsers();
  }
  closeEditRolesModal();
};

const openAddUserModal = () => {
  isAddUserModalOpen.value = true;
};

const closeAddUserModal = () => {
  isAddUserModalOpen.value = false;
};

const handleUserAdded = () => {
  currentPage.value = 1;
  searchTerm.value = '';
  fetchUsers();
  closeAddUserModal();
};

const openEditUserModal = (user) => {
  selectedUserForEdit.value = JSON.parse(JSON.stringify(user));
  isEditUserModalOpen.value = true;
};

const closeEditUserModal = () => {
  isEditUserModalOpen.value = false;
  selectedUserForEdit.value = null;
};

const handleUserDetailsUpdate = (updatedUser) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users.value[index] = { ...users.value[index], ...updatedUser };
  } else {
    fetchUsers();
  }
  closeEditUserModal();
};

// --- SECURITY ACTION HANDLERS ---
const triggerStatusToggle = (user) => {
  const isCurrentlyActive = user.isActive !== false && user.is_active !== false;
  securityModal.value = {
    show: true,
    user,
    actionType: isCurrentlyActive ? 'deactivate' : 'activate',
    title: isCurrentlyActive ? 'Deactivate User Account' : 'Activate User Account',
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
      const response = await userService.toggleUserStatus(user.id, reason, 'subscriber');
      const updated = response.data.user;
      const index = users.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users.value[index].isActive = updated.is_active;
        users.value[index].is_active = updated.is_active;
      }
    } else if (actionType === 'force-reset') {
      await userService.forcePasswordResetWithReason(user.id, reason, 'subscriber');
      alert(`Password reset link dispatched to ${user.email}. Previous password immediately revoked.`);
    }
    securityModal.value.show = false;
  } catch (err) {
    alert(err.response?.data?.message || 'Action failed. Please verify permissions.');
  } finally {
    securityModal.value.isSubmitting = false;
  }
};

watch(() => route.params.productSlug, () => {
  currentPage.value = 1;
  fetchUsers();
});

onMounted(() => {
  fetchUsers();
});
</script>