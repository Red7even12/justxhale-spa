<template>
  <div class="space-y-6 max-w-5xl">
    <!-- ISSUE FORM -->
    <div class="bg-white p-6 rounded-lg shadow border border-indigo-100">
      <h2 class="text-lg font-bold mb-4 text-gray-800">Issue New License</h2>
      <form @submit.prevent="linkSubscriber" class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[250px]">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Select Subscriber</label>
          <select v-model="linkForm.subscriberId" required class="w-full border-gray-300 rounded focus:ring-indigo-500">
            <option value="">-- Choose a Subscriber --</option>
            <option v-for="sub in allSubscribers" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-[250px]">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Brand Name</label>
          <input v-model="linkForm.displayName" type="text" placeholder="e.g. Estates Division" class="w-full border-gray-300 rounded focus:ring-indigo-500">
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-indigo-700">Grant License</button>
      </form>
    </div>

    <!-- TABLE -->
    <div class="bg-white shadow border rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <th class="px-6 py-3 text-left">Subscriber</th>
            <th class="px-6 py-3 text-left">Brand Override</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 text-sm">
          <tr v-for="sub in product.subscribers" :key="sub.id">
            <td class="px-6 py-4 font-bold text-gray-900">{{ sub.name }}</td>
            <td class="px-6 py-4 text-gray-500">{{ sub.pivot.displayName || 'Standard' }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="revokeLicense(sub)" class="text-red-600 font-bold hover:underline">Revoke</button>
            </td>
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

const props = defineProps(['slug', 'product']);
const { showConfirm, showAlert } = useAlerts();
const allSubscribers = ref([]);
const linkForm = ref({ subscriberId: '', displayName: '' });

const fetchSubscribers = async () => {
    const { data } = await apiClient.get('subscribers?all=true');
    allSubscribers.value = data;
};

const linkSubscriber = async () => {
    await apiClient.post(`admin/products/${props.slug}/link-subscriber`, {
        subscriber_id: linkForm.value.subscriberId,
        display_name: linkForm.value.displayName
    });
    showAlert('Success', 'License granted.');
    location.reload(); // Simple refresh to update product prop
};

const revokeLicense = async (sub) => {
    if (await showConfirm('Revoke', `Revoke access for ${sub.name}?`)) {
        await apiClient.post(`admin/products/${props.slug}/revoke-subscriber`, { subscriber_id: sub.id });
        location.reload();
    }
};

onMounted(fetchSubscribers);
</script>