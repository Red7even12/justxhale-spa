<template>
  <!-- Path: frontend-spa/src/views/cases/workspaces/TemplateUnifiedStandard.vue -->
  <div class="h-full flex flex-col relative">
    
    <!-- 1. DYNAMIC CASE HEADER & ROOT TOOLBAR -->
    <CaseWorkspaceHeader 
      :case-file="caseFile" 
      :active-file-type="activeFileType"
      :available-file-types="availableFileTypes"
      @tab-changed="activeFileType = $event"
      @open-setup="openSetupDrawer"
    />

    <!-- 2. STATUS WARNING BANNER (Read-only guard) -->
    <div v-if="['cancelled', 'closed', 'pending'].includes(caseFile.status)" 
        class="my-4 border-l-4 p-4 rounded-r-lg shadow-sm shrink-0"
        :class="caseFile.status === 'cancelled' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg v-if="caseFile.status === 'cancelled'" class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-bold uppercase tracking-tight"
            :class="caseFile.status === 'cancelled' ? 'text-red-700' : 'text-blue-700'">
            Case {{ caseFile.status.toUpperCase() }}: This file is in read-only mode.
          </p>
        </div>
      </div>
    </div>

    <!-- 2.5. POPIA NO ACCESS BANNER -->
    <div v-if="availableFileTypes.length === 0" class="my-4 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg shadow-sm shrink-0">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-bold uppercase tracking-tight text-red-800">
            Access Denied: You do not belong to the authorized functional teams for this file.
          </p>
        </div>
      </div>
    </div>

    <!-- 3. WORKSPACE CONTENT AREA (Scoped to Active Niche Tab) -->
    <div v-if="availableFileTypes.length > 0" class="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1 min-h-0 mt-2">
      
      <!-- Column 1: Active Tab's Document Pack -->
      <div class="lg:col-span-6 relative group">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
          <div class="p-6 h-full overflow-hidden">
            <CaseDocumentsTable 
              :key="`docs-${activeFileType?.id || 'default'}`"
              :case-id="caseFile.id" 
              :file-type-id="activeFileType?.id"
              :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" 
            />
          </div>
        </div>
      </div>

      <!-- Column 2: Active Tab's Workflow Checklist -->
      <div class="lg:col-span-4 relative group">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
          <div class="p-6 h-full overflow-hidden">
            <CaseWorkflowPanel 
              :key="`wf-${activeFileType?.id || 'default'}`"
              :case-id="caseFile.id" 
              :file-type-id="activeFileType?.id"
              :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" 
            />
          </div>
        </div>
      </div>

    </div> 

    <!-- 4. INLINE CASE SETUP SLIDE-OVER DRAWER -->
    <transition
      enter-active-class="transform transition ease-in-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition ease-in-out duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="showSetupDrawer" class="fixed inset-y-0 right-0 max-w-full flex z-50 pl-10">
        <div class="w-screen max-w-2xl bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          
          <!-- Drawer Header -->
          <div class="p-6 bg-brand-primary text-white flex justify-between items-center shrink-0">
            <div>
              <h2 class="text-xl font-black uppercase tracking-tight">Edit Case Setup</h2>
              <p class="text-xs opacity-80 uppercase font-bold tracking-wider mt-0.5">
                Niche: {{ activeFileType?.name || 'Primary' }}
              </p>
            </div>
            <button @click="closeSetupDrawer" class="text-white hover:text-gray-200 p-2 rounded-lg text-lg font-black">
              ✕
            </button>
          </div>

          <!-- Setup Form Tabs (Details vs Participants) -->
          <div class="flex border-b border-gray-200 bg-gray-50 px-6 shrink-0">
            <button 
              @click="setupTab = 'details'"
              :class="['py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all', setupTab === 'details' ? 'border-brand-primary text-brand-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700']">
              Details & Fields
            </button>
            <button 
              @click="setupTab = 'participants'"
              :class="['py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all', setupTab === 'participants' ? 'border-brand-primary text-brand-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700']">
              Role-Player Participants
            </button>
          </div>

          <!-- Drawer Body -->
          <div class="p-6 overflow-y-auto flex-1">
            
            <!-- SUB-TAB: DETAILS & FIELDS -->
            <form v-if="setupTab === 'details'" @submit.prevent="saveMetadata" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                
                <!-- File Name -->
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File Name</label>
                  <input v-model="detailsForm.file_name" type="text" class="w-full border-gray-200 rounded-xl font-bold text-gray-700 text-sm">
                </div>

                <!-- File Reference -->
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File Reference</label>
                  <input v-model="detailsForm.file_reference" type="text" class="w-full border-gray-200 rounded-xl font-bold text-gray-700 text-sm font-mono">
                </div>

                <!-- Assigned Team -->
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Team</label>
                  <select v-model="detailsForm.current_team_id" class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                    <option :value="null">-- Unassigned --</option>
                    <option v-for="team in ownershipTeams" :key="team.id" :value="team.id">
                      {{ team.name }}
                    </option>
                  </select>
                </div>

                <!-- Priority Classification -->
                <div class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Classification (Priority)</label>
                  <select v-model="detailsForm.file_class_id" class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                    <option :value="null">-- Standard (No Class) --</option>
                    <option v-for="cls in fileClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                  </select>
                </div>

                <!-- Dynamic Niche Custom Fields -->
                <div v-for="field in currentNicheFields.filter(f => !f.participantRoleId)" :key="field.id" class="col-span-2">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {{ field.label }}
                    <span v-if="field.showInQuickView" class="text-brand-primary ml-1">★</span>
                  </label>

                  <div v-if="field.fieldType === 'date'" class="relative group">
                    <div class="flex items-center justify-between w-full px-3 h-[42px] bg-white border border-gray-200 rounded-xl shadow-sm group-hover:border-brand-primary transition-colors">
                      <span class="text-sm font-bold uppercase tracking-tight" :class="detailsForm.meta_data[field.key] ? 'text-brand-blue-700' : 'text-gray-400'">
                        {{ detailsForm.meta_data[field.key] ? $formatDate(detailsForm.meta_data[field.key]) : 'Select Date...' }}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input type="date" v-model="detailsForm.meta_data[field.key]" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                  </div>

                  <input 
                    v-else 
                    v-model="detailsForm.meta_data[field.key]" 
                    :type="field.fieldType === 'number' ? 'number' : 'text'"
                    class="w-full border-gray-200 rounded-xl text-sm font-bold text-gray-700 h-[42px]"
                  >
                </div>

              </div>

              <div class="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" :disabled="isSaving" class="bg-brand-primary text-white text-xs px-6 py-2.5 rounded-xl font-bold shadow hover:opacity-90 disabled:opacity-50 transition-all">
                  {{ isSaving ? 'Saving...' : 'Save Case Details' }}
                </button>
              </div>
            </form>

            <!-- SUB-TAB: ROLE-PLAYER PARTICIPANTS -->
            <div v-if="setupTab === 'participants'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="text-xs font-black uppercase text-gray-500 tracking-wider">
                  Case Role Players
                </h4>
                <button @click="openAssignParticipantModal" class="bg-brand-primary text-white text-[11px] px-3 py-1.5 rounded-lg font-bold shadow hover:opacity-90 transition-all">
                  + Add Participant
                </button>
              </div>

              <div class="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                <div v-for="part in (caseFile.participants || [])" :key="part.id" class="p-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <div class="text-sm font-bold text-gray-900">{{ part.entity?.name }}</div>
                    <div class="text-[10px] text-brand-primary font-bold uppercase tracking-wider">{{ part.roleKey || part.role_key }}</div>
                  </div>
                  <button @click="deleteParticipant(part)" class="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                </div>
                <div v-if="!caseFile.participants || caseFile.participants.length === 0" class="p-6 text-center text-xs text-gray-400 italic">
                  No participants assigned to this case yet.
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </transition>

    <!-- 5. ASSIGN PARTICIPANT MODAL -->
    <Modal :show="showAssignModal" @close="showAssignModal = false">
      <template #title>
        <span class="text-brand-primary font-bold">Assign Role-Player to Case</span>
      </template>

      <div class="p-6 space-y-4">
        <!-- Step 1: Select Contact (Entity) -->
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Select Contact / Entity</label>
          <select v-model="assignForm.entity_id" class="w-full border-gray-200 rounded-xl font-bold text-sm text-gray-700">
            <option :value="null" disabled>-- Choose Contact --</option>
            <option v-for="ent in availableEntities" :key="ent.id" :value="ent.id">
              {{ ent.name }} ({{ ent.email || ent.phone_primary || 'No Direct Contact' }})
            </option>
          </select>
        </div>

        <!-- Step 2: Select Role -->
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Assign Role</label>
          <select v-model="assignForm.role_key" class="w-full border-gray-200 rounded-xl font-bold text-sm text-gray-700">
            <option value="" disabled>-- Choose Role --</option>
            <option v-for="r in availableRoles" :key="r.id" :value="r.roleKey || r.role_key">
              {{ r.name }} {{ (r.groupOnDocuments || r.group_on_documents) ? '★ (Docs Target)' : '' }}
            </option>
          </select>
        </div>

        <!-- Primary Contact Toggle -->
        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" v-model="assignForm.is_primary_contact" id="is_prim" class="h-4 w-4 text-brand-primary rounded border-gray-300">
          <label for="is_prim" class="text-xs font-bold text-gray-700 cursor-pointer">Set as Primary Case Contact</label>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" @click="showAssignModal = false" class="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
          <button 
            @click="submitAssignParticipant" 
            :disabled="isAssigning || !assignForm.entity_id || !assignForm.role_key"
            class="bg-brand-primary text-white text-xs px-6 py-2.5 rounded-xl font-bold shadow hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {{ isAssigning ? 'Assigning...' : 'Assign Participant' }}
          </button>
        </div>
      </div>
    </Modal>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import teamService from '@/services/teamService';
