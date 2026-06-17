<!-- frontend-spa/src/components/reports/DashboardBuilder.vue -->
<template>
  <div class="p-6 max-w-7xl mx-auto">
    
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard Factory</h1>
    </div>

    <div class="flex flex-col bg-gray-50 rounded-xl shadow-md border overflow-hidden">
    <!-- THE SWITCHBOARD (Scoping Bar) -->
    <div class="bg-gray-900 text-white p-4 flex flex-wrap items-end gap-6 z-30 shadow-2xl">
    <!-- 1. Class Selection -->
        <!-- 1. DASHBOARD CLASS (Existing) -->
        <div class="flex flex-col gap-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Dashboard Class</label>
            <select v-model="scoping.reportClass" @change="handleClassChange" class="bg-gray-800 border-none rounded text-xs text-white p-2 min-w-[150px]">
            <option value="paas_standard">PaaS Universal</option>
            <option value="product_standard">Product Standard</option>
            <option value="subscriber_specific">Subscriber Bespoke</option>
            </select>
        </div>

        <!-- 2. TARGET PRODUCT (Existing) -->
        <div v-if="scoping.reportClass !== 'paas_standard'" class="flex flex-col gap-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Target Product</label>
            <select v-model="scoping.productId" @change="handleProductChange" class="bg-gray-800 border-none rounded text-xs text-white p-2 min-w-[150px]">
            <option :value="null">-- Select Product --</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
        </div>

        <!-- 3. TARGET SUBSCRIBER (Existing) -->
        <div v-if="scoping.reportClass === 'subscriber_specific'" class="flex flex-col gap-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Target Subscriber</label>
            <select v-model="scoping.subscriberId" @change="fetchDashboards" class="bg-gray-800 border-none rounded text-xs text-white p-2 min-w-[180px]">
            <option :value="null">-- Select Subscriber --</option>
            <option v-for="s in filteredSubscribers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
        </div>

        <!-- 4. EXISTING DASHBOARDS (Selection for Editing) - YOUR CODE BLOCK -->
        <div class="flex flex-col gap-1 w-64">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Existing Dashboards</label>
            <select v-model="selectedDashboardSlug" @change="loadDashboard" class="bg-gray-800 border-none rounded text-xs text-white p-2 w-full">
            <option value="">-- Create New Dashboard --</option>
            <option v-for="d in availableDashboards" :key="d.id" :value="d.slug">
                [{{ (d.reportClass || 'standard').replace('_', ' ') }}] {{ d.name }}
            </option>
            </select>
        </div>

        <!-- 5. DASHBOARD TITLE (The Fix for the "New Dashboard" name issue) -->
        <div class="flex-grow flex flex-col gap-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dashboard Title (Displayed to User)</label>
            <input v-model="form.name" class="bg-transparent border-b border-gray-700 text-lg font-black w-full outline-none focus:border-blue-500" placeholder="Enter Dashboard Title...">
        </div>

        <button @click="saveDashboard" class="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-black transition shadow-lg">
            DEPLOY DASHBOARD
        </button>
    </div>

     <div class="flex flex-grow overflow-hidden" style="height: calc(100vh - 300px);">
        
        <!-- 2. LEFT: SETTINGS (The Factory) -->
        <div class="w-[450px] bg-white border-r shadow-xl overflow-y-auto z-0">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-sm font-black text-gray-800 uppercase tracking-tighter">Widget Construction</h3>
            <button @click="addNewWidget" class="bg-gray-100 hover:bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs font-bold">+ Add Widget</button>
          </div>

          <div class="space-y-6">
            <div v-for="(w, idx) in form.widgets" :key="w.id" class="p-4 border border-gray-200 rounded-2xl bg-white hover:border-blue-300 transition-all shadow-sm">
              <!-- Widget Toolbar -->
              <div class="flex justify-between items-center mb-4">
                <select v-model="w.type" class="text-[10px] font-black bg-blue-50 text-blue-700 rounded px-2 py-1 uppercase border-none">
                  <option value="bar_chart">Bar Chart</option>
                  <option value="donut_chart">Donut Chart</option>
                  <option value="gauge_dial">Gauge Dial</option>
                  <option value="kpi_card">KPI Card</option>
                  <option value="line_chart">Line Chart</option>
                  <option value="pie_chart">Pie Chart</option>
                </select>
                <div class="flex gap-2">
                  <button @click="moveWidget(idx, -1)" :disabled="idx === 0" class="text-gray-300 hover:text-gray-600">▲</button>
                  <button @click="moveWidget(idx, 1)" :disabled="idx === form.widgets.length -1" class="text-gray-300 hover:text-gray-600">▼</button>
                  <button @click="removeWidget(idx)" class="text-red-300 hover:text-red-500">✕</button>
                </div>
              </div>

              <!-- Widget Config -->
              <div class="space-y-3">
                <input v-model="w.dataSource.label" placeholder="Display Label" class="w-full text-sm font-bold border-b border-gray-100 focus:border-blue-500 outline-none pb-1">
                
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="text-[9px] font-black text-gray-400 uppercase">Width</label>
                    <select v-model="w.width" class="w-full text-xs border-gray-200 rounded">
                      <option value="1/4">25% (Small)</option>
                      <option value="1/2">50% (Med)</option>
                      <option value="full">100% (Row)</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-[9px] font-black text-gray-400 uppercase">View (SQL)</label>
                    <select v-model="w.dataSource.view" @change="fetchViewColumns(w.dataSource.view)" class="w-full text-xs border-gray-200 rounded">
                      <option v-for="v in availableViews" :key="v" :value="v">{{ v }}</option>
                    </select>
                  </div>
                </div>

                <div v-if="['bar_chart', 'donut_chart', 'pie_chart'].includes(w.type)" class="mt-3 grid grid-cols-2 gap-2">
                    <!-- Existing Dimension Selector -->
                    <div>
                        <label class="text-[9px] font-black text-gray-400 uppercase">Dimension</label>
                        <select v-model="w.dataSource.dimension" class="w-full text-xs border-gray-200 rounded">
                            <!-- options... -->
                        </select>
                    </div>

                    <!-- NEW: Top n Selector -->
                    <div>
                        <label class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Limit (Top n)</label>
                        <input 
                            type="number" 
                            v-model="w.dataSource.limit" 
                            placeholder="10"
                            class="w-full text-xs border-indigo-100 bg-indigo-50/30 rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <!-- Dimension (For Charts) -->
                <div v-if="w.type !== 'kpi_card'">
                   <label class="text-[9px] font-black text-gray-400 uppercase">Dimension (Group By)</label>
                   <select v-model="w.dataSource.dimension" class="w-full text-xs border-gray-200 rounded">
                      <option v-for="col in columns[w.dataSource.view]" :key="col.field" :value="col.dbField">{{ col.label }}</option>
                   </select>
                </div>

                <!-- Inside v-for widgets in DashboardBuilder.vue -->
                <div v-if="w.type === 'line_chart'" class="mt-2">
                <label class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Time Dimension (Date Column)</label>
                <select v-model="w.dataSource.date_column" class="w-full text-xs border-indigo-200 bg-indigo-50 rounded">
                    <option value="">-- Select Date Column --</option>
                    <!-- We filter to only show columns that likely contain dates, or just show all for flexibility -->
                    <option v-for="col in columns[w.dataSource.view]" :key="col.field" :value="col.dbField">
                        {{ col.label }}
                    </option>
                </select>
                <p class="text-[8px] text-indigo-400 italic mt-1 leading-tight">
                    Select the date field used to calculate the monthly trend.
                </p>
                </div>

                <!-- Target Value (For Dials) -->
                <div v-if="w.type === 'gauge_dial'" class="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-[9px] font-black text-blue-600 uppercase tracking-widest">Target Logic</label>
                        <div class="flex bg-white rounded-lg p-0.5 shadow-sm border">
                            <button @click="w.dataSource.target_type = 'static'" 
                                    :class="w.dataSource.target_type !== 'dynamic' ? 'bg-blue-600 text-white' : 'text-gray-400'"
                                    class="text-[8px] font-bold px-2 py-1 rounded-md transition-all">STATIC</button>
                            <button @click="w.dataSource.target_type = 'dynamic'" 
                                    :class="w.dataSource.target_type === 'dynamic' ? 'bg-blue-600 text-white' : 'text-gray-400'"
                                    class="text-[8px] font-bold px-2 py-1 rounded-md transition-all">DYNAMIC</button>
                        </div>
                    </div>

                    <!-- Switch between Input and Column Selector -->
                    <div v-if="w.dataSource.target_type === 'dynamic'">
                        <label class="text-[8px] font-bold text-gray-400 uppercase">Target Column (from View)</label>
                        <select v-model="w.dataSource.target_column" class="w-full text-xs border-gray-200 rounded mt-1">
                            <option v-for="col in columns[w.dataSource.view]" :key="col.field" :value="col.dbField">{{ col.label }}</option>
                        </select>
                    </div>
                    <div v-else>
                        <label class="text-[8px] font-bold text-gray-400 uppercase">Manual Target Goal</label>
                        <input v-model="w.dataSource.target_value" type="number" class="w-full text-xs border-gray-200 rounded mt-1 p-1">
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. RIGHT: PREVIEW (The Viewer) -->
        <div class="flex-grow overflow-y-auto bg-gray-100 shadow-inner">
            <!-- 
            We pass the CURRENT state of the form.widgets 
            and the results we just fetched from the preview API.
            -->
            <DashboardViewer 
            v-if="form.widgets.length > 0"
                :definition="{ name: form.name, uiConfig: { widgets: form.widgets } }" 
                :results="previewResults" 
                :isAdminPreview="true"
                :subscribers="uniqueSubscribersForPreview" 
                v-model:previewSubscriberId="previewSubscriberId"
            />
            
            <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 italic">
                <span class="material-icons text-6xl mb-2">dashboard_customize</span>
                <p>Add a widget to begin designing the dashboard.</p>
            </div>
        </div>
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
      limit: 10, // <--- Set a default of 10
      metric: 'id', 
      target_value: 100 
    }
  });
};

