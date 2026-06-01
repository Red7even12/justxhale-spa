<template>
  <!-- Path: frontend-spa/src/views/cases/workspaces/TemplateEstateStandard.vue -->
  <div class="h-full flex flex-col">
    
    <!-- 
      1. THE DYNAMIC HEADER 
      This component handles the Title, Buttons, and the 
      DYNAMIC QuickView fields based on the "show_in_quick_view" DB tag.
    -->
    <CaseWorkspaceHeader :case-file="caseFile" />

    <!-- 
      2. WORKSPACE CONTENT AREA
      The Niche Template's job is only to define WHERE things go on the grid.
    -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1 min-h-0 mt-6">
      
      <!-- Column 1: Documents (6 wide) -->
      <div class="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
        <div class="p-6 h-full overflow-hidden">
           <CaseDocumentsTable :case-id="caseFile.id" :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" />
        </div>
      </div>
      
      <!-- Column 2: Workflow (4 wide) -->
      <div class="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
        <div class="p-6 h-full overflow-hidden">
           <CaseWorkflowPanel :case-id="caseFile.id" :current-team-id="caseFile.current_team_id || caseFile.currentTeamId" />
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