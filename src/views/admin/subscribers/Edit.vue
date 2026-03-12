<template>
  <!--frontend-spa\src\views\admin\subscribers\Edit.vue-->
  <div class="max-w-4xl mx-auto p-4">
    <!-- Header with Actions -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Edit Subscriber</h1>
      
      <!-- Only show this button if we have loaded the subscriber -->
      <button 
        v-if="subscriber"
        @click="showManageAdminModal = true"
        type="button" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[var(--c-primary-button-text)] bg-[var(--c-primary-button-bg)] hover:bg-[var(--c-primary-button-hover-bg)] shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--c-primary-button-border)]"
      >
        Manage Admin User
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">Loading subscriber data...</div>
    <div v-else-if="error" class="text-center py-8 text-red-600">{{ error }}</div>

    <!-- Subscriber Form -->
    <SubscriberForm
      v-else
      :subscriber="subscriber"
      :is-loading="isSaving"
      mode="edit"
      @submit="handleUpdate"
      @cancel="handleCancel"
    />

    <!-- Manage Admin Modal -->
    <ManageAdminUserModal
      v-if="showManageAdminModal"
      :user="currentAdminUser"
      @close="showManageAdminModal = false"
      @user-updated="handleUserUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';
import SubscriberForm from './SubscriberForm.vue';
import ManageAdminUserModal from '@/components/admin/ManageAdminUserModal.vue'; 

const route = useRoute();
const router = useRouter();

const subscriberId = ref(null);
const subscriber = ref(null);
const loading = ref(true);
const error = ref(null);
const isSaving = ref(false);
const showManageAdminModal = ref(false);

// Calculate who the current admin is based on the users loaded from the API
const currentAdminUser = computed(() => {
  if (!subscriber.value || !subscriber.value.users) {
    // Return a safe placeholder if data is missing
    return { id: null, name: '', email: '', subscriberId: subscriberId.value };
  }

  // Find the user with the 'Subscriber Admin' role
  const admin = subscriber.value.users.find(user => 
    user.roles && user.roles.some(role => role.name === 'Subscriber Admin')
  );

  if (admin) {
    // Ensure the user object has the subscriberId property needed by the modal
    return { ...admin, subscriberId: subscriberId.value };
  }

  // If no admin found, return placeholder to allow creating/assigning one
  return { id: null, name: '', email: '', subscriberId: subscriberId.value };
});

const fetchSubscriber = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`subscribers/${subscriberId.value}`);
    subscriber.value = response.data;
  } catch (err) {
    console.error('Failed to fetch subscriber:', err);
    error.value = 'Failed to load subscriber data.';
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async (formData) => {
  isSaving.value = true;
  error.value = null;
  try {
    const payload = {
      name: formData.name,
      company_email: formData.companyEmail,
      pricing_plan_id: formData.pricingPlanId,
      account_number: formData.accountNumber,
      company_number: formData.companyNumber,
      contact_person: formData.contactPerson,
      cell_number: formData.cellNumber,
      person_email: formData.personEmail,
    };

    await apiClient.put(`subscribers/${subscriberId.value}`, payload);
    router.push({ name: 'admin-subscribers' }); 

  } catch (err) {
    console.error('Failed to update subscriber:', err);
    error.value = 'Failed to update subscriber.';
  } finally {
    isSaving.value = false;
  }
};

// When the modal updates/creates a user, refresh the subscriber data
// to reflect the changes (e.g., new user in the list)
const handleUserUpdated = () => {
  fetchSubscriber();
};

const handleCancel = () => {
  router.push({ name: 'admin-subscribers' });
};

onMounted(() => {
  subscriberId.value = route.params.id;
  if (subscriberId.value) {
    fetchSubscriber();
  } else {
    error.value = 'No subscriber ID provided.';
    loading.value = false;
  }
});
</script>