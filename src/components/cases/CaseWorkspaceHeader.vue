<!-- frontend-spa/src/components/cases/CaseWorkspaceHeader.vue -->
<template>
  <div class="mb-6">
    
    <!-- 1. TOP ROW: Title & Actions -->
    <div class="flex justify-between items-center mb-4">
      
      <!-- Identity -->
      <div>
        <div class="flex items-center gap-3">
          <h1 
            :style="caseFile.fileClass ? { 
              backgroundColor: caseFile.fileClass.bg_color || caseFile.fileClass.bgColor, 
              color: caseFile.fileClass.text_color || caseFile.fileClass.textColor 
            } : {}"
            :class="[
              'text-3xl font-bold uppercase tracking-tight transition-all',
              caseFile.fileClass ? 'px-4 py-1 rounded-lg shadow-sm' : 'text-gray-900'
            ]"
          >
            {{ caseFile.fileName }}
          </h1>
          <span :class="statusBadgeClass" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            {{ caseFile.status }}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest flex items-center gap-2">
          <span>{{ currentActiveTab?.name || caseFile.fileType?.name }}</span>
          <span class="text-gray-300">|</span>
          <span class="font-mono text-gray-500">{{ caseFile.fileReference || 'No Ref' }}</span>
        </p>
      </div>
      
      <!-- Actions Toolbar -->
      <div class="flex items-center gap-3">
        <!-- Notes -->
        <button v-if="canSeeNotes"
                @click="openCaseNotes" 
                class="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 uppercase tracking-wide flex items-center gap-2 transition-colors">
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {{ canManageStatus ? 'Notes / Status' : 'Notes' }}
        </button>

        <!-- Timeline -->
        <button @click="toggleTimeline" 
                :class="[
                  showTimeline ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50',
                  'px-4 py-2 rounded-lg text-xs font-bold shadow-sm uppercase tracking-wide flex items-center gap-2 transition-colors border'
                ]">
          <svg :class="showTimeline ? 'text-white' : 'text-gray-400'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Timeline
        </button>

        <!-- Edit Setup -->
        <button v-if="!['cancelled', 'closed', 'pending'].includes(caseFile.status)"
                @click="goToSetup" 
                class="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 uppercase tracking-wide transition-colors">
          Edit Case Setup
        </button>
      </div>
    </div>

    <!-- 1.5. NEW: TOP DYNAMIC NICHE TABS (Moved directly above Quickview!) -->
    <div v-if="resolvedAvailableFileTypes.length > 1" class="mb-4 bg-white rounded-xl shadow-xs border border-gray-200/80 px-2 py-1.5 flex items-center gap-2 overflow-x-auto">
      <button 
        v-for="ft in resolvedAvailableFileTypes" 
        :key="ft.id"
        @click="selectTab(ft)"
        type="button"
        class="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap"
        :class="currentActiveTab?.id === ft.id 
          ? 'bg-brand-primary text-white shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
      >
        <span class="material-icons text-sm">{{ ft.icon || 'folder' }}</span>
        <span>{{ ft.name }}</span>
      </button>
    </div>

    <!-- 2. QUICK VIEW (Scoped to the active tab) -->
    <CaseQuickViewHeader :case-file="caseFile" :active-file-type="currentActiveTab" />

    <!-- 3. TIMELINE -->
    <div v-if="showTimeline" class="mt-6">
       <CaseTimeline :case-id="caseFile.id" :case-file="caseFile" @close="showTimeline = false" />
    </div>

    <!-- 4. SHARED MODALS (Notes) -->
    <Modal :show="showNotesModal" @close="showNotesModal = false">
      <template #title>
        <span class="text-brand-primary font-bold">Case File Notes</span>
      </template>
      <div class="p-6">
        <NotesPanel 
           v-if="showNotesModal"
           :initial-notes="currentNotes"
           noteable-type="case_file"
           :noteable-id="caseFile.id"
           :file-type-id="currentActiveTab?.id"
           :current-status="caseFile.status" 
           :context-url="`${route.params.productSlug}/cases/${caseFile.id}`" 
           :current-team-id="caseFile.current_team_id || caseFile.currentTeamId"
           @cancel="showNotesModal = false"
        />
      </div>
    </Modal>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CaseQuickViewHeader from '@/components/cases/CaseQuickViewHeader.vue';
