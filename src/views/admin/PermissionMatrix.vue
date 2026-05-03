<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Security Matrix</h1>
      <button 
        @click="saveAll" 
        :disabled="saving"
        class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
      >
        {{ saving ? 'Saving...' : 'Save Permissions' }}
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Module / Permission
            </th>
            <th v-for="role in roles" :key="role.id" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ role.name }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 text-sm">
          <template v-for="(perms, group) in groupedPermissions" :key="group">
            <!-- Group Header -->
            <tr class="bg-gray-100">
              <td :colspan="roles.length + 1" class="px-4 py-2 font-bold uppercase text-gray-600 text-xs">
                {{ group }}
              </td>
            </tr>
            <!-- Permission Rows -->
            <tr v-for="perm in perms" :key="perm.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-gray-700">
                {{ perm.name }}
              </td>
              <td v-for="role in roles" :key="role.id" class="text-center px-4 py-2">
                <input 
                  type="checkbox" 
                  :checked="hasPermission(role.id, perm.name)"
                  @change="togglePermission(role.id, perm.name)"
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';  // Ensure your axios instance is imported correctly
import { useAuthStore } from '@/store/auth'; // Ensure path to your auth store is correct
const authStore = useAuthStore();


const roles = ref([]);
const groupedPermissions = ref({});
const roleMap = ref({}); // Maps role_id -> Set of permission names
const saving = ref(false);

const fetchData = async () => {
  try {
    const res = await axios.get('/api/v1/admin/permissions/matrix', {
        headers: { Authorization: `Bearer ${authStore.token}` }
    });

    // 1. MATCH THE KEYS FROM YOUR NETWORK RESPONSE
    roles.value = res.data.roles; 
    groupedPermissions.value = res.data.groupedPermissions; // Was grouped_permissions
    
    const map = {};
    res.data.roles.forEach(role => {
      // 2. MATCH rolePermissions KEY
      const rolePerms = res.data.rolePermissions[role.id] || []; // Was role_permissions
      
      const permNames = [];
      // 3. MATCH groupedPermissions KEY here too
      Object.values(res.data.groupedPermissions).flat().forEach(p => {
          if(rolePerms.includes(p.id)) permNames.push(p.name);
      });
      map[role.id] = new Set(permNames);
    });
    
    roleMap.value = map;
  } catch (error) {
    console.error("Matrix Load Error:", error);
  }
};

const hasPermission = (roleId, permName) => {
  return roleMap.value[roleId]?.has(permName);
};

const togglePermission = (roleId, permName) => {
  if (roleMap.value[roleId].has(permName)) {
    roleMap.value[roleId].delete(permName);
  } else {
    roleMap.value[roleId].add(permName);
  }
};

const saveAll = async () => {
  saving.value = true;
  try {
    const promises = roles.value.map(role => {
      // 1. URL
      // 2. Data Payload
      // 3. Config (Headers)
      return axios.post('/api/v1/admin/permissions/sync', 
        { 
          role_id: role.id,
          permissions: Array.from(roleMap.value[role.id])
        }, 
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      );
    });
    
    await Promise.all(promises);
    alert('Permissions updated successfully!');
  } catch (e) {
    console.error('Save Error:', e.response?.data || e.message);
    alert('Error saving permissions. Check console for details.');
  } finally {
    saving.value = false;
  }
};

onMounted(fetchData);
</script>