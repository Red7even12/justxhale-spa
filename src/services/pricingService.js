import apiClient from './api'; // Your configured Axios instance

export default {
  getPricingPlans() {
    return apiClient.get('admin/pricing-plans');
  },
  getPricingPlan(id) {
    return apiClient.get(`admin/pricing-plans/${id}`);
  },
  createPricingPlan(data) {
    return apiClient.post('admin/pricing-plans', data);
  },
  updatePricingPlan(id, data) {
    return apiClient.put(`admin/pricing-plans/${id}`, data);
  },
  deletePricingPlan(id) {
    return apiClient.delete(`admin/pricing-plans/${id}`);
  },
};