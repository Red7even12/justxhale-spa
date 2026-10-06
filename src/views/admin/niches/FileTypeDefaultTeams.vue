<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div>
        <router-link :to="{ name: 'admin.niche-factory' }" class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-2">
          ← Back to Workspace Index
        </router-link>
        <h2 class="text-xl font-black text-gray-900 tracking-tight">Default Teams</h2>
        <p class="text-sm text-gray-500 mt-1">
          Blueprint team templates auto-hydrated when a subscriber provisions
          <span class="font-bold text-blue-600">{{ contextTitle }}</span>.
        </p>
      </div>
      <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition-all text-xs">
        + Add Default Team
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50/80">
          <tr>
            <th class="px-4 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider w-16">Order</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Team Name &amp; Description</th>
            <th class="px-6 py-3.5 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Team Type</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Can View</th>
            <th class="px-6 py-3.5 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Can Edit</th>
            <th class="px-6 py-3.5 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr v-for="dt in sortedDefaultTeams" :key="dt.id" class="hover:bg-blue-50/20 transition-colors">
            <td class="px-4 py-4 text-center">
              <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-700 text-xs font-black">
                {{ dt.display_order ?? dt.displayOrder ?? 0 }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900 text-sm">{{ dt.name }}</div>
              <p v-if="dt.description" class="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-md">
                {{ dt.description }}
              </p>
            </td>
            <td class="px-6 py-4">
              <span
                :class="{
                  'bg-blue-50 text-blue-700 border-blue-200': (dt.team_type ?? dt.teamType) === 'functional',
                  'bg-purple-50 text-purple-700 border-purple-200': (dt.team_type ?? dt.teamType) === 'audit',
                  'bg-amber-50 text-amber-700 border-amber-200': (dt.team_type ?? dt.teamType) === 'ownership'
                }"
                class="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border"
              >
                {{ dt.team_type ?? dt.teamType }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="(dt.can_view ?? dt.canView) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                {{ (dt.can_view ?? dt.canView) ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="(dt.can_edit ?? dt.canEdit) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                {{ (dt.can_edit ?? dt.canEdit) ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 text-xs font-bold">
              <button @click="openModal(dt)" class="text-gray-500 hover:text-gray-700">Edit</button>
              <button @click="removeDefaultTeam(dt)" class="text-red-400 hover:text-red-600">Delete</button>
            </td>
          </tr>
          <tr v-if="defaultTeams.length === 0">
            <td colspan="6" class="p-10 text-center text-gray-400 italic text-sm">
              No default teams defined for this Niche yet. Default teams are hydrated automatically when a subscriber provisions this file type.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <h2 class="text-lg font-black text-gray-900 border-b pb-3">{{ form.id ? 'Edit' : 'Create' }} Default Team</h2>

        <form @submit.prevent="save" class="space-y-4">
          <div v-if="!form.id" class="pb-2">
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Team Blueprint</label>
            <select v-model="form.mode" @change="onModeChange" class="w-full border-gray-300 rounded-lg text-sm">
              <option value="new">＋ Create new team blueprint</option>
              <option v-for="opt in reusableOptions" :key="opt.name" :value="opt.name">
                {{ opt.name }} ({{ opt.team_type }} team)
              </option>
            </select>
            <p class="text-[10px] text-gray-400 mt-1">Pick an existing blueprint to reuse a team name across niches, or create a new one.</p>
          </div>

          <div v-if="form.id">
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Team Name</label>
            <input :value="form.name" type="text" disabled class="w-full border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500">
            <p class="text-[10px] text-gray-400 mt-1">Team name is fixed once the blueprint is linked.</p>
          </div>

          <div v-else-if="form.mode === 'new'">
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">New Team Name</label>
            <input v-model="form.name" :class="nameTaken ? 'w-full border-red-300 rounded-lg text-sm' : 'w-full border-gray-300 rounded-lg text-sm'" type="text" required placeholder="e.g. Fleet Operations">
            <p v-if="nameTaken" class="text-[10px] text-red-500 mt-1">A default team named "{{ form.name }}" is already linked to this Niche.</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-black text-gray-600 uppercase mb-1">Team Type</label>
              <select v-model="form.team_type" class="w-full border-gray-300 rounded-lg text-sm">
                <option value="ownership">Ownership</option>
                <option value="functional">Functional</option>
                <option value="audit">Audit</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-black text-gray-600 uppercase mb-1">Display Order</label>
              <input v-model.number="form.display_order" type="number" min="0" class="w-full border-gray-300 rounded-lg text-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-black text-gray-600 uppercase mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full border-gray-300 rounded-lg text-sm"
              placeholder="Contextual purpose of this team for tenant operators..."
            ></textarea>
          </div>

          <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
            <input v-model="form.can_view" type="checkbox" id="can_view" class="mt-0.5 h-4 w-4 text-blue-600 rounded">
            <div>
              <label for="can_view" class="text-xs text-gray-900 font-bold block cursor-pointer">Can View this Niche Tab</label>
              <p class="text-[10px] text-gray-500 leading-tight mt-0.5">Grants the team read access to this file type's tab.</p>
            </div>
          </div>

          <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
            <input v-model="form.can_edit" type="checkbox" id="can_edit" class="mt-0.5 h-4 w-4 text-blue-600 rounded">
            <div>
              <label for="can_edit" class="text-xs text-gray-900 font-bold block cursor-pointer">Can Edit this Niche Tab</label>
              <p class="text-[10px] text-gray-500 leading-tight mt-0.5">Grants the team write access to this file type's tab.</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t pt-4">
            <button type="button" @click="showModal = false" class="text-gray-400 font-bold text-xs px-4 py-2">Cancel</button>
            <button type="submit" class="bg-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow hover:bg-blue-700">
              {{ form.id ? 'Update Default Team' : 'Save Default Team' }}
            </button>
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
  product: { type: Object, default: null },
  slug: { type: String, default: null },
  niche: { type: Object, default: null },
  fileTypeId: { type: [String, Number], default: null }
});

const { showConfirm, showAlert } = useAlerts();
const defaultTeams = ref([]);
const teamOptions = ref([]);
const showModal = ref(false);

const contextTitle = computed(() => props.niche?.name || props.product?.name || 'this Niche');

const apiUrl = computed(() => `admin/file-types/${props.fileTypeId}/default-teams`);

const form = reactive({
  id: null,
  mode: 'new',
  name: '',
  team_type: 'ownership',
  description: '',
  display_order: 0,
  can_view: true,
  can_edit: true
});

const sortedDefaultTeams = computed(() => {
  return [...defaultTeams.value].sort((a, b) => {
    const orderA = a.display_order ?? a.displayOrder ?? 0;
    const orderB = b.display_order ?? b.displayOrder ?? 0;
    return orderA - orderB;
  });
});

// Blueprints already linked to THIS file type (excluded from the reuse dropdown)
const reusableOptions = computed(() => {
  const taken = new Set(defaultTeams.value.map((dt) => (dt.name || '').trim().toLowerCase()));
  const seen = new Set();
  const out = [];
  for (const opt of teamOptions.value) {
    const name = (opt.name || '').trim();
    const key = name.toLowerCase();
    if (!name || taken.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(opt);
  }
  return out;
});

// Warn (and block) when typing a name that already exists for this file type
const nameTaken = computed(() => {
  if (form.mode !== 'new' || !form.name) return false;
  const name = form.name.trim().toLowerCase();
  return !!name && defaultTeams.value.some((dt) => (dt.name || '').trim().toLowerCase() === name);
});

const loadDefaultTeams = async () => {
  try {
    const { data } = await apiClient.get(apiUrl.value);
    defaultTeams.value = data?.data || data || [];
  } catch (e) {
    console.error('Failed to load default teams', e);
  }
};

const loadTeamOptions = async () => {
  try {
    const { data } = await apiClient.get('/admin/default-team-options');
    teamOptions.value = data?.data || data || [];
  } catch (e) {
    console.error('Failed to load default team options', e);
  }
};

const onModeChange = () => {
  if (form.mode === 'new') {
    form.name = '';
    form.description = '';
    return;
  }
  const opt = teamOptions.value.find((o) => o.name === form.mode);
  if (opt) {
    form.name = opt.name;
    form.team_type = opt.team_type ?? 'ownership';
    form.description = opt.description ?? '';
    form.can_view = !!(opt.can_view ?? opt.canView ?? true);
    form.can_edit = !!(opt.can_edit ?? opt.canEdit ?? true);
  }
};

const openModal = (dt = null) => {
  if (dt) {
    form.id = dt.id;
    form.mode = 'new';
    form.name = dt.name;
    form.team_type = dt.team_type ?? dt.teamType ?? 'ownership';
    form.description = dt.description ?? '';
    form.display_order = dt.display_order ?? dt.displayOrder ?? 0;
    form.can_view = !!(dt.can_view ?? dt.canView ?? true);
    form.can_edit = !!(dt.can_edit ?? dt.canEdit ?? true);
  } else {
    form.id = null;
    form.mode = 'new';
    form.name = '';
    form.team_type = 'ownership';
    form.description = '';
    // Set next sequence by default
    form.display_order = defaultTeams.value.length;
    form.can_view = true;
    form.can_edit = true;
  }
  showModal.value = true;
};

const save = async () => {
  if (!form.id && form.mode === 'new' && nameTaken.value) {
    showAlert('Error', `"${form.name}" is already linked to this Niche as a default team.`);
    return;
  }
  try {
    const url = form.id ? `${apiUrl.value}/${form.id}` : apiUrl.value;
    const method = form.id ? 'put' : 'post';
    await apiClient[method](url, form);
    showModal.value = false;
    loadDefaultTeams();
    loadTeamOptions();
    showAlert('Success', form.id ? 'Default team blueprint updated.' : 'Default team blueprint created.');
  } catch (e) {
    showAlert('Error', e.response?.data?.message || 'Save failed.');
  }
};

const removeDefaultTeam = async (dt) => {
  if (await showConfirm('Delete Default Team', `Remove "${dt.name}"? This blueprint will no longer be auto-hydrated.`)) {
    try {
      await apiClient.delete(`${apiUrl.value}/${dt.id}`);
      loadDefaultTeams();
      showAlert('Success', 'Default team blueprint removed.');
    } catch (e) {
      showAlert('Error', 'Action failed.');
    }
  }
};

onMounted(() => {
  loadDefaultTeams();
  loadTeamOptions();
});
</script>