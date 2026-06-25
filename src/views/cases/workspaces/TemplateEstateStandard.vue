<template>
  <div class="h-full flex flex-col">
    
    <!-- INACTIVE WARNING BANNER (Keep this outside the glass pane so it's clear) -->
    <div v-if="caseFile.status === 'inactive'" class="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-amber-800 font-bold uppercase">
            Read Only: This case is inactive. Editing is disabled.
          </p>
        </div>
      </div>
    </div>

    <CaseWorkspaceHeader :case-file="caseFile" />

    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1 min-h-0 mt-6">
      
      <!-- Column 1: Documents -->
      <div class="lg:col-span-6 relative group">
        <!-- THE GLASS PANE OVERLAY -->
        <div v-if="caseFile.status === 'inactive'" class="absolute inset-0 z-50 cursor-not-allowed bg-gray-50/10"></div>
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col"
             :class="{'grayscale-[50%] opacity-70 pointer-events-none': caseFile.status === 'inactive'}">
          <div class="p-6 h-full overflow-hidden">
             <CaseDocumentsTable :case-id="caseFile.id" :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" />
          </div>
        </div>
      </div>
      
      <!-- Column 2: Workflow -->
      <div class="lg:col-span-4 relative group">
        <!-- THE GLASS PANE OVERLAY -->
        <div v-if="caseFile.status === 'inactive'" class="absolute inset-0 z-50 cursor-not-allowed bg-gray-50/10"></div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col"
             :class="{'grayscale-[50%] opacity-70 pointer-events-none': caseFile.status === 'inactive'}">
          <div class="p-6 h-full overflow-hidden">
             <CaseWorkflowPanel :case-id="caseFile.id" :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import CaseWorkspaceHeader from '@/components/cases/CaseWorkspaceHeader.vue';
import CaseDocumentsTable from '@/components/cases/CaseDocumentsTable.vue';
import CaseWorkflowPanel from '@/components/cases/CaseWorkflowPanel.vue';

const props = defineProps({
  caseFile: {
    type: Object,
    required: true
  }
});

/**
 * Note: We removed the hardcoded helper logic from this file. 
 * If the Header component needs to resolve participant metadata, 
 * that logic should live inside the CaseWorkspaceHeader component 
 * to keep this layout file clean and agnostic.
 */
</script>