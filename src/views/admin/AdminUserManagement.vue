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
        </ul>
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

const fetchCoreUsers = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await userService.getCoreUsers();
    users.value = response.data.data; // Assuming pagination
  } catch (err) {
    error.value = 'Failed to load core users.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleUserAdded = (newUser) => {
  users.value.unshift(newUser); // Add the new user to the top of the list
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