import { useAuthStore } from '@/store/auth';
import { useAlerts } from '@/composables/useAlerts';

import CaseWorkspaceHeader from '@/components/cases/CaseWorkspaceHeader.vue';
import CaseDocumentsTable from '@/components/cases/CaseDocumentsTable.vue';
import CaseWorkflowPanel from '@/components/cases/CaseWorkflowPanel.vue';
import Modal from '@/components/common/Modal.vue';

const props = defineProps({
  caseFile: { type: Object, required: true }
});

const route = useRoute();
const authStore = useAuthStore();
const { showAlert, showConfirm } = useAlerts();

const teams = ref([]);
const fileClasses = ref([]);

// Filtered Ownership Teams for case_files.current_team_id
const ownershipTeams = computed(() => {
  return teams.value.filter(t => (t.team_type || t.teamType || 'ownership') === 'ownership');
});

// --- AVAILABLE NICHE TABS ---
const availableFileTypes = computed(() => {
  const product = props.caseFile.product;
  if (product && (product.file_types !== undefined || product.fileTypes !== undefined)) {
    const types = product.file_types || product.fileTypes || [];
    return [...types].sort((a, b) => (a.sort_order || a.sortOrder || 1) - (b.sort_order || b.sortOrder || 1));
  }
  return props.caseFile.fileType ? [props.caseFile.fileType] : [];
});

