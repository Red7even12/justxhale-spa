// File: frontend-spa/src/services/passwordService.js

import apiClient from './api';

export default {
  /**
   * Sends a "forgot password" request to the backend.
   * @param {string} email The user's email address.
   */
  forgotPassword(email) {
    return apiClient.post('/forgot-password', { email });
  },

  /**
   * Resets the user's password using a token.
   * @param {string} token The password reset token from the URL.
   * @param {string} password The new password.
   * @param {string} passwordConfirmation The new password confirmation.
   */
  resetPassword(token, password, passwordConfirmation) {
    // Convert to snake_case for the backend
    const payload = {
      token,
      password,
      password_confirmation: passwordConfirmation,
    };
    return apiClient.post('/reset-password', payload);
  }
};