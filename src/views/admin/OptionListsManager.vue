<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Option Lists Management</h1>
    <p class="text-gray-600 mb-8">
      Manage sourced dropdown lists. Each list can be <strong>Global</strong> (available to all products)
      or scoped to a single product. Lists can be renamed or rescoped at any time.
    </p>

    <div v-if="isLoading" class="text-center py-12">Loading...</div>
    <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Column 1: Lists -->
      <div class="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Lists</h3>
          <button @click="openListModal(null)" class="btn-primary">Add List</button>
        </div>
        <ul class="space-y-2">
          <li v-for="list in lists" :key="list.id">
            <button
              @click="selectList(list)"
              :class="[
                'w-full text-left p-3 rounded-md transition-colors text-sm font-medium',
                selectedList && selectedList.id === list.id ? 'bg-brand-blue-500 text-white' : 'hover:bg-gray-100'
              ]"
            >
              <div class="flex items-center justify-between">
                <span>{{ list.name }}</span>
                <span v-if="!list.isActive" class="px-1.5 py-0.5 text-[10px] rounded bg-gray-200 text-gray-600 uppercase">Off</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <span :class="[
                  'px-1.5 py-0.5 text-[10px] rounded uppercase tracking-wide',
                  isGlobal(list) ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                ]">
                  {{ scopeLabel(list) }}
                </span>
                <span class="text-[10px] opacity-70">{{ list.optionsCount ?? 0 }} options</span>
              </div>
            </button>
          </li>
        </ul>
      </div>

      <!-- Column 2: Options of Selected List -->
      <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
        <div v-if="!selectedList" class="flex items-center justify-center h-full">
          <p class="text-gray-500">Select a list to manage its options.</p>
        </div>
        <div v-else>
          <div class="flex justify-between items-center mb-4">
            <div>
              <h2 class="text-xl font-bold">
                Options for <span class="text-brand-blue-500">{{ selectedList.name }}</span>
              </h2>
              <span :class="[
                'inline-block mt-1 px-2 py-0.5 text-xs rounded-full',
                isGlobal(selectedList) ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              ]">
                {{ scopeLabel(selectedList) }}
              </span>
            </div>
            <div class="space-x-3">
              <button @click="openListModal(selectedList)" class="btn-secondary">Edit List</button>
              <button @click="handleDeleteList" class="text-red-600 hover:underline text-sm font-medium">Delete List</button>
              <button @click="openOptionModal(null)" class="btn-primary">Add Option</button>
            </div>
          </div>

          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Option Value</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="option in options" :key="option.id">
                <td class="px-4 py-3 text-gray-400">{{ option.sortOrder ?? '—' }}</td>
                <td class="px-4 py-3 font-medium">{{ option.optionValue }}</td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-0.5 text-xs rounded-full', option.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700']">
                    {{ option.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-3">
                  <button @click="openOptionModal(option)" class="text-brand-blue-600 hover:underline">Edit</button>
                  <button @click="handleDeleteOption(option)" class="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
              <tr v-if="options.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-400 italic">No options yet. Click "Add Option".</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Create / Edit LIST -->
  <div v-if="isListModalOpen" class="fixed inset-0 z-10 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <h3 class="text-lg font-medium mb-4">{{ editableList.id ? 'Edit List' : 'New List' }}</h3>
      <form @submit.prevent="saveList">
        <div class="space-y-4">
          <div>
            <label for="list_name" class="block text-sm font-medium">List Name</label>
            <input id="list_name" type="text" v-model="editableList.name" class="form-input w-full" required maxlength="100">
          </div>
                    <div>
            <label for="list_scope" class="block text-sm font-medium">Availability</label>
                        <select id="list_scope" v-model.number="editableList.productId" class="form-input w-full" :required="isWlpAdmin">
              <option v-if="!isWlpAdmin" value="">🌍 Global — available to all products</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                📦 {{ product.name }} — this product only
              </option>
            </select>
            <p v-if="!isWlpAdmin" class="mt-1 text-xs text-gray-500">
              Global lists (e.g. government offices) are visible everywhere. Product-scoped lists only appear inside that product's checklists.
            </p>
            <p v-else class="mt-1 text-xs text-gray-500">
              As a WLP Admin you may only manage lists for your own products.
            </p>
          </div>
          <div class="flex items-center">
            <input id="list_active" type="checkbox" v-model="editableList.isActive" class="form-checkbox">
            <label for="list_active" class="ml-2">Active</label>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" @click="isListModalOpen = false" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary" :disabled="isWlpAdmin && !editableList.productId">Save List</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal: Create / Edit OPTION -->
  <div v-if="isOptionModalOpen" class="fixed inset-0 z-10 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <h3 class="text-lg font-medium mb-4">{{ editableOption.id ? 'Edit Option' : 'Add Option' }}</h3>
      <form @submit.prevent="saveOption">
        <div class="space-y-4">
          <div>
            <label for="option_value" class="block text-sm font-medium">Option Value</label>
            <input id="option_value" type="text" v-model="editableOption.optionValue" class="form-input w-full" required maxlength="50">
          </div>
          <div>
            <label for="sort_order" class="block text-sm font-medium">Sort Order (optional)</label>
            <input id="sort_order" type="number" v-model.number="editableOption.sortOrder" class="form-input w-full">
          </div>
          <div class="flex items-center">
            <input id="option_active" type="checkbox" v-model="editableOption.isActive" class="form-checkbox">
            <label for="option_active" class="ml-2">Active</label>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" @click="isOptionModalOpen = false" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import { useAuthStore } from '@/store/auth';

const { showAlert, showConfirm } = useAlerts();
const route = useRoute();
const authStore = useAuthStore();
const isWlpAdmin = computed(() => authStore.hasRole('WLP Admin'));

// ProductBlueprintLayout passes slug/product down through <router-view>.
const props = defineProps({
  slug: { type: String, default: null },
  product: { type: Object, default: null },
});

const lists = ref([]);
const products = ref([]);
const options = ref([]);
const selectedList = ref(null);
const isLoading = ref(true);
const error = ref(null);

// --- List modal state ---
const isListModalOpen = ref(false);
const editableList = reactive({ id: null, name: '', productId: '', isActive: true });

// --- Option modal state ---
const isOptionModalOpen = ref(false);
const editableOption = reactive({ id: null, optionValue: '', sortOrder: null, isActive: true });

const contextProductId = computed(() => {
  if (props.product?.id) return props.product.id;
  if (!props.slug) return null;
  const match = products.value.find(p => p.slug === props.slug);
  return match ? match.id : null;
});

// NOTE: The API's CamelCaseResponseMiddleware converts all response keys to camelCase.
const isGlobal = (list) => list.productId === null || list.productId === undefined;

const scopeLabel = (list) => isGlobal(list) ? 'Global' : (list.productName || 'Product');

// --- Fetching ---
const fetchProducts = async () => {
  try {
    const response = await apiClient.get('admin/products');
    products.value = response.data.data || response.data || [];
  } catch (err) {
    console.error('Failed to load products for scope selector:', err);
  }
};

const fetchLists = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('admin/document-option-lists');
    lists.value = response.data;

    // Keep selection in sync after refresh
    if (selectedList.value) {
      const refreshed = lists.value.find(l => l.id === selectedList.value.id);
      if (refreshed) {
        selectedList.value = refreshed;
        await fetchOptions(refreshed.id);
      } else {
        selectedList.value = null;
        options.value = [];
      }
    }
  } catch (err) {
    error.value = 'Failed to load option lists.';
  } finally {
    isLoading.value = false;
  }
};

