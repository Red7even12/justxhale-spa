<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Document Template Management</h1>
    <p class="text-gray-600 mb-8">Configure document types, their behavior, and data capture requirements.</p>

    <div v-if="isLoading" class="text-center py-12">Loading...</div>
    <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Column 1: List of Document Types (Unchanged) -->
      <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Definitions</h3>
          <button @click="handleAddNew" class="btn-primary">Add New</button>
        </div>
        <ul class="space-y-2">
          <li v-for="docType in sortedDocumentTypes" :key="docType.id">
            <button 
              @click="selectDocumentType(docType)"
              :class="[
                'w-full text-left p-3 rounded-md transition-colors text-sm',
                formObject.data?.id === docType.id ? 'bg-brand-blue-600 text-white' : 'hover:bg-gray-100'
              ]"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ docType.label }}</span>
                <span 
                  :class="['px-2 py-0.5 text-xs rounded-full', docType.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700']"
                >
                  {{ docType.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </button>
          </li>
        </ul>
      </div>

      <!-- Column 2: Form for Editing/Creating -->
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
        <div v-if="!formObject.data" class="flex items-center justify-center h-full">
          <p class="text-gray-500">Select a document type to edit, or click "Add New".</p>
        </div>
        <div v-else>
          <h2 class="text-xl font-bold mb-6 border-b pb-4">
            {{ isCreatingNew ? 'Create New Document Type' : `Editing: ${formObject.data.label}` }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            
<!-- ============================================= -->
<!-- START: COMPLETE AND FINAL FORM LAYOUT         -->
<!-- ============================================= -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">

  <!-- Row: Display Label -->
  <div class="md:col-span-1"><label for="label" class="form-label font-medium">Display Label</label></div>
  <div class="md:col-span-2">
    <input id="label" type="text" v-model="formObject.data.label" class="form-input" required>
    <p class="text-xs text-gray-500 mt-1">The user-friendly name for the document.</p>
  </div>

  <!-- Row: System Name -->
  <div class="md:col-span-1"><label for="name" class="form-label font-medium">System Name</label></div>
  <div class="md:col-span-2">
    <input id="name" type="text" v-model="formObject.data.name" class="form-input" required placeholder="e.g., power_of_attorney">
    <p class="text-xs text-gray-500 mt-1">Unique identifier. Use lowercase and underscores only.</p>
  </div>

  <!-- Row: Action Type -->
  <div class="md:col-span-1"><label for="action_field_type" class="form-label font-medium">Action Type</label></div>
  <div class="md:col-span-2">
    <select id="action_field_type" v-model="formObject.data.action_field_type" @change="handleActionTypeChange" class="form-input">
      <option value="none">Checkbox (Received)</option>
      <option value="date">Date (Simple)</option>
      <option value="expiry_date">Date (with Expiry Validation)</option>
      <option value="text">Text / Number Input</option>
      <option value="sourced_dropdown">Sourced Dropdown</option>
    </select>
  </div>

  <!-- Conditional Row: Data Source -->
  <template v-if="formObject.data.action_field_type === 'sourced_dropdown'">
    <div class="md:col-span-1"><label for="recordsource" class="form-label font-medium text-blue-700">Data Source</label></div>
    <div class="md:col-span-2">
      <select id="recordsource" v-model="formObject.data.recordsource" class="form-input border-blue-300" required>
        <option :value="null">-- Select a source --</option>
        <option v-for="sourceName in availableRecordsourceNames" :key="sourceName" :value="sourceName">
          {{ sourceName }}
        </option>
      </select>
      <p class="text-xs text-gray-500 mt-1">Select the source for the dropdown options.</p>
    </div>
  </template>
  
  <!-- Row: Sort Order -->
  <div class="md:col-span-1"><label for="sort_order" class="form-label font-medium">Sort Order</label></div>
  <div class="md:col-span-2">
    <input id="sort_order" type="number" v-model="formObject.data.sort_order" class="form-input max-w-xs" required>
    <p class="text-xs text-gray-500 mt-1">Display order on Document Checklist (lowest first).</p>
  </div>
  
  <!-- Row: Description / Note -->
  <div class="md:col-span-1"><label for="note" class="form-label font-medium">Description / Note</label></div>
  <div class="md:col-span-2">
    <textarea id="note" v-model="formObject.data.note" class="form-input" rows="3"></textarea>
    <p class="text-xs text-gray-500 mt-1">This note appears below the document name on the checklist.</p>
  </div>

  <!-- Conditional Row: Validity (Months) -->
  <template v-if="formObject.data.action_field_type === 'expiry_date'">
    <div class="md:col-span-1"><label for="validity_days" class="form-label font-medium text-blue-700">Validity (Months)</label></div>
    <div class="md:col-span-2">
      <input id="validity_days" type="number" v-model="formObject.data.validity_days" class="form-input max-w-xs border-blue-300" placeholder="e.g., 3" required>
      <p class="text-xs text-gray-500 mt-1">Required when Action Type has expiry validation.</p>
    </div>
  </template>
  
  <!-- Conditional Row: Input Placeholder -->
  <template v-if="formObject.data.action_field_type !== 'none'">
    <div class="md:col-span-1"><label for="action_field_label" class="form-label font-medium">Input Placeholder</label></div>
    <div class="md:col-span-2">
      <input id="action_field_label" type="text" v-model="formObject.data.action_field_label" class="form-input" placeholder="e.g., Document Date or LOA Number">
      <p class="text-xs text-gray-500 mt-1">Placeholder text for the date or text input field.</p>
    </div>
  </template>

  <!-- Row: Interchangeable With -->
  <div class="md:col-span-1"><label for="either_document_type_id" class="form-label font-medium">Interchangeable With</label></div>
  <div class="md:col-span-2">
    <select id="either_document_type_id" v-model="formObject.data.either_document_type_id" class="form-input">
      <option :value="null">-- None --</option>
      <option v-for="option in interchangeableOptions" :key="option.id" :value="option.id">
        {{ option.label }}
      </option>
    </select>
    <p class="text-xs text-gray-500 mt-1">If this document is received, the selected document becomes "Not Applicable".</p>
  </div>

</div>
<!-- ============================================= -->
<!-- END: COMPLETE AND FINAL FORM LAYOUT           -->
<!-- ============================================= -->

              <!-- Checkboxes -->
              <div class="pt-6 border-t">
                <div class="flex items-center space-x-6">
                  <div class="flex items-center">
                    <input id="is_active" type="checkbox" v-model="formObject.data.is_active" class="form-checkbox">
                    <label for="is_active" class="ml-2">Active</label>
                  </div>
                  <div class="flex items-center">
                    <input id="is_optional" type="checkbox" v-model="formObject.data.is_optional" class="form-checkbox">
                    <label for="is_optional" class="ml-2">Optional</label>
                  </div>
                  <div class="flex justify-end pt-6">
                  <button type="submit" class="btn-primary">
                  {{ isCreatingNew ? 'Create Document Type' : 'Save Changes' }}
                  </button>
                </div>
                </div>
              </div>

              <!-- ============================================= -->
              <!-- START: ACTIONS SECTION (RE-ADDED)             -->
              <!-- ============================================= -->

              <!-- ============================================= -->
              <!-- END: ACTIONS SECTION (RE-ADDED)               -->
              <!-- ============================================= -->


          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import adminService from '@/services/adminService';
// 1. IMPORT YOUR EXISTING MODAL COMPONENT

const documentTypes = ref([]);
const availableRecordsourceNames = ref([]); // New ref
const isLoading = ref(true);
const error = ref(null);
const formObject = reactive({ data: null });
const isCreatingNew = ref(false);

// 2. ADD STATE TO CONTROL THE MODAL
const modalState = reactive({
  show: false,
  type: 'success', // 'success' or 'error'
  title: '',
  message: '',
});

const sortedDocumentTypes = computed(() => {
  // Use slice() to create a copy before sorting to avoid mutating the original array
  return documentTypes.value.slice().sort((a, b) => {
    // Handle potential null/undefined values by defaulting to 0
    const sortA = a.sort_order || 0;
    const sortB = b.sort_order || 0;
    return sortA - sortB;
  });
});

const fetchDocumentTypes = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await adminService.getDocumentTypes();
    documentTypes.value = response.data;
  } catch (err) {
    error.value = 'Failed to load document types.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const selectDocumentType = (docType) => {
  isCreatingNew.value = false;
  // This JSON method is a perfectly valid way to deep clone
  formObject.data = JSON.parse(JSON.stringify(docType));
};

const handleAddNew = () => {
  isCreatingNew.value = true;
  formObject.data = {
    name: '',
    label: '',
    sort_order: 0,
    note: '',
    is_active: true,
    is_optional: false,
    action_field_type: 'none',
    action_field_label: '',
    validity_days: null,
    either_document_type_id: null,
    recordsource: null,
  };
};

const handleActionTypeChange = () => {
    if (formObject.data.action_field_type !== 'sourced_dropdown') {
        formObject.data.recordsource = null;
    }
};

// 3. UPDATED handleSubmit FUNCTION TO REPLACE alert()
const handleSubmit = async () => {
  if (!formObject.data) return;
  
  try {
    if (isCreatingNew.value) {
      await adminService.createDocumentType(formObject.data);
    } else {
      await adminService.updateDocumentType(formObject.data.id, formObject.data);
    }

    // Configure and show success modal
    modalState.type = 'success';
    modalState.title = 'Success!';
    modalState.message = 'The document type has been saved successfully.';
    modalState.show = true;

    await fetchDocumentTypes();
    // Reset state after save
    formObject.data = null; 
    isCreatingNew.value = false;
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'An error occurred.';
    
    // Configure and show error modal
    modalState.type = 'error';
    modalState.title = 'Save Failed';
    modalState.message = errorMsg;
    modalState.show = true;

    console.error(err);
  }
};

const interchangeableOptions = computed(() => {
  if (!formObject.data) return documentTypes.value;
  return documentTypes.value.filter(type => type.id !== formObject.data.id);
});

onMounted(async () => {
  await fetchDocumentTypes();
  try {
    const response = await adminService.getSourcedOptionSources();
    availableRecordsourceNames.value = response.data;
  } catch (err) {
    console.error('Failed to fetch recordsource names:', err);
  }
});
</script>