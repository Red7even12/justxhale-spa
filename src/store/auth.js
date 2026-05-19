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
    appVersion: localStorage.getItem('appVersion') || '0.0.0',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission: (state) => (permissionName) => {
      if (!state.permissions) {
        //console.warn('hasPermission check failed: No permissions in state');
        return false;
      }
      const target = permissionName.trim().toLowerCase();
      const match = state.permissions.some(p => 
        (typeof p === 'string' ? p : p.name).trim().toLowerCase() === target
      );
      // console.log(`hasPermission("${permissionName}")?`, match, 'Target:', target, 'Available:', state.permissions);
      return match;
    },
    hasRole: (state) => (roleName) => {
      if (!state.roles) {
        //console.warn('hasRole check failed: No roles in state');
        return false;
      }
      const target = roleName.trim().toLowerCase();
      const match = state.roles.some(r => 
        (typeof r === 'string' ? r : r.name).trim().toLowerCase() === target
      );
      //console.log(`hasRole("${roleName}")?`, match, 'Target:', target, 'Available:', state.roles);
      return match;
    },
  },
  actions: {
    /**
     * Handles the successful response from any login-like process.
     * This is the missing function that will fix the error.
     * @param {object} loginData - The successful payload from the API.
     */
    handleLoginSuccess(loginData) {
      // Extract the token and user from the payload.
      // The `||` makes it robust; it works if the key is `accessToken` or `access_token`.
      const token = loginData.accessToken || loginData.access_token;
      const user = loginData.user;
      const appVersion = loginData.appVersion || loginData.app_version || '0.0.0';
      
      // 2. Extract roles and permissions. They come as objects, so we extract the names.
      const roles = user.roles ? user.roles.map(r => (typeof r === 'string' ? r : r.name).trim()) : [];
      const permissions = user.permissions ? user.permissions.map(p => (typeof p === 'string' ? p : p.name).trim()) : [];

      // 3. Update the global API client to use the new token for all future requests.
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 4. Update the store's state.
      this.token = token;
      this.user = user;
      this.roles = roles;
      this.permissions = permissions;
      this.appVersion = appVersion;

      // 5. Save everything to localStorage for persistence.
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      localStorage.setItem('appVersion', appVersion);
    },
    // --- END OF NEW ACTION ---

async login(credentials) {
      try {
        const loginData = {
          ...credentials,
          email: credentials.email.toLowerCase()
        };
        const response = await api.post('/login', loginData);
        
        // 1. Set Token (Resilient to snake_case or camelCase)
        const token = response.data.accessToken || response.data.access_token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // 2. Fetch User Details & Roles
        await this.fetchAndSetUser(token);

        // 3. UNIFIED REDIRECT: Everyone goes to the Launcher.
        // The AppLauncher.vue component now handles the logic for 
        // System Admins (Master Console Card) vs Subscribers (Auto-launch).
        router.push({ name: 'AppLauncher' });

      } catch (error) {
        //console.error('Login failed:', error);
        // Ensure we clean up if the second step failed
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
        this.appVersion = response.data.appVersion || response.data.app_version || '0.0.0';
        
        // Ensure roles and permissions are arrays of strings (names) and trimmed
        this.roles = (response.data.roles || []).map(r => (typeof r === 'string' ? r : r.name).trim());
        this.permissions = (response.data.permissions || []).map(p => (typeof p === 'string' ? p : p.name).trim());

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('roles', JSON.stringify(this.roles));
        localStorage.setItem('permissions', JSON.stringify(this.permissions));
        localStorage.setItem('appVersion', this.appVersion);

      } catch (error) {
        //console.error('Failed to fetch user:', error);
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
      this.appVersion = '0.0.0';
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      localStorage.removeItem('appVersion');
      delete api.defaults.headers.common['Authorization']; // Clean up the API client
      router.push({ name: 'Login' });
    },
  },
});