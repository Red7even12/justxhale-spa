<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4">
      <div>
        <!-- Context Backlink if in Foundry -->
        <router-link v-if="isFoundryContext" :to="{ name: 'admin.niche-factory' }" class="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mb-2">
          ← Back to Niche Factory
        </router-link>
        <div class="flex items-center gap-2">
          <span class="text-2xl">📦</span>
          <h2 class="text-xl font-black text-gray-900 tracking-tight">Document Packs</h2>
          <span class="bg-indigo-50 text-indigo-700 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
            {{ contextTitle }}
          </span>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Configure document requirements, mandatory status, and tab labels for this compliance module.
        </p>
      </div>

      <button @click="openModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs shrink-0">
        <span>+ Add Document Pack</span>
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50/80">
          <tr>
            <th class="px-4 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider w-16">Order</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Pack Name</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Workspace Tab Label</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Doc Count</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Mandatory</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="pack in packs" :key="pack.id" class="hover:bg-indigo-50/20 transition-colors">
            
            <!-- Order -->
            <td class="px-4 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-gray-100 text-gray-800 rounded-lg h-7 w-7 text-xs font-black">
                {{ pack.pivot?.display_order ?? pack.sort_order ?? 1 }}
              </span>
            </td>

            <!-- Name -->
            <td class="px-6 py-4 font-bold text-gray-900 text-sm">
              {{ pack.name }}
            </td>

            <!-- Tab Override -->
            <td class="px-6 py-4 text-sm text-gray-600">
              <span v-if="pack.pivot?.tab_label_override" class="font-bold text-indigo-900">
                {{ pack.pivot.tab_label_override }}
              </span>
              <span v-else class="text-gray-400 italic">Default ("{{ pack.name }}")</span>
            </td>

            <!-- Doc Count -->
            <td class="px-6 py-4 text-center">
              <span class="inline-flex items-center justify-center bg-purple-50 text-purple-700 rounded-full h-7 px-2.5 text-xs font-bold border border-purple-100">
                📄 {{ pack.document_types_count ?? pack.documentTypesCount ?? 0 }}
              </span>
            </td>

            <!-- Mandatory -->
            <td class="px-6 py-4 text-center">
              <span :class="(pack.pivot?.is_mandatory ?? true) ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'" class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border">
                {{ (pack.pivot?.is_mandatory ?? true) ? 'Required' : 'Optional' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 text-center">
              <span :class="(pack.is_active ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                {{ (pack.is_active ?? true) ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 text-right space-x-3 text-xs font-bold">
              <button @click="manageDocs(pack)" class="text-indigo-600 hover:text-indigo-900">
                Manage Documents ↗
              </button>
              <button @click="openModal(pack)" class="text-gray-500 hover:text-gray-700">
                Edit
              </button>
              <button @click="deletePack(pack)" class="text-red-400 hover:text-red-600">
                {{ isFoundryContext ? 'Detach' : 'Delete' }}
              </button>
            </td>
          </tr>
          
          <tr v-if="packs.length === 0">
            <td colspan="7" class="p-10 text-center text-gray-400 italic text-sm">
              No document packs attached to this module yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div class="border-b pb-3 flex justify-between items-center">
          <h2 class="text-lg font-black text-gray-900">{{ form.id ? 'Configure Document Pack' : 'Attach Document Pack' }}</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Pack Name</label>
            <input v-model="form.name" type="text" placeholder="e.g. Identity & KYC Documents" class="w-full border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Workspace Tab Label Override (Optional)</label>
            <input v-model="form.tab_label_override" type="text" placeholder="Leave blank to use pack name" class="w-full border-gray-300 rounded-lg text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black text-gray-600 uppercase mb-1">Display Order</label>
              <input v-model.number="form.display_order" type="number" min="1" class="w-full border-gray-300 rounded-lg text-sm font-bold text-center" />
            </div>

            <div class="flex items-center pt-5">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                <input v-model="form.is_mandatory" type="checkbox" class="rounded text-indigo-600" />
                <span>Mandatory Pack</span>
              </label>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <input v-model="form.is_active" type="checkbox" id="pack_active" class="h-4 w-4 text-indigo-600 rounded" />
            <label for="pack_active" class="text-xs font-bold text-gray-700">Pack is Active</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t pt-4">
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 font-bold text-xs px-4 py-2">Cancel</button>
          <button @click="save" class="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow hover:bg-indigo-700">
            {{ form.id ? 'Save Configuration' : 'Attach Pack' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  product: { type: Object, default: null },
  slug: { type: String, default: null },
  niche: { type: Object, default: null },
  fileTypeId: { type: [String, Number], default: null }
});

const router = useRouter();
const { showConfirm, showAlert } = useAlerts();

const packs = ref([]);
const showModal = ref(false);

const isFoundryContext = computed(() => !!props.fileTypeId);
const contextTitle = computed(() => props.niche?.name || props.product?.name || 'Blueprint');

const form = reactive({
  id: null,
  name: '',
  tab_label_override: '',
  display_order: 1,
  is_mandatory: true,
  is_active: true
});

const loadPacks = async () => {
  try {
    const url = isFoundryContext.value
      ? `admin/file-types/${props.fileTypeId}/document-packs`
      : `admin/products/${props.slug}/document-packs`;

    const { data } = await apiClient.get(url);
    packs.value = data?.data || data || [];
  } catch (error) {
    console.error('Failed to load document packs', error);
  }
};

const openModal = (pack = null) => {
  if (pack) {
    form.id = pack.id;
    form.name = pack.name;
    form.tab_label_override = pack.pivot?.tab_label_override || '';
    form.display_order = pack.pivot?.display_order ?? 1;
    form.is_mandatory = pack.pivot?.is_mandatory ?? true;
    form.is_active = pack.is_active ?? true;
  } else {
    form.id = null;
    form.name = '';
    form.tab_label_override = '';
    form.display_order = packs.value.length + 1;
    form.is_mandatory = true;
    form.is_active = true;
  }
  showModal.value = true;
};

const save = async () => {
  if (!form.name) return showAlert('Error', 'Pack name is required.');

  try {
    const url = isFoundryContext.value
      ? `admin/file-types/${props.fileTypeId}/document-packs${form.id ? '/' + form.id : ''}`
      : `admin/products/${props.slug}/document-packs${form.id ? '/' + form.id : ''}`;

    const method = form.id ? 'put' : 'post';

    await apiClient[method](url, form);
    showModal.value = false;
    loadPacks();
    showAlert('Success', 'Document Pack saved.');
  } catch (error) {
    showAlert('Error', error.response?.data?.message || 'Failed to save pack.');
  }
};

const deletePack = async (pack) => {
  const actionName = isFoundryContext.value ? 'Detach Pack' : 'Delete Pack';
  const actionMsg = isFoundryContext.value 
    ? `Detach "${pack.name}" from this Niche?` 
    : `Delete "${pack.name}" from ${props.product?.name}?`;

  if (await showConfirm(actionName, actionMsg)) {
    try {
      const url = isFoundryContext.value
        ? `admin/file-types/${props.fileTypeId}/document-packs/${pack.id}`
        : `admin/products/${props.slug}/document-packs/${pack.id}`;

      await apiClient.delete(url);
      loadPacks();
      showAlert('Success', 'Pack detached/removed successfully.');
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Action failed.');
    }
  }
};

const manageDocs = (pack) => {
  if (isFoundryContext.value) {
    router.push({ 
      name: 'admin.niche-factory.pack-types', 
      params: { 
        fileTypeId: props.fileTypeId, 
        packId: pack.id 
      } 
    });
  } else {
    router.push({ 
      name: 'admin.product.pack-types', 
      params: { 
        slug: props.slug, 
        packId: pack.id 
      } 
    });
  }
};

onMounted(loadPacks);
</script>