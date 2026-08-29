<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">
          {{ dashboardData?.wlp_tenant?.name || 'WLP Partner Admin' }}
        </h1>
        <p class="text-xs text-gray-500 font-medium">Partner Performance & Revenue Analytics</p>
      </div>
      <div class="flex gap-3">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
          Prepaid Credit: R {{ formatMoney(dashboardData?.wlp_tenant?.prepaid_activation_credit) }}
        </span>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div class="text-xs font-bold uppercase text-gray-400 tracking-wider">Active Subscribers</div>
        <div class="text-3xl font-black text-gray-900 mt-2">{{ dashboardData?.metrics?.total_subscribers || 0 }}</div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div class="text-xs font-bold uppercase text-gray-400 tracking-wider">Active Case Files (Cycle)</div>
        <div class="text-3xl font-black text-brand-blue-600 mt-2">{{ dashboardData?.metrics?.active_case_files || 0 }}</div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div class="text-xs font-bold uppercase text-gray-400 tracking-wider">Last Settled Invoice</div>
        <div class="text-3xl font-black text-green-600 mt-2">
          R {{ formatMoney(dashboardData?.metrics?.last_billing_run?.platform_invoice) }}
        </div>
        <div class="text-[10px] font-bold text-gray-400 uppercase mt-1">
          Platform Share: {{ dashboardData?.metrics?.last_billing_run?.platform_fee_pct || 40 }}%
        </div>
      </div>
    </div>

    <!-- ASSIGNED PRODUCTS & BLUEPRINTING SECTION (NEW) -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <div>
          <h3 class="text-sm font-bold uppercase text-gray-800 tracking-wider">My Products & Blueprint IP</h3>
          <p class="text-xs text-gray-500">Configure workflows, document packs, and casefile types for your products.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="product in dashboardData?.products" :key="product.id" class="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex justify-between items-start">
              <h4 class="font-bold text-gray-900 text-base">{{ product.name }}</h4>
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">Product IP</span>
            </div>
            <code class="text-xs text-gray-400">/{{ product.slug }}</code>
          </div>

          <button
            @click="openBlueprint(product.slug)"
            class="w-full py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <span>Configure Product DNA →</span>
          </button>
        </div>

        <div v-if="!dashboardData?.products || dashboardData?.products?.length === 0" class="col-span-full p-4 text-center text-gray-400 italic text-xs">
          No products linked to your partner account yet. Contact platform administration.
        </div>
      </div>
    </div>

    <!-- Subscriber Management Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 class="text-sm font-bold uppercase text-gray-700 tracking-wider">Subscriber Accounts</h3>
      </div>

      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
          <tr>
            <th class="p-3">Subscriber Firm</th>
            <th class="p-3">Contact</th>
            <th class="p-3 text-center">Active Files</th>
            <th class="p-3 text-center">Status</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="sub in subscribers" :key="sub.id" class="hover:bg-gray-50">
            <td class="p-3 font-bold text-gray-800">{{ sub.name }}</td>
            <td class="p-3 text-xs text-gray-500">{{ sub.company_email || sub.person_email || 'N/A' }}</td>
            <td class="p-3 text-center font-bold">{{ sub.active_files || 0 }}</td>
            <td class="p-3 text-center">
              <span
                :class="sub.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
              >
                {{ sub.is_active !== false ? 'Active' : 'Suspended' }}
              </span>
            </td>
            <td class="p-3 text-right">
              <button
                @click="toggleStatus(sub)"
                class="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                :class="sub.is_active !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
              >
                {{ sub.is_active !== false ? 'Suspend' : 'Reactivate' }}
              </button>
            </td>
          </tr>
          <tr v-if="subscribers.length === 0">
            <td colspan="5" class="p-4 text-center text-gray-400 italic">No subscribers found under this partner.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const router = useRouter();
const dashboardData = ref(null);
const subscribers = ref([]);
const { showAlert, showConfirm } = useAlerts();

const formatMoney = (val) => {
  if (!val) return '0.00';
  return Number(val).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const openBlueprint = (slug) => {
  router.push({ name: 'admin.product.dashboard', params: { slug } });
};

const fetchData = async () => {
  try {
    const [dashRes, subRes] = await Promise.all([
      apiClient.get('/admin/partner-admin/dashboard'),
      apiClient.get('/admin/partner-admin/subscribers'),
    ]);
    dashboardData.value = dashRes.data;
    subscribers.value = subRes.data?.data || subRes.data || [];
  } catch (err) {
    console.error('Failed to load WLP Admin data:', err);
  }
};

const toggleStatus = async (sub) => {
  const action = sub.is_active !== false ? 'suspend' : 'reactivate';
  const confirm = await showConfirm(
    'Confirm Account Status Change',
    `Are you sure you want to ${action} ${sub.name}?`
  );
  if (!confirm) return;

  try {
    const res = await apiClient.post(`/admin/partner-admin/subscribers/${sub.id}/toggle-status`);
    sub.is_active = res.data.is_active;
    await showAlert('Success', res.data.message);
  } catch (err) {
    await showAlert('Error', 'Failed to update subscriber status.');
  }
};

onMounted(() => {
  fetchData();
});
</script>