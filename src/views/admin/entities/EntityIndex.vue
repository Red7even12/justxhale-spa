<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Entity Registry</h1>
      <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
        + Add New Entity
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[250px]">
        <label class="block text-sm font-medium text-gray-700">Search</label>
        <input v-model="filters.search" @input="fetchEntities" type="text" placeholder="Name or ID Number..." class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Type</label>
        <select v-model="filters.type" @change="fetchEntities" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm">
          <option value="">All Types</option>
          <option value="company">Companies</option>
          <option value="individual">Individuals</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white shadow overflow-hidden rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Entity</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="entity in entities" :key="entity.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ entity.name }}</div>
              <div class="text-xs text-gray-500 capitalize">{{ entity.entityType }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ entity.identificationNumber || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div>{{ entity.email }}</div>
              <div class="text-xs">{{ entity.phonePrimary }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ entity.parent ? entity.parent.name : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openModal(entity)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
              <button @click="deleteEntity(entity.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Entity' : 'Add New Entity' }}</h2>
        
        <form @submit.prevent="saveEntity" class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700">Entity Type</label>
            <div class="flex gap-4 mt-2">
              <label class="inline-flex items-center">
                <input type="radio" v-model="form.entityType" value="company" class="text-blue-600">
                <span class="ml-2">Company</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" v-model="form.entityType" value="individual" class="text-blue-600">
                <span class="ml-2">Individual</span>
              </label>
            </div>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700">Full Name / Company Name</label>
            <input v-model="form.name" type="text" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">ID / Reg Number</label>
            <input v-model="form.identificationNumber" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm">
          </div>

          <div v-if="form.entityType === 'individual'">
            <label class="block text-sm font-medium text-gray-700">Linked Company</label>
            <select v-model="form.parentId" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm">
              <option :value="null">None</option>
              <option v-for="co in companies" :key="co.id" :value="co.id">{{ co.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input v-model="form.email" type="email" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Primary Phone</label>
            <input v-model="form.phonePrimary" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm">
          </div>

          <div class="col-span-2 mt-4 flex justify-between">
             <div class="flex items-center">
                <input type="checkbox" v-model="createAndStay" id="stay" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                <label for="stay" class="ml-2 text-sm text-gray-600">Create & Stay (Add another)</label>
             </div>
             <div class="flex gap-2">
                <button type="button" @click="showModal = false" class="bg-gray-200 px-4 py-2 rounded text-gray-700">Cancel</button>
                <button type="submit" class="bg-blue-600 px-4 py-2 rounded text-white shadow hover:bg-blue-700">
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

const entities = ref([]);
const companies = ref([]);
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
});

const fetchEntities = async () => {
  try {
    const { data } = await entityService.getEntities(filters.value);
    // Handle both Laravel pagination object and plain array
    entities.value = data.data || (Array.isArray(data) ? data : []);
    console.log('Entities fetched:', entities.value);
  } catch (error) {
    console.error('Failed to fetch entities:', error);
  }
};

const fetchCompanies = async () => {
  try {
    const { data } = await entityService.getCompanies();
    companies.value = data.data || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
  }
};

const openModal = (entity = null) => {
  fetchCompanies();
  if (entity) {
    isEditing.value = true;
    form.value = { ...entity };
  } else {
    isEditing.value = false;
    form.value = { entityType: 'individual', name: '', identificationNumber: '', parentId: null, email: '', phonePrimary: '' };
  }
  showModal.value = true;
};

const saveEntity = async () => {
  try {
    if (isEditing.value) {
      await entityService.updateEntity(form.value.id, form.value);
    } else {
      await entityService.createEntity(form.value);
    }
    
    await fetchEntities();
    
    if (!createAndStay.value || isEditing.value) {
      showModal.value = false;
    } else {
      // Reset form but stay open for next entry
      form.value = { entityType: 'individual', name: '', identificationNumber: '', parentId: null, email: '', phonePrimary: '' };
    }
  } catch (error) {
    alert('Error saving entity. Check if name/ID are unique.');
  }
};

const deleteEntity = async (id) => {
  if (confirm('Are you sure? This will soft-delete the entity.')) {
    await entityService.deleteEntity(id);
    fetchEntities();
  }
};

onMounted(fetchEntities);
</script>