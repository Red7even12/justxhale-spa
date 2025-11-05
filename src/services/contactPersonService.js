//frontend-spa\src\services\contactPersonService.js

import apiClient from './api.js';

export default {
  // POST /api/v1/companies/{companyId}/contacts
  createContact(companyId, contactData) {
    return apiClient.post(`/companies/${companyId}/contacts`, contactData);
  },

  // PUT /api/v1/contacts/{contactId}
  updateContact(contactId, contactData) {
    return apiClient.put(`/contacts/${contactId}`, contactData);
  },

  // DELETE /api/v1/contacts/{contactId}
  deactivateContact(contactId) {
    return apiClient.delete(`/contacts/${contactId}`);
  },

  // Reactivate /api/v1/contacts/{contactId}
  reactivateContact(contactId) {
    return apiClient.post(`/contacts/${contactId}/restore`);
 },

  getContact(id) {
    // Aligned to use '/contacts/' and is relative to the apiClient baseURL
    return apiClient.get(`/contacts/${id}`);
  }
};