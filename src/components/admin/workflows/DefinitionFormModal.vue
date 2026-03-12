<template>
  <Modal :show="show" @close="$emit('close')">
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        {{ isEditMode ? 'Edit Workflow Definition' : 'Create New Definition' }}
      </h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label for="def-name" class="block text-sm font-bold text-gray-700 mb-1">Definition Name</label>
            <input id="def-name" v-model="form.name" type="text" class="form-input" required placeholder="e.g. Standard Estate Workflow" />
          </div>
          
          <!-- Description -->
          <div>
            <label for="def-description" class="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea id="def-description" v-model="form.description" rows="2" class="form-input"></textarea>
          </div>

          <!-- Product Selection -->
          <div>
            <label for="def-product" class="block text-sm font-bold text-gray-700 mb-1">Product Context <span class="text-red-500">*</span></label>
            <select id="def-product" v-model.number="form.product_id" class="form-input" required>
              <option :value="null" disabled>Select Product</option>
              <option v-for="prod in products" :key="prod.id" :value="prod.id">{{ prod.name }}</option>
            </select>
          </div>

          <!-- File Type Selection (Niche) -->
          <div>
            <label for="def-file-type" class="block text-sm font-bold text-gray-700 mb-1">Associated Niche (File Type)</label>
            <select id="def-file-type" v-model.number="form.file_type_id" class="form-input" :disabled="!form.product_id">
              <option :value="null">{{ form.product_id ? 'Global / All Niches' : 'Select Product First' }}</option>
              <option v-for="ft in filteredFileTypes" :key="ft.id" :value="ft.id">{{ ft.name }}</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">If selected, this workflow will be automatically added to new cases of this type.</p>
          </div>

          <!-- Active Checkbox -->
          <div class="flex items-center pt-2">
            <input id="def-is_active" v-model="form.is_active" type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label for="def-is_active" class="ml-2 block text-sm font-bold text-gray-700">Is Active</label>
          </div>
        </div>

        <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 text-sm text-red-600 rounded border border-red-200 font-bold">
          {{ errorMessage }}
        </div>

        <div class="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-gray-500 font-bold hover:text-gray-700">Cancel</button>
          <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-blue-700 disabled:opacity-50" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Definition' }}
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import Modal from '@/components/common/Modal.vue';
import workflowDefinitionService from '@/services/workflowDefinitionService';
import adminService from '@/services/adminService';

const props = defineProps({
  show: { type: Boolean, required: true },
  definitionToEdit: { type: Object, default: null },
});
const emit = defineEmits(['close', 'definition-saved']);

// Initialize with null for IDs to match Select "disabled" logic
const form = reactive({ 
    name: '', 
    description: '', 
    product_id: null, 
    file_type_id: null, 
    is_active: true 
});

const products = ref([]);
const fileTypes = ref([]);
const isSaving = ref(false);
const errorMessage = ref(null);

const isEditMode = computed(() => !!props.definitionToEdit);

// FIX: Ensure ID comparison handles potential string/number mismatch safely
const filteredFileTypes = computed(() => {
    if (!form.product_id) return [];
    return fileTypes.value.filter(ft => {
       const ftProdId = ft.productId || ft.product_id;
       return Number(ftProdId) === Number(form.product_id);
    });
});

const loadData = async () => {
    try {
        const [prodRes, ftRes] = await Promise.all([
            adminService.getProducts(),
            adminService.getFileTypes()
        ]);
        products.value = prodRes.data;
        fileTypes.value = Array.isArray(ftRes.data) ? ftRes.data : (ftRes.data.data || []);
    } catch (error) {
        console.error('Failed to load products/niches:', error);
    }
};

onMounted(loadData);

watch(() => props.show, (newVal) => {
  if (newVal) {
    errorMessage.value = null;
    if (props.definitionToEdit) {
      // Edit Mode: Populate Form
      const def = props.definitionToEdit;
      form.name = def.name;
      form.description = def.description;
      // Handle camelCase vs snake_case
      form.product_id = def.productId || def.product_id || null;
      form.file_type_id = def.fileTypeId || def.file_type_id || null;
      form.is_active = (def.isActive !== undefined) ? def.isActive : !!def.is_active;
    } else {
      // Create Mode: Reset Form
      form.name = '';
      form.description = '';
      form.product_id = null;
      form.file_type_id = null;
      form.is_active = true;
    }
  }
});

const handleSubmit = async () => {
  if (!form.product_id) {
      errorMessage.value = "Product selection is required.";
      return;
  }
  
  isSaving.value = true;
  errorMessage.value = null;
  
  try {
    if (isEditMode.value) {
      await workflowDefinitionService.updateDefinition(props.definitionToEdit.id, form);
    } else {
      await workflowDefinitionService.createDefinition(form);
    }
    emit('definition-saved');
  } catch (err) {
    console.error(err);
    errorMessage.value = err.response?.data?.message || 'Failed to save definition.';
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.form-input { 
  @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm; 
}
</style>