// File: frontend-spa/src/services/authService.js

import apiClient from '@/services/api';
import { useAuthStore } from '@/store/auth'; // Ensure alias is correct

export default {
  /**
   * Sets the password for a new user via an invitation token.
   * On success, this will also log the user in via the auth store.
   *
   * @param {string} token The invitation token from the URL.
   * @param {string} password The user's new password.
   * @param {string} passwordConfirmation The password confirmation.
   * @returns {Promise<object>}
   */
  setPassword(data) {
    const payload = {
      token: data.token,
      password: data.password,
      password_confirmation: data.password_confirmation,
    };

    return new Promise((resolve, reject) => {
      apiClient.post('set-password', payload)
        .then(response => {
          // The service's ONLY job on success is to call the auth store.
          const authStore = useAuthStore();
          authStore.handleLoginSuccess(response.data);
          resolve(response); // Resolve the promise so the component knows it succeeded.
        })
        .catch(error => {
          reject(error); // Reject the promise so the component knows it failed.
        });
    });
  }
};