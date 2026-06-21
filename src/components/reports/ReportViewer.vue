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
        <div v-if="meta?.filters && Object.keys(meta.filters).length > 0" 
            class="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            
            <!-- Use ?. here as well -->
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
                    <router-link :to="builderLink" class="hover:text-blue-600 transition-colors">
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
                <thead class="bg-gray-100 border-b">
                    <tr>
                        <th v-for="col in definition.columns" :key="col.field" 
                            @click="handleSort(col.field)"
                            class="p-4 font-semibold cursor-pointer hover:bg-gray-200 transition group"
                        >
                            <div class="flex items-center gap-2">
                                {{ col.label }}
                                
                                <!-- Sort Icons -->
                                <span class="text-[10px]">
                                    <template v-if="sortField === col.field">
                                        {{ sortDir === 'asc' ? '▲' : '▼' }}
                                    </template>
                                    <template v-else>
                                        <span class="opacity-20 group-hover:opacity-100">⇅</span>
                                    </template>
                                </span>
                            </div>
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

</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../services/api'; // Ensure this path is correct

// 1. Interfaces (Strictly Typed)
interface ColumnDefinition {
    field: string;
    label: string;
    type: string;
    isFilter?: boolean;
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
}

// 2. Props (Positioned at top for clarity)
const props = defineProps<{
    productSlug?: string;
    reportSlug: string;
    isAdminPreview?: boolean;
}>();

const route = useRoute();
const router = useRouter();

// 3. Reactive State
const definition = ref<ReportDefinition | null>(null);
const reportData = ref<any[]>([]);
const meta = ref<ReportMeta>({ filters: {} }); // Ensure filters is an empty object, not missing
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

// Filtering & Sorting State
const activeFilters = ref<Record<string, string>>({});
const sortField = ref<string | null>(null);
const sortDir = ref<'asc' | 'desc'>('asc');
const testSubscriberId = ref<string>((route.query.preview_subscriber_id as string) || '');

// 4. Core Fetch Logic (Unified)
/**
 * Fetches report definition and data from the V2 Engine.
 * Handles sorting, filtering, and admin preview overrides.
 */
const fetchReport = async () => {
    // 1. Resolve Slugs
    const rSlug = props.reportSlug || (route.params.reportSlug as string);
    const pSlug = props.productSlug || (route.params.slug as string) || (route.params.productSlug as string);

    if (!rSlug || rSlug === 'undefined') return;

    loading.value = true;
    error.value = null;

    const params: any = { 
        ...activeFilters.value,
        sortBy: sortField.value,
        sortDir: sortDir.value
    };

    // --- CONTEXT AWARE ROUTING ---
    let apiPath = '';

    if (props.isAdminPreview) {
        // MATCHES: api/v1/admin/report-factory/reports/{slug}
        apiPath = `/admin/report-factory/reports/${rSlug}`;
        if (testSubscriberId.value) {
            params.preview_subscriber_id = testSubscriberId.value;
        }
    } else {
        // MATCHES: api/v1/{productSlug}/reports/{slug}
        apiPath = `/${pSlug}/reports/${rSlug}`;
    }

    try {
        const response = await apiClient.get(apiPath, { params });
        
        definition.value = response.data.definition || null;
        reportData.value = response.data.data || [];
        meta.value = response.data.meta || { filters: {} };

        if (!sortField.value && definition.value?.uiConfig?.defaultSort) {
            sortField.value = definition.value.uiConfig.defaultSort;
        }
    } catch (err: any) {
        error.value = err.response?.status === 403 
            ? "Access Denied: You do not have permission for this factory route."
            : (err.response?.data?.message || "Failed to load report data.");
    } finally {
        loading.value = false;
    }
};

// 5. Event Handlers
const handleSort = (field: string) => {
    if (sortField.value === field) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortField.value = field;
        sortDir.value = 'asc';
    }
    fetchReport();
};

const handleFilterChange = () => fetchReport();

const resetFilters = () => {
    activeFilters.value = {};
    sortField.value = null;
    sortDir.value = 'asc';
    fetchReport();
};

const goBackToBuilder = () => {
    const pSlug = props.productSlug || (route.params.slug as string);
    const rSlug = props.reportSlug || (route.params.reportSlug as string);
    
    if (pSlug) {
        router.push({
            name: 'admin.product.report-builder',
            params: { slug: pSlug },
            query: { edit: rSlug }
        });
    } else {
        router.push({
            name: 'admin.report-factory',
            query: { edit: rSlug }
        });
    }
};

const downloadCsv = async () => {
    // 1. Resolve Slugs
    const rSlug = props.reportSlug || (route.params.reportSlug as string);
    // Use the same logic as fetchReport to find the product context
    const pSlug = props.productSlug || (route.params.slug as string) || (route.params.productSlug as string);

    if (!rSlug || rSlug === 'undefined') return;

    // 2. CONTEXT AWARE EXPORT PATH
    const exportPath = props.isAdminPreview 
        ? `/admin/report-factory/reports/${rSlug}/export` 
        : `/${pSlug}/reports/${rSlug}/export`; // ADDED pSlug here

    try {
        const params: any = { 
            ...activeFilters.value,
            sortBy: sortField.value,
            sortDir: sortDir.value
        };
        
        if (props.isAdminPreview && testSubscriberId.value) {
            params.preview_subscriber_id = testSubscriberId.value;
        }

        const response = await apiClient.get(exportPath, {
            params,
            responseType: 'blob'
        });
        
        // 3. Trigger Browser Download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        
        link.href = url;
        link.setAttribute('download', `${rSlug}-${date}.csv`);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        console.error("Export Error:", err);
        alert("Failed to export CSV. Please check your permissions.");
    }
};

// 6. Watchers & Lifecycle
// Watch for slug changes (important when switching reports in the same view)
watch(() => props.reportSlug, () => {
    fetchReport();
});

// Watch for Test ID changes in Admin Preview mode
watch(testSubscriberId, () => {
    if (props.isAdminPreview) fetchReport();
});

onMounted(() => {
    fetchReport();
});

// 7. Computed Logic
const builderLink = computed(() => {
    const pSlug = props.productSlug || (route.params.slug as string);
    const rSlug = props.reportSlug || (route.params.reportSlug as string);
    if (pSlug) {
        return {
            name: 'admin.product.report-builder',
            params: { slug: pSlug },
            query: { edit: rSlug }
        };
    }
    return {
        name: 'admin.report-factory',
        query: { edit: rSlug }
    };
});

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
</script>

<style scoped>
.report-container { width: 100%; padding: 20px; }
</style>