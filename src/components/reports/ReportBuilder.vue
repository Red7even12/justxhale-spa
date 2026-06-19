<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- 1. HEADER & GLOBAL SCOPING BAR -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Report Factory</h1>
      <div class="flex gap-2">
         <button v-if="selectedReportSlug" @click="resetForm" class="text-sm text-blue-600 hover:underline">
            + Create New Report
         </button>
      </div>
    </div>

    <!-- THE SCOPING BAR (The Switchboard) -->
    <div class="bg-gray-900 text-white p-4 rounded-t-xl shadow-lg border-b border-white/10 flex flex-wrap items-end gap-6 mb-0">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Report Class</label>
        <select v-model="scoping.reportClass" class="bg-gray-800 border-none rounded text-sm text-white focus:ring-2 focus:ring-blue-500 p-2">
          <option value="paas_standard">PaaS Universal</option>
          <option value="product_standard">Product Standard</option>
          <option value="subscriber_specific">Subscriber Bespoke</option>
        </select>
      </div>

      <div v-if="scoping.reportClass !== 'paas_standard'" class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Target Product</label>
        <select v-model="scoping.productId" class="bg-gray-800 border-none rounded text-sm text-white focus:ring-2 focus:ring-blue-500 p-2">
          <option :value="null">-- Select Product --</option>
          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>

        <div v-if="scoping.reportClass === 'subscriber_specific'" class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Target Subscriber</label>
        <select v-model="scoping.subscriberId" class="bg-gray-800 border-none rounded text-sm text-white focus:ring-2 focus:ring-blue-500 p-2">
            <option :value="null">-- Select Subscriber --</option>
            <!-- Use 'filteredSubscribers' here -->
            <option v-for="s in filteredSubscribers" :key="s.id" :value="s.id">
                {{ s.name }}
            </option>
        </select>
        </div>

      <div class="flex flex-col gap-1 flex-grow">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Existing Reports</label>
        <select v-model="selectedReportSlug" @change="loadExistingReport" class="bg-gray-800 border-none rounded text-sm text-white w-full p-2">
          <option value="">-- Start New Report --</option>
            <option v-for="r in availableReports" :key="r.id" :value="r.slug">
            <!-- 1. Changed report_class to reportClass -->
            <!-- 2. Added (r.reportClass || '') as a defensive guard -->
            [{{ (r.reportClass || '').replace('_', ' ') }}] {{ r.name }}
            </option>
        </select>
      </div>
    </div>

    <!-- 2. THE BUILDER CANVAS -->
    <div class="space-y-6 bg-white p-6 rounded-b-xl shadow-md border border-gray-200">
        
        <!-- View Selection -->
        <div class="p-4 bg-gray-50 border rounded-lg">
            <div class="flex justify-between items-center mb-4">
                <label class="block text-sm font-bold text-gray-700">1. Data Source (Base View)</label>
                <button @click="openViewCreator" type="button" class="text-xs bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700">
                    <i class="fas fa-database mr-1"></i> Create New View
                </button>
            </div>
            <div class="flex gap-2">
                <select v-model="selectedView" class="block w-full rounded-md border-gray-300 p-2">
                    <option value="">-- Select a View --</option>
                    <option v-for="view in availableViews" :key="view" :value="view">{{ view }}</option>
                </select>
                <button @click="fetchViews" class="p-2 bg-white border rounded text-gray-600 hover:bg-gray-100">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>

        <!-- Report Meta -->
        <div class="p-4 bg-white border rounded-lg">
            <label class="block text-sm font-bold text-gray-700 mb-2">Report Name</label>
            <input v-model="reportName" type="text" placeholder="e.g., Monthly Progress Summary"
                   class="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 p-2 border">
        </div>

        <!-- Column Discovery -->
        <div v-if="selectedView" class="p-4 bg-white border rounded-lg">
            <label class="block text-sm font-bold text-gray-700 mb-4">Select Columns to Include</label>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div v-for="field in availableFields" :key="field.field" 
                     class="flex items-center p-2 border rounded hover:bg-gray-50">
                    <input type="checkbox" :id="field.field" :checked="isFieldSelected(field.field)" @change="toggleField(field)"
                           class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
                    <label :for="field.field" class="ml-2 text-sm text-gray-700 cursor-pointer">{{ field.label }}</label>
                </div>
            </div>
        </div>

        <!-- Column Configuration (Sorting/Filtering) -->
        <div v-if="selectedColumns.length > 0" class="p-4 bg-white border rounded-lg">
            <label class="block text-sm font-bold text-gray-700 mb-4">Configure Sequence & Filters</label>
            <div class="space-y-2">
                <div v-for="(col, index) in selectedColumns" :key="index" class="flex items-center gap-4 p-2 bg-gray-50 border rounded-md">
                    <div class="flex flex-col text-[10px] text-gray-400">
                        <button @click="moveColumn(index, -1)" :disabled="index === 0" class="hover:text-indigo-600">▲</button>
                        <button @click="moveColumn(index, 1)" :disabled="index === selectedColumns.length - 1" class="hover:text-indigo-600">▼</button>
                    </div>
                    <span class="flex-grow font-medium text-sm">{{ col.label }}</span>
                    <label class="flex items-center gap-1 text-xs font-bold text-gray-500">
                        <input type="checkbox" v-model="col.isFilter" class="rounded"> FILTER?
                    </label>
                    <button @click="removeColumn(index)" class="text-red-500">✕</button>
                </div>
            </div>
        </div>

        <!-- Grouping -->
        <div v-if="selectedColumns.length > 0" class="p-4 bg-white border rounded-lg">
            <label class="block text-sm font-bold text-gray-700 mb-2">Default Grouping</label>
            <select v-model="groupByField" class="block w-full border-gray-300 rounded-md p-2 border">
                <option value="">No Grouping</option>
                <option v-for="col in selectedColumns" :key="col.field" :value="col.field">{{ col.label }}</option>
            </select>
        </div>

        <!-- Save Actions -->
        <div class="flex justify-end pt-4">
            <button @click="saveReport" :disabled="saving" class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
                {{ selectedReportSlug ? 'Update Existing Report' : 'Deploy New Report' }}
            </button>
        </div>
    </div>
  </div>

    <!-- Place this at the bottom of ReportBuilder.vue -->
    <div class="max-w-7xl mx-auto mt-10 pb-20">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-800 tracking-tight">Managed Deployed Reports</h3>
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ availableReports.length }} Active Deployments</span>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest">
                    <tr>
                        <th class="p-4">Report Name</th>
                        <th class="p-4">Class</th>
                        <th class="p-4">Target Context</th>
                        <th class="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="report in availableReports" :key="report.id" class="hover:bg-slate-50 transition-colors group">
                        <td class="p-4">
                            <div class="font-bold text-gray-700">{{ report.name }}</div>
                            <div class="text-[10px] font-mono text-blue-400">{{ report.slug }}</div>
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border" 
                                :class="getClassStyling(report.reportClass || report.report_class)">
                                {{ (report.reportClass || report.report_class || 'standard').replace('_', ' ') }}
                            </span>
                        </td>
                        <td class="p-4">
                            <div class="text-xs font-medium text-gray-500">
                                {{ getContextLabel(report) }}
                            </div>
                        </td>
                        <td class="p-4 text-right">
                            <div class="flex justify-end gap-3">
                                <button @click="loadSelectedReport(report.slug)" class="text-blue-600 hover:text-blue-900 font-black text-[11px] uppercase">
                                    Edit
                                </button>
                                <button @click="deleteReport(report)" class="text-red-400 hover:text-red-700 font-black text-[11px] uppercase">
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div v-if="availableReports.length === 0" class="p-10 text-center text-gray-400 italic text-sm">
                No reports found for the current scoping selection.
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../services/api';

