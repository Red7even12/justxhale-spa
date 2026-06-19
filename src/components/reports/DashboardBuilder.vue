<!-- frontend-spa/src/components/reports/DashboardBuilder.vue -->
<template>
  <div class="p-6 max-w-7xl mx-auto pb-20">
    
    <!-- 1. HEADER & SCOPING BAR -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Factory</h1>
    </div>

    <div class="flex flex-col bg-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <!-- THE SWITCHBOARD (Scoping Bar) -->
        <div class="bg-gray-900 text-white p-4 flex flex-wrap items-end gap-6 z-30 shadow-2xl">
            <!-- 1. DASHBOARD CLASS -->
            <div class="flex flex-col gap-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Dashboard Class</label>
                <select v-model="scoping.reportClass" @change="handleClassChange" class="bg-gray-800 border-none rounded text-xs text-white p-2 min-w-[140px]">
                    <option value="paas_standard">PaaS Universal</option>
                    <option value="product_standard">Product Standard</option>
                    <option value="subscriber_specific">Subscriber Bespoke</option>
                </select>
            </div>

            <!-- 2. TARGET PRODUCT -->
            <div v-if="scoping.reportClass !== 'paas_standard'" class="flex flex-col gap-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Target Product</label>
                <select v-model="scoping.productId" @change="handleProductChange" class="bg-gray-800 border-none rounded text-xs text-white p-2 min-w-[140px]">
                    <option :value="null">-- Select Product --</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
            </div>

            <!-- 3. TARGET SUBSCRIBER -->
            <div v-if="scoping.reportClass === 'subscriber_specific'" class="flex flex-col gap-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Target Subscriber</label>
                <select v-model="scoping.subscriberId" @change="fetchDashboards" class="bg-gray-800 border-none rounded text-xs text-white p-2 min-w-[160px]">
                    <option :value="null">-- Select Subscriber --</option>
                    <option v-for="s in filteredSubscribers" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
            </div>

            <!-- 4. EXISTING DASHBOARDS -->
            <div class="flex flex-col gap-1 w-56">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Existing Dashboards</label>
                <select v-model="selectedDashboardSlug" @change="loadDashboard" class="bg-gray-800 border-none rounded text-xs text-white p-2 w-full">
                    <option value="">-- Create New Dashboard --</option>
                    <option v-for="d in availableDashboards" :key="d.id" :value="d.slug">
                        [{{ (d.reportClass || 'standard').replace('_', ' ') }}] {{ d.name }}
                    </option>
                </select>
            </div>

            <!-- 5. DASHBOARD TITLE -->
            <div class="flex-grow flex flex-col gap-1">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dashboard Title</label>
                <input v-model="form.name" class="bg-transparent border-b border-gray-700 text-lg font-black w-full outline-none focus:border-blue-500" placeholder="Enter Dashboard Title...">
            </div>

            <button @click="saveDashboard" :disabled="saving" class="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl font-black transition shadow-lg text-sm">
                DEPLOY DASHBOARD
            </button>
        </div>

        <div class="flex flex-grow overflow-hidden" style="height: calc(100vh - 280px);">
            
            <!-- 2. LEFT: SETTINGS (The Factory) -->
            <div class="w-[450px] bg-white border-r border-gray-200 shadow-xl overflow-y-auto z-0 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Widget Construction</h3>
                    <button @click="addNewWidget" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all">+ Add Widget</button>
                </div>

                <div class="space-y-6">
                    <div v-for="(w, idx) in form.widgets" :key="w.id" class="p-5 border border-gray-100 rounded-2xl bg-white hover:border-indigo-200 transition-all shadow-sm">
                        <!-- Widget Type & Sort Row -->
                        <div class="flex justify-between items-center mb-4">
                            <select v-model="w.type" class="text-[10px] font-black bg-indigo-600 text-white rounded-lg px-2 py-1 uppercase border-none shadow-sm">
                                <option value="bar_chart">Bar Chart</option>
                                <option value="donut_chart">Donut Chart</option>
                                <option value="pie_chart">Pie Chart</option>
                                <option value="line_chart">Line Chart</option>
                                <option value="gauge_dial">Gauge Dial</option>
                                <option value="kpi_card">KPI Card</option>
                            </select>
                            <div class="flex gap-3">
                                <button @click="moveWidget(idx, -1)" :disabled="idx === 0" class="text-gray-300 hover:text-indigo-600 transition">▲</button>
                                <button @click="moveWidget(idx, 1)" :disabled="idx === form.widgets.length -1" class="text-gray-300 hover:text-indigo-600 transition">▼</button>
                                <button @click="removeWidget(idx)" class="text-red-300 hover:text-red-500 transition">✕</button>
                            </div>
                        </div>

                        <!-- Core Config -->
                        <div class="space-y-3">
                            <input v-model="w.dataSource.label" placeholder="Display Label" class="w-full text-sm font-black border-b border-gray-100 focus:border-indigo-500 outline-none pb-1">
                            
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Width</label>
                                    <select v-model="w.width" class="w-full text-xs border-gray-200 rounded p-1">
                                        <option value="1/4">25% (Small)</option>
                                        <option value="1/2">50% (Med)</option>
                                        <option value="full">100% (Row)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest">View (SQL Source)</label>
                                    <select v-model="w.dataSource.view" @change="fetchViewColumns(w.dataSource.view)" class="w-full text-xs border-gray-200 rounded p-1">
                                        <option v-for="v in availableViews" :key="v" :value="v">{{ v }}</option>
                                    </select>
                                </div>
                            </div>

                            <!-- A. DISTRIBUTION SETTINGS (Bar, Donut, Pie) -->
                            <div v-if="['bar_chart', 'donut_chart', 'pie_chart'].includes(w.type)" class="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                    <label class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Dimension (Labels)</label>
                                    <select v-model="w.dataSource.dimension" class="w-full text-xs border-indigo-100 bg-indigo-50/30 rounded p-1">
                                        <option v-for="col in columns[w.dataSource.view]" :key="col.field" :value="col.dbField">{{ col.label }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-[9px] font-black text-gray-400 uppercase">Limit (Top n)</label>
                                    <input type="number" v-model="w.dataSource.limit" class="w-full text-xs border-gray-200 rounded p-1">
                                </div>
                            </div>

                            <!-- B. TREND SETTINGS (Line Chart) -->
                            <div v-if="w.type === 'line_chart'" class="mt-3">
                                <label class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Time Dimension (Date Column)</label>
                                <select v-model="w.dataSource.date_column" class="w-full text-xs border-indigo-100 bg-indigo-50/30 rounded p-1">
                                    <option v-for="col in columns[w.dataSource.view]" :key="col.field" :value="col.dbField">{{ col.label }}</option>
                                </select>
                            </div>

                            <!-- C. CONDITION & TARGET SETTINGS (Gauge & KPI) -->
                            <div v-if="['gauge_dial', 'kpi_card'].includes(w.type)" class="mt-3 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <!-- Measurement -->
                                <div>
                                    <label class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Column to Measure</label>
                                    <select v-model="w.dataSource.metric" class="w-full text-xs border-gray-200 rounded p-1">
                                        <option value="*">Count All Records</option>
                                        <option v-for="col in columns[w.dataSource.view]" :key="col.field" :value="col.dbField">{{ col.label }}</option>
                                    </select>
                                </div>

                                <!-- Condition (The Take-On Fix) -->
                                <div v-if="w.dataSource.metric !== '*'" class="grid grid-cols-2 gap-2">
                                    <div>
                                        <label class="text-[8px] font-black text-gray-400 uppercase">Operator</label>
                                        <select v-model="w.dataSource.match_operator" class="w-full text-[10px] border-gray-200 rounded p-1">
                                            <option value="">No Condition</option>
                                            <option value="=">Equals (=)</option>
                                            <option value=">">Greater Than (&gt;)</option>
                                            <option value="is_true">Is TRUE</option>
                                            <option value="is_false">Is FALSE</option>
                                            <option value="is_not_zero">Is Not Zero</option>
                                        </select>
                                    </div>
                                    <div v-if="['=', '>', '!='].includes(w.dataSource.match_operator)">
                                        <label class="text-[8px] font-black text-gray-400 uppercase">Value</label>
                                        <input v-model="w.dataSource.match_value" type="text" class="w-full text-[10px] border-gray-200 rounded p-1">
                                    </div>
                                </div>

                                <!-- Target Logic (GAUGE ONLY) -->
                                <div v-if="w.type === 'gauge_dial'" class="pt-2 border-t border-slate-200">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-[9px] font-black text-indigo-400 uppercase">Target Goal</span>
                                        <div class="flex bg-white rounded border p-0.5">
                                            <button @click="w.dataSource.target_type = 'static'" :class="w.dataSource.target_type !== 'dynamic' ? 'bg-indigo-600 text-white' : 'text-gray-400'" class="text-[8px] font-bold px-2 py-0.5 rounded">STATIC</button>
                                            <button @click="w.dataSource.target_type = 'dynamic'" :class="w.dataSource.target_type === 'dynamic' ? 'bg-indigo-600 text-white' : 'text-gray-400'" class="text-[8px] font-bold px-2 py-0.5 rounded">DYNAMIC</button>
                                        </div>
                                    </div>
                                    <div v-if="w.dataSource.target_type === 'dynamic'" class="space-y-2 mt-2">
                                        <div class="flex items-center justify-between">
                                            <label class="text-[8px] font-black text-gray-400 uppercase">Target Measurement</label>
                                            <div class="flex bg-white rounded border p-0.5">
                                                <button @click="w.dataSource.target_aggregate = 'count'" 
                                                        :class="w.dataSource.target_aggregate !== 'sum' ? 'bg-indigo-600 text-white' : 'text-gray-400'"
                                                        class="text-[7px] font-bold px-2 py-0.5 rounded">COUNT</button>
                                                <button @click="w.dataSource.target_aggregate = 'sum'" 
                                                        :class="w.dataSource.target_aggregate === 'sum' ? 'bg-indigo-600 text-white' : 'text-gray-400'"
                                                        class="text-[7px] font-bold px-2 py-0.5 rounded">SUM</button>
                                            </div>
                                        </div>
                                        <select v-model="w.dataSource.target_column" class="w-full text-xs border-gray-200 rounded p-1">
                                            <option v-for="col in columns[w.dataSource.view]" :key="col.field" :value="col.dbField">{{ col.label }}</option>
                                        </select>
                                    </div>
                                    <div v-else>
                                        <input v-model="w.dataSource.target_value" type="number" class="w-full text-xs border-gray-200 rounded p-1">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. RIGHT: LIVE PREVIEW -->
            <div class="flex-grow overflow-y-auto bg-gray-100 shadow-inner p-2">
                <DashboardViewer 
                    v-if="form.widgets.length > 0"
                    :definition="{ name: form.name, uiConfig: { widgets: form.widgets } }" 
                    :results="previewResults" 
                    :isAdminPreview="true"
                    :subscribers="uniqueSubscribersForPreview" 
                    v-model:previewSubscriberId="previewSubscriberId"
                />
                <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 italic">
                    <span class="material-icons text-6xl mb-2 opacity-20">dashboard_customize</span>
                    <p class="font-bold uppercase tracking-widest text-[10px]">Add a widget to begin designing</p>
                </div>
            </div>
        </div>
    </div>
  </div>

  <!-- Place this at the very bottom of DashboardBuilder.vue, outside the h-screen flex container if needed, or inside the left column -->
    <div class="max-w-7xl mx-auto p-6 mt-10 pb-20">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-800 tracking-tight">Managed Deployed Dashboards</h3>
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ availableDashboards.length }} Active Deployments</span>
            </div>

            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest">
                    <tr>
                        <th class="p-4">Dashboard Name</th>
                        <th class="p-4">Class</th>
                        <th class="p-4">Target Context</th>
                        <th class="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="db in availableDashboards" :key="db.id" class="hover:bg-slate-50 transition-colors group">
                        <td class="p-4">
                            <div class="font-bold text-gray-700">{{ db.name }}</div>
                            <div class="text-[10px] font-mono text-indigo-400">{{ db.slug }}</div>
                        </td>
                        <td class="p-4">
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border" 
                                :class="getClassStyling(db.reportClass)">
                                {{ (db.reportClass || 'standard').replace('_', ' ') }}
                            </span>
                        </td>
                        <td class="p-4">
                            <div class="text-xs font-medium text-gray-500">
                                {{ getContextLabel(db) }}
                            </div>
                        </td>
                        <td class="p-4 text-right">
                            <div class="flex justify-end gap-3">
                                <button @click="loadSelectedDashboard(db.slug)" class="text-indigo-600 hover:text-indigo-900 font-black text-[11px] uppercase">
                                    Edit
                                </button>
                                <button @click="deleteDashboard(db)" class="text-red-400 hover:text-red-700 font-black text-[11px] uppercase">
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div v-if="availableDashboards.length === 0" class="p-10 text-center text-gray-400 italic text-sm">
                No dashboards found for the current scoping selection.
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../../services/api';
import DashboardViewer from './DashboardViewer.vue';