const selectList = async (list) => {
  selectedList.value = list;
  await fetchOptions(list.id);
};

const fetchOptions = async (listId) => {
  try {
    const response = await apiClient.get(`admin/document-option-lists/${listId}/options`);
    options.value = response.data;
  } catch (err) {
    console.error(err);
    showAlert('Error', 'Failed to load options.');
  }
};

// --- List CRUD ---
const openListModal = (list) => {
  if (list) {
    Object.assign(editableList, {
      id: list.id,
      name: list.name,
      productId: list.productId ?? '',
      isActive: !!list.isActive,
    });
  } else {
    Object.assign(editableList, {
      id: null,
      name: '',
      productId: contextProductId.value ?? '',
      isActive: true,
    });
  }
  isListModalOpen.value = true;
};

const saveList = async () => {
  try {
    const payload = {
      name: editableList.name,
      product_id: editableList.productId === '' ? null : editableList.productId,
      is_active: editableList.isActive,
    };

    if (editableList.id) {
      await apiClient.put(`admin/document-option-lists/${editableList.id}`, payload);
    } else {
      await apiClient.post('admin/document-option-lists', payload);
    }

    isListModalOpen.value = false;
    showAlert('Success', 'List saved successfully.');
    await fetchLists();
  } catch (err) {
    console.error(err);
    showAlert('Error', err.response?.data?.message || 'Failed to save list.');
  }
};

const handleDeleteList = async () => {
  if (!selectedList.value) return;
  const confirmed = await showConfirm(
    'Delete List',
    `Are you sure you want to delete the list "${selectedList.value.name}" and all its options?`
  );

  if (!confirmed) return;

  try {
    await apiClient.delete(`admin/document-option-lists/${selectedList.value.id}`);
    showAlert('Success', 'List deleted.');
    selectedList.value = null;
    options.value = [];
    await fetchLists();
  } catch (err) {
    console.error(err);
    showAlert('Error', err.response?.data?.message || 'Failed to delete list.');
  }
};

// --- Option CRUD ---
const openOptionModal = (option) => {
  if (!selectedList.value) return;
  if (option) {
    Object.assign(editableOption, {
      id: option.id,
      optionValue: option.optionValue,
      sortOrder: option.sortOrder ?? null,
      isActive: !!option.isActive,
    });
  } else {
    Object.assign(editableOption, {
      id: null,
      optionValue: '',
      sortOrder: null,
      isActive: true,
    });
  }
  isOptionModalOpen.value = true;
};

const saveOption = async () => {
  try {
    const payload = {
      option_value: editableOption.optionValue,
      sort_order: editableOption.sortOrder,
      is_active: editableOption.isActive,
    };

    if (editableOption.id) {
      await apiClient.put(`admin/document-option-lists/options/${editableOption.id}`, payload);
    } else {
      await apiClient.post(`admin/document-option-lists/${selectedList.value.id}/options`, payload);
    }

    isOptionModalOpen.value = false;
    showAlert('Success', 'Option saved successfully.');
    await Promise.all([fetchOptions(selectedList.value.id), fetchLists()]);
  } catch (err) {
    console.error(err);
    showAlert('Error', err.response?.data?.message || 'Failed to save option.');
  }
};

const handleDeleteOption = async (option) => {
  const confirmed = await showConfirm(
    'Delete Option',
    `Are you sure you want to delete the option "${option.optionValue}"?`
  );

  if (!confirmed) return;

  try {
    await apiClient.delete(`admin/document-option-lists/options/${option.id}`);
    showAlert('Success', 'Option deleted.');
    await Promise.all([fetchOptions(selectedList.value.id), fetchLists()]);
  } catch (err) {
    console.error(err);
    showAlert('Error', 'Failed to delete option.');
  }
};

onMounted(async () => {
  await fetchProducts();
  await fetchLists();
});
</script>