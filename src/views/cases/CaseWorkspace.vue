<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-brand-primary font-bold animate-pulse">Loading Workspace...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
      <h3 class="font-bold text-lg">Error Loading Case</h3>
      <p class="text-sm mt-1">{{ error }}</p>
      <button @click="$router.push(`/${route.params.productSlug}/cases`)" class="mt-4 underline text-sm font-bold">Return to Case Files</button>
    </div>

    <!-- THE MAGIC: Dynamic Component Rendering -->
    <div v-else-if="caseFile && currentTemplateComponent">
       <component :is="currentTemplateComponent" :caseFile="caseFile" />
    </div>
    
    <!-- Fallback if template is missing -->
    <div v-else class="bg-yellow-50 text-yellow-800 p-6 rounded-2xl border border-yellow-200">
      <h3 class="font-bold">Template Not Found</h3>
      <p class="text-sm mt-1">The system requested a layout named <strong>"{{ caseFile?.fileType?.workspace_template }}"</strong>, but it doesn't exist in the library.</p>
      <button @click="$router.push(`/${route.params.productSlug}/cases/${caseFile.id}/setup`)" class="mt-4 bg-yellow-600 text-white px-4 py-2 rounded font-bold text-sm">Force Open Setup View</button>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';

// 1. Import ONLY what we have built
import TemplateEstateStandard from './workspaces/TemplateEstateStandard.vue';

const route = useRoute();
const caseFile = ref(null);
const loading = ref(true);
const error = ref(null);
const currentTemplateComponent = shallowRef(null);

// 2. Map only the existing templates
const templateMap = {
  'TemplateEstateStandard': TemplateEstateStandard,
  // 'TemplateStandard': TemplateStandard <-- REMOVED to prevent crash
};

const fetchCaseAndLoadTemplate = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { data } = await apiClient.get(`/${route.params.productSlug}/cases/${route.params.id}`);
    caseFile.value = data;

    // Check the database string
    // If the DB has 'TemplateStandard' (the default) but we haven't built it yet, 
    // we can temporarily force it to use 'TemplateEstateStandard' for testing, 
    // OR just let it fall through to the "Template Not Found" warning.
    
    // For now, let's allow the "Template Not Found" warning to show if it doesn't match,
    // so you know your DB logic is working.
    const templateName = data.fileType?.workspaceTemplate || 
                         data.fileType?.workspace_template || 
                         'TemplateStandard';

    console.log("Detected Template:", templateName); // Debug log
    
    if (templateMap[templateName]) {
      currentTemplateComponent.value = templateMap[templateName];
    } else {
      console.warn(`Template "${templateName}" requested but not found in map.`);
      currentTemplateComponent.value = null; // Triggers the Yellow Warning Box
    }

  } catch (err) {
    console.error("Failed to load workspace", err);
    error.value = err.response?.data?.message || "Failed to load the case details.";
  } finally {
    loading.value = false;
  }
};

// Re-fetch if user switches app or case ID while component is active
watch(
  () => [route.params.productSlug, route.params.id],
  ([newSlug, newId]) => {
    if (newSlug && newId) {
      fetchCaseAndLoadTemplate();
    }
  }
);

onMounted(fetchCaseAndLoadTemplate);
</script>