<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">White-Label Partner Management</h1>
        <p class="text-xs text-gray-500 font-medium">Provision level 2 partners, configure pricing tiers, and issue onboarding invites.</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary flex items-center gap-2">
        <span>+ Create WLP & Issue Invite</span>
      </button>
    </div>

    <!-- WLP / Invites Index Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 class="text-sm font-bold uppercase text-gray-700 tracking-wider">White-Label Partners & Invites</h3>
        <span class="text-xs font-bold text-gray-500">{{ partnersList.length }} Records</span>
      </div>
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
          <tr>
            <th class="p-3">Partner Entity</th>
            <th class="p-3">Contact Email</th>
            <th class="p-3 text-center">Prepaid Credit</th>
            <th class="p-3 text-center">Status</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in partnersList" :key="item.id" class="hover:bg-gray-50">
            <td class="p-3 font-bold text-gray-900">
              {{ item.wlpName || item.wlp_name || item.name }}
            </td>
            <td class="p-3 text-xs text-gray-500">
              {{ item.contactEmail || item.contact_email || item.companyEmail || item.company_email }}
            </td>
            <td class="p-3 text-center font-bold text-blue-700">
              R {{ formatMoney(item.activationDeposit || item.activation_deposit || item.prepaid_activation_credit || item.prepaidActivationCredit) }}
            </td>
            <td class="p-3 text-center">
              <span
                :class="(item.acceptedAt || item.accepted_at || item.isActive || item.is_active) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
              >
                {{ (item.acceptedAt || item.accepted_at) ? 'Active' : (item.token ? 'Pending Acceptance' : 'Active') }}
              </span>
            </td>
