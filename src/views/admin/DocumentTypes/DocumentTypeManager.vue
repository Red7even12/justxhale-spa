<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Document Template Management</h1>
    <p class="text-gray-600 mb-8">Configure document types, their behavior, and data capture requirements.</p>

<!-- NEW: Context Switcher Header -->
    <div class="bg-blue-50 border-b border-blue-100 p-4 mb-6 rounded-lg flex justify-between items-center">
       <div>
          <label class="text-xs font-bold text-blue-800 uppercase tracking-wide">Current Context:</label>
          <select 
            v-model="selectedPackId" 
            @change="handlePackChange"
            class="ml-2 border-blue-300 rounded text-sm font-bold text-blue-900 focus:ring-blue-500"
          >
             <option :value="null">Global / Unassigned (V1 Legacy)</option>
             <optgroup label="V2 Document Packs">
                <option v-for="pack in availablePacks" :key="pack.id" :value="pack.id">
                   {{ pack.name }} ({{ pack.product?.name }})
                </option>
             </optgroup>
          </select>
       </div>
       <div v-if="selectedPackId" class="text-xs text-blue-600 font-medium">
          Editing inside a specific V2 Pack. Changes here affect this pack only.
       </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">Loading...</div>
    <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Column 1: List of Document Types -->
      <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Definitions</h3>
          <button @click="handleAddNew" class="btn-primary">Add New</button>
        </div>
        <ul class="space-y-2">
          <li v-for="docType in sortedDocumentTypes" :key="docType.sort_order">
            <button 
              @click="selectDocumentType(docType)"
              :class="[
                'w-full text-left p-3 rounded-md transition-colors text-sm',
                formObject.data?.id === docType.id ? 'bg-brand-blue-600 text-white' : 'hover:bg-gray-100'
              ]"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium">{{ docType.label }}</span>
                <!-- FIX: Used camelCase isActive -->
                <span 
                  :class="['px-2 py-0.5 text-xs rounded-full', docType.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700']"
                >
                  {{ docType.isActive ? 'Active' : 'Inactive' }}
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
                <!-- FIX: v-model to camelCase actionFieldType -->
                <select id="action_field_type" v-model="formObject.data.actionFieldType" @change="handleActionTypeChange" class="form-input">
                  <option value="none">Checkbox (Received)</option>
                  <option value="date">Date (Simple)</option>
                  <option value="expiry_date">Date (with Expiry Validation)</option>
                  <option value="text">Text / Number Input</option>
                  <option value="sourced_dropdown">Sourced Dropdown</option>
                </select>
              </div>

              <!-- Conditional Row: Data Source -->
              <!-- FIX: Check camelCase actionFieldType -->
              <template v-if="formObject.data.actionFieldType === 'sourced_dropdown'">
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
                <!-- FIX: v-model to camelCase sortOrder -->
                <input id="sort_order" type="number" v-model="formObject.data.sortOrder" class="form-input max-w-xs" required>
                <p class="text-xs text-gray-500 mt-1">Display order on Document Checklist (lowest first).</p>
              </div>
              
              <!-- Row: Description / Note -->
              <div class="md:col-span-1"><label for="note" class="form-label font-medium">Description / Note</label></div>
              <div class="md:col-span-2">
                <textarea id="note" v-model="formObject.data.note" class="form-input" rows="3"></textarea>
                <p class="text-xs text-gray-500 mt-1">This note appears below the document name on the checklist.</p>
              </div>

              <!-- Conditional Row: Validity (Months) -->
              <!-- FIX: Check camelCase actionFieldType -->
              <template v-if="formObject.data.actionFieldType === 'expiry_date'">
                <div class="md:col-span-1"><label for="validity_days" class="form-label font-medium text-blue-700">Validity (Months)</label></div>
                <div class="md:col-span-2">
                  <!-- FIX: v-model to camelCase validityDays -->
                  <input id="validity_days" type="number" v-model="formObject.data.validityDays" class="form-input max-w-xs border-blue-300" placeholder="e.g., 3" required>
                  <p class="text-xs text-gray-500 mt-1">Required when Action Type has expiry validation.</p>
                </div>
              </template>
              
              <!-- Conditional Row: Input Placeholder -->
              <!-- FIX: Check camelCase actionFieldType -->
              <template v-if="formObject.data.actionFieldType !== 'none'">
                <div class="md:col-span-1"><label for="action_field_label" class="form-label font-medium">Input Placeholder</label></div>
                <div class="md:col-span-2">
                  <!-- FIX: v-model to camelCase actionFieldLabel -->
                  <input id="action_field_label" type="text" v-model="formObject.data.actionFieldLabel" class="form-input" placeholder="e.g., Document Date or LOA Number">
                  <p class="text-xs text-gray-500 mt-1">Placeholder text for the date or text input field.</p>
                </div>
              </template>

              <!-- Row: Interchangeable With -->
              <div class="md:col-span-1"><label for="either_document_type_id" class="form-label font-medium">Interchangeable With</label></div>
              <div class="md:col-span-2">
                <!-- FIX: v-model to camelCase eitherDocumentTypeId -->
                <select id="either_document_type_id" v-model="formObject.data.eitherDocumentTypeId" class="form-input">
                  <option :value="null">-- None --</option>
                  <option v-for="option in interchangeableOptions" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
                <p class="text-xs text-gray-500 mt-1">If this document is received, the selected document becomes "Not Applicable".</p>
              </div>

            </div>

            <!-- Checkboxes -->
            <div class="pt-6 border-t">
              <div class="flex items-center space-x-6">
                <div class="flex items-center">
                  <!-- FIX: v-model to camelCase isActive -->
                  <input id="is_active" type="checkbox" v-model="formObject.data.isActive" class="form-checkbox">
                  <label for="is_active" class="ml-2">Active</label>
                </div>
                <div class="flex items-center">
                  <!-- FIX: v-model to camelCase isOptional -->
                  <input id="is_optional" type="checkbox" v-model="formObject.data.isOptional" class="form-checkbox">
                  <label for="is_optional" class="ml-2">Optional</label>
                </div>
                <div class="flex justify-end pt-6 ml-auto">
                  <button type="submit" class="btn-primary">
                    {{ isCreatingNew ? 'Create Document Type' : 'Save Changes' }}
                  </button>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>

    <!-- Reused Modal Component for alerts (assuming you have one, or relying on useAlerts composable) -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';
