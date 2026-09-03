<template>
  <div class="space-y-6">
    <!-- 1. Header Banner -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4">
      <div>
        <div class="flex items-center gap-2">
          <!-- <span class="text-2xl">⚡</span> -->
          <h1 class="text-2xl font-black text-gray-900 tracking-tight">Niche Blueprint Foundry</h1>
          <span class="bg-indigo-50 text-indigo-700 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
            PaaS Modular Engine
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Architect reusable, standalone compliance modules (fields, doc requirements, and workflows) independent of commercial products.
        </p>
      </div>

      <button @click="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm shrink-0">
        <span>+ Forge New Niche</span>
      </button>
    </div>

    <!-- 2. Filter & Taxonomy Bar -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex flex-1 items-center gap-3 w-full md:w-auto">
        <!-- Search -->
        <div class="relative flex-1">
          <input 
            v-model="filters.search" 
            @input="debouncedFetch" 
            type="text" 
            placeholder="Search niches, slugs, keywords..." 
            class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span class="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>

        <!-- Category Dropdown -->
        <select 
          v-model="filters.category" 
          @change="fetchNiches" 
          class="border border-gray-300 rounded-lg py-2 px-3 text-sm font-medium text-gray-700 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Quick Metrics -->
      <div class="flex items-center gap-3 text-xs text-gray-500 font-bold shrink-0">
        <span class="bg-gray-100 px-3 py-1.5 rounded-lg border">Total Blueprints: {{ niches.length }}</span>
      </div>
    </div>

    <!-- 3. Niche Blueprint Catalog Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-400 font-bold animate-pulse">
        Loading Blueprint Catalog...
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50/80">
          <tr>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Blueprint Identity</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Category & Tags</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">IP Tier</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Engine Specs</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Deployed In</th>
            <th class="px-6 py-3.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="niche in niches" :key="niche.id" class="hover:bg-indigo-50/20 transition-colors">
            <!-- Identity -->
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900 text-sm">{{ niche.name }}</div>
              <div class="font-mono text-[11px] text-gray-400">/{{ niche.slug }}</div>
              <p v-if="niche.description" class="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">{{ niche.description }}</p>
            </td>

            <!-- Category & Tags -->
            <td class="px-6 py-4">
              <span class="inline-block bg-gray-100 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded border mb-1">
                {{ niche.category || 'General' }}
              </span>
              <div class="flex flex-wrap gap-1 max-w-xs">
                <span v-for="tag in (niche.tags || [])" :key="tag" class="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded">
                  #{{ tag }}
                </span>
              </div>
            </td>

            <!-- IP Governance Tier -->
            <td class="px-6 py-4 text-center">
              <span v-if="niche.is_public" class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                ● Public Core
              </span>
              <span v-else-if="!niche.wlp_tenant_id" class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider" :title="`Licensed to ${niche.licensed_wlp_tenants?.length || 0} Partners`">
                🔒 Licensed IP
              </span>
              <span v-else class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                🏢 {{ niche.wlp_tenant?.name || 'Proprietary' }}
              </span>
            </td>

            <!-- Engine Specs (Fields, Docs, Workflows) -->
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <span class="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-md" title="Custom Fields">
                  📋 {{ niche.field_definitions_count ?? niche.fieldDefinitionsCount ?? niche.fields_count ?? 0 }}
                </span>
                <span class="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded-md" title="Attached Document Packs">
                  📦 {{ niche.document_packs_count ?? niche.documentPacksCount ?? 0 }}
                </span>
                <span class="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md" title="Attached Workflows">
                  ⚡ {{ niche.workflow_definitions_count ?? niche.workflowDefinitionsCount ?? 0 }}
                </span>
              </div>
            </td>

            <!-- Product Deployment Matrix -->
            <td class="px-6 py-4 text-center">
              <span v-if="(niche.products_count ?? niche.productsCount ?? niche.products?.length ?? 0) > 0" class="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black px-2.5 py-1 rounded-full">
                🚀 {{ niche.products_count ?? niche.productsCount ?? niche.products?.length }} Products
              </span>
              <span v-else class="text-xs text-gray-400 italic font-medium">Unassigned</span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 text-right space-x-3 text-xs font-bold">
              <router-link :to="{ name: 'admin.niche-factory.fields', params: { fileTypeId: niche.id } }" class="text-indigo-600 hover:text-indigo-900">
                Fields DNA
              </router-link>
              <button @click="openModal(niche)" class="text-gray-500 hover:text-gray-700">Configure</button>
              <button @click="deleteNiche(niche)" class="text-red-400 hover:text-red-600">Archive</button>
            </td>
          </tr>

          <tr v-if="niches.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-400 italic">
              No Niche blueprints match your search criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 4. Create / Configure Niche Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div class="border-b pb-3 flex justify-between items-center">
          <h2 class="text-lg font-black text-gray-900">{{ form.id ? 'Configure Niche Blueprint' : 'Forge New Niche' }}</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Blueprint Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. Professional Heavy Vehicle Driver" class="w-full border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">System Slug (Unique)</label>
            <input v-model="form.slug" type="text" placeholder="e.g. heavy_vehicle_driver" class="w-full border-gray-300 rounded-lg text-sm font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Industry Category</label>
            <input v-model="form.category" type="text" placeholder="e.g. Fleet & Transport, Health & Medical" class="w-full border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Keywords / Tags (Comma-separated)</label>
            <input v-model="rawTags" type="text" placeholder="driver, pdp, forklift, logistics" class="w-full border-gray-300 rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-gray-600 uppercase mb-1">Compliance Description / Scope</label>
          <textarea v-model="form.description" rows="2" placeholder="Briefly describe what legal compliance or operational workflow this niche covers..." class="w-full border-gray-300 rounded-lg text-sm"></textarea>
        </div>

        <!-- IP Protection Settings (System Admin Only) -->
        <div v-if="isSystemAdmin" class="p-4 bg-purple-50/60 rounded-xl border border-purple-100 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-black text-purple-900 uppercase">Commercial IP Governance</span>
              <p class="text-[11px] text-purple-700">Determine who has clearance to assemble this compliance engine.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.is_public" class="sr-only peer">
              <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              <span class="ml-2 text-xs font-bold" :class="form.is_public ? 'text-emerald-700' : 'text-purple-700'">
                {{ form.is_public ? 'Public Platform Core' : 'Restricted / Licensed' }}
              </span>
            </label>
          </div>

          <!-- License to Specific WLPs if not public -->
          <div v-if="!form.is_public && wlpPartners.length > 0" class="pt-2 border-t border-purple-200/50">
            <label class="block text-[11px] font-black text-purple-800 uppercase mb-1">License Access to Partner Tenants:</label>
            <div class="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto bg-white p-2 rounded-lg border border-purple-200">
              <label v-for="partner in wlpPartners" :key="partner.id" class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1 rounded hover:bg-purple-50">
                <input type="checkbox" :value="partner.id" v-model="form.licensed_wlp_tenant_ids" class="rounded text-purple-600">
                <span>{{ partner.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Attached Doc Packs -->
        <div class="border rounded-xl p-3 bg-gray-50/50">
          <label class="text-xs font-black text-purple-700 uppercase mb-1.5 block">📦 Default Document Packs</label>
          <div v-if="catalogDocPacks.length === 0" class="text-xs text-gray-400 italic">No Document Packs available.</div>
          <div v-else class="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto">
            <label v-for="pack in catalogDocPacks" :key="pack.id" class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1 rounded hover:bg-white">
              <input type="checkbox" :value="pack.id" v-model="form.document_pack_ids" class="rounded text-purple-600">
              <span class="truncate">{{ pack.name }}</span>
            </label>
          </div>
        </div>

        <!-- Attached Workflows -->
        <div class="border rounded-xl p-3 bg-gray-50/50">
          <label class="text-xs font-black text-blue-700 uppercase mb-1.5 block">⚡ Default Workflows</label>
          <div v-if="catalogWorkflows.length === 0" class="text-xs text-gray-400 italic">No Workflows available.</div>
          <div v-else class="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto">
            <label v-for="wf in catalogWorkflows" :key="wf.id" class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer p-1 rounded hover:bg-white">
              <input type="checkbox" :value="wf.id" v-model="form.workflow_ids" class="rounded text-blue-600">
              <span class="truncate">{{ wf.name }}</span>
            </label>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <input v-model="form.is_active" type="checkbox" id="niche_active" class="h-4 w-4 text-indigo-600 rounded">
          <label for="niche_active" class="text-xs font-bold text-gray-700">Blueprint is Active in Foundry</label>
        </div>

        <div class="flex justify-end gap-3 border-t pt-4">
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-xs px-4 py-2">Cancel</button>
          <button @click="save" class="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow hover:bg-indigo-700">
            {{ form.id ? 'Save Blueprint' : 'Forge Blueprint' }}
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
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const { showAlert, showConfirm } = useAlerts();

const isSystemAdmin = computed(() => authStore.hasRole('System Admin') || authStore.hasRole('Business Admin'));

const loading = ref(false);
const niches = ref([]);
const categories = ref([]);
const catalogDocPacks = ref([]);
const catalogWorkflows = ref([]);
const wlpPartners = ref([]);
const showModal = ref(false);
const rawTags = ref('');

const filters = reactive({
  search: '',
  category: ''
});

const form = reactive({
  id: null,
  name: '',
  slug: '',
  category: '',
  description: '',
  tags: [],
  is_active: true,
  is_public: false,
  document_pack_ids: [],
  workflow_ids: [],
  licensed_wlp_tenant_ids: []
});

let debounceTimer = null;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchNiches();
  }, 300);
};

