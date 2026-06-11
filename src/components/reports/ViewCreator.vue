<template>
    <div class="max-w-6xl mx-auto p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">SQL View Deployer (Pro Admin)</h1>
            <button @click="saveAndDeploy" class="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">
                Deploy to VPS
            </button>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border mb-6">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <input v-model="viewName" placeholder="View Name (e.g. rp_audit_trail)" class="border p-3 rounded font-mono" />
                <input v-model="reportName" placeholder="Friendly Name (e.g. Case Audit Trail)" class="border p-3 rounded" />
            </div>

            <label class="block text-sm font-bold text-gray-600 mb-2">Paste PostgreSQL Query (SELECT statement only)</label>
            <textarea 
                v-model="querySql" 
                rows="15" 
                class="w-full border p-4 rounded font-mono text-sm bg-gray-900 text-green-400"
                placeholder="SELECT ... FROM ..."
            ></textarea>
            
            <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-blue-700 text-xs">
                <strong>Protocol:</strong> Your query must include <code>subscriber_id</code>. Do not include <code>CREATE VIEW</code> or ending semicolons. Use <code>rp_</code> prefix for the name.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps<{ productSlug: string }>();

// State
const tables = ref<string[]>([]);
const viewName = ref('');
const baseTable = ref('case_files');
const blueprint = ref({
    joins: [] as any[],
    selected_columns: [] as any[]
});

// Load Tables
onMounted(async () => {
    const res = await axios.get(`/api/v1/admin/report-builder/tables`);
    tables.value = res.data;
});

const addJoin = () => {
    blueprint.value.joins.push({ table: '', alias: '', on: ['', ''], type: 'left' });
};

const addColumn = () => {
    blueprint.value.selected_columns.push({ table: baseTable.value, field: '', as: '', json_key: '' });
};

const saveAndDeploy = async () => {
    // 1. Save Definition
    const saveRes = await axios.post(`/api/v1/admin/products/${props.productSlug}/custom-views`, {
        name: viewName.value,
        view_name: viewName.value,
        base_table: baseTable.value,
        blueprint: blueprint.value
    });

    // 2. Deploy
    await axios.post(`/api/v1/admin/products/${props.productSlug}/custom-views/${saveRes.data.id}/deploy`);
    alert("View Created and Deployed!");
};
</script>
