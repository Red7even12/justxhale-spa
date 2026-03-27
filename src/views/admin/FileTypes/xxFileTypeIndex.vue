<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Case File Types (Engine V2)</h1>
      <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
        + Add New Niche
      </button>
    </div>

    <!-- Filters Section -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Niche Name</label>
        <input 
          v-model="filters.name" 
          type="text" 
          placeholder="Search niche name..." 
          class="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Product</label>
        <select 
          v-model="filters.productId" 
          class="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        >
          <option :value="null">All Products</option>
          <option v-for="prod in products" :key="prod.id" :value="prod.id">{{ prod.name }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th @click="sortBy('name')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group transition-colors">
              <div class="flex items-center">
                Casefile Name
                <span class="ml-2 inline-block w-4 h-4">
                  <svg v-if="sortKey === 'name' && sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  <svg v-else-if="sortKey === 'name' && sortOrder === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                </span>
              </div>
            </th>
            <th @click="sortBy('product')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group transition-colors">
              <div class="flex items-center">
                Product
                <span class="ml-2 inline-block w-4 h-4">
                  <svg v-if="sortKey === 'product' && sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  <svg v-else-if="sortKey === 'product' && sortOrder === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                </span>
              </div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th @click="sortBy('fieldDefinitionsCount')" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group transition-colors">
              <div class="flex items-center justify-center">
                Fields
                <span class="ml-2 inline-block w-4 h-4">
                  <svg v-if="sortKey === 'fieldDefinitionsCount' && sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  <svg v-else-if="sortKey === 'fieldDefinitionsCount' && sortOrder === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                </span>
              </div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="type in processedFileTypes" :key="type.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-medium text-gray-900">{{ type.name }}</td>
            <td class="px-6 py-4 text-gray-600 text-sm italic">{{ type.product?.name || 'Standard' }}</td>
            <td class="px-6 py-4 text-gray-500 font-mono text-xs">{{ type.slug }}</td>
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-blue-100 text-blue-800 rounded-full h-8 w-8 text-sm font-bold">
                {{ type.field_definitions_count || type.fieldDefinitionsCount || 0 }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                :class="(type.is_active || type.isActive) ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'"
              >
                {{ (type.is_active || type.isActive) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-sm">
              <router-link :to="{ name: 'admin.file-type-fields', params: { id: type.id }}" class="text-indigo-600 hover:text-indigo-900 font-medium">
                Manage Fields
              </router-link>
              <button @click="openModal(type)" class="text-gray-600 hover:text-gray-900 font-medium border-l border-gray-300 pl-3">Edit</button>
              <button @click="confirmDelete(type)" class="text-red-600 hover:text-red-900 font-medium border-l border-gray-300 pl-3">Delete</button>
            </td>
          </tr>
          <tr v-if="processedFileTypes.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-500 italic">
              No niches found matching your current filter criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Simple Modal for Add/Edit -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-xl font-bold mb-4 text-gray-900 border-b pb-2">{{ form.id ? 'Edit' : 'Add New' }} Niche Type</h2>
          <div class="space-y-4">
            <!-- 1. Product -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Product <span class="text-red-500">*</span></label>
              <select v-model="form.product_id" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all">
                <option :value="null" disabled>Select Product</option>
                <option v-for="prod in products" :key="prod.id" :value="prod.id">
                  {{ prod.name }}
                </option>
              </select>
              <p v-if="errors.product_id" class="text-red-500 text-xs mt-1">{{ errors.product_id }}</p>
            </div>

            <!-- 2. Display Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Display Name <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="e.g. Deceased Estate">
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
            </div>

            <!-- 3. Slug -->
            <div>
              <label class="block text-sm font-medium text-gray-700">System Slug (Unique) <span class="text-red-500">*</span></label>
              <input v-model="form.slug" type="text" class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm" placeholder="e.g. deceased-estate">
              <p v-if="errors.slug" class="text-red-500 text-xs mt-1">{{ errors.slug }}</p>
            </div>

            <!-- 4. NEW: Workspace Layout Template -->
            <div class="bg-blue-50 p-3 rounded-md border border-blue-100">
              <label class="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">UX Layout Engine</label>
              <select v-model="form.workspace_template" class="block w-full border border-blue-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                <option v-for="temp in availableTemplates" :key="temp.value" :value="temp.value">
                  {{ temp.label }}
                </option>
              </select>
              <p class="text-xs text-blue-600 mt-1">Controls the dashboard layout for cases of this niche.</p>
            </div>

            <!-- 5. Active Checkbox -->
            <div class="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200 mt-2">
              <input v-model="form.is_active" type="checkbox" id="is_active" class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer">
              <label for="is_active" class="ml-3 block text-sm font-semibold text-gray-700 cursor-pointer">Set as Active</label>
            </div>
          </div>
        <div class="mt-8 flex justify-end space-x-3">
          <button @click="showModal = false" class="text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-md transition-colors font-medium">Cancel</button>
          <button @click="save" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 shadow-md transition-all font-bold">
            {{ form.id ? 'Update Niche' : 'Create Niche' }}
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
const fileTypes = ref([]);
const products = ref([]);
const showModal = ref(false);

// NEW: The Hardcoded list of Vue Templates we have built
const availableTemplates = [
  { value: 'TemplateStandard', label: 'Standard Generic Layout' },
  { value: 'TemplateEstateStandard', label: 'Estates: 3-Column Manager' } // The one matching your V1 Logic
];

// Added workspace_template to form default
const form = ref({ id: null, product_id: null, name: '', slug: '', workspace_template: 'TemplateStandard', is_active: true });
const errors = ref({});

// Sorting and Filtering State
const filters = reactive({
  name: '',
  productId: null
});

const sortKey = ref('name');
const sortOrder = ref('asc');

const load = async () => {
  try {
    const [ftRes, prodRes] = await Promise.all([
      adminService.getFileTypes(),
      adminService.getProducts()
    ]);
    
    // Handle potential pagination wrapper
    fileTypes.value = Array.isArray(ftRes.data) ? ftRes.data : (ftRes.data.data || []);
    products.value = prodRes.data;
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};

// Computed property for filtered and sorted data
const processedFileTypes = computed(() => {
  let result = [...fileTypes.value];

  // Filtering
  if (filters.name) {
    const search = filters.name.toLowerCase();
    result = result.filter(type => type.name.toLowerCase().includes(search));
  }

  if (filters.productId) {
    result = result.filter(type => (type.product_id || type.productId) === filters.productId);
  }

  // Sorting
  result.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    
    let valA, valB;

    if (sortKey.value === 'product') {
      valA = (a.product?.name || 'Standard').toLowerCase();
      valB = (b.product?.name || 'Standard').toLowerCase();
    } else if (sortKey.value === 'fieldDefinitionsCount') {
      valA = Number(a.field_definitions_count || a.fieldDefinitionsCount || 0);
      valB = Number(b.field_definitions_count || b.fieldDefinitionsCount || 0);
    } else {
      valA = (a[sortKey.value] || '').toString().toLowerCase();
      valB = (b[sortKey.value] || '').toString().toLowerCase();
    }

    if (valA < valB) return -1 * modifier;
    if (valA > valB) return 1 * modifier;
    return 0;
  });

  return result;
});

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const openModal = (type = null) => {
  errors.value = {};
  if (type) {
    // Handle camelCase from middleware or snake_case from DB
    const template = type.workspaceTemplate || type.workspace_template || 'TemplateStandard';
    
    form.value = { 
        id: type.id, 
        product_id: type.productId || type.product_id, // Safety check for casing
        name: type.name, 
        slug: type.slug,
        workspace_template: template, // Load the setting
        is_active: !!type.isActive 
    };
  } else {
    form.value = { id: null, product_id: null, name: '', slug: '', workspace_template: 'TemplateStandard', is_active: true };
  }
  showModal.value = true;
};

const confirmDelete = async (type) => {
  if (await showConfirm('Archive Niche Type', `Are you sure you want to archive "${type.name}"? This record will be soft-deleted to maintain history.`)) {
    try {
      await adminService.deleteFileType(type.id);
      showAlert('Success', 'Niche type archived successfully.');
      load();
    } catch (error) {
      console.error('Failed to delete:', error);
      showAlert('Error', 'Failed to archive. The record may be linked to active case files.');
    }
  }
};

const save = async () => {
  errors.value = {};
  if (!form.value.product_id) errors.value.product_id = 'Product is required';
  if (!form.value.name) errors.value.name = 'Name is required';
  if (!form.value.slug) errors.value.slug = 'Slug is required';

  if (Object.keys(errors.value).length > 0) return;

  try {
    await adminService.saveFileType(form.value);
    showModal.value = false;
    load();
  } catch (error) {
    console.error('Failed to save:', error);
    if (error.response && error.response.data && error.response.data.errors) {
      errors.value = error.response.data.errors;
    }
  }
};

onMounted(load);
</script>
