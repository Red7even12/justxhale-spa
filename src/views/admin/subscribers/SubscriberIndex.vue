<template>
  <div>
    <!-- The header and "Add" button are managed by the uiStore in the script -->
    <div class="mt-8 flow-root">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div v-if="loading" class="text-center">Loading...</div>
          <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
          <div v-else>
            <!-- Super Admin: filter the global subscriber book by WLP partner -->
            <div class="mb-4 flex items-center gap-3">
              <label class="text-xs font-bold uppercase text-gray-500">Filter by WLP Partner</label>
              <select
                v-model="wlpFilter"
                @change="fetchSubscribers()"
                class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border"
              >
                <option value="">All Subscribers</option>
                <option v-for="partner in wlpPartners" :key="partner.id" :value="partner.id">
                  {{ partner.name }}
                </option>
                <option value="unassigned">— Direct / Unassigned —</option>
              </select>
            </div>

            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">WLP Partner</th>
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
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      v-if="subscriber.wlpTenant?.name || subscriber.wlp_tenant?.name"
                      class="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-black uppercase text-yellow-800"
                    >
                      {{ subscriber.wlpTenant?.name || subscriber.wlp_tenant?.name }}
                    </span>
                    <span v-else class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase text-gray-600">
                      Direct
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ subscriber.company_email || 'N/A' }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(subscriber.created_at) }}</td>
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
import { useAlerts } from '@/composables/useAlerts';
import apiClient from '@/services/api';

const uiStore = useUiStore();
const router = useRouter();

const subscribers = ref([]);
const links = ref({}); // To store pagination links
const meta = ref({}); // To store pagination meta data
const loading = ref(true);
const error = ref(null);
const { showConfirm, showAlert } = useAlerts();
const seeding = ref(false);

// Super Admin: WLP partner filter ('' = all, 'unassigned' = direct firms)
const wlpPartners = ref([]);
const wlpFilter = ref('');

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const fetchWlpPartners = async () => {
  try {
    const res = await apiClient.get('/admin/wlp-tenants');
    wlpPartners.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const fetchSubscribers = async (url = null) => {
  loading.value = true;
  error.value = null;
  try {
    // Build the filtered endpoint on first load / filter change; pagination
    // links returned by Laravel already carry the active query string.
    let endpoint = url;
    if (!endpoint) {
      const params = new URLSearchParams();
      if (wlpFilter.value === 'unassigned') {
        params.append('unassigned', '1');
      } else if (wlpFilter.value) {
        params.append('wlp_tenant_id', wlpFilter.value);
      }
      const qs = params.toString();
            endpoint = `/admin/subscribers${qs ? `?${qs}` : ''}`;
    }

    const response = await apiClient.get(endpoint);
    const payload = response.data;

    subscribers.value = payload.data;

    // Laravel 12 paginators emit a flat payload (total, from, to,
    // current_page, prev_page_url, next_page_url, etc.), while older
    // payloads nested metadata under `meta` and exposed `links` as
    // { prev, next }. Normalise both so the pagination controls work.
    meta.value = payload.meta || {
      total: payload.total,
      from: payload.from,
      to: payload.to,
      current_page: payload.current_page,
      last_page: payload.last_page,
    };
    links.value = Array.isArray(payload.links)
      ? { prev: payload.prev_page_url || null, next: payload.next_page_url || null }
      : (payload.links || {});
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

const setSeedHeaderActions = (label, onClick) => {
  uiStore.setHeaderActions([
    {
      label,
      onClick,
    },
    {
      label: 'Add Subscriber',
      onClick: navigateToAddSubscriber,
    }
  ]);
};

const seedDefaultTeams = async () => {
  if (seeding.value) return;
  if (!(await showConfirm(
    'Seed Default Teams',
    'This will idempotently create/refresh default teams for ALL existing subscribers based on each file type\'s Default Team blueprints. No duplicates will be created. Continue?'
  ))) return;

  seeding.value = true;
  setSeedHeaderActions('Seeding default teams...', () => {});

  try {
    const res = await apiClient.post('/admin/subscribers/seed-default-teams');
    await showAlert('Success', res.data?.message || 'Default teams seeded for existing subscribers.');
  } catch (e) {
    await showAlert('Error', e.response?.data?.message || 'Seeding failed.');
  } finally {
    seeding.value = false;
    setSeedHeaderActions('Seed Default Teams', seedDefaultTeams);
  }
};

onMounted(() => {
  fetchWlpPartners();
  fetchSubscribers();
  setSeedHeaderActions('Seed Default Teams', seedDefaultTeams);
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});
</script>