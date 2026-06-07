<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Workflow Engine</h2>
        <p class="text-sm text-gray-500">Automate processes for <span class="font-bold text-indigo-600">{{ product?.name }}</span></p>
      </div>
      <button @click="openDefModal()" class="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold transition-all">
        + Create Workflow
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-280px)]">
      
      <!-- Left Sidebar: Definitions List -->
      <div class="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div class="p-4 border-b bg-gray-50/50">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Workflow Blueprints</h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <div v-for="def in definitions" :key="def.id" 
              @click="selectedDefinition = def"
              class="group flex justify-between items-center p-3 rounded-lg transition-all cursor-pointer border"
              :class="selectedDefinition?.id === def.id 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold shadow-sm' 
                : 'hover:bg-gray-50 border-transparent text-gray-600'">
            <div class="flex flex-col">
                <span class="text-sm">{{ def.name }}</span>
                <span v-if="def.fileType" class="text-[10px] uppercase text-indigo-400 tracking-tighter">{{ def.fileType.name }}</span>
            </div>
            <div class="opacity-0 group-hover:opacity-100 flex gap-2">
                <button @click.stop="openDefModal(def)" class="text-gray-400 hover:text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
            </div>
          </div>
          
          <div v-if="definitions.length === 0" class="p-8 text-center text-gray-400 italic text-sm">
            No workflows defined.
          </div>
        </div>
      </div>

      <!-- Right Column: Step Manager / Details -->
      <div class="lg:col-span-3 h-full overflow-hidden">
        <div v-if="!selectedDefinition" class="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <p class="text-gray-400">Select a workflow definition to manage its logic.</p>
        </div>
        
        <div v-else class="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div class="p-4 border-b flex justify-between items-center bg-gray-50/50">
              <h3 class="font-bold text-gray-800">
                Steps for: <span class="text-indigo-600">{{ selectedDefinition.name }}</span>
              </h3>
              <div class="flex gap-2">
                <!-- We will wire up actual management components next -->
                <button @click="deleteDefinition(selectedDefinition)" class="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded">Delete Workflow</button>
              </div>
          </div>
          <div class="flex-1 overflow-hidden">
              <WorkflowStepManager 
                  :definition="selectedDefinition" 
                  :slug="slug" 
                  :product="product"
              />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Definition Form -->
    <div v-if="isDefModalOpen" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-xl font-bold mb-6 text-gray-900 border-b pb-4">{{ defForm.id ? 'Edit' : 'Create' }} Workflow Definition</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Workflow Name</label>
            <input v-model="defForm.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm" placeholder="e.g. Standard Estate Liquidation">
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Niche Context (Optional)</label>
            <select v-model="defForm.file_type_id" class="w-full border-gray-300 rounded-lg shadow-sm">
                <option :value="null">Apply to ALL Case Types</option>
                <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">Description</label>
            <textarea v-model="defForm.description" rows="3" class="w-full border-gray-300 rounded-lg shadow-sm"></textarea>
          </div>

          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input v-model="defForm.isActive" type="checkbox" id="active" class="h-5 w-5 text-indigo-600 border-gray-300 rounded">
            <label for="active" class="text-sm text-gray-700 font-bold">Workflow is Active</label>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <button @click="closeDefModal" class="text-gray-400 font-bold px-4 py-2">Cancel</button>
          <button @click="saveDefinition" class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-indigo-700">
            Save Workflow
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import WorkflowStepManager from '@/components/admin/workflows/WorkflowStepManager.vue';

const props = defineProps({
  product: Object,
  slug: String
});

const { showConfirm, showAlert } = useAlerts();
const definitions = ref([]);
const fileTypes = ref([]);
const selectedDefinition = ref(null);
const isDefModalOpen = ref(false);

const defForm = reactive({
  id: null,
  name: '',
  description: '',
  file_type_id: null,
  isActive: true
});

const loadData = async () => {
    try {
        const [defRes, ftRes] = await Promise.all([
            apiClient.get(`admin/products/${props.slug}/workflow-definitions`),
            apiClient.get(`admin/products/${props.slug}/file-types`)
        ]);
        definitions.value = defRes.data;
        fileTypes.value = ftRes.data;
    } catch (e) { console.error(e); }
};

const openDefModal = (def = null) => {
    if (def) {
        defForm.id = def.id;
        defForm.name = def.name;
        defForm.description = def.description;
        defForm.file_type_id = def.fileTypeId || def.file_type_id;
        defForm.isActive = !!def.isActive;
    } else {
        defForm.id = null;
        defForm.name = '';
        defForm.description = '';
        defForm.file_type_id = null;
        defForm.isActive = true;
    }
    isDefModalOpen.value = true;
};

const closeDefModal = () => { isDefModalOpen.value = false; };

const saveDefinition = async () => {
    try {
        const url = `admin/products/${props.slug}/workflow-definitions${defForm.id ? '/' + defForm.id : ''}`;
        const method = defForm.id ? 'put' : 'post';
        
        const payload = {
            name: defForm.name,
            description: defForm.description,
            file_type_id: defForm.file_type_id,
            is_active: defForm.isActive
        };

        await apiClient[method](url, payload);
        closeDefModal();
        loadData();
        showAlert('Success', 'Workflow Definition saved.');
    } catch (e) { showAlert('Error', 'Save failed.'); }
};

const deleteDefinition = async (def) => {
    if (await showConfirm('Delete Workflow', `Are you sure? This will delete the workflow blueprint and all its internal steps.`)) {
        try {
            await apiClient.delete(`admin/products/${props.slug}/workflow-definitions/${def.id}`);
            selectedDefinition.value = null;
            loadData();
            showAlert('Success', 'Workflow removed.');
        } catch (e) { showAlert('Error', 'Delete failed.'); }
    }
};

onMounted(loadData);
</script>