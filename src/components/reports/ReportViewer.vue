<template>
    <div class="xhale-report-viewer bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <!-- Add this UI if it's an Admin Preview -->
        <div v-if="props.isAdminPreview" class="bg-amber-50 p-4 border-b border-amber-200 flex items-center gap-4">
            <span class="text-xs font-bold text-amber-700 uppercase">Admin Preview Mode</span>
            <input v-model="testSubscriberId" 
                   type="text" 
                   placeholder="Enter Test Subscriber ID" 
                   class="border p-1 text-sm rounded">
            <button @click="fetchReport" class="bg-amber-600 text-white px-3 py-1 rounded text-sm">Load Test Data</button>
        </div>

        <!-- DYNAMIC FILTER BAR -->
        <div v-if="Object.keys(meta.filters || {}).length > 0" class="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div v-for="(filter, field) in meta.filters" :key="field" class="min-w-[200px]">
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1 leading-none">
                    Filter by {{ filter.label }}
                </label>
                <select 
                    v-model="activeFilters[field]" 
                    @change="fetchReport" 
                    class="w-full border border-gray-300 rounded-md p-2 text-sm shadow-sm bg-white"
                >
                    <option :value="null">All {{ filter.label }}s</option>
                    <option v-for="opt in filter.options" :key="opt" :value="opt">
                        {{ opt }}
                    </option>
                </select>
            </div>
            
            <!-- Reset Button -->
            <div class="flex items-end">
                <button @click="resetFilters" class="text-xs text-blue-600 hover:underline mb-2">Clear All</button>
            </div>
        </div>
        
        <!-- Header Section -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <div v-if="definition">
                <div v-if="props.isAdminPreview" class="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                    <router-link :to="{ name: 'admin.product.report-builder', params: { slug: props.productSlug || route.params.slug }, query: { edit: props.reportSlug } }" class="hover:text-blue-600 transition-colors">
                        Report Builder
                    </router-link>
                    <span class="material-icons text-[10px]">chevron_right</span>
                    <span class="text-blue-600">Preview</span>
                </div>
                <h2 class="text-xl font-semibold text-gray-800">{{ definition.name }}</h2>
                <p class="text-sm text-gray-500">Operational Report: {{ props.reportSlug }}</p>
            </div>
            <div class="flex gap-2">
                <button v-if="props.isAdminPreview" 
                        @click="goBackToBuilder"
                        class="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm font-medium hover:bg-gray-200 transition-all shadow-sm flex items-center gap-2 text-gray-700">
                    <span class="material-icons text-base">edit</span>
                    Back to Builder
                </button>

                <button @click="fetchReport" class="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                    <span class="material-icons text-sm">refresh</span>
                </button>
                <!-- Default to true if not explicitly false -->
                <button v-if="definition?.uiConfig?.allowExport !== false" 
                        @click="downloadCsv"
                        class="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
                    Export CSV
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-20 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p class="mt-4 text-gray-500 font-medium">Hydrating Report Data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-10 text-center">
            <div class="text-red-500 mb-2 font-bold uppercase tracking-wider text-xs">Load Error</div>
            <p class="text-gray-700">{{ error }}</p>
        </div>

        <!-- Data Grid -->
        <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                        <th v-for="col in definition?.columns" :key="col.field" class="px-6 py-3 font-bold border-b border-gray-200">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <!-- Case A: Grouped Rendering -->
                    <template v-if="groupedData">
                        <template v-for="(items, groupName) in groupedData" :key="groupName">
                            <tr class="bg-blue-50/50">
                                <td :colspan="definition?.columns.length" class="px-6 py-2 text-sm font-bold text-blue-800 italic">
                                    {{ groupName }} ({{ items.length }})
                                </td>
                            </tr>
                            <tr v-for="(row, idx) in items" :key="idx" class="hover:bg-gray-50 transition-colors group">
                                <td v-for="col in definition?.columns" :key="col.field" class="px-6 py-4 text-sm text-gray-700">
                                    {{ row[col.field] }}
                                </td>
                            </tr>
                        </template>
                    </template>

                    <!-- Case B: Flat List Rendering -->
                    <template v-else>
                        <tr v-for="(row, idx) in reportData" :key="idx" class="hover:bg-gray-50 transition-colors group">
                            <td v-for="col in definition?.columns" :key="col.field" class="px-6 py-4 text-sm text-gray-700">
                                {{ row[col.field] }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="reportData.length === 0" class="p-20 text-center text-gray-400 italic">
                No records found matching the report criteria.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../services/api'; 

// 1. Interfaces (Internal blueprints)
interface ColumnDefinition {
    field: string;
    label: string;
    type: string;
}

interface UiConfig {
    defaultGroupBy?: string;
    defaultSort?: string;
    allowExport?: boolean;
}

interface ReportDefinition {
    name: string;
    slug: string;
    columns: ColumnDefinition[];
    uiConfig: UiConfig;
}

interface ReportMeta {
    filters?: Record<string, { label: string, options: string[] }>;
    availableStatuses?: string[];
    availableAttorneys?: string[];
}

// 2. Props aligned with your router: props: route => ({ reportSlug: route.params.reportSlug })
const props = defineProps<{
    productSlug: string;
    reportSlug: string;
    isAdminPreview?: boolean; // Prop to allow System Admin in preview mode to select a Subscriber to feed report.
}>();

const route = useRoute();
const router = useRouter();
const testSubscriberId = ref<string>((route.query.preview_subscriber_id as string) || ''); // For Admin Preview only
const activeFilters = ref<Record<string, string>>({});
const meta = ref<ReportMeta>({});
const definition = ref<ReportDefinition | null>(null);
const reportData = ref<any[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

// 3. Fetch Logic
const fetchReport = async () => {
    loading.value = true;
    error.value = null;

    const pSlug = props.productSlug || route.params.slug || route.params.productSlug;
    const rSlug = props.reportSlug || route.params.reportSlug;

    // Only include the preview ID if it has a value
    const params: any = { ...activeFilters.value };
    if (props.isAdminPreview && testSubscriberId.value) {
        params.preview_subscriber_id = testSubscriberId.value;
    }

    try {
        const response = await apiClient.get(`/${pSlug}/reports/${rSlug}`, { params });
        definition.value = response.data.definition;
        reportData.value = response.data.data;
        meta.value = response.data.meta;
    } catch (err: any) {
        error.value = err.response?.data?.message || "Failed to load report data.";
    } finally {
        loading.value = false;
    }
};

const handleFilterChange = () => {
    fetchReport();
};

const resetFilters = () => {
    activeFilters.value = {};
    fetchReport();
};

const goBackToBuilder = () => {
    router.push({
        name: 'admin.product.report-builder',
        params: { slug: props.productSlug || (route.params.slug as string) },
        query: { edit: props.reportSlug }
    });
};

// 4. Grouping Logic
const groupedData = computed(() => {
    const groupByField = definition.value?.uiConfig?.defaultGroupBy;
    if (!groupByField || !reportData.value.length) return null;

    return reportData.value.reduce((groups: Record<string, any[]>, item: any) => {
        const val = item[groupByField] || 'Unassigned';
        if (!groups[val]) groups[val] = [];
        groups[val].push(item);
        return groups;
    }, {});
});

onMounted(() => fetchReport());

const downloadCsv = async () => {
    const pSlug = props.productSlug || route.params.slug || route.params.productSlug;
    const rSlug = props.reportSlug || route.params.reportSlug;

    try {
        /**
         * FIX: We only provide the relative path. 
         * Axios will automatically prepend the 'api/v1' from your baseURL.
         * We also pass the filters directly to the 'params' object.
         */
        const params: any = { ...activeFilters.value };
        if (props.isAdminPreview && testSubscriberId.value) {
            params.preview_subscriber_id = testSubscriberId.value;
        }

        const response = await apiClient.get(`/${pSlug}/reports/${rSlug}/export`, {
            params: params, 
            responseType: 'blob'         // Required for file downloads
        });
        
        // Create the download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename: e.g., cases-by-milestone-status-2025-06-08.csv
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `${rSlug}-${date}.csv`);
        
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        console.error("Export failed:", err);
        alert("Failed to export CSV. Please check your network or permissions.");
    }
};
</script>

<style scoped>
.report-container { width: 100%; padding: 20px; }
</style>