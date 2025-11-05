<template>
  <div>
    <!-- Team Name and Edit Form -->
    <div class="mb-6">
      <div v-if="!isEditingName" class="flex items-center">
        <h3 class="text-xl font-semibold text-gray-900">{{ localTeam.name }}</h3>
        <button @click="isEditingName = true" class="ml-4 text-brand-blue-600 hover:text-brand-blue-900 text-sm">Edit</button>
      </div>
      <div v-else>
        <form @submit.prevent="updateTeamName" class="flex items-center space-x-2">
          <input
            v-model="editableTeamName"
            type="text"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 sm:text-sm"
          />
          <button type="submit" class="rounded-md bg-brand-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue-500">Save</button>
          <button @click="isEditingName = false" type="button" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
        </form>
      </div>
    </div>

    <!-- Member Management -->
    <div>
      <h4 class="text-lg font-medium text-gray-900">Team Members</h4>
      <p class="mt-1 text-sm text-gray-500">Toggle a user's status to activate or deactivate them from this team.</p>

      <!-- List of Current Members -->
      <ul role="list" class="divide-y divide-gray-200 mt-4">
        <li v-for="member in teamMembers" :key="member.id" class="flex items-center justify-between py-3">
          <span class="font-medium text-sm">{{ member.name }}</span>
          <!-- The Toggle Switch -->
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
// Import the actual services as they exist in your project
import teamService from '@/services/teamService';
import userService from '@/services/userService';

const props = defineProps({
  team: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['team-updated']);

const localTeam = ref({ ...props.team });
const allUsers = ref([]);
const selectedUserToAdd = ref('');
const isEditingName = ref(false);
const editableTeamName = ref(props.team.name);

const fetchAllUsers = async () => {
    try {
        // Use the userService to fetch all users (no pagination)
        const response = await userService.getUsers({ per_page: -1 });
        // Correctly access the data array from the paginated response
        allUsers.value = response.data.data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        allUsers.value = []; // Prevent downstream errors by ensuring it's an array
    }
};

onMounted(fetchAllUsers);

watch(() => props.team, (newTeam) => {
  localTeam.value = { ...newTeam };
  editableTeamName.value = newTeam.name;
  isEditingName.value = false;
}, { deep: true });

const teamMembers = computed(() => {
    return localTeam.value.users || [];
});

const availableUsers = computed(() => {
    const memberIds = new Set(teamMembers.value.map(m => m.id));
    return allUsers.value.filter(u => !memberIds.has(u.id));
});

const updateTeamName = async () => {
    try {
        // Your backend expects snake_case for this, but the single response is not wrapped in .data
        const response = await teamService.updateTeam(localTeam.value.id, { name: editableTeamName.value });
        emit('team-updated', response.data);
        isEditingName.value = false;
    } catch (error) {
        console.error("Failed to update team name:", error);
    }
};

const toggleMemberStatus = async (member) => {
    if (member.pivot.isActive) {
        try {
            await teamService.removeUserFromTeam(localTeam.value.id, member.id);
            member.pivot.isActive = false; // Optimistic update
        } catch (error) {
            console.error("Failed to deactivate member:", error);
        }
    } else {
        try {
            // Your backend controller's addUser expects 'user_id' in snake_case
            await teamService.addUserToTeam(localTeam.value.id, { user_id: member.id });
            member.pivot.isActive = true; // Optimistic update
        } catch (error) {
            console.error("Failed to activate member:", error);
        }
    }
};

const addUserToTeam = async () => {
    if (!selectedUserToAdd.value) return;
    try {
        // Your backend controller's addUser expects 'user_id' in snake_case
        await teamService.addUserToTeam(localTeam.value.id, { user_id: selectedUserToAdd.value });
        // Refetch the team to get the updated user list
        const response = await teamService.getTeam(localTeam.value.id);
        emit('team-updated', response.data);
        selectedUserToAdd.value = '';
    } catch (error) {
        console.error("Failed to add user:", error);
    }
};
</script>