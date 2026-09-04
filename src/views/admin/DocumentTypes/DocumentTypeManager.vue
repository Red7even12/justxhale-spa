<template>
  <div class="space-y-6">
    <!-- Context Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
            <!-- DUAL CONTEXT BACK BUTTON -->
            <router-link :to="backDestination" class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2">
                ← Back to Packs
            </router-link>
            <h2 class="text-xl font-bold text-gray-800">Document Pack Items Management</h2>
            <p class="text-sm text-gray-500">Configure checklist behavior and data capture for this pack.</p>
        </div>
        <div class="flex gap-3">
            <!-- Sync button (Available when running inside a Product context) -->
            <button 
              v-if="props.slug"
              @click="handleSync" 
              :disabled="isSyncing"
              class="bg-amber-500 text-white px-5 py-2 rounded-lg shadow font-bold hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="isSyncing" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ isSyncing ? 'Syncing...' : 'Sync Pack to Cases' }}
            </button>

            <button @click="handleAddNew" class="bg-blue-600 text-white px-5 py-2 rounded-lg shadow font-bold hover:bg-blue-700 transition-all">
              + Add Pack Item
            </button>
        </div>
    </div>

    <div v-if="isLoading" class="text-center py-12 animate-pulse text-gray-400">Loading templates...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)]">
      
      <!-- List Sidebar -->
      <div class="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div class="p-4 border-b bg-gray-50/50">
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Definitions</h3>
        </div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <button v-for="docType in sortedDocumentTypes" :key="docType.id" 
            @click="selectDocumentType(docType)"
            :class="[
              'w-full text-left p-3 rounded-lg transition-all text-sm border',
              formObject.data?.id === docType.id ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold shadow-sm' : 'hover:bg-gray-50 border-transparent text-gray-600'
            ]"
          >
            <div class="flex justify-between items-center">
              <span>{{ docType.label }}</span>
              <span :class="['px-2 py-0.5 text-[10px] rounded font-black uppercase tracking-tighter', docType.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400']">
                {{ docType.isActive ? 'Active' : 'Off' }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Detail Form -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div v-if="!formObject.data" class="flex flex-col items-center justify-center h-full text-gray-400 italic">
          <p>Select an item to configure checklist logic.</p>
        </div>
        
        <div v-else class="flex flex-col h-full">
            <div class="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                <h3 class="font-bold text-gray-800">{{ isCreatingNew ? 'New Document Pack Item' : 'Edit Document Pack Item' }}</h3>
                <button v-if="!isCreatingNew" @click="handleDelete" class="text-xs font-bold text-red-500 hover:underline">Delete Definition</button>
            </div>

            <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Standard Fields -->
                    <div class="md:col-span-1">
                        <label class="block text-xs font-black text-gray-400 uppercase mb-1">Display Label (UI)</label>
                        <input v-model="formObject.data.label" type="text" class="w-full border-gray-300 rounded-lg shadow-sm" required>
                    </div>
                    <div class="md:col-span-1">
                        <label class="block text-xs font-black text-gray-400 uppercase mb-1">System Name (Unique Key)</label>
                        <input v-model="formObject.data.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm font-mono text-xs" required>
                    </div>
                    
                    <div class="md:col-span-2">
                        <label class="block text-xs font-black text-gray-400 uppercase mb-1">Instructional Note</label>
                        <textarea v-model="formObject.data.note" class="w-full border-gray-300 rounded-lg shadow-sm text-sm" rows="2"></textarea>
                    </div>

                    <div>
                        <label class="block text-xs font-black text-gray-400 uppercase mb-1">Checklist Action Type</label>
                        <select v-model="formObject.data.actionFieldType" @change="handleActionTypeChange" class="w-full border-gray-300 rounded-lg shadow-sm">
                            <option value="none">Checkbox Only (Received)</option>
                            <option value="date">Date Input</option>
                            <option value="expiry_date">Date with Expiry Validation</option>
                            <option value="text">Manual Text/Reference Input</option>
                            <option value="sourced_dropdown">Sourced Dropdown (Global Lists)</option>
                        </select>
                    </div>

                    <div v-if="formObject.data.actionFieldType === 'sourced_dropdown'">
                        <label class="block text-xs font-black text-blue-600 uppercase mb-1">Data Source</label>
                        <select v-model="formObject.data.recordsourceId" class="w-full border-blue-300 bg-blue-50 rounded-lg shadow-sm" required>
                            <option :value="null">-- Select a Source --</option>
                            <option v-for="source in availableRecordsources" :key="source.value" :value="source.value">{{ source.label }}</option>
                        </select>
                    </div>

                    <div v-if="formObject.data.actionFieldType === 'expiry_date'">
                        <label class="block text-xs font-black text-blue-600 uppercase mb-1">Validity Period (Months)</label>
                        <input v-model="formObject.data.validityDays" type="number" class="w-full border-blue-300 bg-blue-50 rounded-lg shadow-sm" placeholder="e.g. 3" required>
                    </div>

                    <div v-if="formObject.data.actionFieldType !== 'none'">
                        <label class="block text-xs font-black text-gray-400 uppercase mb-1">Input Placeholder</label>
                        <input v-model="formObject.data.actionFieldLabel" type="text" class="w-full border-gray-300 rounded-lg shadow-sm" placeholder="e.g. Ref Number">
                    </div>

                    <div>
                        <label class="block text-xs font-black text-gray-400 uppercase mb-1">Sort Order</label>
                        <input v-model="formObject.data.sortOrder" type="number" class="w-full border-gray-300 rounded-lg shadow-sm">
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-xs font-black text-gray-400 uppercase mb-1">Interchangeable With</label>
                        <select v-model="formObject.data.eitherDocumentTypeId" class="w-full border-gray-300 rounded-lg shadow-sm">
                            <option :value="null">-- None --</option>
                            <option v-for="option in documentTypes" :key="option.id" :value="option.id">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" v-model="formObject.data.isActive" class="rounded text-blue-600">
                        <span class="text-xs font-bold text-blue-900 uppercase">Active</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" v-model="formObject.data.isOptional" class="rounded text-blue-600">
                        <span class="text-xs font-bold text-blue-900 uppercase">Optional</span>
                    </label>
                </div>

                <div class="flex justify-end gap-3 pt-6 border-t">
                    <button type="button" @click="formObject.data = null" class="text-gray-400 font-bold px-4 py-2">Cancel</button>
                    <button type="submit" class="bg-blue-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-blue-700 transition-all">
                        {{ isCreatingNew ? 'Create Pack Item' : 'Save Pack Item' }}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  slug: { type: String, default: null },
  packId: { type: [String, Number], required: true },
  fileTypeId: { type: [String, Number], default: null }
});

