<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Edit Subscriber</h1>

    <div v-if="loading" class="text-center py-8">Loading subscriber data...</div>
    <div v-else-if="error" class="text-center py-8 text-red-600">{{ error }}</div>

    <SubscriberForm
      v-else
      :subscriber="subscriber"
      :is-loading="isSaving"
      mode="edit"
      @submit="handleUpdate"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/services/api';
import SubscriberForm from './SubscriberForm.vue';

const route = useRoute();
const router = useRouter();

const subscriberId = ref(null);
const subscriber = ref(null);
const loading = ref(true);
const error = ref(null);
const isSaving = ref(false);

const fetchSubscriber = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/subscribers/${subscriberId.value}`);
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
    // --- THE FIX: Convert camelCase from the form to snake_case for the API ---
    const payload = {
      name: formData.name,
      company_email: formData.companyEmail,
      pricing_plan_id: formData.pricingPlanId,
      account_number: formData.accountNumber,
      company_number: formData.companyNumber,
      contact_person: formData.contactPerson,
      cell_number: formData.cellNumber,
      person_email: formData.personEmail,
      // Note: We do NOT include admin_name or admin_email when updating
    };
    // --------------------------------------------------------------------

    // Now, send the correctly formatted 'payload' object to the API
    await apiClient.put(`/subscribers/${subscriberId.value}`, payload);
    
    // You may need to add a success notification here
    router.push({ name: 'admin-subscribers' }); // Ensure this route name is correct in your router

  } catch (err) {
    console.error('Failed to update subscriber:', err);
    // You may need to add an error notification here, parsing err.response.data.message
    error.value = 'Failed to update subscriber.';
  } finally {
    isSaving.value = false;
  }
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