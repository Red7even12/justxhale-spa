<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800 uppercase tracking-tight">
        Users
      </h1>
      <button @click="openAddUserModal" class="bg-[var(--brand-primary)] text-white px-4 py-2 rounded-lg shadow-md font-bold hover:opacity-90 transition-all">
        + Add User
      </button>
    </div>

    <div class="mt-8 flow-root">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div v-if="loading" class="text-center">Loading users...</div>
          <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Roles</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0"><span class="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="user in users" :key="user.id">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{{ user.name }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ user.email }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span v-for="role in user.roles" :key="role.id" class="mr-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">{{ role.name }}</span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span :class="[user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'inline-flex rounded-full px-2 text-xs font-semibold leading-5']">{{ user.isActive ? 'Active' : 'Inactive' }}</span>
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                  <button @click="openEditUserModal(user)" class="text-[var(--c-primary-action)] hover:text-[var(--c-primary-action-hover)] mr-4">Edit Details</button>
                  <button @click="openEditRolesModal(user)" class="text-[var(--c-primary-action)] hover:text-[var(--c-primary-action-hover)]">Edit Roles</button>
                  <button @click="handleForceReset(user)" class="text-sm font-medium text-red-600 hover:text-red-900 ml-4">Force Reset</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

  <!-- Confirmation Mal -->
  <ConfirmationModal
    :show="modalState.show"
    :title="modalState.title"
    :message="modalState.message"
    :confirmButtonText="modalState.confirmButtonText"
    :mode="modalState.mode"
    @confirm="modalState.onConfirm"
    @cancel="modalState.show = false"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../services/api';
import userService from '../../services/userService';
import UserRolesModal from '../../components/admin/UserRolesModal.vue';
import AddUserModal from '../../components/admin/AddUserModal.vue';
import EditUserModal from '../../components/admin/EditUserModal.vue';
import ConfirmationModal from '../../components/modals/ConfirmationModal.vue';

const users = ref([]);
const loading = ref(true);
const error = ref(null);

// State for Edit Roles Modal
const isEditRolesModalOpen = ref(false);
const selectedUserForRoles = ref(null);


// State for Add User Modal
const isAddUserModalOpen = ref(false);

// State for Edit User Modal
const isEditUserModalOpen = ref(false);
const selectedUserForEdit = ref(null);

const modalState = ref({
  show: false,
  title: '',
  message: '',
  confirmButtonText: 'OK',
  mode: 'notify', // 'notify' or 'confirm'
  onConfirm: () => {},
});

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('users');
    users.value = response.data.data;
  } catch (err) {
    console.error("Failed to fetch users:", err);
    error.value = 'Failed to load users. Please try again.';
  } finally {
    loading.value = false;
  }
};

// --- Edit Roles Modal Functions ---
const openEditRolesModal = (user) => {
  // Pass a deep copy to the modal to avoid potential reactivity issues.
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
  }
  closeEditRolesModal();
};

// --- Add User Modal Functions ---
const openAddUserModal = () => {
  isAddUserModalOpen.value = true;
};

const closeAddUserModal = () => {
  isAddUserModalOpen.value = false;
};

const handleUserAdded = (newUser) => {
  users.value.unshift(newUser);
  closeAddUserModal();
};

// --- Edit User Modal Functions ---
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
    // Just update the relevant fields, keeping roles intact
    users.value[index].name = updatedUser.name;
    users.value[index].firstName = updatedUser.firstName;
    users.value[index].lastName = updatedUser.lastName;
    users.value[index].email = updatedUser.email;
    users.value[index].cellNumber = updatedUser.cellNumber;
  }
  closeEditUserModal();
};

const handleForceReset = async (user) => {
  // --- Use the modal for the initial confirmation ---
  modalState.value = {
    show: true,
    title: 'Confirm Password Reset',
    message: `Are you sure you want to force a password reset for ${user.name}? This will invalidate their current password immediately.`,
    confirmButtonText: 'Confirm',
    mode: 'confirm',
    onConfirm: async () => {
      // This logic runs only when the user clicks "Confirm"
      modalState.value.show = false; // Close the confirmation
      try {
        const response = await userService.forceSubscriberPasswordReset(user.id);
        const index = users.value.findIndex(u => u.id === response.data.user.id);
        if (index !== -1) {
          users.value[index] = response.data.user;
        }
        
        // --- Show a SUCCESS notification using the same modal ---
        modalState.value = {
          show: true,
          title: 'Success',
          message: response.data.message,
          confirmButtonText: 'OK',
          mode: 'notify',
          onConfirm: () => modalState.value.show = false,
        };

      } catch (err) {
        // --- Show an ERROR notification using the same modal ---
        modalState.value = {
          show: true,
          title: 'Error',
          message: err.response?.data?.message || 'Failed to initiate password reset.',
          confirmButtonText: 'OK',
          mode: 'notify',
          onConfirm: () => modalState.value.show = false,
        };
      }
    }
  };
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchUsers();
});
</script>