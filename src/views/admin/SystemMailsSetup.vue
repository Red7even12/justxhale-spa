<template>
  <div class="space-y-6">
    <!-- Header Scoped to Product -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">System Mails Setup</h2>
        <p class="text-sm text-gray-500">Configure automated email templates for <span class="font-bold text-indigo-600">{{ product?.name }}</span></p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-220px)] overflow-hidden">
      
      <!-- LEFT COLUMN: Selectors & Editor (Scrollable) -->
      <div class="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
        
        <!-- 1. Cascading Context Selectors -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">1. Select Target Context</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- File Type -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Case Niche</label>
              <select v-model="filters.fileTypeId" class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option :value="null">-- Select Niche --</option>
                <option v-for="f in options.fileTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
              </select>
            </div>

            <!-- Function Type -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Event Group</label>
              <select v-model="filters.functionType" class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option :value="null">-- Select Function --</option>
                <option value="document">Document Pack Request</option>
                <option value="workflow">Workflow Task Notification</option>
              </select>
            </div>

            <!-- Specific Target Item -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Target Action/Item</label>
              <select v-model="filters.targetItem" :disabled="!options.targetItems.length || isLoadingItems" class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400">
                <option :value="null">{{ isLoadingItems ? 'Loading...' : '-- Select Item --' }}</option>
                <option v-for="t in options.targetItems" :key="t.id" :value="t">{{ t.displayName || t.display_name }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. The Markdown Editor -->
        <div v-if="filters.targetItem" class="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div class="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">2. Email Template Content</h3>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.isActive" class="rounded text-indigo-600">
              <span class="text-[10px] font-black text-gray-500 uppercase">Active</span>
            </label>
          </div>

          <div v-if="isLoadingTemplate" class="p-12 text-center animate-pulse text-gray-400 italic">
            Fetching template context...
          </div>

          <div v-else class="p-6 space-y-6">
            <div>
              <label class="block text-xs font-black text-gray-400 uppercase mb-1">Subject Line</label>
              <input type="text" v-model="form.subjectTemplate" class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Action Required: [document_name]">
            </div>

            <div>
              <label class="block text-xs font-black text-gray-400 uppercase mb-1">Salutation (Intro)</label>
              <input type="text" v-model="form.introParagraph" class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Dear [recipient_name],">
            </div>

            <div>
              <div class="flex justify-between items-end mb-1">
                <label class="block text-xs font-black text-gray-400 uppercase">Body Content</label>
                <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Markdown Enabled</span>
              </div>
              <textarea v-model="form.bodyParagraph" rows="10" class="w-full border-gray-300 rounded-lg shadow-sm text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500" placeholder="Type main body..."></textarea>
            </div>

            <!-- Messages & Save Button -->
            <div class="flex items-center justify-between pt-4 border-t">
              <div class="text-xs">
                <span v-if="saveMessage" class="text-green-600 font-bold">{{ saveMessage }}</span>
                <span v-if="saveError" class="text-red-600 font-bold">{{ saveError }}</span>
              </div>
              <button 
                @click="saveTemplate" 
                :disabled="isSaving || !isFormValid"
                class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-gray-400 italic p-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Select a context above to edit its email template.
        </div>

      </div>

      <!-- RIGHT COLUMN: Variable Cheat Sheet -->
      <div class="lg:col-span-1 h-full overflow-hidden">
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-5 h-full flex flex-col">
          <h3 class="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Dynamic Variables
          </h3>
          
          <div class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            <div class="space-y-1">
                <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[recipient_name]</code>
                <p class="text-[10px] text-indigo-700 leading-tight">The person receiving the email (Contact Person)</p>
            </div>
            
            <div class="space-y-1">
                <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[case_reference]</code>
                <p class="text-[10px] text-indigo-700 leading-tight">The File Reference (e.g. est-123)</p>
            </div>

            <div class="space-y-1">
                <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[case_name]</code>
                <p class="text-[10px] text-indigo-700 leading-tight">The File/Estate Name (e.g. John Doe Est)</p>
            </div>

            <div class="space-y-1">
                <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[sender_name]</code>
                <p class="text-[10px] text-indigo-700 leading-tight">The system user triggering the dispatch</p>
            </div>

            <div class="space-y-1">
                <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[subscriber_name]</code>
                <p class="text-[10px] text-indigo-700 leading-tight">The Law Firm or Organization name</p>
            </div>

            <div class="pt-4 mt-4 border-t border-indigo-200 space-y-4">
                <div class="space-y-1">
                    <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[document_name]</code>
                    <p class="text-[10px] text-indigo-700 leading-tight font-bold italic">Context: Document Pack Request</p>
                </div>

                <div class="space-y-1">
                    <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[task_name]</code>
                    <p class="text-[10px] text-indigo-700 leading-tight font-bold italic">Context: Workflow Task Notification</p>
                </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import apiClient from '@/services/api';

const props = defineProps({
  product: Object,
  slug: String
});

// --- STATE ---
const options = reactive({
  fileTypes: [],
  targetItems: []
});

const filters = reactive({
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
    const type = typeClass || 'document_type';
    return type === 'document_type' ? 'App\\Models\\DocumentType' : 'App\\Models\\WorkflowStep';
};

const isFormValid = computed(() => {
    return form.subjectTemplate.trim() !== '' && form.bodyParagraph.trim() !== '';
});

// --- LIFECYCLE ---
onMounted(async () => {
    if (props.slug) {
        loadNiches();
    }
});

const loadNiches = async () => {
    try {
        const res = await apiClient.get('/admin/communication-setup/file-types', {
            params: { product_id: props.product.id }
        });
        options.fileTypes = res.data;
    } catch (error) {
        console.error("Failed to load file types", error);
    }
}

// --- WATCHERS ---
// When File Type OR Function Type changes, fetch Target Items
watch([() => filters.fileTypeId, () => filters.functionType], async ([fId, func]) => {
  filters.targetItem = null;
  options.targetItems = [];
  saveMessage.value = '';
  saveError.value = '';
  
  if (props.product.id && fId && func) {
    isLoadingItems.value = true;
    try {
      const res = await apiClient.get('/admin/communication-setup/target-items', {
        params: { product_id: props.product.id, file_type_id: fId, function_type: func }
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
                    product_id: props.product.id,
                    templateable_type: resolveMorphClass(target.typeClass || target.type_class),
                    templateable_id: target.id
                }
            });

            if (res.data && res.data.id) {
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

    const payload = {
        product_id: props.product.id,
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-indigo-200 rounded-full;
}
</style>