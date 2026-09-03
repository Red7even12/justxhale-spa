<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">🧩</span>
          <h2 class="text-xl font-black text-gray-900 tracking-tight">Product Niche Assembly</h2>
          <span class="bg-indigo-50 text-indigo-700 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
            {{ product?.name }}
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Assemble and sequence reusable Niche blueprints into this product. Configure tab sequence, tab label overrides, and team security clearances.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <router-link :to="{ name: 'admin.niche-factory' }" class="text-xs font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl border transition-colors">
          Open Niche Foundry ↗
        </router-link>
        <button @click="openAttachModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs">
          + Attach Niche from Catalog
        </button>
      </div>
    </div>

    <!-- Assembled Niches Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50/80">
          <tr>
            <th class="px-4 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider w-16">Tab Order</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Niche Blueprint</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Tab Display in Workspace</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Engine Specs</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Team Clearance</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Status on Product</th>
            <th class="px-6 py-3.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="niche in assembledNiches" :key="niche.id" class="hover:bg-indigo-50/20 transition-colors">
            
            <!-- Sort Order Badge -->
            <td class="px-4 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg h-7 w-7 text-xs font-black">
                {{ niche.pivot?.sort_order ?? niche.pivot?.sortOrder ?? 1 }}
              </span>
            </td>

            <!-- Blueprint Identity -->
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900 text-sm">{{ niche.name }}</div>
              <div class="font-mono text-[11px] text-gray-400">/{{ niche.slug }}</div>
              <span v-if="niche.category" class="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                {{ niche.category }}
              </span>
            </td>

            <!-- Tab Display (Default vs Override) -->
            <td class="px-6 py-4">
              <div v-if="niche.pivot?.tab_label_override || niche.pivot?.tabLabelOverride" class="flex items-center gap-1.5">
                <span class="font-bold text-gray-900 text-sm">{{ niche.pivot?.tab_label_override || niche.pivot?.tabLabelOverride }}</span>
                <span class="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-black uppercase tracking-tighter">
                  Override
                </span>
              </div>
              <div v-else class="text-sm text-gray-400 italic">
                Default: "{{ niche.name }}"
              </div>
            </td>

            <!-- Attached Specs -->
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <span class="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded" title="Fields">
                  📋 {{ niche.field_definitions_count ?? niche.fieldDefinitionsCount ?? 0 }}
                </span>
                <span class="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded" title="Doc Packs">
                  📦 {{ niche.document_packs_count ?? niche.documentPacksCount ?? 0 }}
                </span>
                <span class="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded" title="Workflows">
                  ⚡ {{ niche.workflow_definitions_count ?? niche.workflowDefinitionsCount ?? 0 }}
                </span>
              </div>
            </td>

            <!-- Authorized Teams -->
            <td class="px-6 py-4 text-center">
              <span v-if="(niche.teams || []).length > 0" class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                👥 {{ niche.teams.length }} Team(s)
              </span>
              <span v-else class="text-xs text-gray-400 font-medium italic">All Teams (Public)</span>
            </td>

            <!-- Status on this Product -->
            <td class="px-6 py-4 text-center">
              <span :class="Number(niche.pivot?.is_active ?? niche.pivot?.isActive ?? 1) === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                {{ Number(niche.pivot?.is_active ?? niche.pivot?.isActive ?? 1) === 1 ? 'Active' : 'Disabled' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 text-right space-x-3 text-xs font-bold">
              <router-link :to="{ name: 'admin.niche-factory.fields', params: { fileTypeId: niche.id } }" class="text-indigo-600 hover:text-indigo-900">
                Foundry ↗
              </router-link>
              <button @click="openConfigModal(niche)" class="text-gray-500 hover:text-gray-700">
                Configure Tab
              </button>
              <button @click="detachNiche(niche)" class="text-red-400 hover:text-red-600">
                Detach
              </button>
            </td>
          </tr>

          <tr v-if="assembledNiches.length === 0">
            <td colspan="7" class="p-10 text-center text-gray-400 italic text-sm">
              No Niches assembled yet for {{ product?.name }}. Click "+ Attach Niche from Catalog" to assemble your first module.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Attach / Configure Niche -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div class="border-b pb-3 flex justify-between items-center">
          <h2 class="text-lg font-black text-gray-900">
            {{ isEditing ? 'Configure Assembled Tab' : 'Attach Niche to Product' }}
          </h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
        </div>

        <!-- 1. Blueprint Selection (Only when attaching new) -->
        <div v-if="!isEditing">
          <label class="block text-xs font-black text-gray-600 uppercase mb-1">Select Niche from Catalog</label>
          <select v-model="form.file_type_id" class="w-full border-gray-300 rounded-lg text-sm font-medium">
            <option :value="null" disabled>-- Choose a Niche Blueprint --</option>
            <option v-for="c in availableCatalogNiches" :key="c.id" :value="c.id">
              {{ c.name }} {{ c.category ? `(${c.category})` : '' }}
            </option>
          </select>
          <p v-if="availableCatalogNiches.length === 0" class="text-[11px] text-amber-600 mt-1">
            All approved catalog blueprints are already attached to this product.
          </p>
        </div>

        <div v-else class="p-3 bg-gray-50 rounded-xl border">
          <div class="text-[10px] font-black uppercase text-gray-400">Selected Blueprint</div>
          <div class="font-bold text-gray-900 text-sm">{{ selectedNicheName }}</div>
        </div>

        <!-- 2. Tab Display & Sequencing -->
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">
              Tab Label Override (Optional)
            </label>
            <input 
              v-model="form.tab_label_override" 
              type="text" 
              placeholder="Leave blank to use master name" 
              class="w-full border-gray-300 rounded-lg text-sm" 
            />
            <p class="text-[10px] text-gray-400 mt-1">Renames this tab on {{ product?.name }} only.</p>
          </div>

          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Tab Order</label>
            <input 
              v-model.number="form.sort_order" 
              type="number" 
              min="1" 
              class="w-full border-gray-300 rounded-lg text-sm font-bold text-center" 
            />
          </div>
        </div>

        <!-- 3. Authorized Teams (POPIA / Tab Clearance) -->
        <div class="border rounded-xl p-3 bg-gray-50/50 space-y-1">
          <label class="text-xs font-black text-emerald-800 uppercase block">
            👥 Functional Team Clearance (POPIA Scoping)
          </label>
          <div v-if="subscriberTeams.length === 0" class="text-xs text-gray-400 italic">
            No teams configured. All authorized users will have access by default.
          </div>
          <div v-else class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pt-1">
            <label v-for="team in subscriberTeams" :key="team.id" class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1 rounded hover:bg-white">
              <input type="checkbox" :value="team.id" v-model="form.team_ids" class="rounded text-emerald-600">
              <span class="truncate">{{ team.name }}</span>
            </label>
          </div>
          <p class="text-[10px] text-gray-400 mt-1 italic">
            * Leaving all unchecked makes this tab visible to all team members.
          </p>
        </div>

        <!-- Active Toggle -->
        <div class="flex items-center gap-3 pt-2">
          <input v-model="form.is_active" type="checkbox" id="assembly_active" class="h-4 w-4 text-indigo-600 rounded">
          <label for="assembly_active" class="text-xs font-bold text-gray-700">Tab is Active in Product Workspace</label>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 border-t pt-4">
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-xs px-4 py-2">
            Cancel
          </button>
          <button @click="saveAssembly" :disabled="!form.file_type_id" class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow">
            {{ isEditing ? 'Update Configuration' : 'Attach to Product' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import teamService from '@/services/teamService';

const props = defineProps({
  product: Object,
  slug: String
});

const { showConfirm, showAlert } = useAlerts();

const assembledNiches = ref([]);
const masterCatalog = ref([]);
const subscriberTeams = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const selectedNicheName = ref('');

const form = reactive({
  file_type_id: null,
  tab_label_override: '',
  sort_order: 1,
  is_active: true,
  team_ids: []
});

// Filter catalog to show only niches not yet assembled into this product
const availableCatalogNiches = computed(() => {
  const assembledIds = assembledNiches.value.map(n => n.id);
  return masterCatalog.value.filter(c => !assembledIds.includes(c.id));
});

const loadAssembledNiches = async () => {
  try {
    const { data } = await apiClient.get(`admin/products/${props.slug}/file-types`);
    assembledNiches.value = data?.data || data || [];
  } catch (error) {
    console.error('Failed to load assembled niches', error);
  }
};

const loadCatalogAndTeams = async () => {
  try {
    const [catalogRes, teamsRes] = await Promise.all([
      apiClient.get('admin/file-types'),
      teamService.getTeams().catch(() => ({ data: [] }))
    ]);
    masterCatalog.value = catalogRes.data?.data || catalogRes.data || [];
    subscriberTeams.value = teamsRes.data?.data || teamsRes.data || [];
  } catch (error) {
    console.error('Failed to load catalog/teams', error);
  }
};

const openAttachModal = () => {
  isEditing.value = false;
  selectedNicheName.value = '';
  form.file_type_id = availableCatalogNiches.value[0]?.id || null;
  form.tab_label_override = '';
  form.sort_order = assembledNiches.value.length + 1;
  form.is_active = true;
  form.team_ids = [];
  showModal.value = true;
};

const openConfigModal = (niche) => {
  isEditing.value = true;
  selectedNicheName.value = niche.name;
  form.file_type_id = niche.id;
  form.tab_label_override = niche.pivot?.tab_label_override || niche.pivot?.tabLabelOverride || '';
  form.sort_order = niche.pivot?.sort_order ?? niche.pivot?.sortOrder ?? 1;
  form.is_active = Number(niche.pivot?.is_active ?? niche.pivot?.isActive ?? 1) === 1;
  form.team_ids = (niche.teams || []).map(t => t.id);
  showModal.value = true;
};

const saveAssembly = async () => {
  try {
    const url = `admin/products/${props.slug}/file-types${isEditing.value ? '/' + form.file_type_id : ''}`;
    const method = isEditing.value ? 'put' : 'post';

    const payload = {
      file_type_id: form.file_type_id,
      tab_label_override: form.tab_label_override,
      sort_order: form.sort_order,
      is_active: form.is_active,
      team_ids: form.team_ids
    };

    await apiClient[method](url, payload);
    showModal.value = false;
    loadAssembledNiches();
    showAlert('Success', isEditing.value ? 'Tab configuration updated.' : 'Niche attached to product.');
  } catch (error) {
    showAlert('Error', error.response?.data?.message || 'Failed to update assembly.');
  }
};

const detachNiche = async (niche) => {
  const confirmed = await showConfirm(
    'Detach Niche',
    `Detach "${niche.name}" from ${props.product?.name}? The blueprint will remain safe in the Niche Foundry.`
  );

  if (confirmed) {
    try {
      await apiClient.delete(`admin/products/${props.slug}/file-types/${niche.id}`);
      showAlert('Success', `"${niche.name}" detached from product.`);
      loadAssembledNiches();
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Detach failed.');
    }
  }
};

onMounted(() => {
  loadAssembledNiches();
  loadCatalogAndTeams();
});
</script>