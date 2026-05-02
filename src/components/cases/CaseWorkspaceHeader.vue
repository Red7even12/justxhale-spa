<template>
  <div class="mb-6">
    <!-- This is the frame that holds the header on the Casefile Workspace containing the buttons and the Participant fields and Quickview form-->
    
    <!-- 1. TOP ROW: Title & Actions -->
    <div class="flex justify-between items-center mb-4">
      
      <!-- Identity -->
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-gray-900 uppercase tracking-tight">{{ caseFile.fileName }}</h1>
          <span :class="statusBadgeClass" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            {{ caseFile.status }}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest flex items-center gap-2">
          <span>{{ caseFile.fileType?.name }}</span>
          <span class="text-gray-300">|</span>
          <span class="font-mono text-gray-500">{{ caseFile.fileReference || 'No Ref' }}</span>
        </p>
      </div>
      
      <!-- Actions Toolbar -->
      <div class="flex items-center gap-3">
        
        <!-- Notes -->
        <button @click="openCaseNotes" 
                class="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 uppercase tracking-wide flex items-center gap-2 transition-colors">
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Notes
        </button>

        <!-- Timeline -->
        <button @click="goToTimeline" 
                class="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 uppercase tracking-wide flex items-center gap-2 transition-colors">
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Timeline
        </button>

        <!-- Edit Setup -->
        <button @click="goToSetup" 
                class="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 uppercase tracking-wide transition-colors">
          Edit Case Setup
        </button>
      </div>
    </div>

    <!-- 2. QUICK VIEW (Embedded here so it's standard too) -->
    <CaseQuickViewHeader :case-file="caseFile" />

    <!-- 3. SHARED MODALS (Notes) -->
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
           :context-url="`${route.params.productSlug}/cases/${caseFile.id}`" 
           @cancel="showNotesModal = false"
        />
      </div>
    </Modal>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CaseQuickViewHeader from '@/components/cases/CaseQuickViewHeader.vue';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue';
import noteService from '@/services/noteService';

const props = defineProps({
  caseFile: { type: Object, required: true }
});

const route = useRoute();
const router = useRouter();

// --- UI HELPERS ---
const statusBadgeClass = computed(() => {
    switch (props.caseFile.status) {
        case 'open': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        case 'archived': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-blue-100 text-blue-800';
    }
});

// --- NAVIGATION ACTIONS ---
const goToSetup = () => {
    router.push({ 
        name: 'ProductCaseSetup', // Maps to /:productSlug/cases/:id/setup
        params: { productSlug: route.params.productSlug, id: props.caseFile.id } 
    });
};

const goToTimeline = () => {
    router.push({ 
        name: 'CaseTimelineReport', 
        params: { productSlug: route.params.productSlug, id: props.caseFile.id } 
    });
};

// --- NOTES LOGIC ---
const showNotesModal = ref(false);
const currentNotes = ref([]);

const openCaseNotes = async () => {
    try {
        const contextUrl = `${route.params.productSlug}/cases/${props.caseFile.id}`;
        const { data } = await noteService.getNotes('case_file', props.caseFile.id, contextUrl);
        currentNotes.value = data;
        showNotesModal.value = true;
    } catch (err) {
        console.error("Failed to load case notes", err);
        alert("Failed to load notes");
    }
};
</script>