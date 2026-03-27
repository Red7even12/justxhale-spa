<template>
  <div v-if="caseFile" class="space-y-6">
    
    <!-- 1. HEADER: IDENTITY & NAVIGATION -->
    <div class="flex justify-between items-start border-b border-gray-200 pb-6">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            {{ caseFile.fileType?.name }}
          </span>
          <h1 class="text-3xl font-bold text-gray-900">{{ caseFile.fileName }}</h1>
        </div>
        <p class="text-sm text-gray-500">
          Ref: <span class="font-mono font-bold text-gray-700">{{ caseFile.fileReference }}</span> | 
          Status: <span class="uppercase font-bold text-brand-primary">{{ caseFile.status }}</span>
        </p>
      </div>

      <div class="flex gap-3">
        <button @click="$router.push({ name: 'ProductCaseWorkspace', params: { id: caseFile.id } })" 
                class="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Workspace
        </button>
      </div>
    </div>

    <!-- 2. TABS -->
    <div class="flex border-b border-gray-200 gap-8">
      <button 
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="['pb-4 text-sm font-bold transition-all border-b-2 px-1', activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600']">
        {{ tab.label }}
      </button>
    </div>

    <!-- 3. DYNAMIC CONTENT -->
    <div class="py-6">
      
      <!-- TAB: CASE DETAILS (METADATA) -->
      <div v-if="activeTab === 'details'" class="max-w-4xl">
        <form @submit.prevent="saveMetadata" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          <div class="flex justify-between items-center mb-6">
             <h3 class="text-lg font-bold text-gray-800">Case Information</h3>
             <button type="submit" class="bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:opacity-90">
               Save Details
             </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Standard Field -->
            <div class="col-span-2 md:col-span-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">File Reference</label>
              <input v-model="detailsForm.file_reference" type="text" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary font-bold text-gray-700">
            </div>

            <!-- Assigned Team -->
            <div class="col-span-2 md:col-span-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Team</label>
              <select v-model="detailsForm.current_team_id" class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm font-bold text-gray-700">
                <option :value="null">-- Unassigned --</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
              </select>
            </div>

            <!-- Dynamic Fields (From Definitions) -->
            <div v-for="field in definitions.filter(d => !d.participantRoleId)" :key="field.id" class="col-span-2 md:col-span-1">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">
                {{ field.label }} 
                <span v-if="field.showInQuickView" class="text-[10px] text-brand-primary ml-1" title="Visible on Dashboard">★</span>
              </label>
              
              <!-- Bind directly to the normalized 'key' -->
              <input v-if="field.fieldType === 'text'" 
                     v-model="detailsForm.meta_data[field.key]" 
                     type="text" 
                     class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
              >
              
              <input v-else-if="field.fieldType === 'date'" 
                     v-model="detailsForm.meta_data[field.key]" 
                     type="date" 
                     class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
              >

              <input v-else-if="field.fieldType === 'number'" 
                     v-model="detailsForm.meta_data[field.key]" 
                     type="number" 
                     class="w-full border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary text-sm"
              >
            </div>

            <div v-if="definitions.length === 0" class="col-span-2 text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
              No custom fields defined for this Niche yet.
            </div>
            
            <!-- DEBUGGING HELP: Only visible if you uncomment it -->
            <!-- 
            <div class="col-span-2 bg-gray-100 p-4 rounded text-xs font-mono">
                DEBUG DATA: {{ definitions }}
            </div> 
            -->
          </div>
        </form>
      </div>

      <!-- TAB: PARTICIPANTS -->
      <div v-if="activeTab === 'participants'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">Assigned Entities</h3>
          <button @click="openAssignModal()" class="bg-brand-primary text-white px-4 py-2 rounded-lg shadow-md font-bold text-sm hover:opacity-90 transition-all">
            + Assign Participant
          </button>
        </div>

        <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Entity Name</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Reference</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="part in caseFile.participants" :key="part.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-bold text-gray-900">{{ part.entity?.name }}</div>
                  <!-- Primary Badge -->
                    <svg v-if="part.isPrimaryContact || part.is_primary_contact" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" title="Primary Contact">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>              
                  <div class="text-[10px] text-gray-400 uppercase font-bold">{{ part.entity?.entityType || part.entity?.entity_type }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 uppercase">
                    {{ part.roleKey || part.role_key }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 font-mono">
                  {{ part.referenceNumber || part.reference_number || '-' }}
                </td>
                <td class="px-6 py-4">
                  <span :class="[(part.isActive || part.is_active) ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50', 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase']">
                    {{ (part.isActive || part.is_active) ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium space-x-3">
                  <button @click="openAssignModal(part)" class="text-brand-primary hover:underline font-bold">Edit</button>
                  <!-- Optional: Add Delete/Deactivate here -->
                </td>
              </tr>
              <tr v-if="!caseFile.participants || caseFile.participants.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">No participants assigned yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB: TIMELINE -->
      <div v-if="activeTab === 'timeline'" class="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div class="text-gray-400 font-bold uppercase tracking-widest text-sm">Timeline Module</div>
        <p class="text-gray-400 text-xs mt-2 italic">Coming soon...</p>
      </div>

    </div>

    <!-- MODAL: ASSIGN / EDIT PARTICIPANT -->
    <div v-if="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- HEADER -->
        <div class="bg-brand-primary p-6 text-white shrink-0">
          <h2 class="text-xl font-bold uppercase tracking-tight">{{ isEditingParticipant ? 'Edit Participant' : 'Assign Participant' }}</h2>
          <p class="text-xs opacity-80 uppercase tracking-widest mt-1">Context: {{ route.params.productSlug }}</p>
        </div>
        
        <!-- FORM -->
        <form @submit.prevent="saveParticipant" class="p-6 space-y-5 overflow-y-auto">
          
          <!-- Entity Search (Lock if Editing) -->
          <div class="relative">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">1. Search Global Registry</label>
            
            <div v-if="!selectedEntity">
              <input 
                v-model="searchQuery" 
                @input="handleSearch"
                type="text" 
                class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm" 
                placeholder="Start typing name, ID, or company..."
              >
              <!-- Results -->
              <ul v-if="searchResults.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <li v-for="entity in searchResults" :key="entity.id" 
                    @click="selectEntity(entity)"
                    class="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex flex-col transition-colors">
                  <span class="text-sm font-bold text-gray-800">{{ entity.name }}</span>
                  <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    {{ entity.entityType }} • {{ entity.identificationNumber || entity.email || 'No ID' }}
                  </span>
                </li>
              </ul>
              <div v-else-if="searchQuery.length >= 2 && !isSearching" class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500 text-center">
                No entities found.
              </div>
            </div>

            <!-- Selected Badge -->
            <div v-else 
                 class="flex items-center justify-between p-3 border rounded-lg"
                 :style="{ backgroundColor: `var(--brand-primary)1A`, borderColor: 'var(--brand-primary)' }">
              <div>
                <div class="text-sm font-bold text-gray-900">{{ selectedEntity.name }}</div>
                <div class="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{{ selectedEntity.entityType }}</div>
              </div>
              <button v-if="!isEditingParticipant" type="button" @click="clearSelection" class="text-brand-primary hover:text-red-500 font-bold text-sm underline">
                Change
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Role -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">2. Role in Case</label>
              <select v-model="participantForm.role_key" required class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm font-bold text-gray-700">
                <option value="" disabled>Select Role...</option>
                <!-- CORRECTED: role.roleKey (camelCase from Middleware) -->
                <option v-for="role in participantRoles" :key="role.roleKey" :value="role.roleKey">
                  {{ role.name }}
                </option>
              </select>
            </div>

            <!-- Ref Number -->
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">3. Reference #</label>
              <input v-model="participantForm.reference_number" type="text" class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm" placeholder="Optional">
            </div>
          </div>

          <!-- NEW V2: Primary Contact Flag -->
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-4">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="participantForm.is_primary_contact" 
                class="form-checkbox h-5 w-5 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
              >
              <span class="text-sm font-bold text-gray-800">Mark as Primary Contact</span>
            </label>
            <p class="text-[10px] text-gray-500 mt-1 ml-8 uppercase font-bold tracking-widest">
              Automated emails and portal requests will default to this participant.
            </p>
          </div>

          <!-- DYNAMIC ROLE METADATA FIELDS -->
          <div v-if="activeRoleFields.length > 0" class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div class="col-span-2 text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">
                  Metadata for Character: {{ participantForm.role_key }}
              </div>
              
              <div v-for="field in activeRoleFields" :key="field.id" 
                  :class="(field.fieldType || field.field_type) === 'textarea' ? 'col-span-2' : 'col-span-1'">
                  
                  <!-- FIX 1: Robust Label Fallback -->
                  <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {{ field.fieldLabel || field.field_label || field.label || 'Untitled Field' }}
                  </label>
                  
                  <!-- FIX 2: Ensure v-model key is never undefined to prevent mirroring -->
                  <template v-if="field.fieldKey || field.field_key">
                      <input v-if="(field.fieldType || field.field_type) === 'text'" 
                            v-model="participantForm.meta_data[field.fieldKey || field.field_key]" 
                            type="text" 
                            class="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm"
                      >
                      <input v-else-if="(field.fieldType || field.field_type) === 'date'" 
                            v-model="participantForm.meta_data[field.fieldKey || field.field_key]" 
                            type="date" 
                            class="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm"
                      >
                      <input v-else-if="(field.fieldType || field.field_type) === 'number'" 
                            v-model="participantForm.meta_data[field.fieldKey || field.field_key]" 
                            type="number" 
                            class="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm"
                      >
                      <textarea v-else-if="(field.fieldType || field.field_type) === 'textarea'" 
                            v-model="participantForm.meta_data[field.fieldKey || field.field_key]" 
                            rows="2"
                            class="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm"
                      ></textarea>
                  </template>
                  <div v-else class="text-[10px] text-red-400 italic">Error: Missing Field Key</div>
              </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</label>
            <textarea v-model="participantForm.notes" rows="2" class="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button type="button" @click="closeModal" class="text-gray-400 font-bold hover:text-gray-600 px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" :disabled="!selectedEntity || !participantForm.role_key || isSubmitting" 
                    class="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 text-sm transition-opacity">
              {{ isSubmitting ? 'Saving...' : (isEditingParticipant ? 'Update Participant' : 'Assign to Case') }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import teamService from '@/services/teamService';

const route = useRoute();
const { showAlert } = useAlerts();

// --- STATE ---
const caseFile = ref(null);
const definitions = ref([]);
const teams = ref([]);
const activeTab = ref('details');
const tabs = [
  { id: 'details', label: 'Case Details' },
  { id: 'participants', label: 'Participants' },
  { id: 'timeline', label: 'Timeline' },
];

// --- FORMS ---
const detailsForm = reactive({
  file_reference: '',
  current_team_id: null,
  meta_data: {}
});

// Participant Modal State (Keep your existing vars here)
const showAssignModal = ref(false);
const isEditingParticipant = ref(false);
const editingParticipantId = ref(null);
const isSubmitting = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const selectedEntity = ref(null);
let searchTimeout = null;
const participantForm = ref({ 
    role_key: '', 
    reference_number: '', 
    notes: '', 
    is_active: true, 
    is_primary_contact: false,
    meta_data: {} 
});

/**
 * Normalizes metadata by mapping camelCased keys from the API 
 * back to the literal keys defined in the Product Blueprint.
 */
const normalizeMetadata = (rawMeta, definitions) => {
    const normalized = {};
    if (!rawMeta) return normalized;

    definitions.forEach(field => {
        const blueprintKey = field.fieldKey || field.field_key;
        
        // 1. Create the camelCase version of the blueprint key (e.g. viz-att_id -> vizAttId)
        const camelKey = blueprintKey.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase());

        // 2. Try to find the value in rawMeta using: 
        //    a) The exact key (attmd1)
        //    b) The camelCase key (vizAttId)
        normalized[blueprintKey] = rawMeta[blueprintKey] !== undefined 
            ? rawMeta[blueprintKey] 
            : (rawMeta[camelKey] !== undefined ? rawMeta[camelKey] : '');
    });
    
    return normalized;
};

const activeRoleFields = computed(() => {
  if (!caseFile.value || !participantForm.value.role_key || !participantRoles.value) return [];

  // 1. Find the Role ID for the currently selected key (e.g., 'attorney')
  const selectedRole = participantRoles.value.find(r => 
    (r.roleKey === participantForm.value.role_key) || (r.role_key === participantForm.value.role_key)
  );
  
  if (!selectedRole) return [];

  // 2. Filter fields linked to this specific Role ID
  // Check both camelCase and snake_case for the definition and the role link
  return (caseFile.value.fileType?.fieldDefinitions || []).filter(f => {
    const roleId = f.participantRoleId || f.participant_role_id;
    return parseInt(roleId) === parseInt(selectedRole.id);
  });
});

const participantRoles = ref([]);

const fetchParticipantRoles = async () => {
    try {
        const response = await apiClient.get(`/${route.params.productSlug}/participant-roles`);
        // Robust handling of both raw array response and wrapped { data: [...] } response
        participantRoles.value = Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error) {
        console.error("Failed to fetch participant roles", error);
    }
};

// Call it when the component mounts
onMounted(() => {
    fetchParticipantRoles();
    // ... any other existing onMounted logic ...
});

// --- CORE FETCH LOGIC ---
const fetchCase = async () => {
  try {
    const [{ data }, teamRes] = await Promise.all([
        apiClient.get(`/${route.params.productSlug}/cases/${route.params.id}`),
        teamService.getTeams()
    ]);
    
    caseFile.value = data;
    teams.value = Array.isArray(teamRes.data) ? teamRes.data : (teamRes.data.data || []);
    
    // 1. Get Raw Definitions
    const rawDefs = data.fileType?.fieldDefinitions || data.fileType?.field_definitions || [];

    // 2. Normalize Definitions (Clean up casing issues once, here)
    definitions.value = rawDefs.map(def => ({
        id: def.id,
        label: def.label || def.fieldLabel || def.field_label || 'Unnamed Field',
        key: def.key || def.fieldKey || def.field_key, // The critical DB key (e.g. 'tax_no')
        fieldType: def.fieldType || def.field_type || 'text',
        showInQuickView: !!(def.showInQuickView || def.show_in_quick_view),
        participantRoleId: def.participantRoleId || def.participant_role_id || null
    }));

    /// 3. Initialize Form State
    detailsForm.file_reference = data.fileReference || data.file_reference || '';
    detailsForm.current_team_id = data.currentTeamId || data.current_team_id || null;

    // The data from API (might have camelCase keys like 'idNumber')
    const incomingData = data.metaData || data.meta_data || {};
    
    const mergedData = {};
    
    definitions.value.forEach(def => {
        if (!def.key) return;

        // DB Key: 'id_number'
        // Camel Key: 'idNumber'
        const camelKey = def.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

        // Check if value exists under either key
        const value = incomingData[def.key] !== undefined ? incomingData[def.key] :
                      incomingData[camelKey] !== undefined ? incomingData[camelKey] : 
                      '';

        // ALWAYS bind to the DB Key ('id_number') for the form, so saving works correctly
        mergedData[def.key] = value;
    });

    detailsForm.meta_data = mergedData;
    // --- END ---

  } catch (error) {
    console.error("Failed to fetch case", error);
    showAlert('Error', 'Failed to load case data.');
  }
};

// --- METADATA SAVE ---
const saveMetadata = async () => {
  try {
    // Send the data back to the API
    await apiClient.put(`/${route.params.productSlug}/cases/${route.params.id}`, {
      file_reference: detailsForm.file_reference,
      current_team_id: detailsForm.current_team_id,
      meta_data: detailsForm.meta_data
    });
    
    showAlert('Success', 'Case details updated.');
    
    // Optional: Refresh to ensure data round-tripped correctly
    await fetchCase(); 
  } catch (error) {
    console.error("Save failed", error);
    showAlert('Error', 'Failed to save details.');
  }
};

// --- PARTICIPANT LOGIC ---

const openAssignModal = (participant = null) => {
  const definitions = caseFile.value?.fileType?.fieldDefinitions || [];
  
  if (participant) {
    // Edit Mode
    isEditingParticipant.value = true;
    editingParticipantId.value = participant.id;
    selectedEntity.value = participant.entity;

    // Use the helper to map vizAttId -> viz-att_id
    const rawData = participant.entity?.metaData || participant.entity?.meta_data || {};
    
    participantForm.value = {
      role_key: participant.roleKey || participant.role_key,
      reference_number: participant.referenceNumber || participant.reference_number,
      notes: participant.notes,
      is_active: participant.isActive !== undefined ? participant.isActive : participant.is_active,
      is_primary_contact: participant.isPrimaryContact !== undefined ? participant.isPrimaryContact : (participant.is_primary_contact || false),
      // CRITICAL: Normalize the data so keys match the Blueprint
      meta_data: normalizeMetadata(rawData, definitions)
    };
  } else {
    // Create Mode (Normal initialization)
    isEditingParticipant.value = false;
    participantForm.value = { 
        role_key: '', reference_number: '', notes: '', 
        is_active: true, is_primary_contact: false, 
        meta_data: normalizeMetadata({}, definitions) 
    };
  }
  showAssignModal.value = true;
};

const closeModal = () => {
  showAssignModal.value = false;
  clearSelection();
  participantForm.value = { role_key: '', reference_number: '', notes: '', is_active: true, meta_data: {} };
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      // Use helper V2 endpoint if available, or generic entities endpoint
      // Ensure leading slash is handled by axios base URL or manually
      const { data } = await apiClient.get(`/entities?search=${encodeURIComponent(searchQuery.value)}`);
      searchResults.value = data.data || [];
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const selectEntity = (entity) => {
  selectedEntity.value = entity;
  searchQuery.value = '';
  searchResults.value = [];
  
  // NEW: Pre-load global metadata from the registry if assigning an existing entity
  if (entity.metaData || entity.meta_data) {
      participantForm.value.meta_data = { ...(entity.metaData || entity.meta_data) };
  }
};

const clearSelection = () => {
  selectedEntity.value = null;
};

const saveParticipant = async () => {
  if (!selectedEntity.value || !participantForm.value.role_key) return;

  isSubmitting.value = true;
  try {
    const payload = {
      entity_id: selectedEntity.value.id,
      role_key: participantForm.value.role_key,
      reference_number: participantForm.value.reference_number,
      notes: participantForm.value.notes,
      is_active: participantForm.value.is_active,
      is_primary_contact: participantForm.value.is_primary_contact,
      meta_data: participantForm.value.meta_data
    };

    const baseUrl = `/${route.params.productSlug}/cases/${route.params.id}/participants`;

    if (isEditingParticipant.value) {
        await apiClient.put(`${baseUrl}/${editingParticipantId.value}`, payload);
        showAlert('Success', 'Participant updated.');
    } else {
        await apiClient.post(baseUrl, payload);
        showAlert('Success', 'Participant assigned.');
    }
    
    closeModal();
    fetchCase(); // Refresh list

  } catch (error) {
    console.error("Save participant failed", error);
    showAlert('Error', error.response?.data?.message || 'Failed to save participant.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchCase);
</script>

<style scoped>
/* Branding Variables handled by ProductLayout */
.text-brand-primary { color: var(--brand-primary); }
.bg-brand-primary { background-color: var(--brand-primary); }
.border-brand-primary { border-color: var(--brand-primary); }
.focus\:ring-brand-primary:focus { --tw-ring-color: var(--brand-primary); }
</style>