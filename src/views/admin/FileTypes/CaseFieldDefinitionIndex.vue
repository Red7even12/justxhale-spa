<template>
  <div class="p-6">
    <div class="mb-4">
      <router-link :to="{ name: 'admin.file-types' }" class="text-blue-600">&larr; Back to File Types</router-link>
    </div>
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        Field Definitions: {{ fileType?.name || 'Loading...' }}
      </h1>
      <button @click="openModal()" class="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
        + Add Data Field
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label (UI)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key (Database)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="field in fields" :key="field.id">
            <td class="px-6 py-4 font-medium text-gray-900">{{ field.fieldLabel }}</td>
            <td class="px-6 py-4 text-gray-500"><code>{{ field.fieldKey }}</code></td>
            <td class="px-6 py-4 capitalize">{{ field.fieldType }}</td>
            <td class="px-6 py-4 text-gray-500">{{ field.sortOrder }}</td>
            <td class="px-6 py-4 text-right space-x-3">
              <button @click="openModal(field)" class="text-blue-600 hover:underline">Edit</button>
              <button @click="confirmDelete(field)" class="text-red-600 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Field Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4">Define Data Field</h2>
            <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
                <label class="block text-sm font-medium">Field Label (What the user sees)</label>
                <input v-model="form.field_label" type="text" class="mt-1 block w-full border rounded p-2" placeholder="e.g. Date of Death">
            </div>
            <div>
                <label class="block text-sm font-medium">Field Key (JSON Key)</label>
                <input v-model="form.field_key" type="text" class="mt-1 block w-full border rounded p-2" placeholder="e.g. date_of_death">
            </div>
            <div>
                <label class="block text-sm font-medium">Input Type</label>
                <select v-model="form.field_type" class="mt-1 block w-full border rounded p-2">
                <option value="text">Short Text</option>
                <option value="date">Date Picker</option>
                <option value="number">Numeric</option>
                <option value="textarea">Long Text</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium">Sort Order</label>
                <input v-model="form.sort_order" type="number" class="mt-1 block w-full border rounded p-2">
            </div>
            <div class="flex items-center mt-6">
                <input v-model="form.is_required" type="checkbox" class="mr-2">
                <label class="text-sm font-medium">Required Field?</label>
            </div>
            </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button @click="showModal = false" class="text-gray-500 px-4 py-2">Cancel</button>
          <button @click="save" class="bg-blue-600 text-white px-4 py-2 rounded">Save Field</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import adminService from '@/services/adminService';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps(['id']); // The File Type ID
const fields = ref([]);
const fileType = ref(null);
const showModal = ref(false);
const { showConfirm, showAlert } = useAlerts();

const form = ref({ 
    id: null,
    file_type_id: props.id, 
    product_id: null,
    field_label: '', 
    field_key: '', 
    field_type: 'text', 
    is_required: false, 
    sort_order: 0 
});

const load = async () => {
  try {
    const [fieldsRes, typeRes] = await Promise.all([
      adminService.getFieldDefinitions(props.id),
      adminService.getFileType(props.id)
    ]);
    
    fields.value = Array.isArray(fieldsRes.data) ? fieldsRes.data : fieldsRes.data.data;
    fileType.value = typeRes.data;
    
    // Set product_id for new fields from the parent FileType
    if (!form.value.product_id) {
        form.value.product_id = fileType.value.productId || fileType.value.product_id;
    }
  } catch (error) {
    console.error('Load error:', error);
  }
};

const openModal = (field = null) => {
  if (field) {
    form.value = {
      id: field.id,
      file_type_id: props.id,
      product_id: field.productId || field.product_id || fileType.value?.productId,
      field_label: field.fieldLabel || field.field_label,
      field_key: field.fieldKey || field.field_key,
      field_type: field.fieldType || field.field_type,
      is_required: !!(field.isRequired || field.is_required),
      sort_order: field.sortOrder || field.sort_order
    };
  } else {
    form.value = { 
      id: null,
      file_type_id: props.id, 
      product_id: fileType.value?.productId || fileType.value?.product_id,
      field_label: '', 
      field_key: '', 
      field_type: 'text', 
      is_required: false, 
      sort_order: fields.value.length + 1 
    };
  }
  showModal.value = true;
};

const confirmDelete = async (field) => {
  if (await showConfirm('Delete Field', `Delete "${field.fieldLabel}"? This cannot be undone.`)) {
    try {
      await adminService.deleteFieldDefinition(field.id);
      showAlert('Success', 'Field deleted.');
      load();
    } catch (err) {
      showAlert('Error', 'Delete failed.');
    }
  }
};

const save = async () => {
  try {
    await adminService.saveFieldDefinition(form.value);
    showModal.value = false;
    await load();
  } catch (error) {
    console.error('Save failed:', error.response?.data);
    alert('Save failed: ' + JSON.stringify(error.response?.data?.errors));
  }
};

onMounted(load);

</script>
