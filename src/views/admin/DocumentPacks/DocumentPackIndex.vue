<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Document Packs (V2 Engine)</h1>
      <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold transition-colors">
        + Create New Pack
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Filter by Product</label>
        <select v-model="filters.productId" class="w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
          <option :value="null">All Products</option>
          <option v-for="prod in products" :key="prod.id" :value="prod.id">{{ prod.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Filter by Niche</label>
        <select v-model="filters.fileTypeId" class="w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
          <option :value="null">All Niches</option>
          <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
        </select>
      </div>
      <div class="flex items-end">
        <button @click="load" class="bg-gray-100 text-gray-600 px-4 py-2 rounded font-bold hover:bg-gray-200 w-full transition-colors">
          Refresh List
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pack Name</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Context</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Docs Inside</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="pack in packs" :key="pack.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-bold text-gray-900">{{ pack.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">
              <div class="flex flex-col">
                <span class="font-bold text-blue-600">{{ pack.product?.name }}</span>
                <span v-if="pack.fileType" class="text-xs text-gray-400 mt-1">Specific to: {{ pack.fileType.name }}</span>
                <span v-else class="text-xs text-gray-400 mt-1 italic">Global Product Pack</span>
              </div>
            </td>
           <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-gray-100 text-gray-800 rounded-full h-6 w-6 text-xs font-bold">
                <!-- FIX: Check camelCase (Middleware) OR snake_case (Raw) -->
                {{ pack.documentTypesCount || pack.document_types_count || 0 }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <!-- FIX: Check camelCase (Middleware) OR snake_case (Raw) -->
              <span :class="(pack.isActive || pack.is_active) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded text-xs font-bold uppercase">
                {{ (pack.isActive || pack.is_active) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-sm font-medium">
              <button @click="$router.push({ name: 'admin.pack-documents', params: { id: pack.id }})" class="text-blue-600 hover:text-blue-900">
                Manage Docs
              </button>
              <button @click="openModal(pack)" class="text-gray-600 hover:text-gray-900 border-l pl-3 border-gray-300">
                Edit
              </button>
              <button @click="deletePack(pack)" class="text-red-600 hover:text-red-900 border-l pl-3 border-gray-300">
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="packs.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
              No document packs found. Create one to get started!
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">{{ form.id ? 'Edit' : 'Create New' }} Document Pack</h2>
        
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-bold text-gray-700">Pack Name <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Standard Estate Docs">
          </div>

          <!-- Product (Required) -->
          <div>
            <label class="block text-sm font-bold text-gray-700">Product Context <span class="text-red-500">*</span></label>
            <select v-model="form.product_id" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option :value="null" disabled>Select Product</option>
              <option v-for="prod in products" :key="prod.id" :value="prod.id">{{ prod.name }}</option>
            </select>
          </div>

          <!-- Niche (Optional) -->
          <div>
            <label class="block text-sm font-bold text-gray-700">Specific Niche (Optional)</label>
            <select v-model="form.file_type_id" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option :value="null">Apply to All Niches in Product</option>
              <option v-for="type in filteredFileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Leave blank to make this pack available to ALL case types under this product.</p>
          </div>

          <!-- Active Checkbox -->
          <div class="flex items-center">
            <input v-model="form.is_active" type="checkbox" id="active" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="active" class="ml-2 block text-sm text-gray-900 font-bold">Pack is Active</label>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button @click="showModal = false" class="text-gray-500 font-bold hover:text-gray-700 px-4 py-2">Cancel</button>
          <button @click="save" class="bg-blue-600 text-white font-bold px-6 py-2 rounded shadow hover:opacity-90">
            {{ form.id ? 'Update Pack' : 'Create Pack' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import adminService from '@/services/adminService';
import { useAlerts } from '@/composables/useAlerts';

const { showConfirm, showAlert } = useAlerts();
const packs = ref([]);
const products = ref([]);
const fileTypes = ref([]);
const showModal = ref(false);

const form = reactive({
  id: null,
  name: '',
  product_id: null,
  file_type_id: null,
  is_active: true
});

const filters = reactive({
  productId: null,
  fileTypeId: null
});

// Computed: Filter File Types in Modal based on selected Product
const filteredFileTypes = computed(() => {
  if (!form.product_id) return [];
  return fileTypes.value.filter(ft => ft.product_id === form.product_id || ft.productId === form.product_id);
});

const load = async () => {
  try {
    const [packRes, prodRes, ftRes] = await Promise.all([
      adminService.getDocumentPacks(filters), // Pass filters if backend supports query params
      adminService.getProducts(),
      adminService.getFileTypes()
    ]);
    
    packs.value = packRes.data;
    products.value = prodRes.data;
    // Handle pagination wrapper if necessary
    fileTypes.value = Array.isArray(ftRes.data) ? ftRes.data : (ftRes.data.data || []);
  } catch (error) {
    console.error("Failed to load packs", error);
  }
};

const openModal = (pack = null) => {
  if (pack) {
    form.id = pack.id;
    form.name = pack.name;
    
    // FIX: Check for camelCase (Middleware) OR snake_case (Raw DB)
    form.product_id = pack.productId || pack.product_id;
    form.file_type_id = pack.fileTypeId || pack.file_type_id;
    
    // Handle boolean conversion safely
    form.is_active = (pack.isActive !== undefined) ? pack.isActive : !!pack.is_active;
  } else {
    // New Pack Defaults
    form.id = null;
    form.name = '';
    form.product_id = filters.productId || null; 
    form.file_type_id = null;
    form.is_active = true;
  }
  showModal.value = true;
};

const save = async () => {
  if (!form.name || !form.product_id) return showAlert('Error', 'Name and Product are required.');
  
  try {
    if (form.id) {
      await adminService.updateDocumentPack(form.id, form);
    } else {
      await adminService.createDocumentPack(form);
    }
    showModal.value = false;
    load();
    showAlert('Success', 'Pack saved successfully.');
  } catch (error) {
    console.error("Save failed", error);
    showAlert('Error', 'Failed to save pack.');
  }
};

const deletePack = async (pack) => {
  if (await showConfirm('Delete Pack', `Are you sure you want to delete "${pack.name}"? This action cannot be undone.`)) {
    try {
      await adminService.deleteDocumentPack(pack.id);
      load();
      showAlert('Success', 'Pack deleted.');
    } catch (error) {
      console.error("Delete failed", error);
      showAlert('Error', 'Failed to delete pack. Ensure it has no linked documents.');
    }
  }
};

onMounted(load);
</script>