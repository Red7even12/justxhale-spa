import apiClient from './api';

export default {
  runBillingCycle(period) { // period should be in 'YYYY-MM' format
    return apiClient.post('admin/billing/run', { period });
  },

  generateBillingReport(period) { // period should be in 'YYYY-MM' format
    return apiClient.get('admin/billing/report', { params: { period } });
  },
};