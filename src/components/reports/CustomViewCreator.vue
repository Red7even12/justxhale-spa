<template>
    <div class="max-w-6xl mx-auto p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">SQL View Console</h1>
                <p class="text-sm text-gray-500 italic uppercase">Pro-Admin Deployment Tool</p>
            </div>
            <button @click="saveAndDeploy" :disabled="loading" 
                    class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg">
                {{ loading ? 'Deploying...' : 'Deploy to VPS' }}
            </button>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Database View Name (rp_...)</label>
                    <input v-model="viewName" type="text" placeholder="e.g. rp_audit_log" class="w-full border p-3 rounded font-mono" />
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Internal Reference Name</label>
                    <input v-model="reportName" type="text" placeholder="e.g. Detailed Audit Trail" class="w-full border p-3 rounded" />
                </div>
            </div>

            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">PostgreSQL Query (Paste from DBeaver)</label>
            <textarea 
                v-model="querySql" 
                rows="18" 
                class="w-full border p-4 rounded font-mono text-sm bg-gray-900 text-green-400 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                placeholder="SELECT subscriber_id, ... FROM ..."
            ></textarea>

            <div class="mt-4 flex gap-4 text-[11px] text-gray-500 font-medium italic">
                <span>✓ Auto-wraps with <code>CREATE OR REPLACE VIEW</code></span>
                <span>✓ Mandatory <code>subscriber_id</code> check</span>
                <span>✓ VPS Semicolon stripping</span>
            </div>
        </div>

                <!-- SECTION: MANAGE EXISTING VIEWS -->
        <div class="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 class="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Manage Deployed Views</h3>
            
            <div v-if="existingViews.length === 0" class="text-sm text-gray-500 italic">
                No custom views deployed yet.
            </div>

            <table v-else class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-600 uppercase text-[10px]">
                    <tr>
                        <th class="p-3">Internal Name</th>
                        <th class="p-3">DB View Name</th>
                        <th class="p-3">Used In</th> <!-- NEW COLUMN -->
                        <th class="p-3">Status</th>
                        <th class="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="view in existingViews" :key="view.id" class="border-b hover:bg-gray-50 transition">
                        <!-- Internal Name (Standard) -->
                        <td class="p-3 font-medium">{{ view.name }}</td>

                        <!-- DB View Name (Changed view_name to viewName) -->
                        <td class="p-3 font-mono text-blue-600 text-xs">{{ view.viewName }}</td>
                        
                        <!-- Used In (Changed reports_count to reportsCount) -->
                        <td class="p-3">
                            <div v-if="view.reportsCount > 0">
                                <span class="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                    {{ view.reportsCount }} Report(s)
                                </span>
                                <div class="text-[9px] text-gray-400 mt-1">
                                    {{ view.reports.map(r => r.name).join(', ') }}
                                </div>
                            </div>
                            <span v-else class="text-gray-300 italic text-xs">Not in use</span>
                        </td>

                        <!-- Status (Changed is_deployed to isDeployed) -->
                        <td class="p-3">
                            <span v-if="view.isDeployed" class="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">Deployed</span>
                            <span v-else class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold">Pending</span>
                        </td>

                        <td class="p-3 text-right">
                            <!-- Action Logic (Changed reports_count to reportsCount) -->
                            <button 
                                v-if="!view.reportsCount || view.reportsCount === 0"
                                @click="deleteView(view.id)" 
                                class="text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                                Drop & Delete
                            </button>
                            <span v-else title="Cannot delete a view that is actively used in reports" class="text-gray-300 cursor-not-allowed text-[10px] font-medium">
                                Locked (In Use)
                            </span>
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

const props = defineProps<{ productSlug: string }>();
const router = useRouter();

const loading = ref(false);
const viewName = ref('');
const reportName = ref('');
const querySql = ref('');

const saveAndDeploy = async () => {
    if (!viewName.value || !querySql.value) return alert("Please provide both Name and SQL.");
    
    loading.value = true;
    try {
        const payload = {
            name: reportName.value || viewName.value,
            view_name: viewName.value.startsWith('rp_') ? viewName.value : 'rp_' + viewName.value,
            query_sql: querySql.value
        };

        const saveRes = await apiClient.post(`/admin/products/${props.productSlug}/custom-views`, payload);
        await apiClient.post(`/admin/products/${props.productSlug}/custom-views/${saveRes.data.id}/deploy`);

        alert("SQL View Deployed to VPS successfully!");
        router.push({ name: 'admin.product.report-builder', params: { slug: props.productSlug } });
    } catch (err: any) {
        alert("Deployment Error: " + (err.response?.data?.error || err.message));
    } finally {
        loading.value = false;
    }
};

// Add state for the list of existing views
const existingViews = ref<any[]>([]);

// Fetch existing views
const fetchExistingViews = async () => {
    try {
        const res = await apiClient.get(`/admin/products/${props.productSlug}/custom-views`);
        existingViews.value = res.data;
    } catch (err) {
        console.error("Failed to load existing views", err);
    }
};

// Delete a view
const deleteView = async (id: number) => {
    if (!confirm("Are you sure? This will drop the SQL view from the database immediately.")) return;
    
    try {
        await apiClient.delete(`/admin/products/${props.productSlug}/custom-views/${id}`);
        fetchExistingViews(); // Refresh the list
        alert("View deleted successfully.");
    } catch (err: any) {
        alert("Delete Failed: " + (err.response?.data?.error || err.message));
    }
};

// Add to onMounted
onMounted(() => {
    fetchExistingViews();
});
</script>

