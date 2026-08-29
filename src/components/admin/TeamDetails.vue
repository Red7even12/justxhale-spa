<template>
  <div>
    <!-- Team Name and Edit Form -->
    <div class="mb-6">
      <div v-if="!isEditingName" class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-semibold text-gray-900">{{ localTeam.name }}</h3>
            <!-- Team Type Badge -->
            <span :class="(localTeam.team_type || localTeam.teamType) === 'functional' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'" class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border">
              {{ (localTeam.team_type || localTeam.teamType) === 'functional' ? 'Functional Access' : 'Case Ownership' }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            {{ (localTeam.team_type || localTeam.teamType) === 'functional' ? 'Governs Niche Tab & Domain Access inside case files' : 'Governs matter ownership on Dashboard & Reminders' }}
          </p>
        </div>

        <button @click="isEditingName = true" class="text-brand-blue-600 hover:text-brand-blue-900 text-sm font-bold">Edit</button>
      </div>

      <!-- Edit Form -->
      <div v-else class="bg-gray-50 p-4 rounded-xl border space-y-4">
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase mb-1">Team Name</label>
          <input
            v-model="editableTeamName"
            type="text"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 text-sm font-bold"
          />
        </div>

        <div>
          <label class="block text-xs font-black text-gray-500 uppercase mb-2">Team Purpose & Scope</label>
          <div class="grid grid-cols-2 gap-3">
            <label :class="editableTeamType === 'ownership' ? 'border-brand-blue-600 bg-blue-50' : 'border-gray-200 bg-white'" class="p-3 border rounded-xl cursor-pointer flex items-center gap-2">
              <input type="radio" v-model="editableTeamType" value="ownership" class="text-brand-blue-600">
              <span class="text-xs font-bold text-gray-800">Case Ownership</span>
            </label>
            <label :class="editableTeamType === 'functional' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 bg-white'" class="p-3 border rounded-xl cursor-pointer flex items-center gap-2">
              <input type="radio" v-model="editableTeamType" value="functional" class="text-emerald-600">
              <span class="text-xs font-bold text-gray-800">Functional Access</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="isEditingName = false" type="button" class="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
          <button @click="updateTeam" type="button" class="rounded-md bg-brand-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-blue-500">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Member Management -->
    <div>
      <h4 class="text-lg font-medium text-gray-900">Team Members</h4>
      <p class="mt-1 text-sm text-gray-500">Toggle a user's status to activate or deactivate them from this team.</p>

      <ul role="list" class="divide-y divide-gray-200 mt-4">
        <li v-for="member in teamMembers" :key="member.id" class="flex items-center justify-between py-3">
          <span class="font-medium text-sm">{{ member.name }}</span>
          <button
            @click="toggleMemberStatus(member)"
            :class="[member.pivot.isActive ? 'bg-brand-blue-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue-600 focus:ring-offset-2']"
            type="button"
            role="switch"
            :aria-checked="member.pivot.isActive"
          >
            <span :class="[member.pivot.isActive ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" aria-hidden="true"></span>
          </button>
        </li>
      </ul>
      
      <div v-if="teamMembers.length === 0" class="text-sm text-gray-500 py-4">This team has no members yet.</div>
    </div>

    <!-- Add Member Form -->
    <div class="mt-6 border-t border-gray-200 pt-6">
       <h4 class="text-lg font-medium text-gray-900">Add User to Team</h4>
       <div class="mt-4 flex rounded-md shadow-sm">
         <select v-model="selectedUserToAdd" class="block w-full rounded-none rounded-l-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-blue-600 sm:text-sm sm:leading-6">
            <option disabled value="">Select a user to add...</option>
            <option v-for="user in availableUsers" :key="user.id" :value="user.id">{{ user.name }} ({{ user.email }})</option>
         </select>
         <button @click="addUserToTeam" type="button" class="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-white bg-brand-blue-600 hover:bg-brand-blue-700">Add Member</button>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import teamService from '@/services/teamService';
import userService from '@/services/userService';

const props = defineProps({
  team: { type: Object, required: true }
});

const emit = defineEmits(['team-updated']);

const localTeam = ref({ ...props.team });
const allUsers = ref([]);
const selectedUserToAdd = ref('');
const isEditingName = ref(false);
const editableTeamName = ref(props.team.name);
const editableTeamType = ref(props.team.team_type || props.team.teamType || 'ownership');

const fetchAllUsers = async () => {
    try {
        const response = await userService.getUsers({ per_page: -1 });
        allUsers.value = response.data.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        allUsers.value = [];
    }
};

onMounted(fetchAllUsers);

watch(() => props.team, (newTeam) => {
  localTeam.value = { ...newTeam };
  editableTeamName.value = newTeam.name;
  editableTeamType.value = newTeam.team_type || newTeam.teamType || 'ownership';
  isEditingName.value = false;
}, { deep: true });

const teamMembers = computed(() => localTeam.value.users || []);

const availableUsers = computed(() => {
    const memberIds = new Set(teamMembers.value.map(m => m.id));
    return allUsers.value.filter(u => !memberIds.has(u.id));
});

const updateTeam = async () => {
    try {
        const response = await teamService.updateTeam(localTeam.value.id, { 
          name: editableTeamName.value,
          team_type: editableTeamType.value 
        });
        emit('team-updated', response.data);
        isEditingName.value = false;
    } catch (error) {
        console.error("Failed to update team:", error);
    }
};

const toggleMemberStatus = async (member) => {
    if (member.pivot.isActive) {
        try {
            await teamService.removeUserFromTeam(localTeam.value.id, member.id);
            member.pivot.isActive = false;
        } catch (error) {
            console.error("Failed to deactivate member:", error);
        }
    } else {
        try {
            await teamService.addUserToTeam(localTeam.value.id, { user_id: member.id });
            member.pivot.isActive = true;
        } catch (error) {
            console.error("Failed to activate member:", error);
        }
    }
};

const addUserToTeam = async () => {
    if (!selectedUserToAdd.value) return;
    try {
        await teamService.addUserToTeam(localTeam.value.id, { user_id: selectedUserToAdd.value });
        const response = await teamService.getTeam(localTeam.value.id);
        emit('team-updated', response.data);
        selectedUserToAdd.value = '';
    } catch (error) {
        console.error("Failed to add user:", error);
    }
};
</script>