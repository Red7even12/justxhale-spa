import apiClient from './api';

export default {
  // params can include { page: 1, status: 'Paid', etc. }
  getInvoices(params = {}) {
    return apiClient.get('/invoices', { params });
  },
  getInvoice(id) {
    return apiClient.get(`/invoices/${id}`);
  },
};