import CaseTimeline from '@/components/cases/CaseTimeline.vue';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue';
import noteService from '@/services/noteService';
import { useAuthStore } from '@/store/auth'; 
import apiClient from '@/services/api';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const props = defineProps({
  caseFile: { type: Object, required: true },
  activeFileType: { type: Object, default: null },
  availableFileTypes: { 
    type: Array, 
    default: () => [] 
  }
});

const emit = defineEmits(['tab-changed', 'update:activeFileType', 'open-setup']);

// 1. Safe Tabs Resolver (Uses prop OR falls back to caseFile product tabs)
const resolvedAvailableFileTypes = computed(() => {
  if (props.availableFileTypes && props.availableFileTypes.length > 0) {
    return props.availableFileTypes;
  }
  return props.caseFile?.product?.fileTypes 
      || props.caseFile?.product?.file_types 
      || (props.caseFile?.fileType ? [props.caseFile.fileType] : []);
});

// 2. Active Tab State
const localActiveTab = ref(null);

const currentActiveTab = computed(() => {
  return props.activeFileType 
      || localActiveTab.value 
      || (resolvedAvailableFileTypes.value.length > 0 ? resolvedAvailableFileTypes.value[0] : null)
      || props.caseFile?.fileType 
      || null;
});

const selectTab = (ft) => {
  if (!ft) return;
  localActiveTab.value = ft;
  emit('tab-changed', ft);
  emit('update:activeFileType', ft);
};

// 3. Initialize default active tab safely
watch(resolvedAvailableFileTypes, (types) => {
  if (types && types.length > 0 && !localActiveTab.value) {
    const matched = types.find(t => t.id === props.caseFile?.file_type_id) || types[0];
    if (matched) selectTab(matched);
  }
}, { immediate: true });

onMounted(() => {
  if (resolvedAvailableFileTypes.value.length > 0 && !localActiveTab.value) {
    const matched = resolvedAvailableFileTypes.value.find(t => t.id === props.caseFile?.file_type_id) || resolvedAvailableFileTypes.value[0];
    if (matched) selectTab(matched);
  }
});

// --- UI & PERMISSION HELPERS ---
const canSeeNotes = computed(() => {
  if (props.caseFile.status === 'open') return true;
  return authStore.hasRole('Subscriber Admin') || authStore.hasRole('Case File Admin');
});

const canManageStatus = computed(() => {
  return authStore.hasRole('Subscriber Admin') || authStore.hasRole('Case File Admin');
});

const statusBadgeClass = computed(() => {
  switch (props.caseFile.status) {
    case 'open': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800'; 
    case 'closed': return 'bg-blue-100 text-blue-800'; 
    case 'cancelled': return 'bg-gray-200 text-gray-700 border border-gray-300'; 
    default: return 'bg-blue-100 text-blue-800';
  }
});

const goToSetup = () => {
  emit('open-setup');
};

const showTimeline = ref(false);
const toggleTimeline = () => { showTimeline.value = !showTimeline.value; };

const showNotesModal = ref(false);
const currentNotes = ref([]);

const openCaseNotes = async () => {
  try {
    const contextUrl = `${route.params.productSlug}/cases/${props.caseFile.id}`;
    const targetFileType = currentActiveTab.value?.id || props.caseFile.file_type_id;

    // Pass file_type_id to filter notes by the active tab
    const { data } = await noteService.getNotes('case_file', props.caseFile.id, contextUrl, {
      file_type_id: targetFileType
    });
    
    currentNotes.value = data.data || data;
    showNotesModal.value = true;
  } catch (err) {
    alert("Failed to load notes");
  }
};
</script>