<td class="p-3 text-right">
              <div class="flex justify-end gap-2">
                <!-- Action 1: Forward Email Link (Only for pending invites) -->
                <button
                  v-if="item.token && !(item.acceptedAt || item.accepted_at)"
                  @click="forwardLink(item)"
                  class="px-2.5 py-1 bg-brand-primary text-white text-xs font-bold rounded hover:opacity-90 transition-all"
                >
                  Forward Link
                </button>

                <!-- Action 2: Copy Link (Only for pending invites) -->
                <button
                  v-if="item.token && !(item.acceptedAt || item.accepted_at)"
                  @click="copyLocalUrl(item.token, item.id)"
                  class="px-2.5 py-1 bg-gray-200 text-gray-800 text-xs font-bold rounded hover:bg-gray-300 transition-all"
                >
                  {{ activeCopyId === item.id ? 'Copied!' : 'Copy Link' }}
                </button>

                <!-- Action 3: Edit WLP (SHOWS ON ALL WLP LINES) -->
                <button
                  @click="openEditModal(item)"
                  class="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded hover:bg-gray-200 transition-all"
                >
                  Edit WLP
                </button>

                <!-- Action 4: View Subscribers -->
                <router-link
                  to="/partner-admin/subscribers"
                  class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-100 transition-all"
                >
                  Subscribers
                </router-link>
              </div>
            </td>
          </tr>
          <tr v-if="partnersList.length === 0">
            <td colspan="5" class="p-6 text-center text-gray-400 italic">No partners onboarded or invited yet. Click "+ Create WLP & Issue Invite" to start.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CREATE WLP MODAL -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 class="text-lg font-black text-gray-900 border-b pb-2">Configure WLP Onboarding Invite</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Partner / Firm Name</label>
            <input v-model="createForm.wlp_name" type="text" class="form-input w-full" placeholder="e.g. Vizabiliti (Pty) Ltd" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Email</label>
            <input v-model="createForm.contact_email" type="email" class="form-input w-full" placeholder="admin@vizabiliti.co.za" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Person</label>
            <input v-model="createForm.contact_person" type="text" class="form-input w-full" placeholder="John Doe" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Product Archetype</label>
            <select v-model="createForm.archetype" class="form-input w-full">
              <option value="transactional_matter">Transactional Matter (Estate Tax)</option>
              <option value="continuous_compliance">Continuous Compliance (SHEQ/ISO)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Base Price Per File (ZAR)</label>
            <input v-model="createForm.base_price_per_file" type="number" class="form-input w-full" placeholder="120.00" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Activation Deposit (Prepaid Credit)</label>
            <input v-model="createForm.activation_deposit" type="number" class="form-input w-full" placeholder="5000.00" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Launch Grace Days</label>
            <input v-model="createForm.launch_grace_days" type="number" class="form-input w-full" placeholder="60" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Min Subscriber Floor (ZAR/mo)</label>
            <input v-model="createForm.minimum_subscriber_floor" type="number" class="form-input w-full" placeholder="250.00" />
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t pt-4">
          <button @click="showCreateModal = false" class="btn-secondary">Cancel</button>
          <button @click="submitInvite" :disabled="isLoading" class="btn-primary">
            {{ isLoading ? 'Generating...' : 'Generate Onboarding Invite' }}
          </button>
        </div>
      </div>
    </div>

    <!-- EDIT WLP MODAL -->
    <div v-if="editingWlp" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <h2 class="text-lg font-black text-gray-900 border-b pb-2">Edit WLP Partner Details</h2>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Partner Name</label>
            <input v-model="editForm.name" type="text" class="form-input w-full" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Company Registration</label>
            <input v-model="editForm.company_registration" type="text" class="form-input w-full" placeholder="2026/123456/07" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Email</label>
            <input v-model="editForm.company_email" type="email" class="form-input w-full" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Person</label>
            <input v-model="editForm.contact_person" type="text" class="form-input w-full" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Contact Number</label>
            <input v-model="editForm.contact_number" type="text" class="form-input w-full" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Min Subscriber Floor (ZAR)</label>
              <input v-model="editForm.minimum_subscriber_floor" type="number" class="form-input w-full" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Prepaid Credit Balance (ZAR)</label>
              <input v-model="editForm.prepaid_activation_credit" type="number" class="form-input w-full" />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input v-model="editForm.is_active" type="checkbox" id="is_active_toggle" class="h-4 w-4 text-brand-primary rounded border-gray-300" />
            <label for="is_active_toggle" class="text-xs font-bold text-gray-700 uppercase">Partner Account Active</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t pt-4">
          <button @click="editingWlp = null" class="btn-secondary">Cancel</button>
          <button @click="saveWlpEdit" :disabled="isSavingEdit" class="btn-primary">
            {{ isSavingEdit ? 'Saving...' : 'Save WLP Details' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';

const partnersList = ref([]);
const showCreateModal = ref(false);
const editingWlp = ref(null);
const isLoading = ref(false);
const isSavingEdit = ref(false);
const activeCopyId = ref(null);
const { showAlert } = useAlerts();

const createForm = ref({
  wlp_name: '',
  contact_email: '',
  contact_person: '',
  archetype: 'transactional_matter',
  base_price_per_file: 120,
  activation_deposit: 5000,
  launch_grace_days: 60,
  minimum_subscriber_floor: 250,
});

const editForm = ref({
  name: '',
  company_registration: '',
  contact_person: '',
  company_email: '',
  contact_number: '',
  minimum_subscriber_floor: 250,
  prepaid_activation_credit: 5000,
  is_active: true,
});

const formatMoney = (val) => Number(val || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });

const fetchRecords = async () => {
  try {
    const res = await apiClient.get('/admin/wlp-tenants');
    partnersList.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const submitInvite = async () => {
  if (!createForm.value.wlp_name || !createForm.value.contact_email) {
    await showAlert('Validation Error', 'Partner Name and Contact Email are required.');
    return;
  }

  isLoading.value = true;
  try {
    await apiClient.post('/admin/wlp-tenants', createForm.value);
    showCreateModal.value = false;
    createForm.value = {
      wlp_name: '', contact_email: '', contact_person: '',
      archetype: 'transactional_matter', base_price_per_file: 120,
      activation_deposit: 5000, launch_grace_days: 60, minimum_subscriber_floor: 250,
    };
    await fetchRecords();
    await showAlert('Success', 'WLP Partner created!');
  } catch (err) {
    await showAlert('Error', err.response?.data?.message || 'Failed to create partner.');
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (item) => {
  editingWlp.value = item;
  editForm.value = {
    name: item.name || item.wlpName || item.wlp_name,
    company_registration: item.company_registration || item.companyRegistration || '',
    contact_person: item.contact_person || item.contactPerson || '',
    company_email: item.company_email || item.companyEmail || item.contactEmail || item.contact_email || '',
    contact_number: item.contact_number || item.contactNumber || '',
    minimum_subscriber_floor: item.minimum_subscriber_floor || item.minimumSubscriberFloor || 250,
    prepaid_activation_credit: item.prepaid_activation_credit || item.prepaidActivationCredit || item.activationDeposit || 5000,
    is_active: item.is_active !== false && item.isActive !== false,
  };
};

const saveWlpEdit = async () => {
  if (!editingWlp.value) return;

  isSavingEdit.value = true;
  try {
    await apiClient.put(`/admin/wlp-tenants/${editingWlp.value.id}`, editForm.value);
    editingWlp.value = null;
    await fetchRecords();
    await showAlert('Success', 'WLP Partner details updated successfully.');
  } catch (err) {
    await showAlert('Error', err.response?.data?.message || 'Failed to update WLP Partner.');
  } finally {
    isSavingEdit.value = false;
  }
};


const forwardLink = async (item) => {
  try {
    const res = await apiClient.post(`/admin/wlp-tenants/${item.id}/dispatch-email`);
    await showAlert('Email Forwarded', res.data.message); 
  } catch (err) {
    await showAlert('Error', 'Failed to dispatch forwarding email.');
  }
};

const copyLocalUrl = (token, id) => {
  const spaUrl = `${window.location.origin}/onboard/wlp/${token}`;
  navigator.clipboard.writeText(spaUrl);
  activeCopyId.value = id;
  setTimeout(() => { activeCopyId.value = null; }, 3000);
};

onMounted(fetchRecords);
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