const { showAlert, showConfirm } = useAlerts();

const documentTypes = ref([]);
const availableLists = ref([]);
const isLoading = ref(true);
const formObject = reactive({ data: null });
const isCreatingNew = ref(false);
const isSyncing = ref(false); 

// DUAL-CONTEXT NAVIGATION & API PATHS
const backDestination = computed(() => {
  return props.fileTypeId 
    ? { name: 'admin.niche-factory.document-packs', params: { fileTypeId: props.fileTypeId } }
    : { name: 'admin.product.document-packs', params: { slug: props.slug } };
});

const baseApiUrl = computed(() => {
  return props.slug 
    ? `admin/products/${props.slug}/document-packs/${props.packId}/types`
    : `admin/document-packs/${props.packId}/types`;
});

const sortedDocumentTypes = computed(() => {
  return [...documentTypes.value].sort((a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0));
});

const availableRecordsources = computed(() => {
  return availableLists.value
    .filter(src => !props.slug || src.productId === null || src.productId === undefined || src.productSlug === props.slug)
    .map(src => ({
      value: src.id,
      label: `${src.name}${src.productId ? ` • ${src.productName || 'Product'}` : ' • Global'}`,
    }));
});

const fetchDocumentTypes = async () => {
  isLoading.value = true;
  try {
    const { data } = await apiClient.get(baseApiUrl.value);
    documentTypes.value = Array.isArray(data) ? data : data.data || [];
  } catch (err) { 
    console.error('Failed to load document types:', err); 
  }
  isLoading.value = false;
};

