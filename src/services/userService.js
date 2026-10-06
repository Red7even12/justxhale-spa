// frontend-spa/src/services/userService.js
import apiClient from './api';

export default {
  /**
   * Fetches a list of subscriber users.
   */
  getUsers(params = {}) {
    return apiClient.get('users', { params });
  },

  /**
   * Updates a subscriber user's details.
   * @param {string} userId The ID of the user to update.
   * @param {object} userData The data to update (e.g., { name, email, cell_number }).
   */
  updateUser(userId, userData) {
    return apiClient.put(`users/${userId}`, userData);
  },

  /**
   * Fetches a list of CORE users (for System Admins).
   */
  getCoreUsers(params = {}) {
    return apiClient.get('admin/core-users', { params });
  },

  /**
   * Creates a new CORE user and sends an invitation (for System Admins).
   * @param {object} userData - { name, email, roles: [...] }
   */
  createCoreUser(userData) {
    return apiClient.post('admin/core-users', userData);
  },

  /**
   * Updates a core user's details.
   * @param {string} userId The ID of the user to update.
   * @param {object} userData The data to update (e.g., { name, email, cell_number }).
   */
  updateCoreUser(userId, userData) {
    return apiClient.put(`admin/core-users/${userId}`, userData);
  },

  /**
   * Triggers a forced password reset for a subscriber user with compulsory compliance reason.
   * @param {string} userId
   * @param {string} reason
   */
  forceSubscriberPasswordReset(userId, reason) {
    return apiClient.post(`users/${userId}/force-reset-password`, { reason });
  },

  /**
   * Triggers a forced password reset for a core user with compulsory compliance reason.
   * @param {string} userId
   * @param {string} reason
   */
  forceCoreUserPasswordReset(userId, reason) {
    return apiClient.post(`admin/core-users/${userId}/force-reset-password`, { reason });
  },

  /**
   * Fetches a user's email address using a valid invitation/reset token.
   * @param {string} token The plain-text token from the URL.
   * @returns {Promise} Axios promise containing the user's email.
   */
    getEmailFromToken(token) {
        // This will call the new route we created: GET /api/v1/user-email-from-token/{token}
        return apiClient.get(`user-email-from-token/${token}`);
    },

   /**
   * Toggles active status for subscriber or core users with compulsory compliance reason.
   * @param {string} userId
   * @param {string} reason
   * @param {'subscriber' | 'core'} context
   */
  toggleUserStatus(userId, reason, context = 'subscriber') {
    const endpoint = context === 'core'
      ? `admin/core-users/${userId}/toggle-status`
      : `users/${userId}/toggle-status`;
    return apiClient.patch(endpoint, { reason });
  },

  /**
   * Force password reset with mandatory compliance reason.
   */
  async forcePasswordResetWithReason(userId, reason, context = 'subscriber') {
    const endpoint = context === 'core' 
      ? `/admin/core-users/${userId}/force-reset-password` 
      : `/users/${userId}/force-reset-password`;
    return apiClient.post(endpoint, { reason });
  }, 

  /**
   * Fetch immutable security audit logs for a user.
   */
  async getSecurityLogs(userId, context = 'subscriber') {
    const endpoint = context === 'core' 
      ? `admin/core-users/${userId}/security-logs` 
      : `users/${userId}/security-logs`;
    return apiClient.get(endpoint);
  },
};