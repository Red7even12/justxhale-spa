<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center border-b pb-4">
      <div>
        <h1 class="text-2xl font-black text-gray-900 tracking-tight">Subscriber Management</h1>
        <p class="text-xs text-gray-500 font-medium">Provision client firms, assign product workflows, and control account statuses.</p>
      </div>
      <button @click="startCreate" class="btn-primary flex items-center gap-2">
        <span>+ Add New Subscriber Firm</span>
      </button>
    </div>

    <!-- Subscriber Index Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex flex-wrap justify-between items-center gap-3">
        <h3 class="text-sm font-bold uppercase text-gray-700 tracking-wider">Client Subscriber Firms</h3>
        <div class="flex items-center gap-3">
          <!-- Super Admin only: filter the global book by owning WLP partner -->
          <select
            v-if="isGlobalAdmin"
            v-model="wlpFilter"
            @change="fetchSubscribers"
            class="form-input text-xs py-1"
          >
            <option value="">All WLP Partners</option>
            <option v-for="partner in wlpPartners" :key="partner.id" :value="partner.id">
              {{ partner.name }}
            </option>
            <option value="unassigned">— Direct / Unassigned —</option>
          </select>
          <span class="text-xs font-bold text-gray-500">{{ subscribers.length }} Accounts</span>
        </div>
      </div>

      <table class="w-full text-left text-sm">
        <thead class="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wider">
          <tr>
            <th class="p-3">Firm Name</th>
            <th v-if="isGlobalAdmin" class="p-3">WLP Partner</th>
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
            <td v-if="isGlobalAdmin" class="p-3">
              <span
                v-if="sub.wlp_tenant?.name || sub.wlpTenant?.name"
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-100 text-yellow-800"
              >
                {{ sub.wlp_tenant?.name || sub.wlpTenant?.name }}
              </span>
              <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-600">
                Direct
              </span>
            </td>
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
              <div class="flex justify-end gap-2">
                <button
                  @click="openEditModal(sub)"
                  class="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  @click="toggleSubscriber(sub)"
                  class="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                  :class="sub.is_active !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
                >
                  {{ sub.is_active !== false ? 'Suspend' : 'Reactivate' }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="subscribers.length === 0">
            <td :colspan="isGlobalAdmin ? 7 : 6" class="p-6 text-center text-gray-400 italic">No subscriber firms provisioned yet. Click above to add a subscriber.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ADD SUBSCRIBER MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <h2 class="text-lg font-black text-gray-900 border-b pb-2">
          {{ editingId ? 'Edit Subscriber Firm' : 'Provision New Subscriber Firm' }}
        </h2>

        <div class="space-y-3">
          <!-- Super Admin only: choose which WLP partner owns this firm -->
          <div v-if="isGlobalAdmin">
            <label class="block text-xs font-bold uppercase text-gray-500 mb-1">WLP Partner (Owner)</label>
            <select v-model="form.wlp_tenant_id" class="form-input w-full">
              <option value="">-- Select the WLP partner --</option>
              <option v-for="partner in wlpPartners" :key="partner.id" :value="partner.id">
                {{ partner.name }}
              </option>
            </select>
            <p class="text-[10px] text-gray-400 mt-1">
              The firm will be bound to this partner and licensed with the partner's products.
              WLP Admins always bind to their own tenant automatically.
            </p>
          </div>

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
          <div v-if="!editingId" class="border-t border-gray-200 pt-3 mt-3">
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
            {{ isSaving ? 'Saving...' : (editingId ? 'Save Changes' : 'Provision Subscriber Account') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAlerts } from '@/composables/useAlerts';
import { useUiStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';

const uiStore = useUiStore();
const authStore = useAuthStore();
const route = useRoute();

// Global admins (System/Business Admin) see the whole book of business and can
// see/assign which WLP partner owns each subscriber. WLP Admins are always
// tenant-scoped server-side and never see other partners' firms.
const isGlobalAdmin = computed(() =>
  authStore.hasRole('System Admin') || authStore.hasRole('Business Admin')
);

const subscribers = ref([]);
const wlpPartners = ref([]);
const wlpFilter = ref('');
const showModal = ref(false);
const isSaving = ref(false);
const editingId = ref(null);
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
  wlp_tenant_id: '',
});

const form = ref(emptyForm());

const startCreate = () => {
  editingId.value = null;
  form.value = emptyForm();
  showModal.value = true;
};

const openEditModal = (sub) => {
  editingId.value = sub.id;
  form.value = {
    ...emptyForm(),
    name: sub.name || '',
    company_email: sub.company_email || '',
    contact_person: sub.contact_person || '',
    person_email: sub.person_email || '',
    cell_number: sub.cell_number || '',
    wlp_tenant_id: sub.wlp_tenant_id ? String(sub.wlp_tenant_id) : '',
  };
  showModal.value = true;
};

const fetchWlpPartners = async () => {
  if (!isGlobalAdmin.value) return;
  try {
    const res = await apiClient.get('/admin/wlp-tenants');
    wlpPartners.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error(err);
  }
};

const fetchSubscribers = async () => {
  try {
    const params = {};
    if (isGlobalAdmin.value) {
      if (wlpFilter.value === 'unassigned') {
        params.unassigned = 1;
      } else if (wlpFilter.value) {
        params.wlp_tenant_id = wlpFilter.value;
      }
    }

    const res = await apiClient.get('/admin/partner-admin/subscribers', { params });
    // The global CamelCaseResponseMiddleware converts every response key to
    // camelCase. Normalise the rows back to the snake_case keys this
    // component (and the backend validation) work with.
    const rows = res.data?.data || res.data || [];
    subscribers.value = rows.map((sub) => ({
      ...sub,
      company_email: sub.companyEmail ?? sub.company_email ?? '',
      company_number: sub.companyNumber ?? sub.company_number ?? '',
      account_number: sub.accountNumber ?? sub.account_number ?? '',
      contact_person: sub.contactPerson ?? sub.contact_person ?? '',
      person_email: sub.personEmail ?? sub.person_email ?? '',
      cell_number: sub.cellNumber ?? sub.cell_number ?? '',
      is_active: sub.isActive ?? sub.is_active ?? true,
      wlp_tenant_id: sub.wlpTenantId ?? sub.wlp_tenant_id ?? null,
      wlp_tenant: sub.wlpTenant ?? sub.wlp_tenant ?? null,
    }));
  } catch (err) {
    console.error(err);
  }
};

const submitSubscriber = async () => {
  if (isGlobalAdmin.value && !editingId.value && !form.value.wlp_tenant_id) {
    await showAlert('Validation Error', 'Please select the WLP partner that will own this subscriber firm.');
    return;
  }
  if (!form.value.name) {
    await showAlert('Validation Error', 'Firm Name is required.');
    return;
  }
  if (!editingId.value) {
    if (!form.value.company_email) {
      await showAlert('Validation Error', 'Company Email is required when provisioning a new subscriber.');
      return;
    }
    if (!form.value.admin_first_name || !form.value.admin_last_name || !form.value.admin_email) {
      await showAlert('Validation Error', 'The Subscriber Admin first name, last name and email are required.');
      return;
    }
  }

  isSaving.value = true;
  try {
    const payload = { ...form.value };
    if (!isGlobalAdmin.value) {
      // WLP Admins never supply the tenant: it is forced server-side.
      delete payload.wlp_tenant_id;
    } else if (payload.wlp_tenant_id === '' || payload.wlp_tenant_id == null) {
      // Drop the placeholder so the BE requiredIf rule produces a clean
      // message instead of a type-mismatch 422 on ''.
      delete payload.wlp_tenant_id;
    } else {
      // Send a real JSON number, not the DOM-coerced numeric string.
      payload.wlp_tenant_id = Number(payload.wlp_tenant_id);
    }

    if (editingId.value) {
      // Edit mode: tenant-scoped update endpoint (403 for other tenants'
      // firms when called by a WLP Admin; tenant ownership is never editable).
      const editable = ['name', 'company_email', 'contact_person', 'person_email', 'cell_number'];
      const updatePayload = Object.fromEntries(
        editable.filter((k) => k in payload).map((k) => [k, payload[k]])
      );
      await apiClient.put(`/admin/partner-admin/subscribers/${editingId.value}`, updatePayload);
    } else {
      // WLP-scoped endpoint: binds the firm to the owning tenant and
      // auto-licenses it with that tenant's products.
      await apiClient.post('/admin/partner-admin/subscribers', payload);
    }
    showModal.value = false;
    const wasEditing = !!editingId.value;
    editingId.value = null;
    form.value = emptyForm();
    await showAlert('Success', wasEditing
      ? 'Subscriber updated successfully.'
      : 'Subscriber firm provisioned and licensed to the tenant products successfully.');
    fetchSubscribers();
  } catch (err) {
    const errors = err.response?.data?.errors;
    const firstFieldError = errors ? Object.values(errors).flat().find(Boolean) : null;
    const msg = firstFieldError || err.response?.data?.message || 'Failed to save subscriber.';
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
    // Response keys are camelCase via the global middleware; accept both.
    sub.is_active = res.data.isActive ?? res.data.is_active;
    await showAlert('Success', res.data.message);
  } catch (err) {
    await showAlert('Error', err.response?.data?.message || 'Failed to update subscriber account status.');
  }
};

onMounted(() => {
  // Deep link from the WLP Partners console: /partner-admin/subscribers?wlp_tenant_id=<id>
  if (isGlobalAdmin.value && route.query.wlp_tenant_id) {
    wlpFilter.value = String(route.query.wlp_tenant_id);
  }

  fetchWlpPartners();
  fetchSubscribers();
  // Match the Super Admin layout: expose "Add Subscriber" in the top bar
  uiStore.setHeaderActions([
    {
      label: 'Add Subscriber',
      onClick: () => startCreate(),
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