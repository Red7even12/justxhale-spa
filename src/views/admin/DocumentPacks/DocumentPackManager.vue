<template>
  <div class="p-6">
    <!-- Header with Back Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <button @click="$router.push({ name: 'admin.document-packs' })" class="text-gray-500 hover:text-gray-700">
          ← Back to Packs
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ pack?.name || 'Loading...' }}</h1>
          <p class="text-sm text-gray-400" v-if="pack">
            Context: {{ pack.product?.name }} <span v-if="pack.fileType">• {{ pack.fileType.name }}</span>
          </p>
        </div>
      </div>
      <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold">
        + Add Document Type
      </button>
    </div>

    <!-- Documents List -->
    <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Label</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action Type</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Optional?</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900">{{ doc.label }}</div>
              <div class="text-xs text-gray-400">{{ doc.name }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ doc.actionFieldType || 'None' }}
            </td>
            <td class="px-6 py-4 text-center">
              <span v-if="doc.isOptional" class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">OPTIONAL</span>
              <span v-else class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">REQUIRED</span>
            </td>
            <td class="px-6 py-4 text-right text-sm">
              <button @click="openModal(doc)" class="text-blue-600 hover:text-blue-900 font-bold mr-3">Edit</button>
              <button @click="deleteDoc(doc)" class="text-red-600 hover:text-red-900 font-bold">Remove</button>
            </td>
          </tr>
          <tr v-if="documents.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-gray-500 italic">
              No documents defined in this pack yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Add/Edit Document Type -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
        <h2 class="text-xl font-bold mb-4 border-b pb-2">{{ form.id ? 'Edit' : 'Add' }} Document Definition</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <!-- Internal Name -->
          <div class="col-span-2">
            <label class="block text-sm font-bold text-gray-700">Internal Name (Unique) <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" class="w-full border-gray-300 rounded-md focus:ring-blue-500" placeholder="e.g. ID_DOCUMENT">
          </div>

          <!-- Public Label -->
          <div class="col-span-2">
            <label class="block text-sm font-bold text-gray-700">Display Label <span class="text-red-500">*</span></label>
            <input v-model="form.label" type="text" class="w-full border-gray-300 rounded-md focus:ring-blue-500" placeholder="e.g. Certified Copy of ID">
          </div>

          <!-- Action Field Type -->
          <div>
            <label class="block text-sm font-bold text-gray-700">Input Type</label>
            <select v-model="form.action_field_type" class="w-full border-gray-300 rounded-md focus:ring-blue-500">
              <option value="none">Checkbox Only</option>
              <option value="text">Text Input</option>
              <option value="date">Date Picker</option>
              <option value="expiry_date">Expiry Date</option>
            </select>
          </div>

          <!-- Flags -->
          <div class="flex flex-col justify-center space-y-2">
            <label class="flex items-center">
              <input v-model="form.is_optional" type="checkbox" class="h-4 w-4 text-blue-600 rounded">
              <span class="ml-2 text-sm text-gray-700 font-bold">Is Optional?</span>
            </label>
            <label class="flex items-center">
              <input v-model="form.is_active" type="checkbox" class="h-4 w-4 text-blue-600 rounded">
              <span class="ml-2 text-sm text-gray-700 font-bold">Is Active?</span>
            </label>
          </div>
          
          <!-- Note -->
          <div class="col-span-2">
             <label class="block text-sm font-bold text-gray-700">Helper Note</label>
             <input v-model="form.note" type="text" class="w-full border-gray-300 rounded-md focus:ring-blue-500" placeholder="e.g. Must be certified within 3 months">
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button @click="showModal = false" class="text-gray-500 font-bold px-4 py-2">Cancel</button>
          <button @click="save" class="bg-blue-600 text-white font-bold px-6 py-2 rounded shadow hover:opacity-90">
            {{ form.id ? 'Update' : 'Add to Pack' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api'; // Using direct API client for nested resource
import { useAlerts } from '@/composables/useAlerts';

const route = useRoute();
const { showAlert, showConfirm } = useAlerts();

const pack = ref(null);
const documents = ref([]);
const showModal = ref(false);

const form = reactive({
  id: null,
  name: '',
  label: '',
  action_field_type: 'none',
  is_optional: false,
  is_active: true,
  note: ''
});

const load = async () => {
  try {
    // 1. Fetch the Pack details
    const { data } = await apiClient.get(`/admin/document-packs/${route.params.id}`);
    pack.value = data;
    documents.value = data.documentTypes || data.document_types || [];
  } catch (error) {
    console.error("Failed to load pack", error);
    showAlert('Error', 'Failed to load document pack.');
  }
};

const openModal = (doc = null) => {
  if (doc) {
    form.id = doc.id;
    form.name = doc.name;
    form.label = doc.label;
    form.action_field_type = doc.actionFieldType || doc.action_field_type || 'none';
    form.is_optional = !!(doc.isOptional || doc.is_optional);
    form.is_active = !!(doc.isActive || doc.is_active);
    form.note = doc.note || '';
  } else {
    form.id = null;
    form.name = '';
    form.label = '';
    form.action_field_type = 'none';
    form.is_optional = false;
    form.is_active = true;
    form.note = '';
  }
  showModal.value = true;
};

const save = async () => {
  if (!form.name || !form.label) return showAlert('Error', 'Name and Label are required.');

  try {
    // We need an endpoint for managing docs within a pack. 
    // Ideally: POST /admin/document-packs/{id}/documents
    // Or we use a generic DocumentType controller. 
    // For simplicity, let's assume we create a generic endpoint or nested one.
    
    const payload = { ...form, document_pack_id: pack.value.id };
    
    if (form.id) {
       await apiClient.put(`/admin/document-types/${form.id}`, payload);
    } else {
       await apiClient.post(`/admin/document-types`, payload);
    }

    showModal.value = false;
    load();
    showAlert('Success', 'Document saved.');
  } catch (error) {
    console.error("Save failed", error);
    showAlert('Error', 'Failed to save document definition.');
  }
};

const deleteDoc = async (doc) => {
  if (await showConfirm('Remove Document', 'Are you sure? This will remove it from future cases.')) {
    try {
      await apiClient.delete(`/admin/document-types/${doc.id}`);
      load();
      showAlert('Success', 'Document removed.');
    } catch (error) {
      console.error("Delete failed", error);
      showAlert('Error', 'Failed to delete document.');
    }
  }
};

onMounted(load);
</script>