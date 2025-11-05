// Import the single, configured apiClient from your existing api.js file
import apiClient from './api.js';

export default {
  // This is the single, correct version that handles both cases
  getCompanies(params = {}) {
    // Axios will automatically convert the 'params' object into URL query parameters.
    // e.g., { status: 'inactive', search: 'acme' } becomes "?status=inactive&search=acme"
    return apiClient.get('/companies', { params });
  },

  getCompany(id) {
    return apiClient.get(`/companies/${id}`);
  },

  createCompany(companyData) {
    return apiClient.post('/companies', companyData);
  },

  updateCompany(id, companyData) {
    return apiClient.put(`/companies/${id}`, companyData);
  },

  deactivateCompany(id) {
    return apiClient.post(`/companies/${id}/deactivate`);
  },

  activateCompany(id) {
    return apiClient.post(`/companies/${id}/activate`);
  },
  
  getContacts(companyId) {
    return apiClient.get(`/companies/${companyId}/contacts`);
  },

  getContact(contactId) {
    // Use "contacts", not "contact-persons"
    return apiClient.get(`/contacts/${contactId}`); 
  },
};