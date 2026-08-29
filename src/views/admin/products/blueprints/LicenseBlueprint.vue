<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">License & Ownership Management</h2>
        <p class="text-sm text-gray-500">Manage WLP Partner ownership and subscriber client access for <span class="font-bold text-indigo-600">{{ product?.name }}</span></p>
      </div>
    </div>

    <!-- SCENARIO A: SYSTEM ADMIN - ASSIGN WLP PARTNER (LEVEL 2) -->
    <div v-if="authStore.hasRole('System Admin') || authStore.hasRole('Business Admin')" class="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 shadow-sm space-y-4">
      <h3 class="text-xs font-black text-indigo-900 uppercase tracking-widest">Level 2: WLP Partner Ownership</h3>
      
      <div v-if="product.wlpTenant || product.wlp_tenant" class="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-200">
        <div>
          <span class="text-xs font-bold uppercase text-gray-400 block">Assigned WLP Partner</span>
          <span class="text-base font-black text-gray-900">{{ (product.wlpTenant || product.wlp_tenant).name }}</span>
          <span class="text-xs text-gray-500 block">{{ (product.wlpTenant || product.wlp_tenant).company_email }}</span>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-black uppercase bg-green-100 text-green-800">Active WLP Owner</span>
      </div>

      <form @submit.prevent="assignWlp" class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-[10px] font-black text-indigo-400 uppercase mb-1">Select / Change WLP Partner Owner</label>
          <select v-model="selectedWlpId" required class="w-full border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 text-sm p-2 border">
            <option value="">-- Choose a WLP Partner --</option>
            <option v-for="wlp in allWlps" :key="wlp.id" :value="wlp.id">{{ wlp.name }} ({{ wlp.company_email }})</option>
          </select>
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all">
          Assign WLP Owner
        </button>
      </form>
    </div>

    <!-- SCENARIO B: SUBSCRIBER LICENSING (LEVEL 3) -->
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <h3 class="text-xs font-black text-gray-700 uppercase tracking-widest">Level 3: Licensed Subscriber Client Firms</h3>
      
      <!-- Issue New License Form -->
      <form @submit.prevent="linkSubscriber" class="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Select Subscriber Firm</label>
          <select v-model="linkForm.subscriberId" required class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 text-sm p-2 border">
            <option value="">-- Choose a Subscriber Firm --</option>
            <option v-for="sub in allSubscribers" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-[250px]">
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Custom Brand Name (Optional)</label>
          <input v-model="linkForm.displayName" type="text" placeholder="e.g. Estates Division" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 text-sm p-2 border">
        </div>
        <button type="submit" class="bg-brand-primary text-white px-6 py-2 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all">
          Grant License
        </button>
      </form>

      <!-- Licensed Subscribers Table -->
      <div class="border border-gray-200 rounded-xl overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th class="px-6 py-3 text-left">Subscriber Firm Name</th>
              <th class="px-6 py-3 text-left">Internal Branding</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 text-sm">
            <tr v-for="sub in product.subscribers" :key="sub.id" class="hover:bg-gray-50">
              <td class="px-6 py-3 font-bold text-gray-900">{{ sub.name }}</td>
              <td class="px-6 py-3 text-xs">
                <span v-if="sub.pivot && sub.pivot.displayName" class="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-medium">
                  {{ sub.pivot.displayName }}
                </span>
                <span v-else class="text-gray-400 italic">Standard</span>
              </td>
              <td class="px-6 py-3 text-right">
                <button @click="revokeLicense(sub)" class="text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded border border-transparent hover:border-red-100">
                  Revoke License
                </button>
              </td>
            </tr>
            <tr v-if="!product.subscribers || product.subscribers.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-gray-400 italic">No subscriber firms currently licensed for this product.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import { useAuthStore } from '@/store/auth';

const props = defineProps({
  product: { type: Object, required: true },
  slug: { type: String, required: true }
});

const authStore = useAuthStore();
const { showConfirm, showAlert } = useAlerts();
const allSubscribers = ref([]);
const allWlps = ref([]);
const selectedWlpId = ref(props.product?.wlp_tenant_id || props.product?.wlpTenant?.id || '');
const linkForm = ref({ subscriberId: '', displayName: '' });

const fetchInitialData = async () => {
  try {
    const [subRes, wlpRes] = await Promise.all([
      apiClient.get('admin/subscribers?all=true'),
      apiClient.get('admin/wlp-tenants'),
    ]);
    allSubscribers.value = subRes.data?.data || subRes.data || [];
    allWlps.value = wlpRes.data?.data || wlpRes.data || [];
  } catch (e) {
    console.error(e);
  }
};

const assignWlp = async () => {
  try {
    await apiClient.post(`admin/products/${props.slug}/assign-wlp`, {
      wlp_tenant_id: selectedWlpId.value,
    });
    await showAlert('Success', 'Product ownership assigned to WLP Partner.');
    window.location.reload();
  } catch (e) {
    await showAlert('Error', 'Failed to assign WLP Partner ownership.');
  }
};

const linkSubscriber = async () => {
  try {
    await apiClient.post(`admin/products/${props.slug}/link-subscriber`, {
      subscriber_id: linkForm.value.subscriberId,
      display_name: linkForm.value.displayName
    });
    await showAlert('Success', 'License granted to subscriber firm.');
    linkForm.value = { subscriberId: '', displayName: '' };
    window.location.reload();
  } catch (e) {
    await showAlert('Error', 'Failed to grant license.');
  }
};

const revokeLicense = async (sub) => {
  if (await showConfirm('Revoke License', `Are you sure you want to revoke access for "${sub.name}"?`)) {
    try {
      await apiClient.post(`admin/products/${props.slug}/revoke-subscriber`, {
        subscriber_id: sub.id
      });
      await showAlert('Success', 'License revoked.');
      window.location.reload();
    } catch (e) {
      await showAlert('Error', 'Failed to revoke license.');
    }
  }
};

onMounted(fetchInitialData);
</script>