const loadDashboard = async () => {
    if (!selectedDashboardSlug.value) {
        resetForm();
        return;
    }

    isHydrating.value = true; // LOCK THE WATCHERS

    try {
        const response = await apiClient.get(`/admin/report-factory/reports/${selectedDashboardSlug.value}`);
        const d = response.data.definition;

        if (!d) throw new Error("Definition missing");

        // 1. Hydrate the Display Name
        form.value.name = d.name;

        // 2. Hydrate the Scoping (Use database keys)
        scoping.value.reportClass = d.report_class || d.reportClass;
        scoping.value.productId = d.product_id || d.productId;
        scoping.value.subscriberId = d.subscriber_id || d.subscriberId;

        // 3. Hydrate the Widgets
        form.value.widgets = d.uiConfig?.widgets || d.ui_config?.widgets || [];

        // 4. Sync the Preview Context
        if (scoping.value.subscriberId) {
            previewSubscriberId.value = scoping.value.subscriberId;
        }

        // 5. Load columns for all views
        form.value.widgets.forEach(w => {
            if (w.dataSource?.view) fetchViewColumns(w.dataSource.view);
        });

    } catch (err) {
        console.error("Hydration Error:", err);
        alert("Failed to load dashboard settings.");
    } finally {
        // Wait a short tick for the DOM/Watchers to settle before unlocking
        setTimeout(() => {
            isHydrating.value = false;
        }, 500);
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
    if (!form.value.name || form.value.widgets.length === 0) {
        alert("Please provide a name and add at least one widget.");
        return;
    }

    saving.value = true;
    
    // Construct payload
    const payload = {
        name: form.value.name,
        definition_type: 'dashboard',
        report_class: scoping.value.reportClass,
        product_id: scoping.value.productId,
        subscriber_id: scoping.value.subscriberId,
        base_view: 'rp_dashboard_manifest',
        columns: [], 
        filters: [], 
        ui_config: { widgets: JSON.parse(JSON.stringify(form.value.widgets)) }, // Clone to break reactivity
        is_active: true
    };

    try {
        if (selectedDashboardSlug.value) {
            // UPDATE EXISTING
            const url = `/admin/report-factory/reports/${selectedDashboardSlug.value}`;
            await apiClient.put(url, payload);
            alert(`Dashboard "${form.value.name}" updated successfully.`);
        } else {
            // CREATE NEW
            const res = await apiClient.post(`/admin/report-factory/reports`, payload);
            // After creating, set the slug so subsequent clicks "Update" instead of "Create"
            selectedDashboardSlug.value = res.data.slug;
            alert("New Dashboard Deployed.");
        }
        
        // Refresh the sidebar list
        fetchDashboards();
    } catch (e: any) {
        console.error("Save Error:", e.response?.data || e.message);
        alert("Save Failed: " + (e.response?.data?.message || "Check console for details"));
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

</script>