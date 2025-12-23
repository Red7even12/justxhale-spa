import apiClient from './api';

const workflowDefinitionService = {
  getDefinitions() {
    return apiClient.get('/admin/workflow-definitions');
  },
  getDefinition(id) {
    return apiClient.get(`/admin/workflow-definitions/${id}`);
  },
  createDefinition(data) {
    return apiClient.post('/admin/workflow-definitions', data);
  },
  updateDefinition(id, data) {
    return apiClient.put(`/admin/workflow-definitions/${id}`, data);
  },
  deleteDefinition(id) {
    return apiClient.delete(`/admin/workflow-definitions/${id}`);
  },
  exportSteps(definitionId) {
    return apiClient.get(`/workflow-definitions/${definitionId}/export-steps`, {
      responseType: 'blob', // This is crucial to handle the file download
    });
  },
  importSteps(definitionId, file) {
    const formData = new FormData();
    formData.append('file', file);

      // When sending FormData, the browser automatically sets the correct
    // 'Content-Type': 'multipart/form-data' header.
    return apiClient.post(`/workflow-definitions/${definitionId}/import-steps`, formData);
  }, 
};

export default workflowDefinitionService;