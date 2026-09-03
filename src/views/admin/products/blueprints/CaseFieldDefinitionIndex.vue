<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <!-- DUAL-CONTEXT BACK LINK -->
        <router-link :to="backDestination" class="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mb-2">
            ← {{ backLabel }}
        </router-link>
        <h2 class="text-xl font-bold text-gray-800">Field Definitions: {{ fileType?.name }}</h2>
        <p class="text-sm text-gray-500">Configure custom data points and role-player metadata for this Niche Blueprint.</p>
      </div>
      <button @click="openModal()" class="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-700 font-bold transition-all">
        + Add Data Field
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
          <tr>
            <th class="px-6 py-4 text-left">Label (UI) / Context</th>
            <th class="px-6 py-4 text-left">Key (Database)</th>
            <th class="px-6 py-4 text-center">Type</th>
            <th class="px-6 py-4 text-center">Order</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="field in fields" :key="field.id" class="hover:bg-indigo-50/30 transition-colors">
            <td class="px-6 py-4">
                <div class="font-bold text-gray-900">{{ field.fieldLabel || field.field_label }}</div>
                <div class="flex flex-col gap-1 mt-1">
                    <div v-if="field.participantRole" class="text-[10px] text-indigo-500 font-black uppercase tracking-tighter flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Role: {{ field.participantRole.name }}
                    </div>
                    <div v-if="field.entityFieldDefinitionId" class="text-[10px] text-emerald-600 font-black uppercase tracking-tighter flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Projected Global Data
                    </div>
                    <div v-if="!field.participantRole" class="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">General Case Data</div>
                </div>
            </td>
            <td class="px-6 py-4 font-mono text-xs text-gray-400">{{ field.fieldKey || field.field_key }}</td>
            <td class="px-6 py-4 text-center text-xs font-medium uppercase">{{ field.fieldType || field.field_type }}</td>
            <td class="px-6 py-4 text-center text-sm text-gray-500">{{ field.sortOrder || field.sort_order }}</td>
            <td class="px-6 py-4 text-right space-x-3 text-sm font-medium">
              <button @click="openModal(field)" class="text-gray-400 hover:text-indigo-600">Edit</button>
              <button @click="confirmDelete(field)" class="text-red-400 hover:text-red-600">Delete</button>
            </td>
          </tr>
          <tr v-if="fields.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-400 italic">No custom data fields defined for this Niche yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 class="text-xl font-bold mb-6 text-gray-900 border-b pb-4">{{ form.id ? 'Edit' : 'Create' }} Field</h2>
        <form @submit.prevent="save" class="grid grid-cols-2 gap-5">
            <div class="col-span-2">
                <label class="block text-xs font-black text-gray-400 uppercase mb-1">Field Label (UI Display)</label>
                <input v-model="form.field_label" type="text" required class="w-full border-gray-300 rounded-lg shadow-sm">
            </div>
            <div>
                <label class="block text-xs font-black text-gray-400 mb-1">Field Key (System)</label>
                <input 
                    v-model="form.field_key" 
                    type="text" 
                    required 
                    @input="normalizeKey"
                    placeholder="e.g. tax_no_executor"
                    class="w-full border-gray-300 rounded-lg shadow-sm font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                <p class="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                    Automatically normalized to snake_case
                </p>
            </div>
            <div>
                <label class="block text-xs font-black text-gray-400 uppercase mb-1">Input Type</label>
                <select v-model="form.field_type" class="w-full border-gray-300 rounded-lg shadow-sm">
                    <option value="text">Short Text</option>
                    <option value="date">Date Picker</option>
                    <option value="number">Numeric</option>
                    <option value="textarea">Long Text</option>
                </select>
            </div>
            
            <!-- PARTICIPANT ROLE CONTEXT -->
            <div class="col-span-2 p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-4">
                <div>
                    <label class="block text-xs font-black text-indigo-900 uppercase mb-2">Character Context (Optional)</label>
                    <select v-model="form.participant_role_id" class="w-full border-indigo-200 rounded-lg shadow-sm text-sm">
                        <option :value="null">-- General Case Field --</option>
                        <option v-for="role in roles" :key="role.id" :value="role.id">
                             Metadata for character: {{ role.name }}
                        </option>
                    </select>
                </div>

                <!-- PROJECTION MAPPING -->
                <div v-if="form.participant_role_id">
                    <label class="block text-[12px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">
                        Projection Mapping (Optional)
                    </label>
                    <select v-model="form.entity_field_definition_id" class="w-full border-indigo-200 rounded-lg shadow-sm text-xs bg-white">
                        <option :value="null">-- No Projection (Manual Data) --</option>
                        <option v-for="eField in entityFields" :key="eField.id" :value="eField.id">
                             Project Global Value: {{ eField.fieldLabel }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <input v-model="form.is_required" type="checkbox" id="req" class="rounded text-indigo-600">
                <label for="req" class="text-xs font-bold text-gray-700">Mandatory?</label>
            </div>
            <div class="flex items-center gap-2">
                <input v-model="form.show_in_quick_view" type="checkbox" id="sqv" class="rounded text-indigo-600">
                <label for="sqv" class="text-xs font-bold text-gray-700">Show in Quickview?</label>
            </div>
            <div class="flex items-center gap-2">
                <label class="text-xs font-bold text-gray-700">Order:</label>
                <input v-model="form.sort_order" type="number" class="w-20 border-gray-300 rounded-lg shadow-sm text-sm">
            </div>

            <div class="col-span-2 mt-4 flex justify-end gap-3 pt-5 border-t">
                <button type="button" @click="showModal = false" class="text-gray-400 font-bold px-4 py-2">Cancel</button>
                <button type="submit" class="bg-indigo-600 text-white font-bold px-8 py-2 rounded-lg shadow hover:bg-indigo-700">Save Field</button>
            </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  slug: { type: String, default: null },
  fileTypeId: { type: [String, Number], required: true }
});

