// frontend-spa/src/services/teamService.js

// THE FIX: Import from 'api.js' as we established.
import apiClient from './api';

export default {
  /**
   * Fetches a paginated list of teams.
   */
  getTeams(params = {}) {
    return apiClient.get('/teams', { params });
  },

  /**
   * Fetches a single team by its ID.
   */
  getTeam(id) {
    return apiClient.get(`/teams/${id}`);
  },

  /**
   * Updates a team's details.
   */
  updateTeam(id, data) {
    return apiClient.put(`/teams/${id}`, data); 
  },

  /**
   * Adds a user to a specific team.
   */
  addUserToTeam(teamId, payload) {
    return apiClient.post(`/teams/${teamId}/users`, payload);
  },

  /**
   * Deactivates (removes) a user from a specific team.
   */
  removeUserFromTeam(teamId, userId) {
    return apiClient.delete(`/teams/${teamId}/users/${userId}`);
  }
};