const route = useRoute();
const dashboardSlug = ref(route.query.edit || null);

const isHydrating = ref(false); 
const selectedDashboardSlug = ref('');
const availableDashboards = ref([]);   

const form = ref({
  name: 'New Dashboard',
  widgets: [] as any[]
});

const previewResults = ref({});
const previewSubscriberId = ref(null);
const subscribers = ref([]);
const availableViews = ref([]);
const columns = ref<Record<string, any[]>>({});
const saving = ref(false);

const addNewWidget = () => {
  const newId = 'w' + Math.random().toString(36).substring(2, 9);
  form.value.widgets.push({
    id: newId,
    type: 'bar_chart',
    width: '1/4',
    dataSource: { 
      label: 'New Metric', 
      view: '', 
      dimension: '', 
      limit: 10,
      metric: '*',
      // --- THE CRITICAL KEYS FOR SAVING ---
      match_operator: '',   
      match_value: '',      
      target_type: 'static', 
      target_value: 100,
      target_aggregate: 'count', 
      target_column: '',
      date_column: ''
    }
  });
};

const loadDashboard = async () => {
    if (!selectedDashboardSlug.value) {
        resetForm();
        return;
    }

    isHydrating.value = true;

    try {
        const response = await apiClient.get(`/admin/report-factory/reports/${selectedDashboardSlug.value}`);
        const d = response.data.definition;

        form.value.name = d.name;
        scoping.value.reportClass = d.reportClass || d.report_class;
        scoping.value.productId = d.productId || d.product_id;
        scoping.value.subscriberId = d.subscriberId || d.subscriber_id;

        const rawWidgets = d.uiConfig?.widgets || d.ui_config?.widgets || [];
        
        form.value.widgets = rawWidgets.map(w => {
            // Get the data source object regardless of naming
            const ds = w.dataSource || w.data_source || {};

            return {
                ...w,
                dataSource: {
                    // FORCE MAPPING: camelCase (API) -> snake_case (Template)
                    view: ds.view || '',
                    label: ds.label || '',
                    metric: ds.metric || '*',
                    dimension: ds.dimension || '',
                    limit: ds.limit || 10,
                    
                    // The Gauge/KPI Logic Fix
                    match_operator: ds.match_operator || ds.matchOperator || '',
                    match_value: ds.match_value || ds.matchValue || '',
                    
                    // The Target Logic Fix
                    target_type: ds.target_type || ds.targetType || 'static',
                    target_value: ds.target_value || ds.targetValue || 100,
                    target_aggregate: ds.target_aggregate || ds.targetAggregate || 'count',
                    target_column: ds.target_column || ds.targetColumn || '',
                    
                    // The Line Chart Fix
                    date_column: ds.date_column || ds.dateColumn || ''
                }
            };
        });

        // Fetch columns for the views so the dropdowns have options to show
        form.value.widgets.forEach(w => {
            if (w.dataSource?.view) fetchViewColumns(w.dataSource.view);
        });

        await fetchPreview();

    } catch (err) {
        console.error("Hydration Error:", err);
        alert("Failed to load dashboard settings.");
    } finally {
        setTimeout(() => { isHydrating.value = false; }, 500);
    }
};