const activeFileType = ref(null);

const initActiveTab = () => {
  if (availableFileTypes.value.length > 0 && !activeFileType.value) {
    const matched = availableFileTypes.value.find(ft => ft.id === props.caseFile.file_type_id);
    activeFileType.value = matched || availableFileTypes.value[0];
  }
};

watch(() => props.caseFile, initActiveTab, { immediate: true });
onMounted(initActiveTab);

// --- SETUP DRAWER STATE ---
const showSetupDrawer = ref(false);
const setupTab = ref('details');
const isSaving = ref(false);

const detailsForm = reactive({
  file_name: '',
  file_reference: '',
  current_team_id: null,
  file_class_id: null,
  meta_data: {}
});

const currentNicheFields = computed(() => {
  const fields = activeFileType.value?.fields || props.caseFile.fileType?.fields || [];
  return fields.map(f => {
    const key = f.fieldKey || f.field_key || f.key || '';
    const label = f.fieldLabel || f.field_label || f.label || key;
    const pRoleId = f.participantRoleId || f.participant_role_id;
    const showStar = f.showInQuickView === true || f.show_in_quick_view === true || f.show_in_quick_view === 1;

    return {
      id: f.id,
      label: label,
      key: key,
      fieldType: f.fieldType || f.field_type || 'text',
      showInQuickView: showStar,
      participantRoleId: (pRoleId && pRoleId !== "0") ? pRoleId : null
    };
  });
});