const { showConfirm, showAlert } = useAlerts();

const fields = ref([]);
const fileType = ref(null);
const roles = ref([]);
const entityFields = ref([]);
const showModal = ref(false);

// DUAL-CONTEXT NAVIGATION HELPERS
const backDestination = computed(() => {
  return props.slug 
    ? { name: 'admin.product.file-types', params: { slug: props.slug } }
    : { name: 'admin.niche-factory' };
});

const backLabel = computed(() => {
  return props.slug ? 'Back to Product Niches' : 'Back to Niche Foundry';
});

// DUAL-CONTEXT API URL BUILDER
const basePath = computed(() => {
  return props.slug 
    ? `admin/products/${props.slug}/file-types/${props.fileTypeId}`
    : `admin/file-types/${props.fileTypeId}`;
});

const form = reactive({ 
    id: null, field_label: '', field_key: '', field_type: 'text', 
    is_required: false, sort_order: 0, participant_role_id: null,
    entity_field_definition_id: null,
    show_in_quick_view: false
});

const load = async () => {
  try {
    const promises = [
      apiClient.get(`${basePath.value}/fields`),
      apiClient.get(basePath.value),
      apiClient.get('admin/entity-fields').catch(() => ({ data: { data: [] } }))
    ];

    // Only query product-scoped participant roles if we are in a product context
    if (props.slug) {
      promises.push(
        apiClient.get(`admin/products/${props.slug}/participant-roles`).catch(() => ({ data: [] }))
      );
    }

    const [fieldsRes, typeRes, entityRes, rolesRes] = await Promise.all(promises);

    fields.value = fieldsRes.data?.data || fieldsRes.data || [];
    fileType.value = typeRes.data?.data || typeRes.data || null;
    entityFields.value = entityRes.data?.data || entityRes.data || [];
    roles.value = rolesRes?.data?.data || rolesRes?.data || [];
  } catch (e) { 
    console.error('Failed to load field definitions context:', e); 
  }
};

const openModal = (field = null) => {
  if (field) {
    Object.assign(form, {
        id: field.id,
        field_label: field.fieldLabel || field.field_label,
        field_key: field.fieldKey || field.field_key,
        field_type: field.fieldType || field.field_type,
        is_required: !!(field.isRequired || field.is_required),
        sort_order: field.sortOrder || field.sort_order,
        participant_role_id: field.participantRoleId || field.participant_role_id,
        entity_field_definition_id: field.entityFieldDefinitionId || field.entity_field_definition_id || null,
        show_in_quick_view: !!(field.showInQuickView || field.show_in_quick_view)
    });
  } else {
    Object.assign(form, { 
        id: null, field_label: '', field_key: '', field_type: 'text', 
        is_required: false, sort_order: fields.value.length + 1, 
        participant_role_id: null, entity_field_definition_id: null, show_in_quick_view: false 
    });
  }
  showModal.value = true;
};

const normalizeKey = () => {
    form.field_key = form.field_key
        .toLowerCase()
        .trim()
        .replace(/[\s-]/g, '_')
        .replace(/[^a-z0-9_]/g, '');
};

const save = async () => {
    normalizeKey();

    const snakeRegex = /^[a-z0-9_]+$/;
    if (!snakeRegex.test(form.field_key)) {
        showAlert('Invalid Key', 'The Field Key must only contain lowercase letters, numbers, and underscores.');
        return;
    }

    try {
        const url = `${basePath.value}/fields${form.id ? '/' + form.id : ''}`;
        const method = form.id ? 'put' : 'post';
        
        if (form.entity_field_definition_id && !form.participant_role_id) {
            showAlert('Error', 'Projection mapping requires a Participant Role.');
            return;
        }

        await apiClient[method](url, form);
        showModal.value = false;
        load();
        showAlert('Success', 'Field definition saved.');
    } catch (e) { 
        showAlert('Error', e.response?.data?.message || 'Save failed.'); 
    }
};

const confirmDelete = async (field) => {
  if (await showConfirm('Delete Field', `Permanent deletion of "${field.fieldLabel || field.field_label}"?`)) {
    try {
        await apiClient.delete(`${basePath.value}/fields/${field.id}`);
        load();
    } catch (e) { showAlert('Error', 'Delete failed.'); }
  }
};

onMounted(load);
</script>