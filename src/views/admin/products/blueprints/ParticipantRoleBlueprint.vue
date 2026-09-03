<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div>
        <router-link v-if="isFoundryContext" :to="{ name: 'admin.niche-factory' }" class="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mb-2">
          ← Back to Niche Factory
        </router-link>
        <h2 class="text-xl font-black text-gray-900 tracking-tight">Role-player Roles</h2>
        <p class="text-sm text-gray-500 mt-1">Define the character vernacular for <span class="font-bold text-indigo-600">{{ contextTitle }}</span> case files.</p>
      </div>
      <button @click="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition-all text-xs">
        + Add Role
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50/80">
          <tr>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">UI Label</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">System Key</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Group on Docs</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Order</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-indigo-50/20 transition-colors">
            <td class="px-6 py-4 font-bold text-gray-900 text-sm">{{ role.name }}</td>
            <td class="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">
                {{ role.roleKey || role.role_key }}
            </td>
            <!-- Group on Docs Badge -->
            <td class="px-6 py-4 text-center">
              <span :class="(role.groupOnDocuments || role.group_on_documents) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-200'" class="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border">
                {{ (role.groupOnDocuments || role.group_on_documents) ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center text-xs font-bold text-gray-600">
                {{ role.sortOrder || role.sort_order }}
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="(role.isActive ?? role.is_active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                {{ (role.isActive ?? role.is_active) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-xs font-bold">
                <button @click="openModal(role)" class="text-gray-500 hover:text-gray-700">Edit</button>
                <button @click="deleteRole(role)" class="text-red-400 hover:text-red-600">Delete</button>
            </td>
          </tr>
          <tr v-if="roles.length === 0">
            <td colspan="6" class="p-10 text-center text-gray-400 italic text-sm">
              No participant roles defined for this Niche yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <h2 class="text-lg font-black text-gray-900 border-b pb-3">{{ form.id ? 'Edit' : 'Create' }} Role</h2>
        
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Display Label</label>
            <input v-model="form.name" type="text" required class="w-full border-gray-300 rounded-lg text-sm" placeholder="e.g. Company Shareholder">
          </div>

          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">System Key (Unique)</label>
            <input v-model="form.role_key" :disabled="!!form.id" type="text" required class="w-full border-gray-300 rounded-lg text-sm font-mono disabled:bg-gray-100" placeholder="e.g. company_shareholder">
            <p class="text-[10px] text-gray-400 mt-1">This key is used by the logic engine and cannot be changed after creation.</p>
          </div>

          <!-- Group on Documents Checkbox -->
          <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
            <input v-model="form.group_on_documents" type="checkbox" id="group_docs" class="mt-0.5 h-4 w-4 text-indigo-600 rounded">
            <div>
              <label for="group_docs" class="text-xs text-gray-900 font-bold block cursor-pointer">Group on Documents</label>
              <p class="text-[10px] text-gray-500 leading-tight mt-0.5">When checked, participants with this role will appear as individual stakeholder tabs on the Documents Checklist.</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-black text-gray-600 uppercase mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" class="w-full border-gray-300 rounded-lg text-sm text-center font-bold">
              </div>
              <div class="flex items-end">
                  <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border w-full h-[42px]">
                    <input v-model="form.is_active" type="checkbox" id="active" class="h-4 w-4 text-indigo-600 rounded">
                    <label for="active" class="text-xs text-gray-700 font-bold cursor-pointer">Active</label>
                  </div>
              </div>
          </div>

          <div class="flex justify-end gap-3 border-t pt-4">
            <button type="button" @click="showModal = false" class="text-gray-400 font-bold text-xs px-4 py-2">Cancel</button>
            <button type="submit" class="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow hover:bg-indigo-700">
                {{ form.id ? 'Update Role' : 'Save Role' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  product: { type: Object, default: null },
  slug: { type: String, default: null },
  niche: { type: Object, default: null },
  fileTypeId: { type: [String, Number], default: null }
});

const { showConfirm, showAlert } = useAlerts();
const roles = ref([]);
const showModal = ref(false);

const isFoundryContext = computed(() => !!props.fileTypeId);
const contextTitle = computed(() => props.niche?.name || props.product?.name || 'Blueprint');

const apiUrl = computed(() => {
  return isFoundryContext.value
    ? `admin/file-types/${props.fileTypeId}/participant-roles`
    : `admin/products/${props.slug}/participant-roles`;
});

const form = reactive({
  id: null,
  name: '',
  role_key: '',
  group_on_documents: false,
  sort_order: 0,
  is_active: true
});

const loadRoles = async () => {
    try {
        const { data } = await apiClient.get(apiUrl.value);
        roles.value = data?.data || data || [];
    } catch (e) { console.error('Failed to load roles', e); }
};

const openModal = (role = null) => {
    if (role) {
        form.id = role.id;
        form.name = role.name;
        form.role_key = role.roleKey || role.role_key;
        form.group_on_documents = !!(role.groupOnDocuments ?? role.group_on_documents);
        form.sort_order = role.sortOrder ?? role.sort_order ?? 0;
        form.is_active = !!(role.isActive ?? role.is_active ?? true);
    } else {
        form.id = null;
        form.name = '';
        form.role_key = '';
        form.group_on_documents = false;
        form.sort_order = roles.value.length;
        form.is_active = true;
    }
    showModal.value = true;
};

const save = async () => {
    try {
        const url = `${apiUrl.value}${form.id ? '/' + form.id : ''}`;
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
    if (await showConfirm('Delete Role', `Are you sure? This character will no longer be available.`)) {
        try {
            await apiClient.delete(`${apiUrl.value}/${role.id}`);
            loadRoles();
            showAlert('Success', 'Role removed.');
        } catch (e) { showAlert('Error', 'Action failed.'); }
    }
};

onMounted(loadRoles);
</script>