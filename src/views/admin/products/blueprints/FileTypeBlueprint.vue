<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Casefile Types</h2>
        <p class="text-sm text-gray-500">Define the specific types of work records within <span class="font-bold text-indigo-600">{{ product?.name }}</span></p>
      </div>
      <button @click="openModal()" class="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold transition-all">
        + Add New Niche
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Casefile Type Name</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">System Slug</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">UX Layout</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Fields</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="niche in niches" :key="niche.id" class="hover:bg-indigo-50/30 transition-colors">
            <td class="px-6 py-4 font-bold text-gray-900">{{ niche.name }}</td>
            <td class="px-6 py-4 font-mono text-xs text-gray-400">{{ niche.slug }}</td>
            <td class="px-6 py-4 text-center">
              <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {{ niche.workspaceTemplate || niche.workspace_template }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-blue-50 text-blue-700 rounded-full h-7 w-7 text-xs font-bold border border-blue-100">
                {{ niche.field_definitions_count ?? niche.fieldDefinitionsCount ?? 0 }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="(niche.is_active ?? niche.isActive) ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'" class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border">
                {{ (niche.is_active ?? niche.isActive) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-sm font-medium">
                <router-link :to="{ name: 'admin.product.file-type-fields', params: { slug: slug, fileTypeId: niche.id } }" class="text-indigo-600 hover:text-indigo-900">Fields</router-link>
                <button @click="openModal(niche)" class="text-gray-400 hover:text-gray-600">Edit</button>
                <button @click="deleteNiche(niche)" class="text-red-400 hover:text-red-600">Archive</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-xl font-bold mb-6 text-gray-900 border-b pb-4">{{ form.id ? 'Edit' : 'Create' }} Niche</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Display Name</label>
            <input v-model="form.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm" placeholder="e.g. Standard Estate">
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">System Slug (Unique)</label>
            <input v-model="form.slug" type="text" class="w-full border-gray-300 rounded-lg shadow-sm font-mono text-sm" placeholder="e.g. standard-estate">
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">UX Layout Engine</label>
            <select v-model="form.workspace_template" class="w-full border-gray-300 rounded-lg shadow-sm">
                <option value="TemplateStandard">Standard Generic Layout</option>
                <option value="TemplateEstateStandard">Estates: 3-Column Manager</option>
            </select>
          </div>

          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input v-model="form.is_active" type="checkbox" id="active" class="h-5 w-5 text-indigo-600 border-gray-300 rounded">
            <label for="active" class="text-sm text-gray-700 font-bold">Niche is Active</label>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <button @click="showModal = false" class="text-gray-400 font-bold px-4 py-2">Cancel</button>
          <button @click="save" class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-indigo-700">
            {{ form.id ? 'Update Niche' : 'Create Niche' }}
          </button>
        </div>
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
const niches = ref([]);
const showModal = ref(false);

const form = reactive({
  id: null,
  name: '',
  slug: '',
  workspace_template: 'TemplateStandard',
  is_active: true
});

const loadNiches = async () => {
  try {
    const { data } = await apiClient.get(`admin/products/${props.slug}/file-types`);
    niches.value = data;
  } catch (error) {
    console.error("Load failed", error);
  }
};

const openModal = (niche = null) => {
  if (niche) {
    form.id = niche.id;
    form.name = niche.name;
    form.slug = niche.slug;
    form.workspace_template = niche.workspace_template;
    form.is_active = !!niche.is_active;
  } else {
    form.id = null;
    form.name = '';
    form.slug = '';
    form.workspace_template = 'TemplateStandard';
    form.is_active = true;
  }
  showModal.value = true;
};

const save = async () => {
  try {
    const url = `admin/products/${props.slug}/file-types${form.id ? '/' + form.id : ''}`;
    const method = form.id ? 'put' : 'post';
    
    const payload = {
        name: form.name,
        slug: form.slug,
        workspace_template: form.workspace_template,
        is_active: form.is_active
    };

    await apiClient[method](url, payload);
    showModal.value = false;
    loadNiches();
    showAlert('Success', 'Niche configuration updated.');
  } catch (error) {
    showAlert('Error', error.response?.data?.message || 'Save failed.');
  }
};

const deleteNiche = async (niche) => {
  if (await showConfirm('Archive Niche', `Archive "${niche.name}"? This will hide it from the product factory.`)) {
    try {
      await apiClient.delete(`admin/products/${props.slug}/file-types/${niche.id}`);
      loadNiches();
      showAlert('Success', 'Niche archived.');
    } catch (error) {
      showAlert('Error', 'Action failed.');
    }
  }
};

onMounted(loadNiches);
</script>