const resetForm = () => {
    form.value.name = 'New Management Dashboard';
    form.value.widgets = [];
    router.push({ query: {} });
};

const fetchDashboards = async () => {
    try {
        const params = { 
            definition_type: 'dashboard', // CRITICAL: Only get dashboards
            report_class: scoping.value.reportClass 
        };

        // Standard Cascade Logic
        if (scoping.value.reportClass !== 'paas_standard') {
            params.product_id = scoping.value.productId || ''; // Send empty string if null for backend check
        }
        if (scoping.value.reportClass === 'subscriber_specific') {
            params.subscriber_id = scoping.value.subscriberId || '';
        }

        const res = await apiClient.get('/admin/report-factory/reports', { params });
        availableDashboards.value = res.data;
    } catch (e) { console.error("Dropdown fetch failed", e); }
};

const fetchViewColumns = async (viewName: string) => {
  if (!viewName || columns.value[viewName]) return;
  const res = await apiClient.get(`/admin/report-factory/views/${viewName}/columns`);
  columns.value[viewName] = res.data;
};

/**
 * Hits the 'preview' endpoint we created earlier.
 * This sends the UNSAVED widget configuration to the backend
 * and gets real data back based on the 'Test Data Context'.
 */
const fetchPreview = async () => {
    // 1. Guard: Don't fetch if there are no widgets or no test subscriber
    if (!previewSubscriberId.value || form.value.widgets.length === 0) {
        previewResults.value = {};
        return;
    }

    // 2. Guard: Don't fetch widgets that don't have a view selected yet
    const validWidgets = form.value.widgets.filter(w => w.dataSource.view);
    if (validWidgets.length === 0) return;

    try {
        const response = await apiClient.post('/admin/report-factory/dashboards/preview', {
            widgets: validWidgets,
            preview_subscriber_id: previewSubscriberId.value
        });
        
        // 3. Update the results. The DashboardViewer is watching this!
        previewResults.value = response.data;
    } catch (err) {
        console.error("Preview Engine Error:", err.response?.data || err.message);
    }
};