const openSetupDrawer = async () => {
  showSetupDrawer.value = true;
  setupTab.value = 'details';

  detailsForm.file_name = props.caseFile.fileName || props.caseFile.file_name || '';
  detailsForm.file_reference = props.caseFile.fileReference || props.caseFile.file_reference || '';
  detailsForm.current_team_id = props.caseFile.currentTeamId || props.caseFile.current_team_id || null;
  detailsForm.file_class_id = props.caseFile.fileClassId || props.caseFile.file_class_id || null;

  const rawMeta = props.caseFile.metaData || props.caseFile.meta_data || {};
  const nicheId = activeFileType.value?.id;
  const nicheScopedMeta = (nicheId && rawMeta[nicheId] && typeof rawMeta[nicheId] === 'object') ? rawMeta[nicheId] : {};

  detailsForm.meta_data = {};
  currentNicheFields.value.forEach(f => {
    const key = f.key;
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

    const value = nicheScopedMeta[key] 
      ?? nicheScopedMeta[camelKey] 
      ?? nicheScopedMeta[snakeKey] 
      ?? rawMeta[key] 
      ?? rawMeta[camelKey] 
      ?? rawMeta[snakeKey] 
      ?? '';

    detailsForm.meta_data[key] = value;
  });

  if (teams.value.length === 0) {
    try {
      const [teamRes, classRes] = await Promise.all([
        teamService.getTeams(),
        apiClient.get(`/${route.params.productSlug}/file-classes`)
      ]);
      teams.value = teamRes.data.data || teamRes.data;
      fileClasses.value = classRes.data.data || classRes.data;
    } catch (err) {
      console.error("Failed to load setup collections", err);
    }
  }
};

const closeSetupDrawer = () => {
  showSetupDrawer.value = false;
};

