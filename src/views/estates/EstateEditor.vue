<template>
  <!-- frontend-spa\src\views\estates\EstateEditor.vue -->
  
  <!-- Wrapper for positioning the lock overlay -->
  <div class="relative">
    <!-- NEW: The lock overlay component. It shows when the estate is locked by another user. -->
    <LockedOverlay v-if="lockState.isLockedByOther" :locked-by-user="lockState.lockedBy" />

    <!-- This div wraps all your content and disables it if the estate is locked. -->
    <div :class="{ 'pointer-events-none opacity-50': lockState.isLockedByOther }">
      <div v-if="loading">Loading estate...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else-if="estate">
        <EstateInfoHeader 
          :estate-id="parseInt(props.id)" 
          @edit-estate="navigateToEditForm" 
          @open-notes="handleOpenNotesModal" 
          @view-timeline="navigateToTimeline" 
          @view-case-numbers="navigateToCaseNumbers"
        />

        <div class="mt-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div class="bg-white shadow-sm rounded-lg p-6 lg:col-span-6">
            <DocumentsTable :estate-id="parseInt(props.id)" @open-notes="handleOpenNotesModal" />
          </div>
          <div class="bg-white shadow-sm rounded-lg p-6 lg:col-span-4">
            <SarsWorkflowPanel :estate-id="parseInt(props.id)" @open-notes="handleOpenNotesModal" />
          </div>
        </div>
      </div>
    </div>

    <!-- Your existing modal code is unchanged -->
    <Modal :show="isNotesModalOpen" @close="isNotesModalOpen = false">
      <template #title>
        {{ notesContext.title }}
      </template>
      <div class="p-6">
        <NotesPanel
          v-if="notesContext.noteableType && notesContext.noteableId"
          :key="notesContext.noteableId"
          :initial-notes="notesContext.initialNotes"
          :noteable-type="notesContext.noteableType"
          :noteable-id="notesContext.noteableId"
          @note-added="handleNoteAdded" 
          @cancel="isNotesModalOpen = false"
        />
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'; // changed onUnmounted to onBeforeUnmount
import { useRouter, useRoute } from 'vue-router';
import estateService from '@/services/estateService';
import apiClient from '@/services/api'; // Import API Client directly for the locks
import EstateInfoHeader from '@/components/estates/EstateInfoHeader.vue';
import DocumentsTable from '@/components/estates/DocumentsTable.vue';
import SarsWorkflowPanel from '@/components/estates/SarsWorkflowPanel.vue';
import Modal from '@/components/common/Modal.vue';
import NotesPanel from '@/components/estates/NotesPanel.vue';
import LockedOverlay from '@/components/LockedOverlay.vue';

const props = defineProps({ id: { type: String, required: true } });
const router = useRouter();
const route = useRoute(); 

const estate = ref(null);
const loading = ref(true);
const error = ref(null);

const isNotesModalOpen = ref(false);
const notesContext = reactive({
  title: '',
  noteableType: null,
  noteableId: null,
  initialNotes: [],
});

// --- Locking State Management ---
const lockState = reactive({
    isLockedByOther: false,
    lockedBy: '',
    heartbeatInterval: null,
});

const fetchEstateDetails = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await estateService.getEstate(props.id);
    estate.value = response.data.data;
  } catch (err) {
    console.error("Failed to fetch estate details:", err);
    error.value = 'Could not load estate details.';
  } finally {
    loading.value = false;
  }
};

// --- Lock Management Functions ---
const acquireLock = async () => {
    try {
        // 1. Initial Lock Request
        await apiClient.post(`/estates/${props.id}/lock`);
        console.log('Lock acquired/refreshed successfully.');
        
        // 2. Clear any existing interval to prevent duplicates
        if (lockState.heartbeatInterval) clearInterval(lockState.heartbeatInterval);

        // 3. Set Heartbeat to 60 seconds (Half of the 2-minute backend TTL)
        lockState.heartbeatInterval = setInterval(async () => {
            try {
                console.log('Sending lock heartbeat...');
                await apiClient.put(`/estates/${props.id}/lock`);
            } catch (innerErr) {
                console.warn('Lost lock heartbeat connection.');
            }
        }, 60000); 

    } catch (err) {
        if (err.response && err.response.status === 409) {
            console.warn('Estate is locked by another user.');
            lockState.isLockedByOther = true;
            lockState.lockedBy = err.response.data.user;
        } else {
            console.error('An unexpected error occurred while trying to lock the estate:', err);
        }
    }
};

const releaseLock = async () => {
    // 1. Stop the heartbeat immediately
    if (lockState.heartbeatInterval) {
        clearInterval(lockState.heartbeatInterval);
        lockState.heartbeatInterval = null;
    }

    // 2. If we own the lock, tell the server to delete it
    if (!lockState.isLockedByOther) {
        try {
            console.log('Releasing lock...');
            // We use Beacon API logic here by using a standard request 
            // inside onBeforeUnmount which usually completes before the page unloads
            await apiClient.delete(`/estates/${props.id}/lock`);
        } catch (err) {
            // Ignore errors on release (e.g. if network is already lost)
            console.warn('Lock release signal failed (harmless if navigating away).');
        }
    }
};
// -----------------------------------

const navigateToEditForm = () => {
  router.push({ name: 'estates.form.edit', params: { id: props.id } });
};

const navigateToTimeline = () => {
  router.push({ name: 'estates.timeline', params: { id: props.id } });
};

const navigateToCaseNumbers = () => {
  router.push({ name: 'estates.case-numbers', params: { id: props.id } });
};

const handleOpenNotesModal = (payload) => {
  notesContext.title = `Notes for ${payload.name}`;
  notesContext.noteableType = payload.type;
  notesContext.noteableId = payload.id;

  if (payload.type === 'estate') {
    // FIX: Use camelCase 'timelineNotes' to match the actual API response
    const rawTimeline = estate.value.timelineNotes;
    
    // Handle potential array vs object wrapper (just in case)
    notesContext.initialNotes = (rawTimeline && rawTimeline.data) ? rawTimeline.data : (rawTimeline || []);
  } else if (payload.type === 'estate_workflow_process' && estate.value.workflowProcesses) {
    const process = estate.value.workflowProcesses.find(p => p.id === payload.id);
    notesContext.initialNotes = process ? process.notes : [];
  } else if (payload.type === 'estate_document_requirement' && estate.value.documentRequirements) {
    const requirement = estate.value.documentRequirements.find(r => r.id === payload.id);
    notesContext.initialNotes = requirement ? requirement.notes : [];
  }
  
  isNotesModalOpen.value = true;
};

const handleNoteAdded = () => {
  fetchEstateDetails();
};

onMounted(async () => {
  await fetchEstateDetails();
  if (estate.value) {
    await acquireLock();
  }

  const { open_notes_for_type, open_notes_for_id, open_notes_for_name } = route.query;
  if (open_notes_for_type && open_notes_for_id) {
    handleOpenNotesModal({
      type: open_notes_for_type,
      id: parseInt(open_notes_for_id),
      name: open_notes_for_name || 'Note',
    });
  }
});

// Changed from onUnmounted to onBeforeUnmount for better reliability
onBeforeUnmount(() => {
    releaseLock();
});
</script>