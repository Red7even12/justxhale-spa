// src/services/adminService.js
import apiClient from './api.js';

export default {
  // === Document Type Management ===
  
  /**
   * Fetches all document types for the admin management screen.
   */
  getDocumentTypes(params) {
    return apiClient.get('/admin/document-types', { params });
  },

  /**
   * Creates a new document type definition.
   * @param {object} documentTypeData - The data for the new document type.
   */
  createDocumentType(documentTypeData) {
    return apiClient.post('admin/document-types', documentTypeData);
  },

  /**
   * Updates an existing document type definition.
   * @param {number} id - The ID of the document type to update.
   * @param {object} documentTypeData - The updated data.
   */
  updateDocumentType(id, documentTypeData) {
    return apiClient.put(`admin/document-types/${id}`, documentTypeData);
  },

  // === Document Pack Management ===

  getDocumentPacks(slug) {
        return apiClient.get(`/admin/products/${slug}/document-packs`);
    },

  createDocumentPack(slug, data) {
        return apiClient.post(`/admin/products/${slug}/document-packs`, data);
    },

  updateDocumentPack(slug, id, data) {
        return apiClient.put(`/admin/products/${slug}/document-packs/${id}`, data);
    },

  deleteDocumentPack(slug, id) {
        return apiClient.delete(`/admin/products/${slug}/document-packs/${id}`);
    },

// File Types (Niches)
    getFileTypes(slug) {
        return apiClient.get(`/admin/products/${slug}/file-types`);
    },
    getProducts() {
        return apiClient.get('admin/products');
    },
    getSubscribers() {
        return apiClient.get('admin/subscribers?all=true');
    },
    saveFileType(slug, data) {
        const method = data.id ? 'put' : 'post';
        const url = data.id ? `/admin/products/${slug}/file-types/${data.id}` : `/admin/products/${slug}/file-types`;
        return apiClient[method](url, data);
    },
    deleteFileType(slug, id) {
        return apiClient.delete(`/admin/products/${slug}/file-types/${id}`);
    },
    getFileType(id) {
        return apiClient.get(`/admin/file-types/${id}`);
    },

    // Case Field Definitions (Dynamic Fields)
    getFieldDefinitions(fileTypeId) {
        return apiClient.get(`admin/field-definitions?file_type_id=${fileTypeId}`);
    },
    saveFieldDefinition(data) {
        if (data.id) return apiClient.put(`admin/field-definitions/${data.id}`, data);
        return apiClient.post('admin/field-definitions', data);
    },
    deleteFieldDefinition(id) {
        return apiClient.delete(`admin/field-definitions/${id}`);
    },



  /**
   * Toggles the is_active status of a document type.
   * @param {number} id - The ID of the document type.
   */
  toggleDocumentTypeActive(id) {
    return apiClient.patch(`admin/document-types/${id}/toggle`);
  },

  // === Sourced Option Management ===

  getSourcedOptionSources() {
    return apiClient.get('document-sourced-options/sources');
  },

  getOptionsForSource(sourceName) {
    return apiClient.get(`document-sourced-options/${sourceName}`);
  },

  createSourcedOption(optionData) {
    return apiClient.post('admin/document-sourced-options', optionData);
  },

  updateSourcedOption(id, optionData) {
    return apiClient.put(`admin/document-sourced-options/${id}`, optionData);
  },

  deleteSourcedOption(id) {
    return apiClient.delete(`admin/document-sourced-options/${id}`);
  },
};