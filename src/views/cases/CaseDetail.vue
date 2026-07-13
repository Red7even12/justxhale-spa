<template>
  <!-- Path: frontend-spa/src/views/cases/CaseDetail.vue -->
  <div class="case-detail-container">
  <div v-if="caseFile" class="space-y-6">
    
    <!-- 1. HEADER: IDENTITY & NAVIGATION -->
    <div class="flex justify-between items-start border-b border-gray-200 pb-6">
      <div>
        <div class="flex items-center gap-3 mb-2">
        <!-- Show Priority Badge if exists, else show Product Type Badge -->
          <span v-if="caseFile?.fileClass"
                :style="{ backgroundColor: caseFile.fileClass.bg_color, color: caseFile.fileClass.text_color }"
                class="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
            {{ caseFile.fileClass.name }}
          </span>
          <span v-else class="bg-brand-primary text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            {{ caseFile?.fileType?.name }}
          </span>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">{{ caseFile.fileName }}</h1>
        </div>
        <p class="text-sm text-gray-500 font-medium">
          Ref: <span class="font-mono font-bold text-gray-700">{{ caseFile.fileReference || caseFile.file_reference }}</span> | 
          Status: <span class="uppercase font-black text-gray-800">{{ caseFile.status }}</span>
        </p>
      </div>

      <div class="flex gap-3">
        <button @click="$router.push({ name: 'ProductCaseWorkspace', params: { id: caseFile.id } })" 
                class="bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Workspace
        </button>
      </div>
    </div>

    <!-- 2. TABS -->
    <div class="flex border-b border-gray-200 gap-8">
      <button 
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        :class="['pb-4 text-sm font-black transition-all border-b-2 px-1 uppercase tracking-widest', activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600']">
        {{ tab.label }}
      </button>
    </div>

    <!-- 3. DYNAMIC CONTENT -->
    <div class="py-6">
      
      <!-- TAB: CASE DETAILS -->
      <div v-if="activeTab === 'details'" class="max-w-4xl">
        <form @submit.prevent="saveMetadata" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-8">
             <h3 class="text-lg font-black text-gray-800 uppercase tracking-tight">Case Information</h3>

             <button type="submit" class="bg-brand-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
               Save Details
             </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Assigned Team -->
            <div class="col-span-2 md:col-span-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Team</label>
              <select v-model="detailsForm.current_team_id" class="w-full border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary text-sm font-bold text-gray-700">
                <option :value="null">-- Unassigned --</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
            <!-- Case Classification Dropdown -->
            <div class="col-span-2 md:col-span-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Classification (Priority)</label>
              <select v-model="detailsForm.file_class_id" class="w-full border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary text-sm font-bold text-gray-700">
                <option :value="null">-- Standard (No Class) --</option>
                <option v-for="cls in fileClasses" :key="cls.id" :value="cls.id">
                  {{ cls.name }}
                </option>
              </select>
            </div>
            <!-- File Name -->
            <div class="col-span-2 md:col-span-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File Name</label>
              <input v-model="detailsForm.file_name" type="text" class="w-full border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary font-bold text-gray-700">
            </div>
            <!-- File Reference -->
            <div class="col-span-2 md:col-span-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File Reference</label>
              <input v-model="detailsForm.file_reference" type="text" class="w-full border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary font-bold text-gray-700">
            </div>
            <!-- Custom Fields -->
            <div v-for="field in caseFields.filter(f => !f.participantRoleId)" :key="field.id" class="col-span-2 md:col-span-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                {{ field.label }} 
                <span v-if="field.showInQuickView" class="text-brand-primary ml-1">★</span>
              </label>

              <!-- CASE 1: Date Type (The Finesse Picker) -->
              <div v-if="field.fieldType === 'date'" class="relative group">
                <!-- Display Layer -->
                <div class="flex items-center justify-between w-full px-3 h-[42px] bg-white border border-gray-200 rounded-xl shadow-sm group-hover:border-brand-primary transition-colors">
                  <span class="text-sm font-bold uppercase tracking-tight" :class="detailsForm.meta_data[field.key] ? 'text-brand-blue-700' : 'text-gray-400'">
                    {{ detailsForm.meta_data[field.key] ? $formatDate(detailsForm.meta_data[field.key]) : 'Select Date...' }}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <!-- Hidden Picker Layer -->
                <input 
                  type="date" 
                  v-model="detailsForm.meta_data[field.key]" 
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
              </div>

              <!-- CASE 2: Text / Number Type (Standard Input) -->
              <input 
                v-else
                v-model="detailsForm.meta_data[field.key]" 
                :type="field.fieldType === 'number' ? 'number' : 'text'" 
                class="w-full border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary text-sm font-bold text-gray-700 h-[42px]"
              >
            </div>
          </div>
        </form>
      </div>

      <!-- TAB: PARTICIPANTS -->
      <div v-if="activeTab === 'participants'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-black text-gray-800 uppercase tracking-tight">Assigned Entities</h3>
          <button @click="openAssignModal()" class="bg-brand-primary text-white text-xs px-4 py-2 rounded-lg font-bold shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            + Assign Role-player
          </button>
        </div>
        <div class="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity / Identity</th>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                <th class="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="part in caseFile.participants" :key="part.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-bold text-gray-900">
                    <span v-if="part.entity?.entity_type === 'company' || part.entity?.entityType === 'company'" class="text-gray-500 font-normal">Co: </span>{{ part.entity?.name }}
                    <span v-if="part.entity?.parent" class="text-xs text-brand-primary font-bold ml-1">— Co: {{ part.entity.parent.name }}</span>
                  </div>
                  <div class="text-[10px] text-gray-400 uppercase font-bold">{{ part.entity?.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-gray-100 text-gray-700 uppercase tracking-tighter">
                    {{ part.roleKey || part.role_key }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-gray-500 font-mono">
                  {{ part.referenceNumber || part.reference_number || '-' }}
                </td>
                <td class="px-6 py-4 text-right flex justify-end gap-3">
                  <button 
                      @click="openParticipantNotes(part)" 
                      class="text-gray-400 hover:text-brand-primary p-2 transition-colors rounded hover:bg-gray-50"
                      title="Participant History"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                  </button>
                  <button @click="openAssignModal(part)" class="text-brand-primary hover:text-brand-secondary font-black text-xs uppercase tracking-widest">Edit</button>
                  <button @click="deleteParticipant(part)" class="text-red-600 hover:text-red-700 font-black text-xs uppercase tracking-widest">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL: ASSIGN / EDIT PARTICIPANT -->
    <div v-if="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div class="bg-brand-primary p-6 text-white shrink-0">
          <h2 class="text-xl font-black uppercase tracking-tight">{{ isEditingParticipant ? 'Update Participant' : 'Assign Participant' }}</h2>
          <p class="text-[10px] opacity-70 uppercase tracking-widest font-bold mt-1">Niche: {{ caseFile.fileType?.name }}</p>
        </div>
        
        <form @submit.prevent="saveParticipant" class="p-8 space-y-6 overflow-y-auto">
          
          <!-- 1. Entity Selection -->
          <div v-if="!selectedEntity" class="space-y-4">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Global Registry</label>
              
              <!-- Alpha Jump Bar (Double Row Grid) -->
              <div class="grid gap-1 mb-3" style="grid-template-columns: repeat(14, minmax(0, 1fr));">
                <button 
                  type="button"
                  @click="clearAlphaFilter"
                  :class="['h-7 flex items-center justify-center rounded-lg text-[10px] font-black tracking-wider uppercase transition-all', !selectedLetter ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
                >
                  All
                </button>
                <button 
                  v-for="letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')" 
                  :key="letter"
                  type="button"
                  @click="filterByLetter(letter)"
                  :class="['h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all', selectedLetter === letter ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
                >
                  {{ letter }}
                </button>
              </div>

              <input v-model="searchQuery" @input="handleSearch" type="text" class="w-full p-3 border-gray-200 rounded-xl focus:ring-brand-primary focus:border-brand-primary text-sm shadow-sm" placeholder="Type name or email...">
            </div>

            <!-- Rich Results Dropdown -->
            <ul v-if="searchResults.length > 0" class="mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-50">
              <li v-for="entity in searchResults" :key="entity.id" @click="selectEntity(entity)" class="p-3 hover:bg-gray-50 cursor-pointer text-sm font-bold text-gray-700 flex justify-between items-center transition-colors">
                <div>
                  <span v-if="entity.entity_type === 'company' || entity.entityType === 'company'" class="text-gray-500 font-normal">Co: </span><span class="text-gray-950 font-black">{{ entity.name }}</span>
                  <span v-if="entity.parent" class="text-xs text-brand-primary font-bold ml-1.5">— Co: {{ entity.parent.name }}</span>
                  <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{{ entity.email || 'No Email' }}</div>
                </div>
                <span :class="['text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shrink-0', entity.entity_type === 'company' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100']">
                  {{ entity.entity_type }}
                </span>
              </li>
            </ul>
          </div>
          <div v-else class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
            <div>
              <div class="text-sm font-black text-gray-900">
                <span v-if="selectedEntity.entity_type === 'company' || selectedEntity.entityType === 'company'" class="text-gray-500 font-normal">Co: </span>{{ selectedEntity.name }}
                <span v-if="selectedEntity.parent" class="text-xs text-brand-primary font-bold ml-1">— Co: {{ selectedEntity.parent.name }}</span>
              </div>
              <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{{ selectedEntity.email }}</div>
            </div>
            <button v-if="!isEditingParticipant" type="button" @click="clearSelection" class="text-brand-primary font-black text-[10px] uppercase underline hover:text-brand-secondary">Change</button>
          </div>

          <!-- 2. Role & Link Settings -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Role in Case</label>
              <select v-model="participantForm.role_key" required class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                <option value="" disabled>Select Role...</option>
                <option v-for="role in participantRoles" :key="role.roleKey" :value="role.roleKey || role.role_key">{{ role.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Case Reference #</label>
              <input v-model="participantForm.reference_number" type="text" class="w-full border-gray-200 rounded-xl text-sm" placeholder="Optional">
            </div>
          </div>

          <!-- 3. DYNAMIC ROLE METADATA -->
          <div v-if="activeRoleFields.length > 0" class="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <div class="text-[10px] font-black text-black-600 uppercase tracking-widest border-b border-gray-200 pb-2">
                  Metadata for Character: {{ participantForm.role_key }}
              </div>
              
              <!-- GUARANTEED RENDER GRID -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="field in activeRoleFields" :key="field.id" 
                     :class="field.fieldType === 'textarea' ? 'col-span-1 md:col-span-2' : 'col-span-1'">
                     
                    <!-- PROJECTED RECORD (EMERALD) -->
                    <div v-if="field.isProjected" class="h-full">
                        <label class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            {{ field.label }} <span class="text-emerald-500">◈</span>
                        </label>
                        <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700 min-h-[42px] flex items-center shadow-inner">
                            {{ resolveProjectedValue(field) || 'Not captured in Registry' }}
                        </div>
                        <p class="text-[9px] text-emerald-400 mt-1 font-bold italic uppercase tracking-tighter">Global Record</p>
                    </div>

                    <!-- TRANSACTIONAL RECORD (WHITE) -->
                    <div v-else class="h-full">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ field.label }}</label>
                        <input v-model="participantForm.meta_data[field.key]" 
                               :type="field.fieldType === 'date' ? 'date' : 'text'" 
                               class="w-full border-gray-200 rounded-xl text-sm shadow-sm">
                    </div>

                </div>
              </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button type="button" @click="closeModal" class="text-sm font-black text-gray-400 uppercase tracking-widest px-4">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="bg-brand-primary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-brand-secondary disabled:opacity-50 transition-all">
              {{ isSubmitting ? 'Saving...' : 'Save Participant' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

 <!-- PARTICIPANT NOTES MODAL -->
  <!-- Note: We use the Case File context URL to ensure the API 'Wall' is enforced via the Case Controller -->
  <Modal :show="showNotesModal" @close="showNotesModal = false">
    <template #title>
      <span class="text-brand-primary font-bold">{{ currentNoteContext.title }}</span>
    </template>

    <div class="p-6">
      <NotesPanel 
          v-if="showNotesModal"
          :noteable-type="currentNoteContext.type"
          :noteable-id="currentNoteContext.id"
          :context-url="`${productSlug}/cases/${caseFile.id}`" 
          :current-team-id="caseFile.current_team_id"
          :is-readonly="caseFile.is_closed"
          @cancel="showNotesModal = false"
      />
    </div>
  </Modal>
 </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import teamService from '@/services/teamService';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue'; // Reuse V1 Panel

const props = defineProps({
  id: { type: [String, Number], required: true },
  productSlug: { type: String, required: true }
});

const route = useRoute();
const { showAlert, showConfirm } = useAlerts();
const productSlug = computed(() => props.productSlug);
const caseId = computed(() => props.id);

// --- STATE ---
const caseFile = ref(null);
const caseFields = ref([]);
const teams = ref([]);
const participantRoles = ref([]);
const activeTab = ref('details');
const tabs = [{ id: 'details', label: 'Details' }, { id: 'participants', label: 'Participants' }];
const selectedLetter = ref('');

// --- FORMS ---
const detailsForm = reactive({ file_name: '', file_reference: '', current_team_id: null, file_class_id: null, meta_data: {} });
const showAssignModal = ref(false);
const isEditingParticipant = ref(false);
const editingParticipantId = ref(null);
const isSubmitting = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const selectedEntity = ref(null);
const participantForm = ref({ role_key: '', reference_number: '', notes: '', is_active: true, is_primary_contact: false, meta_data: {} });

const showNotesModal = ref(false);
const currentNoteContext = ref({ id: null, title: '', type: 'case_participant' });

const openParticipantNotes = (participant) => {
    // 1. Check if the participant actually exists before trying to read .id
    if (!participant || !participant.id) {
        console.error("Cannot open notes: Participant object is missing or has no ID", participant);
        return;
    }

    currentNoteContext.value = {
        id: participant.id,
        title: `History: ${participant.entity?.name || 'Participant'}`,
        type: 'case_participant'
    };
    showNotesModal.value = true;
};

// --- COMPUTED ---
const activeRoleFields = computed(() => {
  if (!caseFile.value || !participantForm.value.role_key || !participantRoles.value.length) return [];

  const selectedRole = participantRoles.value.find(r => 
    (r.roleKey || r.role_key || '').toLowerCase() === participantForm.value.role_key.toLowerCase()
  );
  
  if (!selectedRole) return [];

  return caseFields.value.filter(f => parseInt(f.participantRoleId) === parseInt(selectedRole.id));
});

const fileClasses = ref([]); 

// --- CORE FETCH ---
const fetchCase = async () => {
  try {
    // 1. Capture 4 variables from 4 requests
    const [{ data }, teamRes, rolesRes, fileClassesRes] = await Promise.all([
        apiClient.get(`/${route.params.productSlug}/cases/${route.params.id}`),
        teamService.getTeams(),
        apiClient.get(`/${route.params.productSlug}/participant-roles`),
        apiClient.get(`/${route.params.productSlug}/file-classes`) 
    ]);
    
    const cData = data.data || data;
    caseFile.value = cData;
    teams.value = teamRes.data.data || teamRes.data;
    participantRoles.value = rolesRes.data.data || rolesRes.data;
    
    // 2. Assign the captured variable
    fileClasses.value = fileClassesRes.data.data || fileClassesRes.data;

    // 1. FORCE THE MAPPING (Bypassing ?? false logic)
    caseFields.value = (cData.fileType?.fields || []).map(f => {
         // Determine if it belongs to a participant role
        const pRoleId = f.participantRoleId || f.participant_role_id;
        // Safety check for Boolean flags
        const showStar = f.showInQuickView === true || f.show_in_quick_view === true || f.show_in_quick_view === 1;
        // Check IDs explicitly
        const hasId = !!f.entityFieldDefinitionId || !!f.entity_field_definition_id;
        const hasRel = !!f.entityFieldDefinition || !!f.entity_field_definition;
        
        // If the backend sent explicit 'true', use it. Otherwise rely on the relations/IDs.
        const isProj = hasId || hasRel || f.isProjected === true || f.is_projected === true;
        
        // Force extract the key
        let dnaKey = f.globalDnaKey || f.global_dna_key || null;
        if (!dnaKey) {
             const rel = f.entityFieldDefinition || f.entity_field_definition;
             if (rel) {
                 dnaKey = rel.fieldKey || rel.field_key || null;
             }
        }

        return {
          id: f.id,
          label: f.fieldLabel || f.field_label,
          key: f.fieldKey || f.field_key, 
          fieldType: f.fieldType || f.field_type,
          // Ensure this is strictly null if not present to avoid filter bugs
          participantRoleId: (pRoleId && pRoleId !== "0") ? pRoleId : null,
          showInQuickView: showStar,
          isProjected: f.isProjected || f.is_projected || false,
          globalDnaKey: f.globalDnaKey || f.global_dna_key || null
        };
    });

    detailsForm.file_name = cData.fileName || cData.file_name || '';
    detailsForm.file_reference = cData.fileReference || cData.file_reference || '';
    detailsForm.current_team_id = cData.currentTeamId || cData.current_team_id || null;
    detailsForm.file_class_id = cData.fileClassId || cData.file_class_id || null;
    
    const rawMeta = cData.metaData || cData.meta_data || {};
    detailsForm.meta_data = {};

    caseFields.value.filter(f => !f.participantRoleId).forEach(f => {
        const blueprintKey = f.key;
        const camelKey = blueprintKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        detailsForm.meta_data[blueprintKey] = rawMeta[blueprintKey] !== undefined 
            ? rawMeta[blueprintKey] 
            : (rawMeta[camelKey] || '');
    });

  } catch (e) { console.error("Fetch Case Error:", e); }
};



// --- HELPERS ---
const resolveProjectedValue = (field) => {
    if (!selectedEntity.value) return null;
    
    const entityMeta = selectedEntity.value.metaData || selectedEntity.value.meta_data || {};
    const dnaKey = field.globalDnaKey;
    if (!dnaKey) return null;

    // Create variations
    const camelKey = dnaKey.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const pascalKey = camelKey.charAt(0).toUpperCase() + camelKey.slice(1);

    // Return exact match
    return entityMeta[dnaKey] || entityMeta[camelKey] || entityMeta[pascalKey] || null;
};

// --- SAVING ---
const saveMetadata = async () => {
  isSubmitting.value = true;
  try {
    await apiClient.put(`/${route.params.productSlug}/cases/${route.params.id}`, {
        file_name: detailsForm.file_name,
        file_reference: detailsForm.file_reference,
        current_team_id: detailsForm.current_team_id,
        file_class_id: detailsForm.file_class_id,
        meta_data: detailsForm.meta_data
    });
    showAlert('Success', 'Case synchronized.');
    fetchCase();
  } catch (e) { showAlert('Error', 'Update failed.'); } 
  finally { isSubmitting.value = false; }
};

const saveParticipant = async () => {
  isSubmitting.value = true;
  try {
    const baseUrl = `/${route.params.productSlug}/cases/${route.params.id}/participants`;
    const payload = { entity_id: selectedEntity.value.id, ...participantForm.value };
    
    if (isEditingParticipant.value) {
        await apiClient.put(`${baseUrl}/${editingParticipantId.value}`, payload);
    } else {
        await apiClient.post(baseUrl, payload);
    }
    showAssignModal.value = false;
    fetchCase();
    showAlert('Success', 'Participant updated.');
  } catch (e) { showAlert('Error', 'Save failed.'); }
  finally { isSubmitting.value = false; }
};

const deleteParticipant = async (part) => {
  const confirmed = await showConfirm('Confirm Removal', `Are you sure you want to remove ${part.entity?.name} from this case?`);
  if (!confirmed) return;

  try {
    await apiClient.delete(`/${route.params.productSlug}/cases/${route.params.id}/participants/${part.id}`);
    showAlert('Success', 'Participant removed from case.');
    fetchCase();
  } catch (e) {
    showAlert('Error', 'Failed to remove participant.');
  }
};

// --- MODAL HELPERS ---
const openAssignModal = (part = null) => {
  selectedLetter.value = '';
  searchResults.value = [];
  searchQuery.value = '';

  if (part) {
    isEditingParticipant.value = true;
    editingParticipantId.value = part.id;
    selectedEntity.value = part.entity;
    const roleMeta = part.metaData || part.meta_data || {};
    participantForm.value = {
        role_key: (part.roleKey || part.role_key || '').toLowerCase(),
        reference_number: part.referenceNumber || part.reference_number || '',
        notes: part.notes || '',
        is_active: !!(part.isActive || part.is_active),
        is_primary_contact: !!(part.isPrimaryContact || part.is_primary_contact),
        meta_data: { ...roleMeta }
    };
    Object.keys(roleMeta).forEach(key => {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        if (snakeKey !== key && participantForm.value.meta_data[snakeKey] === undefined) {
            participantForm.value.meta_data[snakeKey] = roleMeta[key];
        }
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        if (camelKey !== key && participantForm.value.meta_data[camelKey] === undefined) {
            participantForm.value.meta_data[camelKey] = roleMeta[key];
        }
    });
  } else {
    isEditingParticipant.value = false;
    selectedEntity.value = null;
    participantForm.value = { role_key: '', reference_number: '', notes: '', is_active: true, is_primary_contact: false, meta_data: {} };
  }
  showAssignModal.value = true;
};

let searchTimeout = null;
const handleSearch = () => {
    selectedLetter.value = ''; // Reset alpha filter if user starts typing manually
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (searchQuery.value.length < 2) {
        searchResults.value = [];
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const { data } = await apiClient.get(`/entities?search=${encodeURIComponent(searchQuery.value)}`);
            searchResults.value = data.data || [];
        } catch (e) {
            console.error("Search error:", e);
        }
    }, 300);
};

const filterByLetter = async (letter) => {
    selectedLetter.value = letter;
    searchQuery.value = ''; // Clear manual query text
    if (searchTimeout) clearTimeout(searchTimeout);
    try {
        const { data } = await apiClient.get(`/entities?prefix=${letter}`);
        searchResults.value = data.data || [];
    } catch (e) {
        console.error("Alpha filter error:", e);
    }
};

const clearAlphaFilter = () => {
    selectedLetter.value = '';
    searchResults.value = [];
    searchQuery.value = '';
};

const selectEntity = (entity) => {
    selectedEntity.value = entity;
    searchQuery.value = '';
    searchResults.value = [];
};

const clearSelection = () => { selectedEntity.value = null; };
const closeModal = () => { showAssignModal.value = false; };

onMounted(fetchCase);
</script>