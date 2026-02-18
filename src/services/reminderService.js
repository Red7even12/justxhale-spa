// frontend-spa/src/services/reminderService.js

import api from './api';

const reminderService = {
  /**
   * Fetches a paginated and filterable list of reminders for the dashboard.
   * @param {object} params - The query parameters for filtering and pagination.
   * @returns {Promise} Axios promise with the API response.
   */
  getReminders(params) {
    return api.get('/reminders', { params });
  },

  /**
   * Fetches the default "To" date for the dashboard filter from the backend.
   * @returns {Promise}
   */
  getDefaultToDate() {
    return api.get('/config/default-to-date');
  },

  // --- NEW METHODS START HERE ---

  /**
   * Fetches the details for a single reminder.
   * @param {number} reminderId - The ID of the reminder to fetch.
   * @returns {Promise} Axios promise with the reminder data.
   */
  getReminder(reminderId) {
    return api.get(`/reminders/${reminderId}`);
  },

  /**
   * Updates a specific reminder.
   * @param {number} reminderId - The ID of the reminder to update.
   * @param {object} payload - The data to update (e.g., { due_date: 'YYYY-MM-DD' }).
   * @returns {Promise} Axios promise with the updated reminder data.
   */
  updateReminder(reminderId, payload) {
    return api.put(`/reminders/${reminderId}`, payload);
  },

  /**
   * Snoozes a reminder, which completes it and creates a new follow-up.
   * @param {number} reminderId - The ID of the reminder to snooze.
   * @param {object} payload - The data for the new reminder (e.g., { due_date: 'YYYY-MM-DD' }).
   * @returns {Promise} Axios promise with the NEW reminder's data.
   */
  snoozeReminder(reminderId, payload) {
    return api.post(`/reminders/${reminderId}/snooze`, payload);
  },

    /**
   * Snoozes a reminder by a specified number of workdays.
   * @param {number} reminderId - The ID of the reminder to snooze.
   * @param {object} payload - The data, e.g., { days: 5 }.
   * @returns {Promise}
   */
  snoozeReminderByDays(reminderId, payload) {
    return api.post(`/reminders/${reminderId}/snooze-by-days`, payload);
  },
   
  
  triggerAction(id, actionName) {
    return api.post(`/reminders/${id}/action`, { action: actionName });
  },
};

export default reminderService;