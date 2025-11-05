<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Invoices</h1>
      <!-- Add filters or actions here if needed -->
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <!-- Filters -->
      <div class="flex space-x-4 mb-4">
         <select v-model="statusFilter" @change="applyFilters" class="block w-48 rounded-md border-gray-300 shadow-sm">
            <option value="">All Statuses</option>
            <option value="Debit Pending">Debit Pending</option>
            <option value="Paid">Paid</option>
            <option value="Debit Failed">Debit Failed</option>
        </select>
      </div>

      <!-- Loading State -->
      <div v-if="billingStore.isLoading" class="text-center p-8">
        Loading invoices...
      </div>
      
      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscriber</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!billingStore.invoices.data.length">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No invoices found.</td>
            </tr>
            <tr v-for="invoice in billingStore.invoices.data" :key="invoice.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ invoice.invoiceNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.subscriber.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.invoiceDate }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.dueDate }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ invoice.totalAmount }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                        'bg-yellow-100 text-yellow-800': invoice.status === 'Debit Pending',
                        'bg-green-100 text-green-800': invoice.status === 'Paid',
                        'bg-red-100 text-red-800': invoice.status === 'Debit Failed',
                    }">
                    {{ invoice.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (Basic) -->
      <div class="mt-4 flex justify-between items-center">
        <p class="text-sm text-gray-700">
            Showing {{ billingStore.invoices.meta.from }} to {{ billingStore.invoices.meta.to }} of {{ billingStore.invoices.meta.total }} results
        </p>
        <div>
          <button @click="changePage(billingStore.invoices.links.prev)" :disabled="!billingStore.invoices.links.prev" class="px-3 py-1 text-sm border rounded-md">Previous</button>
          <button @click="changePage(billingStore.invoices.links.next)" :disabled="!billingStore.invoices.links.next" class="ml-2 px-3 py-1 text-sm border rounded-md">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useBillingStore } from '../../store/billingStore.js';

const billingStore = useBillingStore();
const statusFilter = ref('');

const applyFilters = () => {
  const params = {};
  if (statusFilter.value) {
    params.status = statusFilter.value;
  }
  billingStore.fetchInvoices(params);
};

const changePage = (url) => {
  if (!url) return;
  const page = new URL(url).searchParams.get('page');
  const params = { page };
   if (statusFilter.value) {
    params.status = statusFilter.value;
  }
  billingStore.fetchInvoices(params);
};

onMounted(() => {
  billingStore.fetchInvoices();
});
</script>