// 4. CRITICAL: Watch for any changes in the widget array
// Whenever you change a label, a width, or a view, this fires.
watch(() => form.value.widgets, () => {
    fetchPreview();
}, { deep: true });

// Also re-fetch if you switch the "Test Data Context" subscriber
watch(previewSubscriberId, fetchPreview);

const moveWidget = (idx: number, dir: number) => {
  const item = form.value.widgets.splice(idx, 1)[0];
  form.value.widgets.splice(idx + dir, 0, item);
};

const removeWidget = (idx: number) => form.value.widgets.splice(idx, 1);

// --- SCOPING STATE ---
const scoping = ref({
  reportClass: 'product_standard',
  productId: null,
  subscriberId: null
});

const products = ref([]);
const allSubscribers = ref([]);

// Filter subscribers based on product selection (Standard JustXhale Pattern)
// --- COMPUTED: CLEAN LIST FOR THE YELLOW BAR ---
const uniqueSubscribersForPreview = computed(() => {
    const map = new Map();
    
    allSubscribers.value.forEach(s => {
        // Use the subscriber ID as the unique key. 
        // If "Prop Tax" appears twice, the Map just overwrites the previous entry.
        const id = s.id || s.subscriber_id;
        if (id) {
            map.set(id, s);
        }
    });

    // Convert back to array and sort alphabetically
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
});

