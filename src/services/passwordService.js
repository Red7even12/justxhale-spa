// File: frontend-spa/src/services/passwordService.js

import apiClient from './api';

const passwordService = {
    /**
     * Sends a "forgot password" request to the backend.
     * @param {string} email The user's email address.
     * @returns {Promise} Axios promise.
     */
    forgotPassword(email) {
        return apiClient.post('/forgot-password', { email });
    },

    /**
     * Submits the password reset form data to the backend.
     * @param {object} payload The form data.
     * @param {string} payload.token The password reset token from the URL.
     * @param {string} payload.password The new password.
     * @param {string} payload.password_confirmation The new password confirmation.
     * @param {string} payload.email The user's email for browser password manager integration.
     * @returns {Promise} Axios promise.
     */
    resetPassword(payload) {
        // The payload is now passed directly from the component,
        // ensuring all required data is present and correctly named.
        // We normalize the email to lowercase as a best practice.
        const sanitizedPayload = {
            ...payload,
            email: payload.email ? payload.email.toLowerCase() : payload.email,
        };
        return apiClient.post('/reset-password', sanitizedPayload);
    }
};

export default passwordService;