<template>
    <div class="max-w-6xl mx-auto p-6 pb-20">
        <!-- HEADER SECTION -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">
                    {{ editingId ? 'Editing View: ' + viewName : 'SQL View Console' }}
                </h1>
                <p class="text-sm text-gray-500 italic uppercase">
                    {{ editingId ? 'Updating existing database schema' : 'Pro-Admin Deployment Tool' }}
                </p>
            </div>
            <div class="flex gap-4">
                <button v-if="editingId" @click="resetForm" class="text-gray-500 hover:text-gray-800 font-bold">
                    Cancel Edit
                </button>
                <button @click="saveAndDeploy" :disabled="loading" 
                        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-all">
                    <span v-if="loading" class="material-icons animate-spin text-sm">sync</span>
                    {{ editingId ? 'Update & Deploy to VPS' : 'Deploy New View' }}
                </button>
            </div>
        </div>

        <!-- MAIN CONSOLE CARD -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Database View Name (rp_...)</label>
                    <input v-model="viewName" type="text" placeholder="e.g. rp_audit_log" class="w-full border p-3 rounded font-mono focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Internal Reference Name</label>
                    <input v-model="reportName" type="text" placeholder="e.g. Detailed Audit Trail" class="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>

            <!-- PRIMARY SQL CONSOLE -->
            <label class="block text-xs font-black text-gray-400 uppercase mb-1 tracking-widest">1. Primary SQL Query (Source of Data)</label>
            <textarea 
                v-model="querySql" 
                rows="15" 
                class="w-full border p-4 rounded-xl font-mono text-sm bg-slate-900 text-emerald-400 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                placeholder="SELECT subscriber_id, ... FROM ..."
            ></textarea>

            <!-- PERFORMANCE SIDECAR CONSOLE -->
            <div class="mt-8 p-5 bg-indigo-900/5 border border-indigo-500/20 rounded-2xl">
                <div class="flex items-center gap-2 mb-3">
                    <span class="material-icons text-indigo-500 text-sm">speed</span>
                    <label class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                        2. Performance Sidecar (PostgreSQL Index / Analyze)
                    </label>
                </div>
                
                <textarea 
                    v-model="indexSql" 
                    rows="4"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-orange-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="CREATE INDEX idx_... ON public.table (subscriber_id, column) WHERE ...;"
                ></textarea>
                
                <div class="flex justify-between items-center mt-2 px-1">
                    <p class="text-[10px] text-gray-500 italic">
                        Executed on the VPS immediately after the view is created to optimize universal tables.
                    </p>
                    <span class="text-[9px] font-bold text-gray-400 uppercase">Allowed: CREATE INDEX / ANALYZE</span>
                </div>
            </div>

            <div class="mt-6 flex gap-6 text-[11px] text-gray-400 font-bold uppercase tracking-tighter italic border-t pt-4">
                <span>✓ Auto-wraps with <code>CREATE OR REPLACE VIEW</code></span>
                <span>✓ Mandatory <code>subscriber_id</code> isolation</span>
                <span>✓ VPS Deployment Protocol V2</span>
            </div>
        </div>

        <!-- SECTION: MANAGE EXISTING VIEWS -->
        <div class="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-6 border-b pb-4">
                <h3 class="text-lg font-bold text-gray-800">Managed Deployed Views</h3>
                <span class="text-xs font-bold text-gray-400 uppercase">{{ existingViews.length }} Recipes Found</span>
            </div>
            
            <div v-if="existingViews.length === 0" class="text-sm text-gray-500 italic py-10 text-center">
                No custom views deployed yet. Use the console above to begin.
            </div>

            <table v-else class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest">
                    <tr>
                        <th class="p-3">Reference Name</th>
                        <th class="p-3">DB View Name</th>
                        <th class="p-3">Used In</th>
                        <th class="p-3">Status</th>
                        <th class="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="view in existingViews" :key="view.id" class="border-b hover:bg-slate-50 transition-colors group">
                        <td class="p-3 font-bold text-gray-700">{{ view.name }}</td>
                        <td class="p-3 font-mono text-indigo-600 text-xs">{{ view.viewName }}</td>
                        <td class="p-3">
                            <div v-if="view.reportsCount > 0">
                                <span class="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 uppercase">
                                    {{ view.reportsCount }} Active Reports
                                </span>
                            </div>
                            <span v-else class="text-gray-300 italic text-xs">Not mapped</span>
                        </td>
                        <td class="p-3">
                            <div class="flex items-center gap-1.5">
                                <div :class="view.isDeployed ? 'bg-emerald-500' : 'bg-amber-400'" class="w-1.5 h-1.5 rounded-full"></div>
                                <span class="text-[10px] font-black uppercase tracking-tighter" :class="view.isDeployed ? 'text-emerald-700' : 'text-amber-700'">
                                    {{ view.isDeployed ? 'Live on VPS' : 'Pending' }}
                                </span>
                            </div>
                        </td>
                        <td class="p-3 text-right">
                            <div class="flex justify-end gap-3">
                                <button @click="loadViewIntoConsole(view)" class="text-indigo-600 hover:text-indigo-900 font-black text-[11px] uppercase">
                                    Edit Recipe
                                </button>
                                <button v-if="!view.reportsCount || view.reportsCount === 0" @click="deleteView(view.id)" class="text-red-400 hover:text-red-700 font-black text-[11px] uppercase">
                                    Drop & Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../../services/api';

