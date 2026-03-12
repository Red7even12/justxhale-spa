import apiClient from './api';

const estateWorkflowService = {
  /**
   * Fetches all workflow processes for a specific estate.
   * @param {number|string} estateId The ID of the estate.
   * @returns {Promise} A promise that resolves with the API response.
   */
  getProcesses(estateId) {
    return apiClient.get(`estates/${estateId}/workflow-processes`);
  },

  /**
   * Activates a pending workflow process for a given estate.
   * @param {number|string} estateId The ID of the estate.
   * @param {number|string} processId The ID of the specific estate_workflow_processes record to activate.
   * @returns {Promise} A promise that resolves with the API response.
   */
  activateProcess(estateId, processId) {
    return apiClient.post(`estates/${estateId}/workflow-processes/${processId}/activate`);
  },
};

export default estateWorkflowService;