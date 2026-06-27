<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight"> </h2>
        <p class="text-sm text-gray-500 font-medium">Define global fields that follow people/companies across all cases.</p>
      </div>
      <button @click="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
        Add Global Field
      </button>
    </div>

    <!-- Field List -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Label / Key</th>
            <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
            <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="field in fields" :key="field.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <!-- Changed field_label to fieldLabel -->
              <div class="font-bold text-gray-900">{{ field.fieldLabel }}</div>
              <!-- Changed field_key to fieldKey -->
              <div class="text-[10px] font-mono text-indigo-500 uppercase">{{ field.fieldKey }}</div>
            </td>
            <td class="px-6 py-4 text-sm font-medium text-gray-600">
                <!-- Changed field_type to fieldType -->
                <span class="px-2 py-1 bg-gray-100 rounded text-[10px] uppercase font-bold">{{ field.fieldType }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openModal(field)" class="text-indigo-600 hover:text-indigo-900 font-bold text-xs mr-4">Edit</button>
              <button @click="deleteField(field.id)" class="text-red-400 hover:text-red-600 font-bold text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="fields.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-gray-400 font-medium">No global entity fields defined yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal (Simple implementation) -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50">
          <h3 class="font-black text-gray-900 uppercase tracking-tight">{{ editingField ? 'Edit' : 'Add' }} Global Field</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Field Label</label>
            <input v-model="form.field_label" type="text" class="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. State Bar Number">
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Field Key (Permanent)</label>
            <input v-model="form.field_key" :disabled="editingField" type="text" class="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm " placeholder="state_bar_number">
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Field Type</label>
            <select v-model="form.field_type" class="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500">
              <option value="text">Text</option>
              <option value="date">Date</option>
              <option value="number">Number</option>
              <option value="textarea">Long Text</option>
            </select>
          </div>
        </div>
        <div class="p-6 bg-gray-50 flex justify-end gap-3">
          <button @click="showModal = false" class="text-sm font-bold text-gray-500">Cancel</button>
          <button @click="saveField" class="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-indigo-200">Save DNA</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

// 1. Capture the props into the 'props' variable
const props = defineProps({
    product: { type: Object, required: true },
    slug: { type: String, required: true }
});

const fields = ref([]);
const showModal = ref(false);
const editingField = ref(null);
const form = ref({ field_label: '', field_key: '', field_type: 'text' });

const fetchFields = async () => {
    // Architects call the Admin endpoint (full access)
    // We pass the product id if we want to filter, 
    // or just let it load all for the architect
    const { data } = await apiClient.get('/admin/entity-fields'); 
    fields.value = data.data;
};

const openModal = (field = null) => {
    editingField.value = field;
    if (field) {
        // Map camelCase back to snake_case for the form/API
        form.value = {
            field_label: field.fieldLabel,
            field_key: field.fieldKey,
            field_type: field.fieldType,
            is_required: field.isRequired,
            sort_order: field.sortOrder
        };
    } else {
        form.value = { field_label: '', field_key: '', field_type: 'text', is_required: false, sort_order: 0 };
    }
    showModal.value = true;
};

const saveField = async () => {
    try {
        // 2. Now 'props.product.id' will be accessible
        const payload = {
            ...form.value,
            product_id: props.product.id 
        };

        if (editingField.value) {
            await apiClient.put(`/admin/entity-fields/${editingField.value.id}`, payload);
        } else {
            await apiClient.post('/admin/entity-fields', payload);
        }
        showModal.value = false;
        fetchFields();
    } catch (e) { 
        // 3. Robust error reporting
        if (e.response && e.response.status === 422) {
             alert(`Error: ${Object.values(e.response.data.errors)[0][0]}`);
        } else {
             alert('Error saving field. Check console.');
             console.error(e);
        }
    }
};

onMounted(fetchFields);
</script>