<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Billing Management</h1>

    <!-- Control Panel -->
    <div class="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Generate Billing</h2>
      <p class="text-gray-600 mb-4">
        Select a month and year to generate a preview report. After verifying the report, you can execute the official billing run to create invoices.
      </p>

      <div class="mb-4">
        <label for="billing-period" class="block text-sm font-medium text-gray-700">Billing Period</label>
        <input
          type="month"
          id="billing-period"
          v-model="selectedPeriod"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div class="space-y-3">
         <!-- Secondary Button for Preview Report -->
        <button
          @click="handleGenerateReport"
          :disabled="!selectedPeriod || billingStore.isLoading"
          class="w-full text-[#72958D] hover:text-[#0F2629] bg-[#EBF5F5] hover:bg-[#D2F1F1] border border-[#72958D] hover:border-[#455E5E] font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <span v-if="billingStore.isLoading && actionType === 'report'">Generating...</span>
          <span v-else>Generate Preview Report</span>
        </button>

         <!-- Primary Button for Official Billing Run -->
        <button
          @click="handleRunBilling"
          :disabled="!selectedPeriod || billingStore.isLoading"
          class="w-full text-[#EBF5F5] hover:text-[#72958D] bg-[#72958D] hover:bg-[#ABE0E0] border border-[#71B6B1] hover:border-[#0F2629] font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <span v-if="billingStore.isLoading && actionType === 'run'">Processing...</span>
          <span v-else>Execute Official Billing Run</span>
        </button>
      </div>
    </div>

    <!-- Report Display Area -->
    <div v-if="billingStore.isLoading && actionType === 'report'" class="text-center p-8 bg-white rounded-lg shadow-md">
        <p class="text-gray-600">Generating report, this may take a moment...</p>
    </div>
    <div v-else-if="billingStore.billingReport" class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Billing Preview for {{ billingStore.billingReport.period }}</h2>
        <button @click="billingStore.billingReport = null" class="text-sm text-gray-500 hover:text-gray-700 font-medium">Clear Report</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscriber Name</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Live Estates</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!billingStore.billingReport.reportData.length">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">No billable subscribers found for this period.</td>
            </tr>
            <tr v-for="item in billingStore.billingReport.reportData" :key="item.subscriberId">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.subscriberName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{{ item.estateCount }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">R{{ item.subtotal }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">R{{ item.totalAmount }}</td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
                <td colspan="3" class="px-6 py-3 text-right text-sm font-bold uppercase text-gray-700">Grand Total</td>
                <td class="px-6 py-3 text-right text-sm font-bold text-gray-700">R{{ billingStore.billingReport.grandTotal }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBillingStore } from '@/store/billingStore';

const billingStore = useBillingStore();
const selectedPeriod = ref(''); // Will hold the YYYY-MM value from the input
const actionType = ref(''); // To distinguish which button initiated the loading state

const handleGenerateReport = () => {
  if (!selectedPeriod.value) return;
  actionType.value = 'report';
  billingStore.fetchBillingReport(selectedPeriod.value);
};

const handleRunBilling = async () => {
  if (!selectedPeriod.value) return;
  // CRITICAL: Add a confirmation dialog for this destructive action
  if (!confirm(`Are you sure you want to execute the official billing run for ${selectedPeriod.value}? This will generate real invoices and cannot be undone.`)) {
    return;
  }
  
  actionType.value = 'run';
  await billingStore.runBilling(selectedPeriod.value);

  // Clear the report after a successful run to avoid showing stale data
  billingStore.billingReport = null;
  actionType.value = '';
};
</script>