// 2. THE FILTERED LIST (Fed from the clean master list)
// Use this for the Black Scoping Bar
const filteredSubscribers = computed(() => {
    if (!scoping.value.productId) return [];
    
    // Filter the ALREADY UNIQUE list by the selected product
    return uniqueAllSubscribers.value.filter(s => {
        const pId = s.productId || s.product_id;
        return pId === scoping.value.productId;
    });
});


const saveDashboard = async () => {
    if (!form.value.name) return alert("Title required.");
    
    saving.value = true;

    // Use JSON.parse/stringify to create a "Dead" copy of the data
    // This is the safest way to ensure nested objects are saved correctly.
    const widgetData = JSON.parse(JSON.stringify(form.value.widgets));

    const payload = {
        name: form.value.name,
        definition_type: 'dashboard',
        report_class: scoping.value.reportClass,
        product_id: scoping.value.productId,
        subscriber_id: scoping.value.subscriberId,
        base_view: 'rp_dashboard_manifest',
        columns: [],
        filters: [],
        ui_config: { widgets: widgetData },
        is_active: true
    };

    try {
        if (selectedDashboardSlug.value) {
            await apiClient.put(`/admin/report-factory/reports/${selectedDashboardSlug.value}`, payload);
        } else {
            const res = await apiClient.post(`/admin/report-factory/reports`, payload);
            selectedDashboardSlug.value = res.data.slug;
        }
        alert("Dashboard Settings Saved.");
        fetchDashboards(); // Refresh the list
    } catch (e) {
        alert("Save failed.");
    } finally {
        saving.value = false;
    }
};

