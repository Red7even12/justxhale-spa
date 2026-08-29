<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">Casefile Types (Niches)</h2>
        <p class="text-sm text-gray-500">Define and assemble niche blueprints within <span class="font-bold text-indigo-600">{{ product?.name }}</span></p>
      </div>
      <button @click="openModal()" class="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold transition-all">
        + Add New Niche
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Tab Order</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Niche Name</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">System Slug</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">UX Layout</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Doc Packs</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Workflows</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Teams</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="niche in niches" :key="niche.id" class="hover:bg-indigo-50/30 transition-colors">
            <!-- Sort Order -->
            <td class="px-4 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-gray-100 text-gray-800 rounded-lg h-6 w-6 text-xs font-black">
                {{ niche.sort_order ?? niche.sortOrder ?? 1 }}
              </span>
            </td>
            <td class="px-6 py-4 font-bold text-gray-900">{{ niche.name }}</td>
            <td class="px-6 py-4 font-mono text-xs text-gray-400">{{ niche.slug }}</td>
            <td class="px-6 py-4 text-center">
              <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {{ niche.workspaceTemplate || niche.workspace_template }}
              </span>
            </td>
            <!-- Attached Doc Packs -->
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-purple-50 text-purple-700 rounded-full h-7 px-3 text-xs font-bold border border-purple-100">
                📦 {{ niche.document_packs_count ?? niche.documentPacks?.length ?? 0 }}
              </span>
            </td>
            <!-- Attached Workflows -->
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-blue-50 text-blue-700 rounded-full h-7 px-3 text-xs font-bold border border-blue-100">
                ⚡ {{ niche.workflow_definitions_count ?? niche.workflowDefinitions?.length ?? 0 }}
              </span>
            </td>
            <!-- Authorized Teams -->
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-full h-7 px-3 text-xs font-bold border border-emerald-100">
                👥 {{ niche.teams_count ?? niche.teams?.length ?? 'All' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="(niche.is_active ?? niche.isActive) ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'" class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border">
                {{ (niche.is_active ?? niche.isActive) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-sm font-medium">
                <router-link :to="{ name: 'admin.product.file-type-fields', params: { slug: slug, fileTypeId: niche.id } }" class="text-indigo-600 hover:text-indigo-900">Fields</router-link>
                <button @click="openModal(niche)" class="text-gray-400 hover:text-gray-600">Edit</button>
                <button @click="deleteNiche(niche)" class="text-red-400 hover:text-red-600">Archive</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Niche Blueprint Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-900 border-b pb-3">{{ form.id ? 'Edit' : 'Create' }} Niche Blueprint</h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-4">
            <div class="col-span-2">
              <label class="block text-xs font-black text-gray-500 uppercase mb-1">Display Name</label>
              <input v-model="form.name" type="text" class="w-full border-gray-300 rounded-lg shadow-sm text-sm" placeholder="e.g. Contractor Entity">
            </div>

            <div>
              <label class="block text-xs font-black text-gray-500 uppercase mb-1">Tab Sort Order</label>
              <input v-model.number="form.sort_order" type="number" min="1" class="w-full border-gray-300 rounded-lg shadow-sm text-sm font-bold text-center" placeholder="1">
            </div>
          </div>

          <div>
            <label class="block text-xs font-black text-gray-500 uppercase mb-1">System Slug (Unique)</label>
            <input v-model="form.slug" type="text" class="w-full border-gray-300 rounded-lg shadow-sm font-mono text-sm" placeholder="e.g. contractor_entity">
          </div>

          <!-- 1. ATTACH DOCUMENT PACKS -->
          <div class="border rounded-xl p-4 bg-gray-50/50">
            <label class="text-xs font-black text-purple-700 uppercase mb-2 flex items-center gap-1.5">
              <span>📦 Attach Document Packs (Workspace Tabs)</span>
            </label>
            <div v-if="catalogDocPacks.length === 0" class="text-xs text-gray-400 italic">
              No Document Packs created yet for this product.
            </div>
            <div v-else class="space-y-2 max-h-32 overflow-y-auto">
              <label v-for="pack in catalogDocPacks" :key="pack.id" class="flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer p-1.5 rounded hover:bg-white">
                <input type="checkbox" :value="pack.id" v-model="form.document_pack_ids" class="rounded text-purple-600 border-gray-300">
                <span>{{ pack.name }}</span>
              </label>
            </div>
          </div>

          <!-- 2. ATTACH WORKFLOWS -->
          <div class="border rounded-xl p-4 bg-gray-50/50">
            <label class="flex text-xs font-black text-blue-700 uppercase mb-2 items-center gap-1.5">
              <span>⚡ Attach Workflow Processes</span>
            </label>
            <div v-if="catalogWorkflows.length === 0" class="text-xs text-gray-400 italic">
              No Workflows created yet for this product.
            </div>
            <div v-else class="space-y-2 max-h-32 overflow-y-auto">
              <label v-for="wf in catalogWorkflows" :key="wf.id" class="flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer p-1.5 rounded hover:bg-white">
                <input type="checkbox" :value="wf.id" v-model="form.workflow_ids" class="rounded text-blue-600 border-gray-300">
                <span>{{ wf.name }}</span>
              </label>
            </div>
          </div>

          <!-- 3. AUTHORIZED TEAMS (RBAC / POPIA SCOPING) -->
          <div class="border rounded-xl p-4 bg-gray-50/50">
            <label class="text-xs font-black text-emerald-700 uppercase mb-2 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span class="material-icons text-sm">groups</span>
                <span>Authorized Teams (Tab Access Scoping)</span>
              </span>
              <span class="text-[10px] font-normal text-gray-400">Optional</span>
            </label>
            <div v-if="subscriberTeams.length === 0" class="text-xs text-gray-400 italic">
              No teams created yet. All users will have access by default.
            </div>
            <div v-else class="space-y-2 max-h-32 overflow-y-auto">
              <label v-for="team in subscriberTeams" :key="team.id" class="flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer p-1.5 rounded hover:bg-white">
                <input type="checkbox" :value="team.id" v-model="form.team_ids" class="rounded text-emerald-600 border-gray-300">
                <span>{{ team.name }}</span>
              </label>
            </div>
            <p class="text-[10px] text-gray-400 mt-2 italic">
              * Tip: Admins always have access. Leaving all unchecked grants access to all teams.
            </p>
          </div>

          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <input v-model="form.is_active" type="checkbox" id="active" class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
            <label for="active" class="text-xs text-gray-700 font-bold">Niche is Active</label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3 border-t pt-4">
          <button @click="showModal = false" class="text-gray-400 font-bold text-xs px-4 py-2">Cancel</button>
          <button @click="save" class="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow hover:bg-indigo-700">
            {{ form.id ? 'Update Niche' : 'Create Niche' }}
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
import teamService from '@/services/teamService';

const props = defineProps({
  product: Object,
  slug: String
});

const { showConfirm, showAlert } = useAlerts();
const niches = ref([]);
const catalogDocPacks = ref([]);
const catalogWorkflows = ref([]);
const subscriberTeams = ref([]);
const showModal = ref(false);

const form = reactive({
  id: null,
  name: '',
  slug: '',
  workspace_template: 'TemplateStandard',
  sort_order: 1,
  is_active: true,
  document_pack_ids: [],
  workflow_ids: [],
  team_ids: []
});

const loadCatalog = async () => {
  try {
    const [packsRes, wfRes, teamsRes] = await Promise.all([
      apiClient.get(`admin/products/${props.slug}/document-packs`),
      apiClient.get(`admin/products/${props.slug}/workflow-definitions`),
      teamService.getTeams().catch(() => ({ data: [] }))
    ]);
    catalogDocPacks.value = packsRes.data?.data || packsRes.data || [];
    catalogWorkflows.value = wfRes.data?.data || wfRes.data || [];
    subscriberTeams.value = teamsRes.data?.data || teamsRes.data || [];
  } catch (error) {
    console.error("Catalog/Teams load failed", error);
  }
};

const loadNiches = async () => {
  try {
    const { data } = await apiClient.get(`admin/products/${props.slug}/file-types`);
    niches.value = data;
  } catch (error) {
    console.error("Load failed", error);
  }
};

const openModal = (niche = null) => {
  if (niche) {
    form.id = niche.id;
    form.name = niche.name;
    form.slug = niche.slug;
    form.workspace_template = niche.workspaceTemplate ?? niche.workspace_template ?? 'TemplateStandard';
    form.sort_order = niche.sortOrder ?? niche.sort_order ?? 1;
    form.is_active = niche.isActive ?? niche.is_active ?? true;
    form.document_pack_ids = (niche.documentPacks || niche.document_packs || []).map(p => p.id);
    form.workflow_ids = (niche.workflowDefinitions || niche.workflow_definitions || []).map(w => w.id);
    form.team_ids = (niche.teams || []).map(t => t.id);
  } else {
    form.id = null;
    form.name = '';
    form.slug = '';
    form.workspace_template = 'TemplateStandard';
    form.sort_order = (niches.value.length + 1);
    form.is_active = true;
    form.document_pack_ids = [];
    form.workflow_ids = [];
    form.team_ids = [];
  }
  showModal.value = true;
};

const save = async () => {
  try {
    const url = `admin/products/${props.slug}/file-types${form.id ? '/' + form.id : ''}`;
    const method = form.id ? 'put' : 'post';
    
    const payload = {
        name: form.name,
        slug: form.slug,
        workspace_template: form.workspace_template,
        sort_order: form.sort_order,
        is_active: form.is_active,
        document_pack_ids: form.document_pack_ids,
        workflow_ids: form.workflow_ids,
        team_ids: form.team_ids
    };

    await apiClient[method](url, payload);
    showModal.value = false;
    loadNiches();
    showAlert('Success', 'Niche configuration and team access updated.');
  } catch (error) {
    showAlert('Error', error.response?.data?.message || 'Save failed.');
  }
};

const deleteNiche = async (niche) => {
  if (await showConfirm('Archive Niche', `Archive "${niche.name}"? This will hide it from the product factory.`)) {
    try {
      await apiClient.delete(`admin/products/${props.slug}/file-types/${niche.id}`);
      loadNiches();
      showAlert('Success', 'Niche archived.');
    } catch (error) {
      showAlert('Error', 'Action failed.');
    }
  }
};

onMounted(() => {
  loadNiches();
  loadCatalog();
});
</script>