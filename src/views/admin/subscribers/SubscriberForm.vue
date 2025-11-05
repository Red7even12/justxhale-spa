<template>
  <form @submit.prevent="handleSubmit">
    <div class="bg-white p-6 rounded-lg shadow-md space-y-6">
      <!-- Subscriber Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Subscriber Name</label>
        <input
          type="text"
          id="name"
          v-model="formState.name"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <!-- Company Email -->
      <div>
        <label for="companyEmail" class="block text-sm font-medium text-gray-700">Company Email</label>
        <input
          type="email"
          id="companyEmail"
          v-model="formState.companyEmail"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <!-- Account Number -->
      <div>
        <label for="accountNumber" class="block text-sm font-medium text-gray-700">Account Number</label>
        <input
          type="text"
          id="accountNumber"
          v-model="formState.accountNumber"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <!-- Company Number -->
      <div>
        <label for="companyNumber" class="block text-sm font-medium text-gray-700">Company Number</label>
        <input
          type="text"
          id="companyNumber"
          v-model="formState.companyNumber"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <!-- Contact Person -->
      <div>
        <label for="contactPerson" class="block text-sm font-medium text-gray-700">Contact Person</label>
        <input
          type="text"
          id="contactPerson"
          v-model="formState.contactPerson"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <!-- Cell Number -->
      <div>
        <label for="cellNumber" class="block text-sm font-medium text-gray-700">Cell Number</label>
        <input
          type="text"
          id="cellNumber"
          v-model="formState.cellNumber"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <!-- Person Email -->
      <div>
        <label for="personEmail" class="block text-sm font-medium text-gray-700">Person Email</label>
        <input
          type="email"
          id="personEmail"
          v-model="formState.personEmail"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <!-- New Section for Admin User -->
      <template v-if="mode === 'create'">
        <hr class="my-6">
        <!-- New Section for Admin User -->
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Primary Administrator Account
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            This will create the first user for the new subscriber and send them an invitation.
          </p>
        </div>

        <div class="mt-4">
          <label for="admin_name" class="block text-sm font-medium text-gray-700">Admin Name</label>
          <input type="text" id="admin_name" v-model="formState.adminName" required class="...">
        </div>

        <div class="mt-4">
          <label for="admin_email" class="block text-sm font-medium text-gray-700">Admin Email</label>
          <input type="email" id="admin_email" v-model="formState.adminEmail" required class="...">
        </div>
      </template>

      <!-- Pricing Plan Dropdown -->
      <div>
        <label for="pricing-plan" class="block text-sm font-medium text-gray-700">Pricing Plan</label>
        <select
          id="pricing-plan"
          v-model="formState.pricingPlanId"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option :value="null">-- No Plan Assigned --</option>
          <option v-for="plan in billingStore.pricingPlans" :key="plan.id" :value="plan.id">
            {{ plan.planName }}
          </option>
        </select>
         <p v-if="billingStore.isLoading" class="text-sm text-gray-500 mt-1">Loading plans...</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-6 flex justify-end space-x-4">
       <button
        type="button"
        @click="$emit('cancel')"
        class="text-[#72958D] hover:text-[#0F2629] bg-[#EBF5F5] hover:bg-[#D2F1F1] border border-[#72958D] hover:border-[#455E5E] font-bold py-2 px-4 rounded"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        class="text-[#EBF5F5] hover:text-[#72958D] bg-[#72958D] hover:bg-[#ABE0E0] border border-[#71B6B1] hover:border-[#0F2629] font-bold py-2 px-4 rounded flex items-center"
        :class="{ 'cursor-not-allowed bg-gray-400': isLoading }"
      >
        <span v-if="isLoading">Saving...</span>
        <span v-else>Save Subscriber</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useBillingStore } from '@/store/billingStore'; // Ensure path is correct

const props = defineProps({
  subscriber: {
    type: Object,
    // --- THIS IS THE CRITICAL FIX ---
    // Ensure every key in this default object uses camelCase to match the API response.
    default: () => ({
      name: '',
      companyEmail: '', // Was likely company_email
      pricingPlanId: null,  // Was likely pricing_plan_id
      accountNumber: '',
      companyNumber: '',
      contactPerson: '',
      cellNumber: '',
      personEmail: '',
      adminName: '',
      adminEmail: '',
    }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['create', 'edit'].includes(value),
  },
});

const emit = defineEmits(['submit', 'cancel']);

const billingStore = useBillingStore();
// This formState is what the v-model directives in the template bind to.
const formState = ref({});

// The watch effect copies the incoming prop data into our local formState.
// This will now work correctly because the keys will match.
watch(() => props.subscriber, (newVal) => {
    formState.value = JSON.parse(JSON.stringify(newVal));
}, { immediate: true, deep: true });

const handleSubmit = () => {
  // When submitted, it emits the formState data back to the parent (Create.vue or Edit.vue)
  emit('submit', formState.value);
};

onMounted(() => {
    if (!billingStore.pricingPlans.length) {
        billingStore.fetchPricingPlans();
    }
});
</script>