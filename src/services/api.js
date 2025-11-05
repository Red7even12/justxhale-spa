// frontend-spa\src/services\api.js

import axios from 'axios';
// Use the @ alias for a clean path to your store
import { useAuthStore } from '@/store/auth';

const apiClient = axios.create({
  // Use the environment variable for the full base URL
  baseURL: import.meta.env.VITE_API_BASE_URL,
  
  // This is required for Sanctum's cookie-based SPA authentication to work.
  withCredentials: true,
  // --------------------

  headers: {
    'Accept': 'application/json',
  }
});

// This interceptor will apply to EVERY API call made through this file.
apiClient.interceptors.request.use(config => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => {
    // If the response is successful (2xx), just return it.
    return response;
  },
  (error) => {
    // If we get an error response...
    const authStore = useAuthStore();
    
    // Check if it's a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      // If it is, the token is invalid. Log the user out.
       authStore.logout();
    }
    
    // Always reject the promise so the component's catch block can handle it.
    return Promise.reject(error);
  }
);

// We do a default export so the rest of your app doesn't break
export default apiClient;