<template>
  <div class="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
    <div class="mb-4">
      <button @click="close" class="no-print bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Case
      </button>
    </div>
    <CaseTimeline 
        :case-id="caseId" 
        :file-type-id="activeTabId"
        @close="close"
    />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import CaseTimeline from '@/components/cases/CaseTimeline.vue';

const route = useRoute();
const router = useRouter();

const caseId = route.params.id;
const productSlug = route.params.productSlug;

// The tab the user came from ("Print" on the workspace panel), so the printed report
// is scoped to that tab instead of every tab the user can see.
const activeTabId = route.query.file_type_id ?? null;

const close = () => {
    router.push({ 
        name: 'ProductCaseWorkspace', 
        params: { productSlug, id: caseId } 
    });
};
</script>