const route = useRoute();
const router = useRouter();

const props = defineProps<{
    productSlug?: string;
    reportSlug?: string;
}>();

// --- STATE ---
const scoping = ref({
    reportClass: 'product_standard',
    productId: null as number | null,
    subscriberId: null as number | null
});

const products = ref<any[]>([]);
const allSubscribers = ref<any[]>([]);
const availableReports = ref<any[]>([]);
const availableViews = ref<string[]>([]);
const availableFields = ref<any[]>([]);

const selectedReportSlug = ref('');
const selectedView = ref('');
const reportName = ref('');
const selectedColumns = ref<any[]>([]);
const groupByField = ref('');

const saving = ref(false);
const isHydrating = ref(false);

// --- COMPUTED ---
const internalProductSlug = computed(() => {
    if (!scoping.value.productId) return null;
    const p = products.value.find(p => p.id === scoping.value.productId);
    return p ? p.slug : null;
});

// Dynamic filtering for subscribers based on product
const filteredSubscribers = computed(() => {
    if (!scoping.value.productId) return [];
    // The middleware turns 'product_id' into 'productId'
    return allSubscribers.value.filter(s => {
        const pId = s.productId || s.product_id; // Support both just in case
        return pId === scoping.value.productId;
    });
});

// --- DATA FETCHING ---
onMounted(async () => {
    try {
        const [prodRes, subRes, viewRes] = await Promise.all([
            apiClient.get('/admin/report-factory/products'),
            apiClient.get('/admin/report-factory/subscribers'),
            apiClient.get('/admin/report-factory/views')
        ]);
        
        products.value = prodRes.data;
        allSubscribers.value = subRes.data;
        availableViews.value = viewRes.data; 
        
        // If we have a productSlug prop (coming from a direct link), pre-set the scoping
        if (props.productSlug) {
            const p = products.value.find(p => p.slug === props.productSlug);
            if (p) {
                scoping.value.productId = p.id;
                scoping.value.reportClass = 'product_standard';
            }
        }
    } catch (err) {
        console.error("Initialization Failed", err); 
    }
});