const saveMetadata = async () => {
  isSaving.value = true;
  try {
    const rawMeta = { ...(props.caseFile.metaData || props.caseFile.meta_data || {}) };
    const nicheId = activeFileType.value?.id;

    if (nicheId) {
      rawMeta[nicheId] = {
        ...(rawMeta[nicheId] || {}),
        ...detailsForm.meta_data
      };
    } else {
      Object.assign(rawMeta, detailsForm.meta_data);
    }

    const response = await apiClient.put(`/${route.params.productSlug}/cases/${props.caseFile.id}`, {
      file_name: detailsForm.file_name,
      file_reference: detailsForm.file_reference,
      current_team_id: detailsForm.current_team_id,
      file_class_id: detailsForm.file_class_id,
      meta_data: rawMeta
    });

    // --- 1. INSTANT LIVE UI SYNC (Mutate caseFile in-place) ---
    props.caseFile.fileName = detailsForm.file_name;
    props.caseFile.file_name = detailsForm.file_name;
    props.caseFile.fileReference = detailsForm.file_reference;
    props.caseFile.file_reference = detailsForm.file_reference;
    props.caseFile.currentTeamId = detailsForm.current_team_id;
    props.caseFile.current_team_id = detailsForm.current_team_id;
    props.caseFile.fileClassId = detailsForm.file_class_id;
    props.caseFile.file_class_id = detailsForm.file_class_id;
    props.caseFile.meta_data = rawMeta;
    props.caseFile.metaData = rawMeta;

    // Update Priority Classification Badge in real time
    if (detailsForm.file_class_id && fileClasses.value.length > 0) {
      const matched = fileClasses.value.find(c => c.id === detailsForm.file_class_id);
      if (matched) {
        props.caseFile.fileClass = matched;
        props.caseFile.file_class = matched;
      }
    } else {
      props.caseFile.fileClass = null;
      props.caseFile.file_class = null;
    }
    // ---------------------------------------------------------

    showAlert('Success', 'Case setup updated successfully.');
    closeSetupDrawer();
  } catch (err) {
    showAlert('Error', 'Failed to update setup.');
  } finally {
    isSaving.value = false;
  }
};

// --- ASSIGN PARTICIPANT MODAL STATE & ACTIONS ---
const showAssignModal = ref(false);
const isAssigning = ref(false);
const availableEntities = ref([]);
const availableRoles = ref([]);

const assignForm = reactive({
  entity_id: null,
  role_key: '',
  is_primary_contact: false
});

const openAssignParticipantModal = async () => {
  assignForm.entity_id = null;
  assignForm.role_key = '';
  assignForm.is_primary_contact = false;
  showAssignModal.value = true;

  try {
    const [entRes, roleRes] = await Promise.all([
      apiClient.get('/entities'),
      apiClient.get(`/${route.params.productSlug}/participant-roles`)
    ]);
    availableEntities.value = entRes.data.data || entRes.data || [];
    availableRoles.value = roleRes.data.data || roleRes.data || [];
  } catch (err) {
    console.error("Failed to load entities/roles", err);
  }
};

const submitAssignParticipant = async () => {
  if (!assignForm.entity_id || !assignForm.role_key) {
    showAlert('Warning', 'Please select both a Contact and a Role.');
    return;
  }

  isAssigning.value = true;
  try {
    const response = await apiClient.post(`/${route.params.productSlug}/cases/${props.caseFile.id}/participants`, {
      entity_id: assignForm.entity_id,
      role_key: assignForm.role_key,
      is_primary_contact: assignForm.is_primary_contact
    });

    const newPart = response.data.data || response.data;
    
    if (!props.caseFile.participants) {
      props.caseFile.participants = [];
    }

    const existingIndex = props.caseFile.participants.findIndex(p => p.id === newPart.id);
    if (existingIndex > -1) {
      props.caseFile.participants[existingIndex] = newPart;
    } else {
      props.caseFile.participants.push(newPart);
    }

    showAlert('Success', 'Participant assigned successfully.');
    showAssignModal.value = false;

    // Refresh workspace view to instantly show new stakeholder tabs
    window.location.reload(); 
  } catch (err) {
    showAlert('Error', err.response?.data?.message || 'Failed to assign participant.');
  } finally {
    isAssigning.value = false;
  }
};

const deleteParticipant = async (part) => {
  const confirmed = await showConfirm('Remove Participant', `Remove ${part.entity?.name} from this case?`);
  if (!confirmed) return;

  try {
    await apiClient.delete(`/${route.params.productSlug}/cases/${props.caseFile.id}/participants/${part.id}`);
    
    if (props.caseFile.participants) {
      props.caseFile.participants = props.caseFile.participants.filter(p => p.id !== part.id);
    }
    
    showAlert('Success', 'Participant removed.');
  } catch (err) {
    showAlert('Error', 'Failed to remove participant.');
  }
};
</script>