// 1. Watch for Class changes (PaaS/Product/Bespoke)
watch(() => scoping.value.reportClass, () => {
    if (isHydrating.value) return; // Guard: Don't reset if we are loading from DB
    
    // Reset selections based on the new class
    if (scoping.value.reportClass === 'paas_standard') {
        scoping.value.productId = null;
        scoping.value.subscriberId = null;
    }
    fetchDashboards(); // Refresh the "Existing Dashboards" list
});

// 2. Watch for Product changes
watch(() => scoping.value.productId, () => {
    if (isHydrating.value) return; // Guard
    fetchDashboards();
});

// 3. Watch for Subscriber changes
watch(() => scoping.value.subscriberId, () => {
    if (isHydrating.value) return; // Guard
    fetchDashboards();
});


// --- PREVIEW WATCHERS (The Charts) ---

// 4. Watch for Widget configuration changes
watch(() => form.value.widgets, () => {
    if (isHydrating.value) return; // Guard: Don't hammer API while loading
    fetchPreview(); 
}, { deep: true });

// 5. Watch for Test Subscriber change
watch(previewSubscriberId, () => {
    if (isHydrating.value) return; // Guard
    fetchPreview();
});

onMounted(async () => {
    const [prodRes, subRes, viewRes] = await Promise.all([
        apiClient.get('/admin/report-factory/products'),
        apiClient.get('/admin/report-factory/subscribers'),
        apiClient.get('/admin/report-factory/views')
    ]);
    products.value = prodRes.data;
    allSubscribers.value = subRes.data;
    availableViews.value = viewRes.data;

    // Set a default preview subscriber for the designer
    if (allSubscribers.value.length) previewSubscriberId.value = allSubscribers.value[0].id;
});

/**
 * Physically removes the dashboard definition from the database.
 */
const deleteDashboard = async (db: any) => {
    if (!confirm(`DANGER: Are you sure you want to delete "${db.name}"? This action cannot be undone.`)) return;

    try {
        await apiClient.delete(`/admin/report-factory/reports/${db.slug}`);
        
        // If we were currently editing this dashboard, reset the form
        if (selectedDashboardSlug.value === db.slug) {
            resetForm();
        }
        
        // Refresh the table
        await fetchDashboards();
        alert("Dashboard deleted successfully.");
    } catch (e: any) {
        alert("Delete Failed: " + (e.response?.data?.message || "Internal Error"));
    }
};

/**
 * Helper to trigger the existing loadDashboard logic from the table
 */
const loadSelectedDashboard = (slug: string) => {
    selectedDashboardSlug.value = slug;
    loadDashboard();
    // Scroll back to top to see the builder
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const getContextLabel = (db: any) => {
    if (db.reportClass === 'paas_standard') return 'Universal Access';
    if (db.reportClass === 'product_standard') return db.product?.name || 'Product Standard';
    return `${db.subscriber?.name || 'Subscriber'} (${db.product?.name || 'Bespoke'})`;
};

const getClassStyling = (reportClass: string) => {
    if (reportClass === 'paas_standard') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (reportClass === 'product_standard') return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-purple-50 text-purple-600 border-purple-100';
};

</script>