const props = defineProps<{ productSlug?: string }>();
const router = useRouter();

const loading = ref(false);
const viewName = ref('');
const reportName = ref('');
const querySql = ref('');
const indexSql = ref(''); // NEW: Performance Sidecar State
const editingId = ref<number | null>(null);
const existingViews = ref<any[]>([]);

/**
 * Saves the metadata to the DB and triggers the physical VPS deployment.
 */
const saveAndDeploy = async () => {
    if (!viewName.value || !querySql.value) return alert("Please provide both Name and SQL.");
    
    loading.value = true;
    try {
        const payload = {
            name: reportName.value || viewName.value,
            view_name: viewName.value.startsWith('rp_') ? viewName.value : 'rp_' + viewName.value,
            query_sql: querySql.value,
            index_sql: indexSql.value // NEW: Send to Backend
        };

        let viewId = editingId.value;

        if (viewId) {
            await apiClient.put(`/admin/custom-views/${viewId}`, payload);
        } else {
            const saveRes = await apiClient.post('/admin/custom-views', payload);
            viewId = saveRes.data.id;
        }
        
        // PHYSICAL DEPLOYMENT (View + Index)
        await apiClient.post(`/admin/custom-views/${viewId}/deploy`);

        alert("Schema and Performance Sidecar Deployed to VPS Successfully.");

        resetForm();
        await fetchExistingViews();

    } catch (err: any) {
        alert("Deployment Failed: " + (err.response?.data?.error || err.message));
    } finally {
        loading.value = false;
    }
};

const fetchExistingViews = async () => {
    try {
        const res = await apiClient.get('/admin/custom-views');
        existingViews.value = res.data;
    } catch (err) {
        console.error("Discovery Error", err);
    }
};

const deleteView = async (id: number) => {
    if (!confirm("DANGER: This will physically DROP the SQL view from the database. Proceed?")) return;
    try {
        await apiClient.delete(`/admin/custom-views/${id}`);
        fetchExistingViews();
        alert("View destroyed.");
    } catch (err: any) {
        alert("Action Blocked: " + (err.response?.data?.error || err.message));
    }
};

const loadViewIntoConsole = (view: any) => {
    editingId.value = view.id;
    viewName.value = view.viewName || view.view_name;
    reportName.value = view.name;
    querySql.value = view.querySql || view.query_sql;
    indexSql.value = view.indexSql || view.index_sql || ''; // Hydrate Sidecar
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetForm = () => {
    editingId.value = null;
    viewName.value = '';
    reportName.value = '';
    querySql.value = '';
    indexSql.value = ''; // Clear Sidecar
};

onMounted(() => {
    fetchExistingViews();
});
</script>