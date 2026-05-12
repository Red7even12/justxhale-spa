<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Pricing Plans</h1>
       <button @click="openCreateModal" class="text-[#EBF5F5] hover:text-[#72958D] bg-[#72958D] hover:bg-[#ABE0E0] border border-[#71B6B1] hover:border-[#0F2629] font-bold py-2 px-4 rounded">
          + New Pricing Plan
      </button>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
       <div v-if="billingStore.isLoading" class="text-center p-8">Loading plans...</div>
       <div v-else class="space-y-4">
            <div v-for="plan in billingStore.pricingPlans" :key="plan.id" class="border p-4 rounded-lg">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-semibold">{{ plan.planName }}
                          <span v-if="plan.isDefault" class="ml-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Default</span>
                        </h2>
                                <p class="text-sm text-gray-500">
                                    Active: {{ plan.startDate }} to {{ plan.endDate || 'Present' }}
                                </p>
                    </div>
                    <div class="space-x-2">
                         <button @click="openEditModal(plan)" class="text-[#72958D] hover:text-[#0F2629] bg-[#EBF5F5] hover:bg-[#D2F1F1] border border-[#72958D] hover:border-[#455E5E] font-bold py-2 px-4 rounded-md text-sm">
                            Edit
                        </button>
                        <button @click="handleDelete(plan)" class="text-red-700 bg-red-100 hover:bg-red-200 font-bold py-2 px-4 rounded-md text-sm">
                            Delete
                        </button>
                    </div>
                </div>
                 <div class="mt-4" v-if="plan.pricingTiers && plan.pricingTiers.length">
                    <h4 class="font-medium text-gray-600">Tiers:</h4>
                    <ul class="list-disc list-inside text-gray-500 text-sm pl-2 space-y-1 mt-1">
                        <!-- Loop through each tier and display its details -->
                        <li v-for="tier in plan.pricingTiers" :key="tier.id">
                            {{ tier.minCasefiles }} - {{ tier.maxCasefiles || '&#8734;' }} case files @ R{{ tier.ratePerCasefile }} each/month
                        </li>
                    </ul>
                </div>
            </div>
       </div>
    </div>
  </div>

  <!-- Modal -->
  <Modal :show="isModalOpen" @close="closeModal">
    <div class="p-6">
       <h2 class="text-2xl font-bold mb-4">{{ isEditing ? 'Edit' : 'Create' }} Pricing Plan</h2>
      <PricingPlanForm 
        :plan="selectedPlan" 
        :is-loading="isSubmitting"
        @submit="handleFormSubmit"
        @close="closeModal"
      />
    </div>
  </Modal>

</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useBillingStore } from '@/store/billingStore';
import pricingService from '@/services/pricingService';

// Assume Modal.vue and PricingPlanForm.vue are globally registered or imported
import Modal from '@/components/common/Modal.vue'; // Adjust path as needed
import PricingPlanForm from '@/components/admin/PricingPlanForm.vue'; // Adjust path as needed

const billingStore = useBillingStore();
const isModalOpen = ref(false);
const isSubmitting = ref(false);
const selectedPlan = ref(null);
const isEditing = ref(false);

const showNotification = (message, type = 'success') => {
  // Replace this with your actual toast/notification library call
  alert(`${type.toUpperCase()}: ${message}`);
};

const openCreateModal = () => {
  isEditing.value = false;
  selectedPlan.value = null;
  isModalOpen.value = true;
};

const openEditModal = (plan) => {
  isEditing.value = true;
  selectedPlan.value = plan;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedPlan.value = null;
};

const handleFormSubmit = async (planData) => {
  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      await pricingService.updatePricingPlan(planData.id, planData);
      showNotification('Plan updated successfully!');
    } else {
      await pricingService.createPricingPlan(planData);
      showNotification('Plan created successfully!');
    }
    await billingStore.fetchPricingPlans(); // Refresh the list
    closeModal();
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred.';
    showNotification(errorMessage, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (plan) => {
  if (!confirm(`Are you sure you want to delete the plan "${plan.planName}"?`)) return;

  try {
    await pricingService.deletePricingPlan(plan.id);

    showNotification('Plan deleted successfully!');
    await billingStore.fetchPricingPlans(); // Refresh the list
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete plan.';
    showNotification(errorMessage, 'error');
  }
};

onMounted(() => {
  billingStore.fetchPricingPlans();
});
</script>