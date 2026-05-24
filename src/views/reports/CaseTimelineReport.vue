<template>
  <div class="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
    <CaseTimeline 
        :case-id="caseId" 
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

const close = () => {
    router.push({ 
        name: 'ProductCaseWorkspace', 
        params: { productSlug, id: caseId } 
    });
};
</script>