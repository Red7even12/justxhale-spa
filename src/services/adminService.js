// src/services/adminService.js
import apiClient from './api.js';

export default {
  // === Document Type Management ===
  
  /**
   * Fetches all document types for the admin management screen.
   */
  getDocumentTypes() {
    return apiClient.get('/admin/document-types');
  },

  /**
   * Creates a new document type definition.
   * @param {object} documentTypeData - The data for the new document type.
   */
  createDocumentType(documentTypeData) {
    return apiClient.post('/admin/document-types', documentTypeData);
  },

  /**
   * Updates an existing document type definition.
   * @param {number} id - The ID of the document type to update.
   * @param {object} documentTypeData - The updated data.
   */
  updateDocumentType(id, documentTypeData) {
    return apiClient.put(`/admin/document-types/${id}`, documentTypeData);
  },

  /**
   * Toggles the is_active status of a document type.
   * @param {number} id - The ID of the document type.
   */
  toggleDocumentTypeActive(id) {
    return apiClient.patch(`/admin/document-types/${id}/toggle`);
  },

  // === Sourced Option Management ===

  getSourcedOptionSources() {
    return apiClient.get('/document-sourced-options/sources');
  },

  getOptionsForSource(sourceName) {
    return apiClient.get(`/document-sourced-options/${sourceName}`);
  },

  createSourcedOption(optionData) {
    return apiClient.post('/admin/document-sourced-options', optionData);
  },

  updateSourcedOption(id, optionData) {
    return apiClient.put(`/admin/document-sourced-options/${id}`, optionData);
  },

  deleteSourcedOption(id) {
    return apiClient.delete(`/admin/document-sourced-options/${id}`);
  },
};