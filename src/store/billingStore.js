import { defineStore } from 'pinia';
import { ref } from 'vue';
import pricingService from '@/services/pricingService';
import invoiceService from '@/services/invoiceService';
import billingService from '@/services/billingService';

// Placeholder for a notification system
const showNotification = (message, type = 'success') => {
  // Replace this with your actual toast/notification library call
  alert(`${type.toUpperCase()}: ${message}`);
};



export const useBillingStore = defineStore('billing', () => {
  // --- STATE ---
  const pricingPlans = ref([]);
  const invoices = ref({ data: [], links: {}, meta: {} }); // For pagination
  const isLoading = ref(false);
  const billingReport = ref(null);

  // --- ACTIONS ---

  async function fetchPricingPlans() {
    isLoading.value = true;
    try {
      const response = await pricingService.getPricingPlans();
      pricingPlans.value = response.data;
    } catch (error) {
      showNotification('Failed to fetch pricing plans.', 'error');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchInvoices(params) {
    isLoading.value = true;
    try {
      const response = await invoiceService.getInvoices(params);
      invoices.value = { data: response.data.data, links: response.data.links, meta: response.data.meta };
    } catch (error) {
      showNotification('Failed to fetch invoices.', 'error');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchBillingReport(period) {
    isLoading.value = true;
    billingReport.value = null; // Clear previous report
    try {
      const response = await billingService.generateBillingReport(period);
      billingReport.value = response.data;
    } catch (error) {
      showNotification('Failed to generate billing report.', 'error');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function runBilling(period) {
    isLoading.value = true;
    try {
      const response = await billingService.runBillingCycle(period);
      showNotification(response.data.message, 'success');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during the billing run.';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    billingReport, // <-- EXPOSE THE STATE
    pricingPlans,  // <-- Expose other state
    invoices,      // <-- Expose other state
    
    // Actions
    fetchPricingPlans,
    fetchInvoices,
    runBilling,
    fetchBillingReport, // <-- EXPOSE THE ACTION
  };
});