const fetchNiches = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;

    const { data } = await apiClient.get('admin/file-types', { params });
    niches.value = data?.data || [];
  } catch (error) {
    console.error('Failed to load niche catalog', error);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await apiClient.get('admin/file-types/categories');
    categories.value = data?.data || [];
  } catch (error) {
    console.error('Failed to load categories', error);
  }
};

const loadDependencies = async () => {
  try {
    const [packsRes, wfRes] = await Promise.all([
      apiClient.get('admin/document-types').catch(() => ({ data: [] })), // fallback
      apiClient.get('admin/file-types').catch(() => ({ data: [] }))
    ]);

    // If System Admin, fetch WLP Tenants for IP licensing picker
    if (isSystemAdmin.value) {
      const { data } = await apiClient.get('admin/wlp-tenants').catch(() => ({ data: [] }));
      wlpPartners.value = data?.data || data || [];
    }
  } catch (err) {
    console.error('Failed to load dependencies', err);
  }
};

const openModal = (niche = null) => {
  if (niche) {
    form.id = niche.id;
    form.name = niche.name;
    form.slug = niche.slug;
    form.category = niche.category || '';
    form.description = niche.description || '';
    form.tags = niche.tags || [];
    rawTags.value = (niche.tags || []).join(', ');
    form.is_active = niche.is_active ?? true;
    form.is_public = niche.is_public ?? false;
    form.document_pack_ids = (niche.document_packs || []).map(p => p.id);
    form.workflow_ids = (niche.workflow_definitions || []).map(w => w.id);
    form.licensed_wlp_tenant_ids = (niche.licensed_wlp_tenants || []).map(t => t.id);
  } else {
    form.id = null;
    form.name = '';
    form.slug = '';
    form.category = '';
    form.description = '';
    form.tags = [];
    rawTags.value = '';
    form.is_active = true;
    form.is_public = false;
    form.document_pack_ids = [];
    form.workflow_ids = [];
    form.licensed_wlp_tenant_ids = [];
  }
  showModal.value = true;
};