const fetchReports = async () => {
    // 1. Guard: If 'Subscriber Bespoke' is selected, don't fetch until a subscriber is picked
    if (scoping.value.reportClass === 'subscriber_specific' && !scoping.value.subscriberId) {
        availableReports.value = [];
        return;
    }

    // 2. Guard: If 'Product Standard' is selected, don't fetch until a product is picked
    if (scoping.value.reportClass === 'product_standard' && !scoping.value.productId) {
        availableReports.value = [];
        return;
    }

    try {
        const params: any = {
            report_class: scoping.value.reportClass
        };

        // If it's a PaaS report, we explicitly want both to be NULL
        if (scoping.value.reportClass === 'paas_standard') {
            params.product_id = '';
            params.subscriber_id = '';
        } 
        // If it's a Product report, product_id must match, subscriber_id must be NULL
        else if (scoping.value.reportClass === 'product_standard') {
            params.product_id = scoping.value.productId;
            params.subscriber_id = '';
        }
        // If it's Subscriber Bespoke, both must have values
        else {
            params.product_id = scoping.value.productId;
            params.subscriber_id = scoping.value.subscriberId;
        }

        const response = await apiClient.get('/admin/report-factory/reports', { params });
        availableReports.value = response.data;
    } catch (err) {
        console.error("Failed to fetch reports", err);
    }
};

const fetchViews = async () => {
    try {
        // NEW: Global path, no slug needed
        const response = await apiClient.get('/admin/report-factory/views');
        availableViews.value = response.data;
    } catch (error) {
        console.error("Failed to fetch views", error);
    }
};

const fetchColumnsForView = async (viewName: string) => {
    if (!viewName) return;
    try {
        // NEW: Global path, no slug needed
        const response = await apiClient.get(`/admin/report-factory/views/${viewName}/columns`);
        availableFields.value = response.data;
    } catch (error) {
        console.error("Failed to fetch columns", error);
    }
};

// --- WATCHERS ---
watch(scoping, () => {
    fetchReports();
    fetchViews();
}, { deep: true });

watch(selectedView, (newView) => {
    if (newView) fetchColumnsForView(newView);
    if (!isHydrating.value) selectedColumns.value = [];
});

// --- LOGIC ---
const loadExistingReport = async () => {
    if (!selectedReportSlug.value) {
        resetForm();
        return;
    }
    
    isHydrating.value = true;
    try {
        // NEW GLOBAL PATH: No product slug needed
        const response = await apiClient.get(`/admin/report-factory/reports/${selectedReportSlug.value}`);
        const r = response.data.definition;
        
        // Populate form
        reportName.value = r.name;
        selectedView.value = r.baseView || r.base_view; 
        selectedColumns.value = r.columns;
        groupByField.value = r.uiConfig?.defaultGroupBy || r.ui_config?.defaultGroupBy || '';

        // AUTO-SYNC THE SCOPING BAR to match the report we just loaded
        scoping.value.reportClass = r.report_class || r.reportClass;
        scoping.value.productId = r.product_id || r.productId;
        scoping.value.subscriberId = r.subscriber_id || r.subscriberId;

    } catch (err) {
        console.error("Load Error", err);
    } finally {
        setTimeout(() => isHydrating.value = false, 500);
    }
};

