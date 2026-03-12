import apiClient from './api';

const workflowStepService = {
  getSteps(definitionId) {
    return apiClient.get(`admin/workflow-definitions/${definitionId}/steps`);
  },
  // Note: The 'shallow' route means we don't need the definition ID for single-step operations.
  getStep(stepId) {
    return apiClient.get(`admin/steps/${stepId}`);
  },
  createStep(definitionId, data) {
    return apiClient.post(`admin/workflow-definitions/${definitionId}/steps`, data);
  },
  updateStep(stepId, data) {
    return apiClient.put(`admin/steps/${stepId}`);
  },
  deleteStep(stepId) {
    return apiClient.delete(`admin/steps/${stepId}`);
  },
};

export default workflowStepService;