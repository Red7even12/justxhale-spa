<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 border-b border-gray-200 pb-4">
      <h1 class="text-2xl font-bold text-gray-900">System Mails Setup</h1>
      <p class="mt-1 text-sm text-gray-500">Configure automated email templates for specific workflows and documents.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- LEFT COLUMN: Selectors & Editor -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- 1. Cascading Context Selectors -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">1. Select Target Context</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Product -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Product</label>
              <select v-model="filters.productId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                <option :value="null" disabled>Select Product</option>
                <option v-for="p in options.products" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <!-- File Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Case File Type</label>
              <select v-model="filters.fileTypeId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                <option :value="null" disabled>Select File Type</option>
                <option v-for="f in options.fileTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
              </select>
            </div>

            <!-- Function Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Function Type</label>
              <select v-model="filters.functionType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm">
                <option :value="null" disabled>Select Function</option>
                <option value="document">Document Pack Request</option>
                <option value="workflow">Workflow Task Notification</option>
              </select>
            </div>

            <!-- Specific Target Item -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Specific Target Item</label>
              <select v-model="filters.targetItem" :disabled="!options.targetItems.length || isLoadingItems" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400">
                <option :value="null" disabled>{{ isLoadingItems ? 'Loading items...' : 'Select Target Item' }}</option>
                <option v-for="t in options.targetItems" :key="t.id" :value="t">{{ t.displayName || t.display_name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. The Markdown Editor (Only visible when a target is selected) -->
        <div v-if="filters.targetItem" class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">2. Email Template Content</h2>
            <div class="flex items-center">
              <input id="is_active" type="checkbox" v-model="form.isActive" class="h-4 w-4 text-brand-blue-600 focus:ring-brand-blue-500 border-gray-300 rounded">
              <label for="is_active" class="ml-2 block text-sm text-gray-900">Template Active</label>
            </div>
          </div>

          <div v-if="isLoadingTemplate" class="text-sm text-gray-500 py-4">Loading existing template...</div>

          <div v-else class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Subject Line</label>
              <input type="text" v-model="form.subjectTemplate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" placeholder="e.g., Action Required: [document_name]">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Intro Paragraph (Salutation)</label>
              <textarea v-model="form.introParagraph" rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" placeholder="e.g., Dear [recipient_name],"></textarea>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 flex justify-between">
                <span>Body Paragraph</span>
                <span class="text-xs text-gray-500 font-normal">Supports **Markdown** for bold/italics</span>
              </label>
              <textarea v-model="form.bodyParagraph" rows="8" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm" placeholder="Type the main body of the email here..."></textarea>
            </div>

            <!-- Messages & Save Button -->
            <div class="flex items-center justify-between pt-4">
              <div class="text-sm">
                <span v-if="saveMessage" class="text-green-600 font-medium">{{ saveMessage }}</span>
                <span v-if="saveError" class="text-red-600 font-medium">{{ saveError }}</span>
              </div>
              <button 
                @click="saveTemplate" 
                :disabled="isSaving || !isFormValid"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue-600 hover:bg-brand-blue-700 focus:outline-none disabled:opacity-50"
              >
                {{ isSaving ? 'Saving...' : 'Save Template' }}
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Cheat Sheet -->
      <div class="lg:col-span-1">
        <div class="bg-gray-50 border border-gray-200 shadow-sm rounded-lg p-5 sticky top-6">
          <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-brand-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available Variables
          </h3>
          <p class="text-xs text-gray-600 mb-4">
            Copy and paste these exact tags (including brackets) into your template. The system will auto-fill them when sending.
          </p>

          <ul class="space-y-3 text-sm">
            <li><code class="bg-white border px-1 py-0.5 rounded text-brand-blue-700">[recipient_name]</code><br><span class="text-xs text-gray-500">The person receiving the email</span></li>
            <li><code class="bg-white border px-1 py-0.5 rounded text-brand-blue-700">[case_reference]</code><br><span class="text-xs text-gray-500">The File Reference (e.g., est-123)</span></li>
            <li><code class="bg-white border px-1 py-0.5 rounded text-brand-blue-700">[case_name]</code><br><span class="text-xs text-gray-500">The File Name (e.g., John Doe Est)</span></li>
            <li><code class="bg-white border px-1 py-0.5 rounded text-brand-blue-700">[sender_name]</code><br><span class="text-xs text-gray-500">The user triggering the email</span></li>
            <li><code class="bg-white border px-1 py-0.5 rounded text-brand-blue-700">[subscriber_name]</code><br><span class="text-xs text-gray-500">The active Law Firm / Tenant</span></li>
            <li class="pt-2 border-t border-gray-200">
              <code class="bg-white border px-1 py-0.5 rounded text-brand-blue-700">[document_name]</code><br><span class="text-xs text-gray-500">Only works if Function = Document</span>
            </li>
            <li>
              <code class="bg-white border px-1 py-0.5 rounded text-brand-blue-700">[task_name]</code><br><span class="text-xs text-gray-500">Only works if Function = Workflow</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import apiClient from '@/services/api';

// --- STATE ---
const options = reactive({
  products: [],
  fileTypes: [],
  targetItems: []
});

const filters = reactive({
  productId: null,
  fileTypeId: null,
  functionType: null,
  targetItem: null
});

const form = reactive({
  subjectTemplate: '',
  introParagraph: '',
  bodyParagraph: '',
  isActive: true
});

const isLoadingItems = ref(false);
const isLoadingTemplate = ref(false);
const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref('');

// Helper to determine Laravel morph class string
const resolveMorphClass = (typeClass) => {
    // Check for camelCase first (from interceptor), then snake_case fallback
    const type = typeClass || 'document_type';
    return type === 'document_type' ? 'App\\Models\\DocumentType' : 'App\\Models\\WorkflowStep';
};

const isFormValid = computed(() => {
    return form.subjectTemplate.trim() !== '' && form.bodyParagraph.trim() !== '';
});

// --- LIFECYCLE ---
onMounted(async () => {
  try {
    const res = await apiClient.get('/admin/communication-setup/context-options');
    options.products = res.data.products;
    // Removed: options.fileTypes = ...
  } catch (error) {
    console.error("Failed to load context options", error);
  }
});

// --- WATCHERS ---
// CASCADING STEP 1: When Product changes, fetch File Types
watch(() => filters.productId, async (newProductId) => {
    // Hard reset all downstream data
    filters.fileTypeId = null;
    filters.functionType = null;
    filters.targetItem = null;
    options.fileTypes = [];
    options.targetItems = [];
    
    if (newProductId) {
        try {
            const res = await apiClient.get('/admin/communication-setup/file-types', {
                params: { product_id: newProductId }
            });
            options.fileTypes = res.data;
        } catch (error) {
            console.error("Failed to load file types", error);
        }
    }
});

// CASCADING STEP 2: When File Type OR Function Type changes, fetch Target Items
watch([() => filters.fileTypeId, () => filters.functionType], async ([fId, func]) => {
  // Hard reset downstream data
  filters.targetItem = null;
  options.targetItems = [];
  saveMessage.value = '';
  saveError.value = '';
  
  // Only trigger the API if ALL THREE top levels are selected
  if (filters.productId && fId && func) {
    isLoadingItems.value = true;
    try {
      const res = await apiClient.get('/admin/communication-setup/target-items', {
        params: { product_id: filters.productId, file_type_id: fId, function_type: func }
      });
      options.targetItems = res.data;
    } catch (error) {
      console.error("Failed to fetch target items", error);
    } finally {
      isLoadingItems.value = false;
    }
  }
});

watch(() => filters.targetItem, async (target) => {
    saveMessage.value = '';
    saveError.value = '';
    
    form.subjectTemplate = '';
    form.introParagraph = 'Dear [recipient_name],';
    form.bodyParagraph = '';
    form.isActive = true;

    if (target) {
        isLoadingTemplate.value = true;
        try {
            const res = await apiClient.get('/admin/communication-setup/template', {
                params: {
                    product_id: filters.productId,
                    templateable_type: resolveMorphClass(target.typeClass || target.type_class),
                    templateable_id: target.id
                }
            });

            if (res.data && res.data.id) {
                // camelCase first (from interceptor)
                form.subjectTemplate = res.data.subjectTemplate || res.data.subject_template;
                form.introParagraph = res.data.introParagraph || res.data.intro_paragraph;
                form.bodyParagraph = res.data.bodyParagraph || res.data.body_paragraph;
                form.isActive = res.data.isActive !== undefined ? res.data.isActive : res.data.is_active;
            } else {
                if (filters.functionType === 'document') {
                    form.subjectTemplate = 'Action Required: Updated [document_name] Needed';
                    form.bodyParagraph = 'We are currently updating our records for case **[case_reference]**.\n\nOur system indicates that the **[document_name]** on file is approaching its expiry date or requires a fresh version.\n\nPlease provide an updated version at your earliest convenience.\n\nKind regards,\n**[sender_name]**\n[subscriber_name]';
                } else {
                    form.subjectTemplate = 'Task Notification: [task_name]';
                    form.bodyParagraph = 'This is an automated notification regarding case **[case_reference]**.\n\nPlease note that the following task requires your attention or is currently underway: **[task_name]**.\n\nKind regards,\n**[sender_name]**\n[subscriber_name]';
                }
            }
        } catch (error) {
            console.error("Failed to load template", error);
        } finally {
            isLoadingTemplate.value = false;
        }
    }
});

// --- ACTIONS ---
const saveTemplate = async () => {
    isSaving.value = true;
    saveMessage.value = '';
    saveError.value = '';

    // The outgoing POST payload. We map it to pure snake_case for Laravel validation.
    const payload = {
        product_id: filters.productId,
        templateable_type: resolveMorphClass(filters.targetItem.typeClass || filters.targetItem.type_class),
        templateable_id: filters.targetItem.id,
        subject_template: form.subjectTemplate,
        intro_paragraph: form.introParagraph,
        body_paragraph: form.bodyParagraph,
        is_active: form.isActive
    };

    try {
        await apiClient.post('/admin/communication-setup/template', payload);
        saveMessage.value = "Template saved successfully!";
        setTimeout(() => saveMessage.value = '', 3000);
    } catch (error) {
        saveError.value = error.response?.data?.message || "Failed to save template.";
        console.error(error);
    } finally {
        isSaving.value = false;
    }
};
</script>