const save = async () => {
  try {
    const tagsArray = rawTags.value
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const payload = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      description: form.description,
      tags: tagsArray,
      is_active: form.is_active,
      is_public: form.is_public,
      document_pack_ids: form.document_pack_ids,
      workflow_ids: form.workflow_ids,
      licensed_wlp_tenant_ids: form.licensed_wlp_tenant_ids
    };

    const url = `admin/file-types${form.id ? '/' + form.id : ''}`;
    const method = form.id ? 'put' : 'post';

    await apiClient[method](url, payload);
    showModal.value = false;
    showAlert('Success', `Niche blueprint "${form.name}" saved successfully.`);
    fetchNiches();
    fetchCategories();
  } catch (error) {
    showAlert('Error', error.response?.data?.message || 'Failed to save blueprint.');
  }
};

const deleteNiche = async (niche) => {
  if (niche.products_count > 0) {
    showAlert('Protected Blueprint', `Cannot archive "${niche.name}". It is currently assembled into ${niche.products_count} active product(s).`);
    return;
  }

  if (await showConfirm('Archive Blueprint', `Are you sure you want to archive "${niche.name}"?`)) {
    try {
      await apiClient.delete(`admin/file-types/${niche.id}`);
      showAlert('Success', 'Blueprint archived.');
      fetchNiches();
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Archive failed.');
    }
  }
};

onMounted(() => {
  fetchNiches();
  fetchCategories();
  loadDependencies();
});
</script>