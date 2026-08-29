<template>
  <div class="h-full flex flex-col">
    
    <!-- 1. THE DYNAMIC HEADER (Restored) -->
    <!-- This provides the Title and the Notes button needed to re-open the case -->
    <CaseWorkspaceHeader :case-file="caseFile" />

    <!-- 2. STATUS WARNING BANNER -->
    <!-- Triggers for both inactive (Red) and closed (Blue) -->
    <div v-if="['cancelled', 'closed', 'pending'].includes(caseFile.status)" 
        class="mb-4 border-l-4 p-4 rounded-r-lg shadow-sm"
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

    <!-- 3. WORKSPACE CONTENT AREA -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1 min-h-0 mt-6">
      
      <!-- Column 1: Documents -->
      <div class="lg:col-span-6 relative group">
        <!-- The Glass Pane -->
        <div v-if="['cancelled', 'closed','pending'].includes(caseFile.status)" class="absolute inset-0 z-50 cursor-not-allowed bg-gray-50/10"></div>
        
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col"
            :class="{'grayscale-[50%] opacity-70 pointer-events-none': ['cancelled', 'closed','pending'].includes(caseFile.status)}">
          <div class="p-6 h-full overflow-hidden">
              <CaseDocumentsTable :case-id="caseFile.id" :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" />
          </div>
        </div>
      </div>

      <!-- Column 2: Workflow -->
      <div class="lg:col-span-4 relative group">
        <!-- The Glass Pane -->
        <div v-if="['cancelled', 'closed','pending'].includes(caseFile.status)" class="absolute inset-0 z-50 cursor-not-allowed bg-gray-50/10"></div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col"
            :class="{'grayscale-[50%] opacity-70 pointer-events-none': ['cancelled', 'closed','pending'].includes(caseFile.status)}">
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