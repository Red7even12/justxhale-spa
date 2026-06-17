<!-- src/views/reports/WidgetDashboard.vue -->
<template>
    <div class="widget-dashboard flex h-full bg-gray-50">
        <!-- Sidebar: Dashboard Library -->
        <aside class="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 shadow-sm">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-xl font-bold text-gray-800">Insights Dashboard</h2>
            </div>

            <!-- Standard Section (PaaS and Product Standard) -->
            <div class="mb-8">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Standard Insights</h3>
                <nav class="space-y-1">
                    <button v-for="db in standardDashboards" :key="db.slug"
                            @click="selectDashboard(db.slug)"
                            :class="['w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3', 
                                     selectedSlug === db.slug ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']">
                        <!-- Removed the 'dashboard' text label, kept it clean like Report Library -->
                        <span class="material-icons text-lg opacity-50" :class="{'text-white': selectedSlug === db.slug}"></span>
                        {{ db.name }}
                    </button>
                </nav>
            </div>

            <!-- Bespoke Section (Subscriber Specific) -->
            <div v-if="customDashboards.length > 0">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">My Custom Insights</h3>
                <nav class="space-y-1">
                    <button v-for="db in customDashboards" :key="db.slug"
                            @click="selectDashboard(db.slug)"
                            :class="['w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3', 
                                     selectedSlug === db.slug ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']">
                        <span class="material-icons text-lg opacity-50" :class="{'text-white': selectedSlug === db.slug}"></span>
                        {{ db.name }}
                    </button>
                </nav>
            </div>
        </aside>

        <!-- Main Content (Dashboard Renderer) -->
        <main class="flex-1 overflow-y-auto">
            <div v-if="loading" class="h-full flex items-center justify-center">
                 <div class="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
            
            <!-- ADD THE :key="selectedSlug" HERE -->
            <div v-else-if="selectedSlug" :key="selectedSlug">
                <DashboardPortal 
                :slug="selectedSlug" 
                :product-slug="(route.params.productSlug as string)" 
                />
            </div>

            <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
                <span class="material-icons text-6xl mb-4">dashboard_customize</span>
                <p class="text-lg">Select a dashboard from the Insights Hub.</p>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';
import DashboardPortal from './DashboardPortal.vue';

const route = useRoute();
const router = useRouter();

const dashboards = ref<any[]>([]);
const selectedSlug = ref<string | null>(null);
const loading = ref(true);

const loadLibrary = async () => {
    loading.value = true;
    const pSlug = route.params.productSlug;
    try {
        const response = await apiClient.get(`/${pSlug}/reports`, {
            params: { definition_type: 'dashboard' }
        });
        dashboards.value = response.data;
        
        // Auto-selection: URL slug first, then first available dashboard
        if (route.params.slug) {
            selectedSlug.value = route.params.slug as string;
        } else if (dashboards.value.length > 0) {
            selectedSlug.value = dashboards.value[0].slug;
        }
    } catch (err) {
        console.error("Dashboard Library Load Error", err);
    } finally {
        loading.value = false;
    }
};

/**
 * THE FIX: Defensive filtering. 
 * Checks both camelCase and snake_case to ensure the groups are split correctly.
 */
const standardDashboards = computed(() => {
    return dashboards.value.filter(d => {
        const rClass = d.reportClass || d.report_class;
        return rClass !== 'subscriber_specific';
    });
});

const customDashboards = computed(() => {
    return dashboards.value.filter(d => {
        const rClass = d.reportClass || d.report_class;
        return rClass === 'subscriber_specific';
    });
});

const selectDashboard = (slug: string) => {
    selectedSlug.value = slug;
    router.push({ 
        name: 'operational.dashboard', 
        params: { productSlug: route.params.productSlug, slug: slug } 
    });
};

onMounted(loadLibrary);
</script>

<style scoped>
.widget-dashboard { height: calc(100vh - 64px); }
</style>