const resetForm = () => {
    selectedReportSlug.value = '';
    reportName.value = '';
    selectedColumns.value = [];
    groupByField.value = '';
};

const toggleField = (field: any) => {
    const index = selectedColumns.value.findIndex(c => c.field === field.field);
    if (index === -1) {
        selectedColumns.value.push({ ...field, isFilter: false });
    } else {
        selectedColumns.value.splice(index, 1);
    }
};

const isFieldSelected = (field: string) => selectedColumns.value.some(c => c.field === field);

const moveColumn = (index: number, dir: number) => {
    const el = selectedColumns.value.splice(index, 1)[0];
    selectedColumns.value.splice(index + dir, 0, el);
};

const removeColumn = (index: number) => selectedColumns.value.splice(index, 1);

const saveReport = async () => {
    if (!reportName.value || !selectedView.value) {
        alert("Please provide a name and select a data source.");
        return;
    }
    
    saving.value = true;

    // Resolve which slug to use for the redirect (URL context)
    // If it's a PaaS report, we use 'global' or the first product available to render the preview
    const slugForRedirect = internalProductSlug.value || products.value[0]?.slug || 'global';

    const payload = {
        name: reportName.value,
        base_view: selectedView.value,
        columns: selectedColumns.value,
        report_class: scoping.value.reportClass,
        product_id: scoping.value.productId,
        subscriber_id: scoping.value.subscriberId,
        ui_config: { 
            defaultGroupBy: groupByField.value, 
            allowExport: true 
        }
    };

    try {
        let response;
        if (selectedReportSlug.value) {
            // UPDATE EXISTING
            response = await apiClient.put(`/admin/report-factory/reports/${selectedReportSlug.value}`, payload);
        } else {
            // CREATE NEW
            response = await apiClient.post(`/admin/report-factory/reports`, payload);
        }

        // The response contains the (potentially new) slug
        const finalReportSlug = response.data.slug || selectedReportSlug.value;

        router.push({ 
            name: 'admin.report-preview', // Matches the new name in Step 1
            params: { 
                reportSlug: finalReportSlug,
                productSlug: slugForRedirect 
            },
            query: {
                // We still send the preview ID so the viewer knows which tenant to load
                preview_subscriber_id: scoping.value.subscriberId 
            }
        });

    } catch (err: any) {
        console.error("Save Error:", err);
        alert("Failed to save report: " + (err.response?.data?.message || err.message));
    } finally {
        saving.value = false;
    }
};

const openViewCreator = () => {
    const routeData = router.resolve({ name: 'admin.view-factory' });
    window.open(routeData.href, '_blank');
};

/**
 * Physically removes the report definition from the database.
 */
const deleteReport = async (report: any) => {
    if (!confirm(`DANGER: Are you sure you want to delete the report "${report.name}"? This action cannot be undone.`)) return;

    try {
        await apiClient.delete(`/admin/report-factory/reports/${report.slug}`);
        
        // If we were currently editing this report, reset the form
        if (selectedReportSlug.value === report.slug) {
            resetForm();
        }
        
        // Refresh the list (This function already exists in your ReportBuilder)
        await fetchReports();
        alert("Report destroyed successfully.");
    } catch (e: any) {
        alert("Delete Failed: " + (e.response?.data?.message || "Internal Error"));
    }
};

/**
 * Helper to trigger the existing loadExistingReport logic from the table
 */
const loadSelectedReport = (slug: string) => {
    selectedReportSlug.value = slug;
    // This calls your existing function that hydrates the columns and view
    loadExistingReport(); 
    // Scroll back to top to see the builder
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const getContextLabel = (report: any) => {
    const rClass = report.reportClass || report.report_class;
    if (rClass === 'paas_standard') return 'Universal Access';
    if (rClass === 'product_standard') return report.product?.name || 'Product Standard';
    return `${report.subscriber?.name || 'Subscriber'} (${report.product?.name || 'Bespoke'})`;
};

const getClassStyling = (reportClass: string) => {
    if (reportClass === 'paas_standard') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (reportClass === 'product_standard') return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-purple-50 text-purple-600 border-purple-100';
};


</script>