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

    <div class="space-y-6">

      <div class="flex flex-col gap-6">

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div class="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Email Templates</h3>
            <div class="flex items-center gap-3">
              <input v-model="searchQuery" type="text" placeholder="Search templates..."
                class="border-gray-300 rounded-lg shadow-sm text-xs focus:ring-indigo-500 focus:border-indigo-500 w-48">
              <button @click="newTemplate"
                class="bg-indigo-600 text-white text-xs font-black uppercase px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all">
                + New Template
              </button>
            </div>
          </div>

          <!-- Template Index Table -->
          <div v-if="templates.length" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50/80 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th class="px-4 py-3">Template Key</th>
                  <th class="px-4 py-3">Use Case</th>
                  <th class="px-4 py-3 hidden md:table-cell">Subject</th>
                  <th class="px-4 py-3 text-center">Status</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in filteredTemplates" :key="t.id"
                  :class="['border-t border-gray-100 cursor-pointer transition-all', selectedKey === (t.triggerKey || t.trigger_key) ? 'bg-indigo-50/60' : 'hover:bg-gray-50']"
                  @click="selectTemplate(t)">
                  <td class="px-4 py-3 font-mono text-xs font-bold text-gray-700">{{ t.triggerKey || t.trigger_key }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 max-w-40 truncate">{{ t.useCase || t.use_case || "-" }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 max-w-56 truncate hidden md:table-cell">{{ t.subjectTemplate || t.subject_template }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="['inline-block px-2 py-0.5 text-[10px] rounded font-black uppercase', t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400']">
                      {{ t.is_active ? 'Active' : 'Off' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button type="button" @click.stop="selectTemplate(t)"
                      class="text-[10px] font-black uppercase px-3 py-1.5 rounded border border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white transition-all">
                      Edit
                    </button>
                  </td>
                </tr>
                <tr v-if="!filteredTemplates.length">
                  <td colspan="5" class="px-4 py-8 text-center text-gray-400 italic text-xs">No templates match "{{ searchQuery }}".</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="flex flex-col items-center justify-center text-gray-400 italic p-12 bg-gray-50/50 min-h-48">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            No templates yet. Click "+ New Template" to create your first.
          </div>
        </div>
      </div>


      <!-- Slide-Over: Template Editor + Variables -->
      <div v-if="isPanelOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-gray-900/40" @click="closePanel"></div>
        <div class="absolute right-0 top-0 h-full w-[75vw] max-md:w-full bg-white shadow-2xl flex flex-col">
          <div class="flex justify-between items-center p-4 border-b bg-gray-50/50 shrink-0">
            <h3 class="text-sm font-black text-gray-700 uppercase tracking-widest">
              {{ form.id ? 'Edit: ' + form.triggerKey : 'New Template' }}
            </h3>
            <button type="button" @click="closePanel"
              class="text-gray-400 hover:text-gray-700 text-2xl leading-none font-black transition-all">&times;</button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div class="grid grid-cols-1 xl:grid-cols-[1fr_250px] gap-8">
              <div class="space-y-6">
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
              </div>

              <!-- Dynamic Variables cheat sheet -->
              <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 self-start">
                <h4 class="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">Dynamic Variables</h4>
                <div class="space-y-2">
                  <div v-for="v in dynamicVariables" :key="v.token">
                    <code class="text-[10px] font-black bg-white border border-indigo-200 px-1.5 py-0.5 rounded text-indigo-600">{{ v.token }}</code>
                    <p class="text-[9px] text-indigo-700 leading-tight" :class="v.context ? 'font-bold italic' : ''">{{ v.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 border-t bg-gray-50/50 shrink-0">
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
            <div class="flex items-center gap-2">
              <button type="button" @click="closePanel"
                class="text-xs font-black uppercase text-gray-500 px-4 py-2 hover:text-gray-800 transition-all">Cancel</button>
              <button @click="saveTemplate" :disabled="isSaving || !isFormValid"
                class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all disabled:opacity-50">
                {{ isSaving ? 'Saving...' : 'Save Template' }}
              </button>
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
const isPanelOpen = ref(false);
const isSaving = ref(false);
const searchQuery = ref('');
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

const filteredTemplates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return templates.value;
  return templates.value.filter((t) => {
    const key = (t.triggerKey || t.trigger_key || '').toLowerCase();
    const use = (t.useCase || t.use_case || '').toLowerCase();
    const subj = (t.subjectTemplate || t.subject_template || '').toLowerCase();
    return key.includes(q) || use.includes(q) || subj.includes(q);
  });
});

const dynamicVariables = [
  { token: '[recipient_name]', desc: 'The person receiving the email (Contact Person)' },
  { token: '[case_reference]', desc: 'The File Reference (e.g. est-123)' },
  { token: '[case_name]', desc: 'The File/Estate Name (e.g. John Doe Est)' },
  { token: '[sender_name]', desc: 'The system user triggering the dispatch' },
  { token: '[sender_email]', desc: 'Email of the user dispatching the email (reply-to)' },
  { token: '[magic_link]', desc: 'Secure, expiring (72h) upload link for the recipient. Document contexts only.' },
  { token: '[expiry_date]', desc: 'The reminder / document expiry due date' },
  { token: '[subscriber_name]', desc: 'The Law Firm or Organization name' },
  { token: '[document_name]', desc: 'Context: Document Pack Request', context: true },
  { token: '[task_name]', desc: 'Context: Workflow Task Notification', context: true }
];

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
  isPanelOpen.value = true;
  saveMessage.value = '';
  saveError.value = '';
};

const closePanel = () => {
  isPanelOpen.value = false;
  isEditing.value = false;
  selectedKey.value = '';
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
  isPanelOpen.value = true;
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
