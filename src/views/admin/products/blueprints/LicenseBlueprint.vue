<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-gray-800">License Management</h2>
        <p class="text-sm text-gray-500">Manage which organizations can use <span class="font-bold text-indigo-600">{{ product?.name }}</span></p>
      </div>
    </div>

    <!-- Issue New License Form -->
    <div class="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 shadow-sm">
      <h3 class="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4">Grant New Access</h3>
      <form @submit.prevent="linkSubscriber" class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-[10px] font-black text-indigo-400 uppercase mb-1">Select Subscriber</label>
          <select v-model="linkForm.subscriberId" required class="w-full border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500">
            <option value="">-- Choose a Subscriber --</option>
            <option v-for="sub in allSubscribers" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-[250px]">
          <label class="block text-[10px] font-black text-indigo-400 uppercase mb-1">Custom Brand Name (Optional)</label>
          <input v-model="linkForm.displayName" type="text" placeholder="e.g. Estates Division" class="w-full border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500">
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-8 py-2.5 rounded-lg shadow-lg font-bold hover:bg-indigo-700 transition-all">
          Issue License
        </button>
      </form>
    </div>

    <!-- Licensed Subscribers Table -->
    <div class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <th class="px-6 py-4 text-left">Subscriber Name</th>
            <th class="px-6 py-4 text-left">Internal Branding</th>
            <th class="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="sub in product.subscribers" :key="sub.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-bold text-gray-900">{{ sub.name }}</td>
            <td class="px-6 py-4 text-sm">
              <span v-if="sub.pivot && sub.pivot.displayName" class="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-medium">
                {{ sub.pivot.displayName }}
              </span>
              <span v-else class="text-gray-400 italic">Standard</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="revokeLicense(sub)" class="text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded border border-transparent hover:border-red-100">
                Revoke License
              </button>
            </td>
          </tr>
          <tr v-if="!product.subscribers || product.subscribers.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-gray-400 italic">No organizations currently licensed for this product.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const props = defineProps({
  product: { type: Object, required: true },
  slug: { type: String, required: true }
});

const { showConfirm, showAlert } = useAlerts();
const allSubscribers = ref([]);
const linkForm = ref({ subscriberId: '', displayName: '' });

const fetchAllSubscribers = async () => {
    try {
        const { data } = await apiClient.get('admin/subscribers?all=true');
        allSubscribers.value = data; 
    } catch (e) { console.error(e); }
};

const linkSubscriber = async () => {
    try {
        await apiClient.post(`admin/products/${props.slug}/link-subscriber`, {
            subscriber_id: linkForm.value.subscriberId,
            display_name: linkForm.value.displayName
        });
        showAlert('Success', 'License granted successfully.');
        linkForm.value = { subscriberId: '', displayName: '' };
        // Trigger a page refresh or emit event to Layout to re-fetch product
        window.location.reload(); 
    } catch (e) {
        showAlert('Error', 'Failed to grant license.');
    }
};

const revokeLicense = async (sub) => {
    if (await showConfirm('Revoke License', `Are you sure you want to revoke access for "${sub.name}"?`)) {
        try {
            await apiClient.post(`admin/products/${props.slug}/revoke-subscriber`, {
                subscriber_id: sub.id
            });
            showAlert('Success', 'License revoked.');
            window.location.reload();
        } catch (e) {
            showAlert('Error', 'Failed to revoke license.');
        }
    }
};

onMounted(fetchAllSubscribers);
</script>