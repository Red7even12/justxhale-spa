<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">System Mails Setup</h2>
        <p class="text-sm text-gray-500">
          Manage global automated email templates. Attach them to documents via the
          document item's <span class="font-bold text-indigo-600">Email Template Key</span> dropdown.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-220px)] overflow-hidden">

      <!-- LEFT COLUMN: Template Library & Editor -->
      <div class="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div class="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Email Templates</h3>
            <button @click="newTemplate"
              class="bg-indigo-600 text-white text-xs font-black uppercase px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all">
              + New Template
            </button>
          </div>

          <!-- Template List -->
          <div v-if="templates.length" class="max-h-60 overflow-y-auto p-2 space-y-1 border-b custom-scrollbar">
            <button v-for="t in templates" :key="t.id" @click="selectTemplate(t)"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                selectedKey === (t.triggerKey || t.trigger_key) ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'hover:bg-gray-50 border-transparent text-gray-600'
              ]">
              <div class="flex justify-between items-center gap-2">
                <span class="font-mono truncate">{{ t.triggerKey || t.trigger_key }}</span>
                <span :class="['px-2 py-0.5 text-[10px] rounded font-black uppercase shrink-0', t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400']">
                  {{ t.is_active ? 'Active' : 'Off' }}
                </span>
              </div>
              <div v-if="t.useCase || t.use_case" class="text-[10px] text-gray-400 font-bold uppercase truncate">{{ t.useCase || t.use_case }}</div>
            </button>
          </div>
          <!-- Editor -->
          <div v-if="isEditing" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase mb-1">Template Key (Internal)</label>
                <input v-model="form.triggerKey" type="text" :disabled="!!form.id"
                  class="w-full border-gray-300 rounded-lg shadow-sm text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 disabled:bg-gray-100"
                  placeholder="e.g. reminder_doc_expired" required>
                <p class="text-[10px] text-gray-400 mt-1">Must match the <code>document_type.email_template_key</code>. Locked after creation.</p>
              </div>
              <div>
                <label class="block text-xs font-black text-gray-400 uppercase mb-1">Use Case (Scope)</label>
                <input v-model="form.useCase" type="text"
                  class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Document expiry reminder">
              </div>
            </div>

            <div>
              <label class="block text-xs font-black text-gray-400 uppercase mb-1">Subject Line</label>
              <input v-model="form.subjectTemplate" type="text"
                class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Action Required: [document_name]">
            </div>

            <div>
              <label class="block text-xs font-black text-gray-400 uppercase mb-1">Salutation (Intro)</label>
              <input v-model="form.introParagraph" type="text"
                class="w-full border-gray-300 rounded-lg shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Dear [recipient_name],">
            </div>

            <div>
              <div class="flex justify-between items-end mb-1">
                <label class="block text-xs font-black text-gray-400 uppercase">Body Content</label>
                <span class="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Markdown Enabled</span>
              </div>
              <textarea v-model="form.bodyParagraph" rows="10"
                class="w-full border-gray-300 rounded-lg shadow-sm text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Type main body..."></textarea>
            </div>

            <div class="flex items-center justify-between pt-4 border-t">
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="form.isActive" class="rounded text-indigo-600">
                  <span class="text-[10px] font-black text-gray-500 uppercase">Active</span>
                </label>
                <div class="text-xs">
                  <span v-if="saveMessage" class="text-green-600 font-bold">{{ saveMessage }}</span>
                  <span v-if="saveError" class="text-red-600 font-bold">{{ saveError }}</span>
                </div>
              </div>
              <button @click="saveTemplate" :disabled="isSaving || !isFormValid"
                class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all disabled:opacity-50">
                {{ isSaving ? 'Saving...' : 'Save Template' }}
              </button>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center text-gray-400 italic p-12 bg-gray-50/50 min-h-48">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ templates.length ? 'Select a template above or create a new one.' : 'No templates yet. Click "+ New Template" to create your first.' }}
          </div>
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
              <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[sender_email]</code>
              <p class="text-[10px] text-indigo-700 leading-tight">Email of the user dispatching the email (reply-to)</p>
            </div>
            <div class="space-y-1">
              <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[magic_link]</code>
              <p class="text-[10px] text-indigo-700 leading-tight">Secure, expiring (72h) upload link for the recipient. Document contexts only.</p>
            </div>
            <div class="space-y-1">
              <code class="text-xs font-black bg-white border border-indigo-200 px-2 py-0.5 rounded text-indigo-600 shadow-sm">[expiry_date]</code>
              <p class="text-[10px] text-indigo-700 leading-tight">The reminder / document expiry due date</p>
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
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@/services/api';

const props = defineProps({
  product: Object,
  slug: String
});

const templates = ref([]);
const selectedKey = ref('');
const isEditing = ref(false);
const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref('');

const form = reactive({
  id: null,
  triggerKey: '',
  useCase: '',
  subjectTemplate: '',
  introParagraph: '',
  bodyParagraph: '',
  isActive: true
});

const isFormValid = computed(() =>
  form.triggerKey.trim() !== '' &&
  form.subjectTemplate.trim() !== '' &&
  form.bodyParagraph.trim() !== ''
);

const fetchTemplates = async () => {
  try {
    const res = await apiClient.get('/admin/communication-setup/templates');
    templates.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (error) {
    console.error('Failed to load templates', error);
  }
};

const newTemplate = () => {
  form.id = null;
  form.triggerKey = '';
  form.useCase = '';
  form.subjectTemplate = '';
  form.introParagraph = 'Dear [recipient_name],';
  form.bodyParagraph = '';
  form.isActive = true;
  selectedKey.value = '';
  isEditing.value = true;
  saveMessage.value = '';
  saveError.value = '';
};

const selectTemplate = (t) => {
  form.id = t.id;
  form.triggerKey = t.triggerKey || t.trigger_key;
  form.useCase = t.useCase || t.use_case || '';
  form.subjectTemplate = t.subjectTemplate || t.subject_template;
  form.introParagraph = t.introParagraph || t.intro_paragraph;
  form.bodyParagraph = t.bodyParagraph || t.body_paragraph;
  form.isActive = (t.isActive ?? t.is_active) !== undefined ? (t.isActive ?? t.is_active) : true;
  selectedKey.value = t.triggerKey || t.trigger_key;
  isEditing.value = true;
  saveMessage.value = '';
  saveError.value = '';
};

const saveTemplate = async () => {
  isSaving.value = true;
  saveMessage.value = '';
  saveError.value = '';
  try {
    await apiClient.post('/admin/communication-setup/template', {
      trigger_key: form.triggerKey,
      use_case: form.useCase || null,
      subject_template: form.subjectTemplate,
      intro_paragraph: form.introParagraph,
      body_paragraph: form.bodyParagraph,
      is_active: form.isActive
    });
    saveMessage.value = 'Template saved successfully!';
    setTimeout(() => (saveMessage.value = ''), 3000);
    await fetchTemplates();
  } catch (error) {
    saveError.value = error.response?.data?.message || 'Failed to save template.';
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(fetchTemplates);
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
