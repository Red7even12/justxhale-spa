// File: frontend-spa/src/stores/auth.js

import { defineStore } from 'pinia';
import api from '@/services/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    roles: JSON.parse(localStorage.getItem('roles')) || [],
    permissions: JSON.parse(localStorage.getItem('permissions')) || [],
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission: (state) => (permissionName) => {
      return state.permissions.includes(permissionName);
    },
    hasRole: (state) => (roleName) => {
      return state.roles.includes(roleName);
    },
  },
  actions: {
    /**
     * Handles the successful response from any login-like process.
     * This is the missing function that will fix the error.
     * @param {object} loginData - The successful payload from the API.
     */
    handleLoginSuccess(loginData) {
      // 1. Extract the token and user from the payload.
      // The `||` makes it robust; it works if the key is `accessToken` or `access_token`.
      const token = loginData.accessToken || loginData.access_token;
      const user = loginData.user;
      
      // 2. Extract roles and permissions. They come as objects, so we extract the names.
      const roles = user.roles ? user.roles.map(r => r.name) : [];
      const permissions = user.permissions ? user.permissions.map(p => p.name) : [];

      // 3. Update the global API client to use the new token for all future requests.
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 4. Update the store's state.
      this.token = token;
      this.user = user;
      this.roles = roles;
      this.permissions = permissions;

      // 5. Save everything to localStorage for persistence.
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('permissions', JSON.stringify(permissions));
    },
    // --- END OF NEW ACTION ---

    async login(credentials) {
      try {
        const loginData = {
          ...credentials,
          email: credentials.email.toLowerCase()
        };
        const response = await api.post('/login', loginData);
        
        // The /login response structure might be different. Let's assume it has accessToken.
        // We can reuse a part of the handleLoginSuccess logic here.
        const token = response.data.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // After setting the token, fetch the full user details.
        await this.fetchAndSetUser(token);

        router.push({ name: 'Dashboard' });
      } catch (error) {
        console.error('Login failed:', error);
        this.logout(); 
        throw error;
      }
    },

    async fetchAndSetUser(token) {
      if (!token) return;
      try {
        const response = await api.get('/user'); // No need for custom headers if the default is set
        
        // The /user endpoint gives user, roles, and permissions at the top level.
        this.token = token;
        this.user = response.data.user;
        this.roles = response.data.roles;
        this.permissions = response.data.permissions;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('roles', JSON.stringify(this.roles));
        localStorage.setItem('permissions', JSON.stringify(this.permissions));

      } catch (error) {
        console.error('Failed to fetch user:', error);
        this.logout();
      }
    },

    async checkAuth() {
      const token = this.token || localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await this.fetchAndSetUser(token);
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.roles = [];
      this.permissions = [];
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      delete api.defaults.headers.common['Authorization']; // Clean up the API client
      router.push({ name: 'Login' });
    },
  },
});