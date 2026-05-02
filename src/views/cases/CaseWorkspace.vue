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
    // 1. Destructure 'data' from Axios
    const response = await apiClient.get(`/${route.params.productSlug}/cases/${route.params.id}`);
    
    // 2. Extract the actual case object from the Laravel 'data' wrapper
    // If your controller returns ['data' => $caseFile], we need response.data.data
    const caseData = response.data.data || response.data;
    caseFile.value = caseData;

    console.log("Full Case Object Received:", caseData);

    // 3. Extract the template name (checking all casing possibilities)
    const templateName = caseData.fileType?.workspaceTemplate || 
                         caseData.fileType?.workspace_template || 
                         caseData.file_type?.workspace_template ||
                         'TemplateEstateStandard';

    console.log("Targeting Template:", templateName);
    
    if (templateMap[templateName]) {
      currentTemplateComponent.value = templateMap[templateName];
    } else {
      console.error(`Template "${templateName}" not found in templateMap.`);
      // Optional: fallback to TemplateEstateStandard if something is wrong
      currentTemplateComponent.value = TemplateEstateStandard; 
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