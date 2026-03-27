<template>
  <div class="p-6">
    <!-- Breadcrumbs / Back -->
    <div class="mb-6">
      <router-link to="/admin/products" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Products
      </router-link>
    </div>

    <div v-if="product" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column: Product Info -->
      <div class="bg-white p-6 rounded-lg shadow border h-fit sticky top-6">
        <div :style="{ backgroundColor: getPrimaryColor(product) }" class="w-16 h-16 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
          {{ product.name.charAt(0) }}
        </div>
        <h1 class="text-2xl font-bold text-gray-900">{{ product.name }}</h1>
        <p class="text-sm text-gray-500 mb-6 font-mono">/{{ product.slug }}</p>

        <div class="space-y-4 pt-4 border-t">
          <div>
            <label class="text-xs uppercase font-bold text-gray-400">Current Licenses</label>
            <div class="text-2xl font-semibold">{{ product.subscribers ? product.subscribers.length : 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Right Column: License Management -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Add License Form -->
        <div class="bg-white p-6 rounded-lg shadow border border-indigo-100">
          <h2 class="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Issue New License
          </h2>
          <form @submit.prevent="linkSubscriber" class="flex flex-wrap gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 mb-1">Select Subscriber</label>
              <select v-model="linkForm.subscriberId" required class="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">-- Choose a Subscriber --</option>
                <option v-for="sub in allSubscribers" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
              </select>
            </div>
            <div class="flex-1 min-w-[200px]">
              <label class="block text-sm font-medium text-gray-700 mb-1">Custom Brand Name (Optional)</label>
              <input v-model="linkForm.displayName" type="text" placeholder="e.g. Estates Division" class="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 transition-all font-bold">
              Grant License
            </button>
          </form>
        </div>

        <!-- Licensed Subscribers Table -->
        <div class="bg-white shadow border rounded-lg overflow-hidden">
          <div class="px-6 py-4 bg-gray-50 border-b">
            <h3 class="font-bold text-gray-700 uppercase text-xs tracking-wider">Licensed Subscribers</h3>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-white">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscriber Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custom Brand</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Issued</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="sub in product.subscribers" :key="sub.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ sub.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="sub.pivot.displayName" class="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{{ sub.pivot.displayName }}</span>
                  <span v-else class="text-gray-400 italic">Standard</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(sub.pivot.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button @click="openEditModal(sub)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button @click="revokeLicense(sub)" class="text-red-600 hover:text-red-900">Revoke</button>
                </td>
              </tr>
              <tr v-if="!product.subscribers || product.subscribers.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500 italic">No Subscribers linked to this product yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- Edit License Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl">
        <h2 class="text-xl font-bold mb-4 text-gray-900">Edit License Branding</h2>
        <div class="mb-4">
            <p class="text-sm text-gray-600 mb-4">Subscriber: <span class="font-bold">{{ editingSubscriber?.name }}</span></p>
            <label class="block text-sm font-medium text-gray-700 mb-1">Custom Brand Name</label>
            <input v-model="editForm.displayName" type="text" placeholder="e.g. Estates Division" class="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button @click="showEditModal = false" class="text-gray-500 px-4 py-2 font-medium hover:bg-gray-100 rounded transition-colors">Cancel</button>
          <button @click="updateLicense" class="bg-indigo-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-indigo-700 transition-all">Update Branding</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const route = useRoute();
const { showConfirm, showAlert } = useAlerts();
const product = ref(null);
const allSubscribers = ref([]);
const linkForm = ref({ subscriberId: '', displayName: '' });

const showEditModal = ref(false);
const editingSubscriber = ref(null);
const editForm = ref({ displayName: '' });

// Helper to handle camel/snake color
const getPrimaryColor = (p) => p.primaryColor || p.primary_color || '#3B82F6';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

const fetchProduct = async () => {
  try {
    const { data } = await apiClient.get(`admin/products/${route.params.slug}`);
    product.value = data;
  } catch (error) {
    console.error('Failed to fetch product:', error);
  }
};

const fetchAllSubscribers = async () => {
  try {
    const { data } = await apiClient.get('subscribers?all=true');
    allSubscribers.value = data; 
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
  }
};

const linkSubscriber = async () => {
  try {
    const payload = {
        subscriber_id: linkForm.value.subscriberId,
        display_name: linkForm.value.displayName
    };
    
    await apiClient.post(`admin/products/${product.value.slug}/link-subscriber`, payload);
    
    showAlert('Success', 'License granted successfully.');
    linkForm.value = { subscriberId: '', displayName: '' };
    await fetchProduct();
  } catch (error) {
    console.error('Link failed:', error);
    showAlert('Error', 'Failed to link subscriber.');
  }
};

const openEditModal = (subscriber) => {
    editingSubscriber.value = subscriber;
    editForm.value.displayName = subscriber.pivot.displayName || '';
    showEditModal.value = true;
};

const updateLicense = async () => {
    try {
        const payload = {
            subscriber_id: editingSubscriber.value.id,
            display_name: editForm.value.displayName
        };
        
        await apiClient.post(`admin/products/${product.value.slug}/link-subscriber`, payload);
        
        showEditModal.value = false;
        showAlert('Success', 'License branding updated.');
        await fetchProduct();
    } catch (error) {
        console.error('Update failed:', error);
        showAlert('Error', 'Failed to update branding.');
    }
};

const revokeLicense = async (subscriber) => {
    const confirmed = await showConfirm(
        'Revoke License', 
        `Are you sure you want to revoke the license for "${subscriber.name}"? This will disable access to ${product.value.name} for this subscriber.`
    );

    if (confirmed) {
        try {
            await apiClient.post(`admin/products/${product.value.slug}/revoke-subscriber`, {
                subscriber_id: subscriber.id
            });
            showAlert('Success', 'License revoked.');
            await fetchProduct();
        } catch (error) {
            console.error('Revoke failed:', error);
            showAlert('Error', 'Failed to revoke license.');
        }
    }
};

onMounted(() => {
  fetchProduct();
  fetchAllSubscribers();
});
</script>
