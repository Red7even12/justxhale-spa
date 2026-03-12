// src/services/estateService.js

// Import the single, configured apiClient from your existing api.js file
import apiClient from './api.js';

export default {
  // === Existing Estate Methods ===
  getEstates() {
    return apiClient.get('estates');
  },
  getEstate(id) {
    return apiClient.get(`estates/${id}`);
  },
  createEstate(estateData) {
    return apiClient.post('estates', estateData);
  },
  updateEstate(id, estateData) {
    return apiClient.put(`estates/${id}`, estateData);
  },
  deleteEstate(id) {
    return apiClient.delete(`estates/${id}`);
  },

 // === ESTATE LOCKING METHODS ===
  /**
   * Attempts to acquire a lock on a specific estate.
   * @param {string} id The ID of the estate to lock.
   * @returns {Promise} Axios promise object.
   */
  lockEstate(id) {
    return apiClient.post(`estates/${id}/lock`);
  },

  /**
   * Sends a heartbeat to renew an existing lock on an estate.
   * @param {string} id The ID of the estate.
   * @returns {Promise} Axios promise object.
   */
  refreshLock(id) {
    return apiClient.put(`estates/${id}/lock`);
  },

  /**
   * Releases the lock on a specific estate.
   * @param {string} id The ID of the estate to unlock.
   * @returns {Promise} Axios promise object.
   */
  unlockEstate(id) {
    return apiClient.delete(`estates/${id}/lock`);
  },


  // === TIMELINE METHOD ===
  /**
   * Fetches the full event timeline for a specific estate.
   * @param {string|number} estateId - The ID of the estate.
   * @returns {Promise} Axios promise with the timeline data.
   */
  getEstateTimeline(estateId, params) {
    return apiClient.get(`estates/${estateId}/timeline`, { params });
  },
  getEstateQuickView(estateId) {
    return apiClient.get(`estates/${estateId}/quickview-data`);
  },
  getCaseNumbers(estateId) {
    return apiClient.get(`estates/${estateId}/case-numbers`);
  },


  // === Document Methods ===
  getDocumentRequirements(estateId) {
    return apiClient.get(`estates/${estateId}/document-requirements`);
  },
  submitDocumentLog(estateId, payload) {
    return apiClient.post(`estates/${estateId}/document-log`, payload);
  },
  getDocumentLogHistory(requirementId) {
      return apiClient.get(`document-requirements/${requirementId}/history`);
  },
  batchUpdateDocumentRequirements(estateId, requirementsPayload) {
    return apiClient.post(`estates/${estateId}/document-requirements/batch-update`, {
      requirements: requirementsPayload 
    });
  },

  // === Existing Methods FOR SARS WORKFLOW & REMINDERS ===

  /**
   * Fetches the actionable workflow process list for the SARS checklist.
   * @param {number} estateId The ID of the estate.
   * @returns {Promise}
   */
  getWorkflowProcesses(estateId) {
    return apiClient.get(`estates/${estateId}/workflow-processes`);
  },

  completeWorkflowProcess(processId, value) {
    return apiClient.post(`workflow-processes/${processId}/complete`, { value });
  },
  /**
   * Activates a workflow process and creates its first reminder.
   * @param {number} estateId The ID of the parent estate.
   * @param {number} processId The ID of the workflow process to activate.
   * @returns {Promise} A promise that resolves with the refreshed workflow list.
   */
  activateWorkflowProcess(estateId, processId) {
    return apiClient.post(`estates/${estateId}/workflow-processes/${processId}/activate`);
  },

  /**
   * Fetches the complete reminder history for a single workflow process.
   * @param {number} processId The ID of the workflow process.
   * @returns {Promise} A promise that resolves with an array of reminder objects.
   */
  getReminderHistory(processId) {
    return apiClient.get(`workflow-processes/${processId}/reminders`);
  },

  getMastersOffices() {
    return apiClient.get('reference-data/masters-offices');
  },

  // === NOTE-SPECIFIC METHODS ===
  getNote(noteId) {
    return apiClient.get(`notes/${noteId}`);
  }
  
  
};