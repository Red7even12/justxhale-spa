<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800 uppercase tracking-tight">
        {{ productSlug }} Cases
      </h1>
      <button @click="openCreateModal" class="bg-brand-primary text-white px-4 py-2 rounded-lg shadow-md font-bold hover:opacity-90 transition-all">
        + Create New Case
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
      <div class="flex-1">
        <input v-model="filters.search" @input="fetchCases" type="text" placeholder="Search by name or reference..." class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary">
      </div>
    </div>

    <!-- Case Table -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Case Details</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type / Niche</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="caseFile in cases" :key="caseFile.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="text-sm font-bold text-gray-900">{{ caseFile.fileName }}</div>
              <div class="text-xs text-gray-400">{{ caseFile.fileReference || 'No Reference' }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase">
                {{ caseFile.fileType?.name }}
              </span>
            </td>
            <td class="px-6 py-4">
               <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ caseFile.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ new Date(caseFile.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <router-link :to="`/${productSlug}/cases/${caseFile.id}`" class="text-brand-primary hover:underline font-bold">
                View Details
              </router-link>
            </td>
          </tr>
          <tr v-if="cases.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
              No cases found in this context. Create one to get started.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Case Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="bg-brand-primary p-6 text-white">
          <h2 class="text-xl font-bold">Initialize New Case</h2>
          <p class="text-xs opacity-80 uppercase tracking-widest mt-1">Product: {{ productSlug }}</p>
        </div>
        
        <form @submit.prevent="createCase" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Classification (Niche)</label>
            <select v-model="form.fileTypeId" required class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm font-medium">
              <option value="">-- Select File Type --</option>
              <option v-for="type in fileTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Assigned Team</label>
            <select v-model="form.currentTeamId" required class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm font-medium">
              <option value="">-- Select Team --</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Case Name</label>
            <input v-model="form.fileName" type="text" required placeholder="e.g. Estate Late J Doe" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 uppercase mb-1">Internal Reference</label>
            <input v-model="form.fileReference" type="text" placeholder="REF-2026-001" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary">
          </div>

          <div class="flex justify-end gap-3 mt-8">
            <button type="button" @click="showModal = false" class="text-gray-400 font-bold hover:text-gray-600 px-4 py-2">Cancel</button>
            <button type="submit" class="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90">
              Create Case File
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import caseService from '@/services/caseService';
import teamService from '@/services/teamService';

const route = useRoute();
const productSlug = computed(() => route.params.productSlug);

const cases = ref([]);
const fileTypes = ref([]);
const teams = ref([]);
const showModal = ref(false);
const filters = ref({ search: '' });
const form = ref({ fileTypeId: '', currentTeamId: '', fileName: '', fileReference: '' });

const fetchCases = async () => {
  const { data } = await caseService.getCases(productSlug.value, filters.value);
  cases.value = data.data;
};

const openCreateModal = async () => {
  // Fetch the file types and teams
  try {
    const [ftRes, teamRes] = await Promise.all([
        caseService.getFileTypes(productSlug.value),
        teamService.getTeams()
    ]);
    fileTypes.value = ftRes.data;
    teams.value = Array.isArray(teamRes.data) ? teamRes.data : (teamRes.data.data || []);
    showModal.value = true;
  } catch (error) {
    console.error("Failed to load modal data", error);
  }
};

const createCase = async () => {
  try {
    await caseService.createCase(productSlug.value, form.value);
    showModal.value = false;
    form.value = { fileTypeId: '', currentTeamId: '', fileName: '', fileReference: '' };
    fetchCases();
  } catch (error) {
    alert("Error creating case. Ensure all required fields are selected.");
  }
};

// If the user switches tabs (JustXhale -> EduFund), refresh the data
watch(productSlug, () => {
  fetchCases();
});

onMounted(fetchCases);
</script>