<template>
  <div class="space-y-6">
    <!-- Header Scoped to Product -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Document Packs</h2>
        <p class="text-sm text-gray-500">Manage document requirements for <span class="font-bold text-indigo-600">{{ product?.name }}</span></p>
      </div>
      <button @click="openModal()" class="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold transition-all flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
        </svg>
        New Document Pack
      </button>
    </div>

    <!-- Niche Filter (Only shows niches belonging to THIS product) -->
    <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter by CFile Type:</label>
      <select v-model="filters.fileTypeId" @change="loadPacks" class="border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]">
        <option :value="null">All CFile Types</option>
        <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
      </select>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pack Name</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Casefile Type</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Doc Count</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="pack in packs" :key="pack.id" class="hover:bg-indigo-50/30 transition-colors">
            <td class="px-6 py-4 font-bold text-gray-900">{{ pack.name }}</td>
            <td class="px-6 py-4 text-sm">
              <span v-if="pack.fileType" class="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-medium">
                {{ pack.fileType.name }}
              </span>
              <span v-else class="text-gray-400 italic">Global (All Niches)</span>
            </td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-gray-100 text-gray-800 rounded-full h-7 w-7 text-xs font-bold border border-gray-200">
                {{ pack.document_types_count ?? pack.documentTypesCount ?? 0 }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="(pack.is_active ?? pack.isActive) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border">
                {{ (pack.is_active ?? pack.isActive) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-sm font-medium">
              <button @click="manageDocs(pack)" class="text-indigo-600 hover:text-indigo-900">Manage Docs</button>
              <button @click="openModal(pack)" class="text-gray-400 hover:text-gray-600">Edit</button>
              <button @click="deletePack(pack)" class="text-red-400 hover:text-red-600">Delete</button>
            </td>
          </tr>
          <tr v-if="packs.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-400 italic">
              No document packs configured for this product.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Scoped Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <h2 class="text-xl font-bold mb-4 text-gray-900 border-b pb-4">{{ form.id ? 'Edit' : 'Create' }} Pack</h2>
        
        <div class="space-y-5">
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Pack Name</label>
            <input v-model="form.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Identity & KYC Documents">
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Niche Specificity (Optional)</label>
            <select v-model="form.file_type_id" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option :value="null">Apply to ALL Case Types</option>
              <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input v-model="form.is_active" type="checkbox" id="active" class="h-5 w-5 text-indigo-600 border-gray-300 rounded">
            <label for="active" class="text-sm text-gray-700 font-bold cursor-pointer">Set as Active</label>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100">
          <button @click="showModal = false" class="text-gray-400 font-bold hover:text-gray-600 px-4 py-2">Cancel</button>
          <button @click="save" class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-all">
            {{ form.id ? 'Update Pack' : 'Save Pack' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api'; // Use raw client to handle scoped paths easily
import { useAlerts } from '@/composables/useAlerts';

// Receive product context from the parent layout
const props = defineProps({
  product: { type: Object, required: true },
  slug: { type: String, required: true }
});

const router = useRouter();
const { showConfirm, showAlert } = useAlerts();
const packs = ref([]);
const fileTypes = ref([]);
const showModal = ref(false);

const filters = reactive({
  fileTypeId: null
});

const form = reactive({
  id: null,
  name: '',
  file_type_id: null,
  is_active: true
});

const loadPacks = async () => {
  try {
    const params = filters.fileTypeId ? { file_type_id: filters.fileTypeId } : {};
    const { data } = await apiClient.get(`admin/products/${props.slug}/document-packs`, { params });
    packs.value = data;
  } catch (error) {
    console.error("Failed to load packs", error);
  }
};

const loadFileTypes = async () => {
  try {
    // This will be our next refactor, but for now we fetch niches belonging to this product
    const { data } = await apiClient.get(`admin/products/${props.slug}/file-types`);
    fileTypes.value = data;
  } catch (error) {
    console.error("Failed to load file types", error);
  }
};

const openModal = (pack = null) => {
  if (pack) {
    form.id = pack.id;
    form.name = pack.name;
    form.file_type_id = pack.file_type_id;
    form.is_active = pack.is_active;
  } else {
    form.id = null;
    form.name = '';
    form.file_type_id = filters.fileTypeId || null;
    form.is_active = true;
  }
  showModal.value = true;
};

const save = async () => {
  if (!form.name) return showAlert('Error', 'Pack name is required.');
  
  try {
    const url = `admin/products/${props.slug}/document-packs${form.id ? '/' + form.id : ''}`;
    const method = form.id ? 'put' : 'post';
    
    // Map camelCase to snake_case for DB
    const payload = {
        name: form.name,
        file_type_id: form.file_type_id,
        is_active: form.is_active
    };

    await apiClient[method](url, payload);
    showModal.value = false;
    loadPacks();
    showAlert('Success', 'Document Pack updated.');
  } catch (error) {
    showAlert('Error', 'Failed to save pack.');
  }
};

const deletePack = async (pack) => {
  if (await showConfirm('Delete Pack', `Are you sure? This deletes the pack and all associated requirements within ${props.product.name}.`)) {
    try {
      await apiClient.delete(`admin/products/${props.slug}/document-packs/${pack.id}`);
      loadPacks();
      showAlert('Success', 'Pack deleted.');
    } catch (error) {
      showAlert('Error', 'Cannot delete a pack that is currently in use.');
    }
  }
};

const manageDocs = (pack) => {
    router.push({ 
        name: 'admin.product.pack-types', 
        params: { 
            slug: props.slug, 
            packId: pack.id 
        } 
    });
};

onMounted(() => {
    loadPacks();
    loadFileTypes();
});
</script>