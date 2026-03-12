<template>
  <!-- frontend-spa\src\views\admin\TeamIndex.vue -->
  <!-- Outer padding is now handled by AppLayout for consistency -->
  <div>

    <!-- Main Content Area (unchanged) -->
    <div class="mt-8">
      <div v-if="loading" class="text-center text-gray-500">Loading teams...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Left Panel: Team List -->
        <div class="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900">Teams</h2>
          <ul role="list" class="mt-4 divide-y divide-gray-200">
            <li 
              v-for="team in teams" 
              :key="team.id"
              @click="selectTeam(team)"
              class="py-4 px-2 cursor-pointer rounded-md"
              :class="{ 'bg-brand-blue-50': selectedTeam && selectedTeam.id === team.id, 'hover:bg-gray-50': !selectedTeam || selectedTeam.id !== team.id }"
            >
              <div class="flex items-center space-x-4">
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-gray-900">{{ team.name }}</p>
                  <p class="truncate text-sm text-gray-500">{{ team.users.length }} members</p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Right Panel: Selected Team Details -->
        <div class="md:col-span-2">
          <div v-if="selectedTeam" class="bg-white p-6 rounded-lg shadow">
            <TeamDetails :team="selectedTeam" @team-updated="handleTeamUpdate" />
          </div>
          <div v-else class="flex items-center justify-center h-full bg-white p-6 rounded-lg shadow">
            <p class="text-gray-500">Select a team from the list to view its details.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- The modal remains, as its visibility is controlled by our script -->
     <NewTeamModal v-if="isNewTeamModalOpen" @close="isNewTeamModalOpen = false" @team-created="handleTeamCreated" /> 

  </div>
</template>

<script setup>
// 1. Imports updated
import { ref, onMounted, onUnmounted } from 'vue';
import { useUiStore } from '../../store/ui';
import apiClient from '../../services/api'; 
import TeamDetails from '../../components/admin/TeamDetails.vue';
import NewTeamModal from '../../components/admin/NewTeamModal.vue';

// 2. Initialize UI Store
const uiStore = useUiStore();

// --- Existing State and Logic (all unchanged) ---
const teams = ref([]);
const selectedTeam = ref(null);
const loading = ref(true);
const error = ref(null);
const isNewTeamModalOpen = ref(false);

const fetchTeams = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('teams');
    teams.value = response.data.data;
  } catch (err) {
    console.error('Failed to fetch teams:', err);
    error.value = 'Could not load teams. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const selectTeam = (team) => {
  selectedTeam.value = team;
};

// This existing function is perfect for our header button
const openNewTeamModal = () => {
  isNewTeamModalOpen.value = true;
};

const handleTeamCreated = (newTeam) => {
  isNewTeamModalOpen.value = false;
  fetchTeams();
};

const handleTeamUpdate = (updatedTeam) => {
  const index = teams.value.findIndex(t => t.id === updatedTeam.id);
  if (index !== -1) {
    teams.value[index] = { ...teams.value[index], ...updatedTeam };
  }
  if (selectedTeam.value && selectedTeam.value.id === updatedTeam.id) {
      selectedTeam.value = { ...selectedTeam.value, ...updatedTeam };
  }
};

// 3. Lifecycle hooks to manage header state
onMounted(() => {
  fetchTeams();

  uiStore.setHeaderActions([
    {
      label: 'Add Team',
      onClick: openNewTeamModal // We directly use the existing function!
    }
  ]);
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});
</script>