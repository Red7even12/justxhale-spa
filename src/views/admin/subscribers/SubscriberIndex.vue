<template>
  <div>
    <!-- The header and "Add" button are managed by the uiStore in the script -->
    <div class="mt-8 flow-root">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div v-if="loading" class="text-center">Loading...</div>
          <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
          <div v-else>
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span class="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="subscriber in subscribers" :key="subscriber.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{{ subscriber.name }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ subscriber.companyEmail || 'N/A' }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ new Date(subscriber.createdAt).toLocaleDateString() }}</td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <router-link :to="`/admin/subscribers/${subscriber.id}/edit`" class="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- PAGINATION CONTROLS - ADDED THIS SECTION -->
            <div class="mt-4 flex justify-between items-center" v-if="meta && meta.total > 0">
              <p class="text-sm text-gray-700">
                Showing {{ meta.from }} to {{ meta.to }} of {{ meta.total }} results
              </p>
              <div class="space-x-2">
                <button @click="changePage(links.prev)" :disabled="!links.prev" class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button @click="changePage(links.next)" :disabled="!links.next" class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
            <!-- END OF PAGINATION SECTION -->

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import apiClient from '@/services/api';

const uiStore = useUiStore();
const router = useRouter();

const subscribers = ref([]);
const links = ref({}); // To store pagination links
const meta = ref({}); // To store pagination meta data
const loading = ref(true);
const error = ref(null);

const fetchSubscribers = async (url = '/subscribers') => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(url);
    // --- THIS IS THE CORRECTED LINE ---
    subscribers.value = response.data.data;
    // --- Store the pagination info ---
    links.value = response.data.links;
    meta.value = response.data.meta;
  } catch (err) {
    error.value = 'Failed to load subscribers. You may not have permission to view this page.';
  } finally {
    loading.value = false;
  }
};

// --- NEW FUNCTION TO HANDLE PAGINATION ---
const changePage = (url) => {
  if (url) {
    fetchSubscribers(url);
  }
};

const navigateToAddSubscriber = () => {
  router.push('/admin/subscribers/create');
};

onMounted(() => {
  fetchSubscribers();
  
  uiStore.setHeaderActions([
    {
      label: 'Add Subscriber',
      onClick: navigateToAddSubscriber,
    }
  ]);
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});
</script>