<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Role-player Roles</h2>
        <p class="text-sm text-gray-500">Define the characters involved in <span class="font-bold text-indigo-600">{{ product?.name }}</span> case files.</p>
      </div>
      <button @click="openModal()" class="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold transition-all">
        + Add Role
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">UI Label</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">System Key</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-indigo-50/30 transition-colors">
            <td class="px-6 py-4 font-bold text-gray-900">{{ role.name }}</td>
            <td class="px-6 py-4 font-mono text-xs text-indigo-400">
                {{ role.roleKey || role.role_key }}
            </td>
            <td class="px-6 py-4 text-center text-sm text-gray-500">
                {{ role.sortOrder || role.sort_order }}
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="role.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'" class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border">
                {{ role.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-sm font-medium">
                <button @click="openModal(role)" class="text-gray-400 hover:text-indigo-600">Edit</button>
                <button @click="deleteRole(role)" class="text-red-400 hover:text-red-600">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-xl font-bold mb-6 text-gray-900 border-b pb-4">{{ form.id ? 'Edit' : 'Create' }} Role</h2>
        
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Display Label</label>
            <input v-model="form.name" type="text" required class="w-full border-gray-300 rounded-lg shadow-sm" placeholder="e.g. Lead Executor">
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">System Key (Unique)</label>
            <input v-model="form.role_key" :disabled="!!form.id" type="text" required class="w-full border-gray-300 rounded-lg shadow-sm font-mono text-sm disabled:bg-gray-100" placeholder="e.g. lead_executor">
            <p class="text-[10px] text-gray-400 mt-1">This key is used by the logic engine and cannot be changed after creation.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-black text-gray-500 uppercase mb-1">Sort Order</label>
                <input v-model="form.sort_order" type="number" class="w-full border-gray-300 rounded-lg shadow-sm">
              </div>
              <div class="flex items-end">
                  <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 w-full h-[42px]">
                    <input v-model="form.is_active" type="checkbox" id="active" class="h-5 w-5 text-indigo-600 border-gray-300 rounded">
                    <label for="active" class="text-xs text-gray-700 font-bold">Active</label>
                  </div>
              </div>
          </div>

          <div class="mt-8 flex justify-end gap-3 pt-4">
            <button type="button" @click="showModal = false" class="text-gray-400 font-bold px-4 py-2">Cancel</button>
            <button type="submit" class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all">
                {{ form.id ? 'Update Role' : 'Save Role' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  product: Object,
  slug: String
});

const { showConfirm, showAlert } = useAlerts();
const roles = ref([]);
const showModal = ref(false);

const form = reactive({
  id: null,
  name: '',
  role_key: '',
  sort_order: 0,
  is_active: true
});

const loadRoles = async () => {
    try {
        const { data } = await apiClient.get(`admin/products/${props.slug}/participant-roles`);
        roles.value = data;
    } catch (e) { console.error(e); }
};

const openModal = (role = null) => {
    if (role) {
        form.id = role.id;
        form.name = role.name;
        form.role_key = role.roleKey || role.role_key;
        form.sort_order = role.sortOrder || role.sort_order;
        form.is_active = !!role.isActive;
    } else {
        form.id = null;
        form.name = '';
        form.role_key = '';
        form.sort_order = roles.value.length;
        form.is_active = true;
    }
    showModal.value = true;
};

const save = async () => {
    try {
        const url = `admin/products/${props.slug}/participant-roles${form.id ? '/' + form.id : ''}`;
        const method = form.id ? 'put' : 'post';
        await apiClient[method](url, form);
        showModal.value = false;
        loadRoles();
        showAlert('Success', 'Role configuration updated.');
    } catch (e) {
        showAlert('Error', e.response?.data?.message || 'Save failed.');
    }
};

const deleteRole = async (role) => {
    if (await showConfirm('Delete Role', `Are you sure? This Character will no longer be available for selection in ${props.product.name}.`)) {
        try {
            await apiClient.delete(`admin/products/${props.slug}/participant-roles/${role.id}`);
            loadRoles();
            showAlert('Success', 'Role removed.');
        } catch (e) { showAlert('Error', 'Action failed.'); }
    }
};

onMounted(loadRoles);
</script>