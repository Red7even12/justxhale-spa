<template>
    <div class="max-w-4xl mx-auto p-8 bg-white shadow rounded-xl border">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Build Custom Report</h2>

        <!-- New: Adapt Existing Report Dropdown -->
        <div class="mb-8 p-4 bg-gray-50 border rounded-lg">
            <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-bold text-gray-700">Modify Existing Report?</label>
                
                <button 
                    @click="deleteReport" 
                    :disabled="!selectedReportSlug"
                    type="button"
                    class="text-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded shadow-sm transition flex items-center gap-1"
                >
                    <i class="fas fa-trash text-[10px]"></i>
                    Delete Report
                </button>
            </div>

            <div class="flex gap-2">
                <select v-model="selectedReportSlug" class="w-full border rounded-lg p-3 bg-white">
                    <option value="">-- Create New Report --</option>
                    <option v-for="report in sortedExistingReports" :key="report.slug" :value="report.slug">
                        {{ report.name }} ({{ report.report_class }})
                    </option>
                </select>

                <!-- Refresh Button -->
                <button @click="fetchExistingReports" title="Refresh list" class="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2 px-4">
                    <i class="fas fa-sync-alt text-gray-600"></i>
                    <span class="text-xs font-bold text-gray-600 uppercase">Refresh</span>
                </button>
            </div>
            <p class="text-[10px] text-gray-500 mt-2 italic">
                * Select a report to load its configuration for adjustment.
            </p>
        </div>
                
        <!-- 1. Select Data Source (Base View) -->
        <div class="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-bold text-gray-700">1. Select Data Source (Base View)</label>
                
                <!-- NEW BUTTON HERE -->
                <button 
                    @click="openViewCreator" 
                    type="button"
                    class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow-sm transition flex items-center gap-1"
                >
                    <i class="fas fa-database text-[10px]"></i>
                    Create New View
                </button>
            </div>

            <div class="flex gap-2">
                <select v-model="selectedView" class="w-full border rounded-lg p-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option v-for="view in sortedAvailableViews" :key="view" :value="view">
                        {{ view }}
                    </option>
                </select>
                
                <!-- Refresh Button to pick up newly created views without reloading page -->
                <button @click="fetchViews" title="Refresh list" class="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2 px-4">
                    <i class="fas fa-sync-alt text-gray-600"></i>
                    <span class="text-xs font-bold text-gray-600 uppercase">Refresh</span>
                </button>
            </div>
            <p class="text-[10px] text-gray-500 mt-2 italic">
                * Changing the view will reset your current column selection.
            </p>
        </div>

        <!-- New Subscriber Selection Section (Only for Admins) -->
        <div v-if="subscribers.length > 0" class="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <label class="block text-sm font-bold text-blue-800 mb-2">Scope: Who should see this report?</label>
            <select v-model="selectedSubscriberId" class="w-full border rounded-lg p-3 bg-white">
                <option :value="null">Product Standard (Visible to ALL Subscribers)</option>
                <optgroup label="Bespoke: Limit to Specific Subscriber">
                    <option v-for="sub in sortedSubscribers" :key="sub.id" :value="sub.id">
                        {{ sub.name }} (ID: {{ sub.id }})
                    </option>
                </optgroup>
            </select>
            <p class="text-[10px] text-blue-600 mt-2 italic">
                * If you select a specific subscriber, this report will be hidden from everyone else.
            </p>
        </div>

        <!-- Report Name -->
        <div class="mb-8">
            <label class="block text-sm font-bold text-gray-700 mb-2">Report Name</label>
            <input v-model="reportName" type="text" placeholder="e.g., My Monthly File Summary"
                   class="w-full border rounded-lg p-3 text-lg focus:ring-2 focus:ring-blue-500 outline-none">
        </div>

        <!-- Column Selection -->
        <div class="mb-8">
            <label class="block text-sm font-bold text-gray-700 mb-4">Select Columns to Include</label>
            <div class="grid grid-cols-2 gap-4">
                <div v-for="field in sortedAvailableFields" :key="field.field" 
                     class="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" 
                           :id="field.field" 
                           :value="field.field" 
                           @change="toggleField(field)"
                           :checked="isFieldSelected(field.field)"
                           class="mr-3 h-5 w-5">
                    <label :for="field.field" class="cursor-pointer text-gray-700">{{ field.label }}</label>
                </div>
            </div>
        </div>

        <div v-if="selectedColumns.length > 0" class="mb-8">
            <label class="block text-sm font-bold text-gray-700 mb-2">Configure Selected Columns & Filters</label>
            <div v-for="(col, index) in selectedColumns" :key="index" class="flex items-center gap-4 p-2 bg-white border mb-2 rounded shadow-sm">
                <span class="flex-grow font-medium text-sm">{{ col.label }}</span>
                
                <!-- New: Is Filter Toggle -->
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="col.isFilter" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <span class="text-[10px] uppercase font-bold text-gray-500">Act as Filter?</span>
                </label>

                <button @click="removeColumn(index)" class="text-red-500 hover:text-red-700">✕</button>
            </div>
        </div>

        <!-- Grouping Selection -->
        <div class="mb-8">
            <label class="block text-sm font-bold text-gray-700 mb-2">Optional: Group Results By</label>
            <select v-model="groupByField" class="w-full border rounded-lg p-3 bg-gray-50">
                <option value="">No Grouping</option>
                <option v-for="field in sortedAvailableFields" :key="field.field" :value="field.field">
                    {{ field.label }}
                </option>
            </select>
        </div>

        <!-- Actions -->
        <div class="flex justify-end pt-6 border-t">
            <button @click="saveReport" :disabled="saving"
                    class="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all">
                {{ saving ? 'Saving Blueprint...' : (selectedReportSlug ? 'Update Report' : 'Create Report & View Data') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRoute to get params
import apiClient from '../../services/api';

const props = defineProps<{
    productSlug: string; 
}>();

const route = useRoute();
const router = useRouter();
const internalProductSlug = computed(() => props.productSlug || (route.params.slug as string));

const subscribers = ref<any[]>([]);
const selectedSubscriberId = ref<number | null>(null); // Default to NULL (Product Standard)
const selectedColumns = ref<any[]>([]);
const existingReports = ref<any[]>([]);
const selectedReportSlug = ref<string>('');
const isHydrating = ref(false); // Flag to prevent watch from clearing columns during load

const availableFields = ref<any[]>([]);
const reportName = ref('');
const groupByField = ref('');
const saving = ref(false);

const availableViews = ref<string[]>([]);
const selectedView = ref('rp_operational_case_summary'); // Default

// --- SORTING COMPUTED PROPERTIES ---
const sortedExistingReports = computed(() => {
    return [...existingReports.value].sort((a, b) => a.name.localeCompare(b.name));
});

const sortedAvailableViews = computed(() => {
    return [...availableViews.value].sort((a, b) => a.localeCompare(b));
});

const sortedSubscribers = computed(() => {
    return [...subscribers.value].sort((a, b) => a.name.localeCompare(b.name));
});

const sortedAvailableFields = computed(() => {
    return [...availableFields.value].sort((a, b) => a.label.localeCompare(b.label));
});

const fetchSubscribers = async () => {
    try {
        const response = await apiClient.get('/admin/subscribers?all=true'); 
        subscribers.value = response.data;
    } catch (error) {
        console.error("Failed to fetch subscribers", error);
    }
};

const fetchExistingReports = async () => {
    try {
        const response = await apiClient.get(`/${internalProductSlug.value}/reports`);
        existingReports.value = response.data;
    } catch (error) {
        console.error("Failed to fetch reports", error);
    }
};
const loadReportForEdit = async (slug: string) => {
    if (!slug) {
        // Reset to "New" mode
        reportName.value = '';
        selectedColumns.value = [];
        selectedSubscriberId.value = null;
        groupByField.value = '';
        selectedView.value = 'rp_operational_case_summary'; // Default
        return;
    }

    try {
        isHydrating.value = true;
        const response = await apiClient.get(`/${internalProductSlug.value}/reports/${slug}/definition`);
        const report = response.data;

        // Note: Backend uses CamelCaseResponseMiddleware
        reportName.value = report.name;
        selectedView.value = report.baseView; 
        selectedColumns.value = report.columns;
        selectedSubscriberId.value = report.subscriberId;
        groupByField.value = report.uiConfig?.defaultGroupBy || '';

        // Explicitly fetch columns for the loaded view
        await fetchColumnsForView(report.baseView);

        // Keep isHydrating true for a short moment to allow the watcher to fire (if it does)
        setTimeout(() => {
            isHydrating.value = false;
        }, 500);
    } catch (error) {
        console.error("Failed to load report definition", error);
        alert("Failed to load report for editing.");
        isHydrating.value = false;
    }
};

watch(selectedReportSlug, (newSlug) => {
    loadReportForEdit(newSlug);
});

const fetchViews = async () => {
    try {
        const response = await apiClient.get(`/admin/products/${internalProductSlug.value}/report-builder/views`);
        availableViews.value = response.data;
    } catch (error) {
        console.error("Failed to fetch views", error);
    }
};

const fetchColumnsForView = async (viewName: string) => {
    try {
        const response = await apiClient.get(`/admin/products/${internalProductSlug.value}/report-builder/views/${viewName}/columns`);
        availableFields.value = response.data;
    } catch (error) {
        console.error("Failed to fetch columns", error);
    }
};

watch(selectedView, (newView) => {
    fetchColumnsForView(newView);
    if (!isHydrating.value) {
        selectedColumns.value = []; // Reset if manually changed
    }
});

const isFieldSelected = (field: string) => {
    return selectedColumns.value.some(c => c.field === field);
};

const toggleField = (field: any) => {
    const index = selectedColumns.value.findIndex(c => c.field === field.field);
    if (index === -1) {
        addColumn(field);
    } else {
        removeColumn(index);
    }
};

const addColumn = (field: any) => {
    if (selectedColumns.value.find(c => c.field === field.field)) return;
    selectedColumns.value.push({
        field: field.field,
        label: field.label,
        dbField: field.dbField,
        isFilter: false
    });
};

const removeColumn = (index: number) => {
    selectedColumns.value.splice(index, 1);
};

onMounted(async () => {
    await Promise.all([
        fetchSubscribers(),
        fetchViews(),
        fetchExistingReports()
    ]);

    if (route.query.edit) {
        selectedReportSlug.value = route.query.edit as string;
    } else if (selectedView.value) {
        fetchColumnsForView(selectedView.value);
    }
});

const deleteReport = async () => {
    if (!selectedReportSlug.value) return;
    
    if (!confirm(`Are you sure you want to delete the report "${reportName.value}"? This cannot be undone.`)) {
        return;
    }

    try {
        await apiClient.delete(`/${internalProductSlug.value}/reports/${selectedReportSlug.value}`);
        alert("Report deleted successfully.");
        
        // Reset state
        selectedReportSlug.value = '';
        await fetchExistingReports();
    } catch (err: any) {
        console.error("Delete Error:", err);
        alert(err.response?.data?.message || "Failed to delete report.");
    }
};

const saveReport = async () => {
    if (!reportName.value || selectedColumns.value.length === 0) {
        alert("Please provide a report name and select at least one column.");
        return;
    }
    
    const slugToUse = internalProductSlug.value;
    saving.value = true;

    try {
        const payload = {
            name: reportName.value,
            baseView: selectedView.value,
            columns: selectedColumns.value, 
            subscriberId: selectedSubscriberId.value, 
            uiConfig: {
                defaultGroupBy: groupByField.value,
                allowExport: true
            }
        };

        let response;
        if (selectedReportSlug.value) {
            response = await apiClient.put(`/${slugToUse}/reports/${selectedReportSlug.value}`, payload);
        } else {
            response = await apiClient.post(`/${slugToUse}/reports`, payload);
        }
        
        router.push({ 
            name: 'admin.product.report-preview', 
            params: { 
                slug: slugToUse,
                reportSlug: response.data.slug 
            },
            query: {
                preview_subscriber_id: selectedSubscriberId.value
            }
        });

    } catch (err: any) {
        console.error("Save Error:", err);
        const errorMsg = err.response?.data?.message || "Failed to save report.";
        alert(errorMsg);
    } finally {
        saving.value = false;
    }
};

/**
 * Opens the Stage 1 View Creator in a new browser tab
 */
const openViewCreator = () => {
    // Resolve the URL for the View Creator route
    const routeData = router.resolve({ 
        name: 'admin.product.view-creator', 
        params: { slug: props.productSlug } 
    });
    
    // Open in new tab
    window.open(routeData.href, '_blank');
};
</script>