import adminService from '@/services/adminService';
import { useAlerts } from '@/composables/useAlerts'; // Using your project's alert system

const { showAlert } = useAlerts();

const documentTypes = ref([]);
const availableRecordsourceNames = ref([]); 
const isLoading = ref(true);
const error = ref(null);
const formObject = reactive({ data: null });
const isCreatingNew = ref(false);

const props = defineProps({
  packId: {
    type: [String, Number],
    default: null
  }
});

// State for Packs
const availablePacks = ref([]);
const selectedPackId = ref(props.packId ? parseInt(props.packId) : null);

const fetchPacks = async () => {
    try {
        const { data } = await adminService.getDocumentPacks();
        availablePacks.value = data;
    } catch (err) {
        console.error("Failed to load packs for dropdown", err);
    }
};

// Helper: Sorting uses camelCase sortOrder
const sortedDocumentTypes = computed(() => {
  return documentTypes.value.slice().sort((a, b) => {
    const sortA = a.sortOrder || 0;
    const sortB = b.sortOrder || 0;
    return sortA - sortB;
  });
});

// Fetch Documents (Respects selectedPackId)
const fetchDocumentTypes = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // If selectedPackId is set, filter by it. If null, fetch globals.
    const params = selectedPackId.value ? { document_pack_id: selectedPackId.value } : {};
    
    const response = await adminService.getDocumentTypes(params);
    documentTypes.value = response.data;
  } catch (err) {
    error.value = 'Failed to load document types.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Handle Dropdown Change
const handlePackChange = () => {
    fetchDocumentTypes();
    // Clear the edit form when switching context to prevent saving to wrong pack
    formObject.data = null; 
    isCreatingNew.value = false;
};

const selectDocumentType = (docType) => {
  isCreatingNew.value = false;
  // Clone the camelCase object exactly as received
  formObject.data = JSON.parse(JSON.stringify(docType));
};

const handleAddNew = () => {
  isCreatingNew.value = true;
  // Initialize with camelCase keys to match the template bindings
  formObject.data = {
    name: '',
    label: '',
    sortOrder: 0,
    note: '',
    isActive: true,
    isOptional: false,
    actionFieldType: 'none',
    actionFieldLabel: '',
    validityDays: null,
    eitherDocumentTypeId: null,
    recordsource: null,
  };
};

const handleActionTypeChange = () => {
    // Check using camelCase key
    if (formObject.data.actionFieldType !== 'sourced_dropdown') {
        formObject.data.recordsource = null;
    }
};

// Helper to convert camelCase back to snake_case for the API
const convertToSnakeCase = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(v => convertToSnakeCase(v));
  
  return Object.keys(obj).reduce((acc, key) => {
    // Convert camelCase to snake_case (e.g. sortOrder -> sort_order)
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = convertToSnakeCase(obj[key]);
    return acc;
  }, {});
};

const handleSubmit = async () => {
  if (!formObject.data) return;
  
  try {
    if (selectedPackId.value) {
    payload.document_pack_id = selectedPackId.value;
    } else {
      // Explicitly set null for global docs to ensure they don't accidentally stick to a pack
      payload.document_pack_id = null;
    }

    // 1. Convert form data to snake_case first
    const payload = convertToSnakeCase(formObject.data);

    // 2. IMPORTANT: Inject the Pack ID if we are in "Pack Mode" (V2)
    if (props.packId) {
      payload.document_pack_id = props.packId;
    }

    // 3. Send to API
    if (isCreatingNew.value) {
      await adminService.createDocumentType(payload);
    } else {
      await adminService.updateDocumentType(formObject.data.id, payload);
    }

    showAlert('Success', 'The document type has been saved successfully.');

    await fetchDocumentTypes(); // Refresh the list
    formObject.data = null; 
    isCreatingNew.value = false;
    
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'An error occurred.';
    showAlert('Save Failed', errorMsg);
    console.error(err);
  }
};

const interchangeableOptions = computed(() => {
  if (!formObject.data) return documentTypes.value;
  return documentTypes.value.filter(type => type.id !== formObject.data.id);
});

watch(() => props.packId, (newId) => {
    selectedPackId.value = newId ? parseInt(newId) : null;
    fetchDocumentTypes();
});

onMounted(async () => {
  await fetchPacks();
  await fetchDocumentTypes();
  try {
    const response = await adminService.getSourcedOptionSources();
    availableRecordsourceNames.value = response.data;
  } catch (err) {
    console.error('Failed to fetch recordsource names:', err);
  }
});
</script>