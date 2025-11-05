// frontend-spa/src/services/userService.js
import apiClient from './api';

export default {
  /**
   * Fetches a list of subscriber users.
   */
  getUsers(params = {}) {
    return apiClient.get('/users', { params });
  },

  /**
   * Updates a subscriber user's details.
   * @param {string} userId The ID of the user to update.
   * @param {object} userData The data to update (e.g., { name, email, cell_number }).
   */
  updateUser(userId, userData) {
    return apiClient.put(`/users/${userId}`, userData);
  },

  /**
   * Fetches a list of CORE users (for System Admins).
   */
  getCoreUsers(params = {}) {
    return apiClient.get('/admin/core-users', { params });
  },

  /**
   * Creates a new CORE user and sends an invitation (for System Admins).
   * @param {object} userData - { name, email, roles: [...] }
   */
  createCoreUser(userData) {
    return apiClient.post('/admin/core-users', userData);
  },

  /**
   * Updates a core user's details.
   * @param {string} userId The ID of the user to update.
   * @param {object} userData The data to update (e.g., { name, email, cell_number }).
   */
  updateCoreUser(userId, userData) {
    return apiClient.put(`/admin/core-users/${userId}`, userData);
  },

  // --- THESE WERE THE MISSING FUNCTIONS ---

  /**
   * Triggers a password reset for a subscriber user.
   * @param {string} userId
   */
  forceSubscriberPasswordReset(userId) {
    return apiClient.post(`/users/${userId}/force-reset-password`);
  },

  /**
   * Triggers a password reset for a core user.
   * @param {string} userId
   */
  forceCoreUserPasswordReset(userId) {
    return apiClient.post(`/admin/core-users/${userId}/force-reset-password`);
  }
};