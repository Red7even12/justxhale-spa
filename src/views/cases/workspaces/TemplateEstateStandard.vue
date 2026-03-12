<template>
  <div class="h-full flex flex-col">
    
    <!-- STANDARD HEADER (Contains Title, Buttons, QuickView, Modals) -->
    <CaseWorkspaceHeader :case-file="caseFile" />

    <!-- UNIQUE LAYOUT FOR THIS TEMPLATE (3-Column Grid) -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1 min-h-0">
      
      <!-- Column 1: Documents (6 wide) -->
      <div class="lg:col-span-6 bg-white p-0 rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
        <div class="p-6 h-full overflow-hidden">
           <CaseDocumentsTable :case-id="caseFile.id" />
        </div>
      </div>
      
      <!-- Column 2: Workflow (4 wide) -->
      <div class="lg:col-span-4 bg-white p-0 rounded-2xl shadow-sm border border-gray-100 h-[600px] overflow-hidden flex flex-col">
        <div class="p-6 h-full overflow-hidden">
           <CaseWorkflowPanel :case-id="caseFile.id" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
// Clean Imports
import CaseWorkspaceHeader from '@/components/cases/CaseWorkspaceHeader.vue'; // <-- THE NEW COMPONENT
import CaseDocumentsTable from '@/components/cases/CaseDocumentsTable.vue';
import CaseWorkflowPanel from '@/components/cases/CaseWorkflowPanel.vue';

const props = defineProps({
  caseFile: {
    type: Object,
    required: true
  }
});
</script>