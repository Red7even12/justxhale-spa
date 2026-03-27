<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Participant Roles</h2>
      <button @click="openModal()" class="bg-indigo-600 text-white px-4 py-2 rounded shadow">+ Add Role</button>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden border">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 uppercase text-[10px] font-bold text-gray-500">
          <tr>
            <th class="px-6 py-3 text-left">Label Name</th>
            <th class="px-6 py-3 text-left">Internal Key (role_key)</th>
            <th class="px-6 py-3 text-center">Sort Order</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ role.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500"><code>{{ role.roleKey }}</code></td>
            <td class="px-6 py-4 text-center text-sm text-gray-500">{{ role.sortOrder }}</td>
            <td class="px-6 py-4 text-right text-sm">
              <button @click="openModal(role)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
              <button @click="deleteRole(role.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- SIMPLE CRUD MODAL (Standard UI) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
       <div class="bg-white p-6 rounded-lg w-96 shadow-xl">
          <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Role' : 'Add New Role' }}</h3>
          <form @submit.prevent="saveRole" class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-gray-500 uppercase">Role Name (UI Label)</label>
                <input v-model="form.name" required class="w-full border-gray-300 rounded mt-1" placeholder="e.g. Lead Attorney">
             </div>
             <div>
                <label class="block text-xs font-bold text-gray-500 uppercase">Role Key (System Name)</label>
                <input v-model="form.roleKey" :disabled="isEditing" required class="w-full border-gray-300 rounded mt-1 disabled:bg-gray-100" placeholder="e.g. attorney">
             </div>
             <div class="flex justify-end gap-2 pt-4">
                <button type="button" @click="showModal = false" class="text-gray-500">Cancel</button>
                <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded shadow">Save Role</button>
             </div>
          </form>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

const props = defineProps(['slug']); // The product slug from the URL
const roles = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const form = ref({ name: '', roleKey: '', sortOrder: 0 });

const fetchRoles = async () => {
    // API URL matches our new contextual prefix
    const { data } = await apiClient.get(`/admin/products/${props.slug}/participant-roles`);
    roles.value = data;
};

const saveRole = async () => {
    if (isEditing.value) {
        await apiClient.put(`/admin/products/${props.slug}/participant-roles/${form.value.id}`, form.value);
    } else {
        await apiClient.post(`/admin/products/${props.slug}/participant-roles`, form.value);
    }
    showModal.value = false;
    fetchRoles();
};

onMounted(fetchRoles);
</script>