const fetchOptionSources = async () => {
  try {
    const { data } = await apiClient.get('admin/document-option-lists?include_global=1');
    availableLists.value = Array.isArray(data) ? data : data.data || [];
  } catch (e) { 
    console.error("Failed to load option lists:", e); 
  }
};

const selectDocumentType = (docType) => {
  isCreatingNew.value = false;
  formObject.data = {
      ...docType,
      actionFieldType: docType.actionFieldType || docType.action_field_type,
      sortOrder: docType.sortOrder || docType.sort_order,
      validityDays: docType.validityDays || docType.validity_days,
      actionFieldLabel: docType.actionFieldLabel || docType.action_field_label,
      recordsourceId: docType.recordsourceId ?? docType.recordsource_id ?? null,
      isActive: docType.isActive ?? docType.is_active,
      isOptional: docType.isOptional ?? docType.is_optional,
  };
};

const handleAddNew = () => {
  isCreatingNew.value = true;
  formObject.data = {
    name: '', label: '', sortOrder: sortedDocumentTypes.value.length + 1,
    note: '', isActive: true, isOptional: false, actionFieldType: 'none',
    recordsourceId: null, validityDays: null, actionFieldLabel: '',
  };
};

const handleActionTypeChange = () => {
  if (formObject.data.actionFieldType !== 'sourced_dropdown') formObject.data.recordsourceId = null;
  if (formObject.data.actionFieldType !== 'expiry_date') formObject.data.validityDays = null;
};

const handleSubmit = async () => {
  try {
    const url = `${baseApiUrl.value}${!isCreatingNew.value ? '/' + formObject.data.id : ''}`;
    const method = isCreatingNew.value ? 'post' : 'put';
    
    const payload = {
        label: formObject.data.label,
        name: formObject.data.name,
        note: formObject.data.note,
        action_field_type: formObject.data.actionFieldType,
        recordsource_id: formObject.data.recordsourceId,
        validity_days: formObject.data.validityDays,
        action_field_label: formObject.data.actionFieldLabel,
        sort_order: formObject.data.sortOrder,
        either_document_type_id: formObject.data.eitherDocumentTypeId,
        is_active: formObject.data.isActive,
        is_optional: formObject.data.isOptional,
    };

    await apiClient[method](url, payload);
    showAlert('Success', 'Template configuration updated.');
    fetchDocumentTypes();
    formObject.data = null;
  } catch (err) { 
    showAlert('Error', err.response?.data?.message || 'Save failed.'); 
  }
};

const handleDelete = async () => {
  if (await showConfirm('Delete Definition', 'Permanent deletion?')) {
    try {
      await apiClient.delete(`${baseApiUrl.value}/${formObject.data.id}`);
      fetchDocumentTypes();
      formObject.data = null;
    } catch (err) { 
      showAlert('Error', err.response?.data?.message || 'Delete failed.'); 
    }
  }
};

const handleSync = async () => {
  if (!props.slug) return;

  const confirmed = await showConfirm(
    'Sync Document Pack', 
    'This will add any missing document requirements from this pack to all active cases. Proceed?'
  );

  if (!confirmed) return;

  isSyncing.value = true;
  try {
    const { data } = await apiClient.post(`admin/products/${props.slug}/document-packs/${props.packId}/sync`);
    showAlert('Success', data.message || 'Cases synchronized successfully.');
  } catch (err) {
    showAlert('Error', err.response?.data?.message || 'Failed to sync pack items.');
  } finally {
    isSyncing.value = false;
  }
};

onMounted(() => {
  fetchDocumentTypes();
  fetchOptionSources();
});
</script>WorkflowDefinitionController.php