<template>
  <div class="xhale-portal-container min-h-screen">
    
    <!-- 1. LOADING STATE -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-[60vh]">
      <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Hydrating Insights...</p>
    </div>

    <!-- 2. ERROR STATE -->
    <div v-else-if="error" class="flex flex-col items-center justify-center h-[60vh] p-10 text-center">
      <span class="material-icons text-gray-300 text-6xl mb-4">error_outline</span>
      <h2 class="text-lg font-bold text-gray-700">{{ error }}</h2>
      <button @click="fetchDashboard" class="mt-4 text-indigo-600 font-bold hover:underline">Retry</button>
    </div>

    <!-- 3. THE VIEWER (Only render if we have a definition) -->
    <div v-else-if="dashboardData.definition">
      <DashboardViewer 
        :definition="dashboardData.definition" 
        :results="dashboardData.results" 
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import DashboardViewer from '@/components/reports/DashboardViewer.vue';

const props = defineProps<{
    slug?: string;
    productSlug: string;
}>();

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);

// Initialize with a safe structure
const dashboardData = ref({
  definition: null as any,
  results: {} as Record<string, any>
});

const fetchDashboard = async () => {
  // Guard: if no slugs available, don't fetch
  const pSlug = props.productSlug || route.params.productSlug;
  const dSlug = props.slug || route.params.slug;

  if (!pSlug) return;

  loading.value = true;
  error.value = null;

  try {
    const url = dSlug ? `/${pSlug}/dashboards/${dSlug}` : `/${pSlug}/dashboards`;
    const response = await apiClient.get(url);
    
    if (response.data && response.data.definition) {
        dashboardData.value = response.data;
    } else {
        error.value = "This dashboard has no configuration.";
    }
  } catch (err: any) {
    error.value = "Dashboard not found or access denied.";
  } finally {
    // Crucial: ensure this runs regardless of success/fail
    loading.value = false;
  }
};

// Re-fetch when slug changes from Sidebar
watch(() => props.slug, fetchDashboard);

onMounted(fetchDashboard);
</script>