<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../../services/api';
import ReportViewer from '../../components/reports/ReportViewer.vue';

const route = useRoute();
const reports = ref<any[]>([]);
const selectedReportSlug = ref<string | null>(null);
const loading = ref(true);

const loadLibrary = async () => {
    loading.value = true;
    const productSlug = route.params.productSlug;
    try {
        const response = await apiClient.get(`/${productSlug}/reports`);
        reports.value = response.data;
        
        // If a slug is in the URL, select it automatically
        if (route.params.reportSlug) {
            selectedReportSlug.value = route.params.reportSlug as string;
        }
    } catch (err) {
        console.error("Library Load Error", err);
    } finally {
        loading.value = false;
    }
};

const standardReports = computed(() => reports.value.filter(r => r.reportClass !== 'subscriber_specific'));
const customReports = computed(() => reports.value.filter(r => r.reportClass === 'subscriber_specific'));

const selectReport = (slug: string) => {
    selectedReportSlug.value = slug;
    // Optional: Update the URL without a full page reload if you want bookmarking
};

onMounted(() => loadLibrary());
</script>

<template>
    <div class="reports-dashboard flex h-full bg-gray-50">
        <!-- Sidebar Library -->
        <aside class="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 shadow-sm">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-xl font-bold text-gray-800">Report Library</h2>
            
            </div>

            <!-- Standard Section -->
            <div class="mb-8">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Standard Reports</h3>
                <nav class="space-y-1">
                    <button v-for="report in standardReports" :key="report.slug"
                            @click="selectReport(report.slug)"
                            :class="['w-full text-left px-4 py-3 rounded-lg text-sm transition-all', 
                                     selectedReportSlug === report.slug ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']">
                        {{ report.name }}
                    </button>
                </nav>
            </div>

            <!-- Custom Section -->
            <div v-if="customReports.length > 0">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">My Custom Reports</h3>
                <nav class="space-y-1">
                    <button v-for="report in customReports" :key="report.slug"
                            @click="selectReport(report.slug)"
                            :class="['w-full text-left px-4 py-3 rounded-lg text-sm transition-all', 
                                     selectedReportSlug === report.slug ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100']">
                        {{ report.name }}
                    </button>
                </nav>
            </div>
        </aside>

        <!-- Main Content (Viewer) -->
        <main class="flex-1 p-8 overflow-y-auto">
            <div v-if="selectedReportSlug">
                <ReportViewer 
                    :product-slug="(route.params.productSlug as string)" 
                    :report-slug="selectedReportSlug" 
                    :key="selectedReportSlug" 
                />
            </div>
            
            <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
                <span class="material-icons text-6xl mb-4">analytics</span>
                <p class="text-lg">Select a report from the library to view your data.</p>
            </div>
        </main>
    </div>
</template>

<style scoped>
.reports-dashboard { min-height: calc(100vh - 64px); }
</style>