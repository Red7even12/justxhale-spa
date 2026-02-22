<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Create New Subscriber</h1>
    <SubscriberForm
      :is-loading="isSubmitting"
      mode="create"
      @submit="handleCreateSubscriber"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';
import SubscriberForm from './SubscriberForm.vue';

const router = useRouter();
const isSubmitting = ref(false);

const showNotification = (message, type = 'success') => {
  alert(`${type.toUpperCase()}: ${message}`); // Placeholder
};

const handleCreateSubscriber = async (subscriberData) => {
  isSubmitting.value = true;
  try {
    // --- Create a snake_case payload for the backend ---
    // This payload object will contain the data with keys converted
    // from the frontend's camelCase to the backend's expected snake_case.
    const payload = {
      // Subscriber fields
      name: subscriberData.name,
      company_email: subscriberData.companyEmail,
      pricing_plan_id: subscriberData.pricingPlanId,
      account_number: subscriberData.accountNumber,
      company_number: subscriberData.companyNumber,
      contact_person: subscriberData.contactPerson,
      cell_number: subscriberData.cellNumber,
      person_email: subscriberData.personEmail,

      // Subscriber Admin fields
      admin_first_name: subscriberData.adminFirstName,
      admin_last_name: subscriberData.adminLastName,
      admin_name: `${subscriberData.adminFirstName} ${subscriberData.adminLastName}`.trim(),
      admin_email: subscriberData.adminEmail,
      admin_cell_number: subscriberData.adminCellNumber,
    };

    // Now, send the correctly formatted 'payload' object to the API
    await apiClient.post('/subscribers', payload);

    showNotification('Subscriber and Admin created successfully! Invitation sent.', 'success');
    router.push('/admin/subscribers'); // Navigate back to the list
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to create subscriber.';
    showNotification(errorMessage, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push('/admin/subscribers');
};
</script>