<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Subscriber Management</h1>
        <p class="text-xs text-gray-500 font-medium">Provision client firms, assign product workflows, and control account statuses.</p>
      </div>
      <button @click="showModal = true" class="btn-primary flex items-center gap-2">
        <span>+ Add New Subscriber Firm</span>
      </button>
    </div>

    <!-- Subscriber Index Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 class="text-sm font-bold uppercase text-gray-700 tracking-wider">Client Subscriber Firms</h3>
        <span class="text-xs font-bold text-gray-500">{{ subscribers.length }} Accounts</span>
      </div>

      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
          <tr>
            <th class="p-3">Firm Name</th>
            <th class="p-3">Contact Person</th>
            <th class="p-3">Company Email</th>
            <th class="p-3 text-center">Active Casefiles</th>
            <th class="p-3 text-center">Status</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="sub in subscribers" :key="sub.id" class="hover:bg-gray-50">
            <td class="p-3 font-bold text-gray-900">{{ sub.name }}</td>
            <td class="p-3 text-xs text-gray-600">{{ sub.contact_person || 'N/A' }}</td>
            <td class="p-3 text-xs text-gray-500">{{ sub.company_email || sub.person_email || 'N/A' }}</td>
            <td class="p-3 text-center font-bold text-brand-blue-600">{{ sub.active_files || 0 }}</td>
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
                @click="toggleSubscriber(sub)"
                class="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                :class="sub.is_active !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
              >
                {{ sub.is_active !== false ? 'Suspend' : 'Reactivate' }}
              </button>
            </td>
          </tr>
          <tr v-if="subscribers.length === 0">
            <td colspan="6" class="p-6 text-center text-gray-400 italic">No subscriber firms provisioned yet. Click above to add a subscriber.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ADD SUBSCRIBER MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <h2 class="text-lg font-black text-gray-900 border-b pb-2">Provision New Subscriber Firm</h2>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Firm / Company Name</label>
            <input v-model="form.name" type="text" class="form-input w-full" placeholder="e.g. Apex Accounting Inc" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Company Email</label>
            <input v-model="form.company_email" type="email" class="form-input w-full" placeholder="info@apexacc.co.za" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Person Name</label>
            <input v-model="form.contact_person" type="text" class="form-input w-full" placeholder="Jane Smith" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Person Email</label>
            <input v-model="form.person_email" type="email" class="form-input w-full" placeholder="jane@apexacc.co.za" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Cell Number</label>
            <input v-model="form.cell_number" type="text" class="form-input w-full" placeholder="+27 82 123 4567" />
          </div>

          <!-- SUBSCRIBER ADMIN USER (provisioned & invited automatically) -->
          <div class="border-t border-gray-200 pt-3 mt-3">
            <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Subscriber Admin Account</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Admin First Name</label>
                <input v-model="form.admin_first_name" type="text" class="form-input w-full" placeholder="Jane" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Admin Last Name</label>
                <input v-model="form.admin_last_name" type="text" class="form-input w-full" placeholder="Smith" />
              </div>
            </div>
            <div class="mt-3">
              <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Admin Email</label>
              <input v-model="form.admin_email" type="email" class="form-input w-full" placeholder="jane@apexacc.co.za" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t pt-4">
          <button @click="showModal = false" class="btn-secondary">Cancel</button>
          <button @click="submitSubscriber" :disabled="isSaving" class="btn-primary">
            {{ isSaving ? 'Saving...' : 'Provision Subscriber Account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import { useUiStore } from '@/store/ui';

const uiStore = useUiStore();
const subscribers = ref([]);
const showModal = ref(false);
const isSaving = ref(false);
const { showAlert, showConfirm } = useAlerts();

const emptyForm = () => ({
  name: '',
  company_email: '',
  contact_person: '',
  person_email: '',
  cell_number: '',
  admin_first_name: '',
  admin_last_name: '',
  admin_email: '',
});

const form = ref(emptyForm());

const fetchSubscribers = async () => {
  try {
    const res = await apiClient.get('/admin/partner-admin/subscribers');
    subscribers.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const submitSubscriber = async () => {
  if (!form.value.name || !form.value.company_email) {
    await showAlert('Validation Error', 'Firm Name and Company Email are required.');
    return;
  }
  if (!form.value.admin_first_name || !form.value.admin_last_name || !form.value.admin_email) {
    await showAlert('Validation Error', 'The Subscriber Admin first name, last name and email are required.');
    return;
  }

  isSaving.value = true;
  try {
    // WLP-scoped endpoint: binds the firm to this partner's tenant and
    // auto-licenses it with all of this WLP's products.
    await apiClient.post('/admin/partner-admin/subscribers', form.value);
    showModal.value = false;
    form.value = emptyForm();
    await showAlert('Success', 'Subscriber firm provisioned and licensed to your products successfully.');
    fetchSubscribers();
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create subscriber.';
    await showAlert('Error', msg);
  } finally {
    isSaving.value = false;
  }
};

const toggleSubscriber = async (sub) => {
  const currentStatus = sub.is_active !== false;
  const action = currentStatus ? 'suspend' : 'reactivate';

  const confirm = await showConfirm(
    'Account Status Confirmation',
    `Are you sure you want to ${action} ${sub.name}?`
  );
  if (!confirm) return;

  try {
    const res = await apiClient.post(`/admin/partner-admin/subscribers/${sub.id}/toggle-status`);
    sub.is_active = res.data.is_active;
    await showAlert('Success', res.data.message);
  } catch (err) {
    await showAlert('Error', 'Failed to update subscriber account status.');
  }
};

onMounted(() => {
  fetchSubscribers();
  // Match the Super Admin layout: expose "Add Subscriber" in the top bar
  uiStore.setHeaderActions([
    {
      label: 'Add Subscriber',
      onClick: () => { showModal.value = true; },
    },
  ]);
});

onUnmounted(() => {
  uiStore.clearHeaderActions();
});
</script>

<style scoped>
.form-input {
  @apply block rounded-md border-gray-300 shadow-sm focus:border-brand-blue-500 focus:ring-brand-blue-500 text-sm p-2 border;
}
.btn-primary {
  @apply px-4 py-2 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg shadow hover:opacity-90 transition-all;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-gray-300 transition-all;
}
</style>