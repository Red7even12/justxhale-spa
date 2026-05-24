<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-black text-gray-900 tracking-tight">Contacts & Companies Registry</h1>
      <button @click="openModal()" class="bg-brand-primary text-white px-6 py-2 rounded-xl shadow-lg shadow-indigo-100 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
        + Add New Entity
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[250px]">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Search Registry</label>
        <input v-model="filters.search" @input="fetchEntities" type="text" placeholder="Name or ID Number..." class="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm">
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entity Category</label>
        <select v-model="filters.type" @change="fetchEntities" class="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold">
          <option value="">All Types</option>
          <option value="company">Companies</option>
          <option value="individual">Individuals</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Name / Type</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
            <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
            <th class="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="entity in entities" :key="entity.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-bold text-gray-900">{{ entity.name }}</div>
              <div class="text-[10px] text-gray-400 uppercase font-black">{{ entity.entity_type || entity.entityType }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
              {{ entity.identification_number || entity.identificationNumber || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="font-bold text-gray-700">{{ entity.email }}</div>
              <div class="text-xs">{{ entity.phone_primary || entity.phonePrimary }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openModal(entity)" class="text-indigo-600 hover:text-indigo-900 font-black text-xs uppercase mr-4">Edit</button>
              <button @click="deleteEntity(entity.id)" class="text-red-400 hover:text-red-600 font-black text-xs uppercase">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div class="bg-brand-primary p-6 text-white flex justify-between items-center">
            <h2 class="text-xl font-black uppercase tracking-tight">{{ isEditing ? 'Edit Entity' : 'Add New Entity' }}</h2>
            <button @click="showModal = false" class="text-white/50 hover:text-white">✕</button>
        </div>
        
        <form @submit.prevent="saveEntity" class="p-8 space-y-6 overflow-y-auto">
          
          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entity Type</label>
                <div class="flex gap-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" v-model="form.entityType" value="company" class="text-indigo-600">
                        <span class="text-sm font-bold text-gray-700">Company</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" v-model="form.entityType" value="individual" class="text-indigo-600">
                        <span class="text-sm font-bold text-gray-700">Individual</span>
                    </label>
                </div>
            </div>

            <div class="col-span-2">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name / Company Name</label>
                <input v-model="form.name" type="text" required class="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold">
            </div>

            <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID / Registration Number</label>
                <input v-model="form.identificationNumber" type="text" class="w-full border-gray-200 rounded-xl font-mono">
            </div>

            <div v-if="form.entityType === 'individual'">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Linked Company</label>
                <select v-model="form.parentId" class="w-full border-gray-200 rounded-xl text-sm font-bold">
                    <option :value="null">None</option>
                    <option v-for="co in companies" :key="co.id" :value="co.id">{{ co.name }}</option>
                </select>
            </div>

            <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                <input v-model="form.email" type="email" class="w-full border-gray-200 rounded-xl text-sm">
            </div>

            <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Phone</label>
                <input v-model="form.phonePrimary" type="text" class="w-full border-gray-200 rounded-xl text-sm">
            </div>

            <!-- DYNAMIC GLOBAL METADATA (DNA) -->
            <div v-if="entityFieldDefinitions.length > 0" class="col-span-2 mt-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div class="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4 border-b border-emerald-200 pb-2">Global Registry DNA (Shared across all cases)</div>
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="field in entityFieldDefinitions" :key="field.id">
                        <label class="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{{ field.fieldLabel }}</label>
                        <input 
                            v-model="form.meta_data[field.fieldKey]" 
                            :type="field.fieldType === 'date' ? 'date' : (field.fieldType === 'number' ? 'number' : 'text')"
                            class="w-full border-emerald-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        >
                    </div>
                </div>
            </div>

            <div class="col-span-2 flex items-center gap-2">
                <input type="checkbox" v-model="form.isActive" id="is_active" class="rounded text-indigo-600">
                <label for="is_active" class="text-xs font-black text-gray-500 uppercase tracking-tighter cursor-pointer">Entity is Active</label>
            </div>
          </div>

          <div class="mt-8 flex justify-between items-center pt-6 border-t border-gray-100">
             <div class="flex items-center">
                <input type="checkbox" v-model="createAndStay" id="stay" class="rounded text-indigo-600">
                <label for="stay" class="ml-2 text-xs font-bold text-gray-400">Create & Stay</label>
             </div>
             <div class="flex gap-3">
                <button type="button" @click="showModal = false" class="text-sm font-black text-gray-400 uppercase tracking-widest px-4">Cancel</button>
                <button type="submit" class="bg-brand-primary px-8 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:opacity-90 transition-all">
                  {{ isEditing ? 'Update Entity' : 'Save Entity' }}
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import entityService from '@/services/entityService';
import apiClient from '@/services/api';
import { useRoute } from 'vue-router';
const route = useRoute();

const entities = ref([]);
const companies = ref([]);
const entityFieldDefinitions = ref([]); // DNA Definitions
const showModal = ref(false);
const isEditing = ref(false);
const createAndStay = ref(false);
const filters = ref({ search: '', type: '' });

const form = ref({
  id: null,
  entityType: 'individual',
  name: '',
  identificationNumber: '',
  parentId: null,
  email: '',
  phonePrimary: '',
  isActive: true,
  meta_data: {} // DNA Storage
});

const fetchDefinitions = async () => {
    try {
        // We pass the product slug from the current URL to get the right DNA
        // Assuming your URL is something like /justxhale/registry
        const productSlug = route.params.productSlug || 'justxhale'; 
        
        const response = await apiClient.get(`/entity-field-definitions?product_slug=${productSlug}`);
        entityFieldDefinitions.value = response.data.data || [];
        console.log("DNA for Product:", productSlug, entityFieldDefinitions.value);
    } catch (error) {
        console.error("Failed to fetch DNA definitions:", error);
    }
};

const fetchEntities = async () => {
  const { data } = await entityService.getEntities(filters.value);
  entities.value = data.data || (Array.isArray(data) ? data : []);
};

const fetchCompanies = async () => {
  const { data } = await entityService.getCompanies();
  companies.value = data.data || (Array.isArray(data) ? data : []);
};

const openModal = async (entity = null) => {
  // 1. Refresh definitions to ensure we have the latest DNA
  await fetchDefinitions();
  fetchCompanies();
  
  if (entity) {
    isEditing.value = true;
    
    // 2. Identify the metadata block (check both naming conventions)
    const rawMeta = entity.meta_data || entity.metaData || {};
    
    // 3. Map standard fields
    form.value = { 
        id: entity.id,
        entityType: entity.entity_type || entity.entityType || 'individual',
        name: entity.name,
        identificationNumber: entity.identification_number || entity.identificationNumber || '',
        parentId: entity.parent_id || entity.parentId || null,
        email: entity.email,
        phonePrimary: entity.phone_primary || entity.phonePrimary || '',
        isActive: entity.is_active !== undefined ? entity.is_active : true,
        meta_data: {} // Initialize clean
    };

    // 4. THE FIX: Robust DNA Mapping
    // Loop through every defined DNA field and find its value in the metadata
    entityFieldDefinitions.value.forEach(def => {
        const key = def.fieldKey || def.field_key;
        // Create the camelCase version (tax_number -> taxNumber)
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

        // Try to find the value under either key
        form.value.meta_data[key] = rawMeta[key] !== undefined 
            ? rawMeta[key] 
            : (rawMeta[camelKey] !== undefined ? rawMeta[camelKey] : '');
    });

    console.log("Entity Modal Opened. Form Meta Data:", form.value.meta_data);

  } else {
    // Create Mode
    isEditing.value = false;
    form.value = { entityType: 'individual', name: '', identificationNumber: '', parentId: null, email: '', phonePrimary: '', isActive: true, meta_data: {} };
    // Initialize empty keys for new records
    entityFieldDefinitions.value.forEach(def => {
        form.value.meta_data[def.fieldKey || def.field_key] = '';
    });
  }
  showModal.value = true;
};

const saveEntity = async () => {
  try {
    const payload = {
        ...form.value,
        // Ensure keys match what Laravel expects
        entity_type: form.value.entityType,
        identification_number: form.value.identificationNumber,
        phone_primary: form.value.phonePrimary,
        parent_id: form.value.parentId,
        is_active: form.value.isActive,
        meta_data: form.value.meta_data
    };

    if (isEditing.value) {
      await entityService.updateEntity(form.value.id, payload);
    } else {
      await entityService.createEntity(payload);
    }
    
    await fetchEntities();
    if (!createAndStay.value || isEditing.value) showModal.value = false;
    else form.value = { entityType: 'individual', name: '', identificationNumber: '', parentId: null, email: '', phonePrimary: '', isActive: true, meta_data: {} };
  } catch (error) {
    alert('Error saving entity.');
  }
};

const deleteEntity = async (id) => {
  if (confirm('Are you sure?')) {
    await entityService.deleteEntity(id);
    fetchEntities();
  }
};

onMounted(() => {
    fetchEntities();
    fetchDefinitions();
});
</script>