<template>
  <div class="space-y-6">
    
    <!-- Top Action Bar -->
    <div class="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h2 class="text-lg font-bold text-gray-900">Child Modules & Tabs</h2>
        <p class="text-xs text-gray-500 mt-1">
          Assemble composite products (like SHEQ suites) by plugging in child products as dedicated tabs.
        </p>
      </div>
      <button 
        @click="openAddModal" 
        class="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
      >
        <span class="material-icons text-sm">add_circle</span>
        Add Child Module
      </button>
    </div>

    <!-- Live Workspace Tab Preview -->
    <div v-if="modules.length > 0" class="bg-gray-900 text-white p-5 rounded-2xl shadow-inner">
      <div class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
        <span class="material-icons text-sm text-yellow-400">preview</span>
        Casefile Workspace Live Tab Preview
      </div>
      <div class="flex space-x-3 overflow-x-auto pb-2 border-b border-gray-800">
        <div 
          v-for="(mod, index) in modules" 
          :key="mod.id"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold"
          :class="index === 0 ? 'bg-white/20 text-white border border-white/30' : 'text-gray-400 bg-white/5'"
        >
          <span class="material-icons text-xs">{{ mod.tab_icon || 'folder' }}</span>
          <span>{{ mod.tab_label || mod.child_product?.name }}</span>
          <span v-if="mod.is_mandatory" class="w-1.5 h-1.5 rounded-full bg-red-400" title="Mandatory Module"></span>
        </div>
      </div>
    </div>

    <!-- Modules Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-400 animate-pulse text-xs font-bold uppercase tracking-wider">
        Loading Child Modules...
      </div>

      <div v-else-if="modules.length === 0" class="p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto mb-3">
          <span class="material-icons text-2xl">layers</span>
        </div>
        <h3 class="text-sm font-bold text-gray-900">Standalone Product</h3>
        <p class="text-xs text-gray-500 max-w-sm mx-auto mt-1">
          This product currently has no child modules and operates as a standalone direct workspace (like Estates).
        </p>
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
            <th class="py-3 px-6 w-12">Order</th>
            <th class="py-3 px-6">Child Product</th>
            <th class="py-3 px-6">Tab Label Override</th>
            <th class="py-3 px-6">Icon</th>
            <th class="py-3 px-6 text-center">Mandatory</th>
            <th class="py-3 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 text-xs">
          <tr v-for="(mod, index) in modules" :key="mod.id" class="hover:bg-gray-50/80 transition-colors">
            <!-- Reorder Controls -->
            <td class="py-4 px-6">
              <div class="flex items-center gap-1">
                <button 
                  :disabled="index === 0" 
                  @click="moveModule(index, -1)"
                  class="p-1 hover:bg-gray-200 rounded disabled:opacity-20 text-gray-600"
                >
                  ▲
                </button>
                <button 
                  :disabled="index === modules.length - 1" 
                  @click="moveModule(index, 1)"
                  class="p-1 hover:bg-gray-200 rounded disabled:opacity-20 text-gray-600"
                >
                  ▼
                </button>
              </div>
            </td>

            <!-- Child Product Info -->
            <td class="py-4 px-6">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: mod.child_product?.primary_color || '#3B82F6' }"></div>
                <div class="font-bold text-gray-900">{{ mod.child_product?.name }}</div>
              </div>
              <div class="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5">
                {{ mod.child_product?.product_archetype }}
              </div>
            </td>

            <!-- Tab Label Override -->
            <td class="py-4 px-6 font-medium text-gray-700">
              {{ mod.tab_label || '(Default: Same as Product)' }}
            </td>

            <!-- Icon -->
            <td class="py-4 px-6">
              <div class="flex items-center gap-1.5 text-gray-600">
                <span class="material-icons text-base">{{ mod.tab_icon || 'folder' }}</span>
                <span class="text-[10px] font-mono text-gray-400">{{ mod.tab_icon || 'folder' }}</span>
              </div>
            </td>

            <!-- Mandatory Badge -->
            <td class="py-4 px-6 text-center">
              <span 
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter"
                :class="mod.is_mandatory ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ mod.is_mandatory ? 'Yes' : 'Optional' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="py-4 px-6 text-right">
              <button 
                @click="detachModule(mod)" 
                class="text-red-500 hover:text-red-700 font-bold text-xs"
              >
                Detach
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Add Child Module -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="font-bold text-base text-gray-900">Attach Child Product Module</h3>
        
        <div v-if="availableChildren.length === 0" class="text-xs text-gray-500 p-4 bg-gray-50 rounded-xl text-center">
          No other products available in your WLP catalog to attach.
        </div>

        <div v-else class="space-y-3">
          <div>
            <label class="block text-[10px] font-black uppercase text-gray-500 mb-1">Select Child Product</label>
            <select v-model="form.child_product_id" class="w-full text-xs p-2.5 rounded-xl border border-gray-200">
              <option :value="null" disabled>Select a product...</option>
              <option v-for="p in availableChildren" :key="p.id" :value="p.id">
                {{ p.name }} ({{ p.product_archetype }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-black uppercase text-gray-500 mb-1">Custom Tab Label (Optional)</label>
            <input v-model="form.tab_label" type="text" placeholder="e.g. Medical / Health" class="w-full text-xs p-2.5 rounded-xl border border-gray-200" />
          </div>

          <div>
            <label class="block text-[10px] font-black uppercase text-gray-500 mb-1">Tab Material Icon</label>
            <input v-model="form.tab_icon" type="text" placeholder="e.g. medical_services, verified, folder" class="w-full text-xs p-2.5 rounded-xl border border-gray-200" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showAddModal = false" class="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700">Cancel</button>
          <button 
            :disabled="!form.child_product_id"
            @click="submitAdd" 
            class="px-4 py-2 text-xs font-bold text-white bg-brand-primary rounded-xl disabled:opacity-30"
          >
            Attach Module
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

const route = useRoute();
const slug = ref(route.params.slug);

const modules = ref([]);
const availableChildren = ref([]);
const loading = ref(true);
const showAddModal = ref(false);

const form = ref({
  child_product_id: null,
  tab_label: '',
  tab_icon: 'folder',
  is_mandatory: true
});

const fetchModules = async () => {
  loading.value = true;
  try {
    const { data } = await apiClient.get(`admin/products/${slug.value}/modules`);
    modules.value = data;
  } catch (err) {
    console.error('Failed to load product modules', err);
  } finally {
    loading.value = false;
  }
};

const openAddModal = async () => {
  try {
    const { data } = await apiClient.get(`admin/products/${slug.value}/modules/available-children`);
    availableChildren.value = data;
    form.value.child_product_id = availableChildren.value[0]?.id || null;
    showAddModal.value = true;
  } catch (err) {
    console.error('Failed to load available products', err);
  }
};

const submitAdd = async () => {
  try {
    await apiClient.post(`admin/products/${slug.value}/modules`, form.value);
    showAddModal.value = false;
    form.value = { child_product_id: null, tab_label: '', tab_icon: 'folder', is_mandatory: true };
    await fetchModules();
  } catch (err) {
    alert('Failed to attach child module.');
  }
};

const moveModule = async (index, direction) => {
  const targetIndex = index + direction;
  const item = modules.value.splice(index, 1)[0];
  modules.value.splice(targetIndex, 0, item);

  const module_ids = modules.value.map(m => m.id);
  await apiClient.post(`admin/products/${slug.value}/modules/reorder`, { module_ids });
};

const detachModule = async (mod) => {
  if (confirm(`Detach ${mod.child_product?.name} from this parent product?`)) {
    await apiClient.delete(`admin/products/${slug.value}/modules/${mod.id}`);
    await fetchModules();
  }
};

onMounted(fetchModules);
</script>