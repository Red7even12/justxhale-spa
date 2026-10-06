import { defineStore } from 'pinia';
import apiClient from '@/services/api';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    currentStep: 1,           // 1: Account, 'verify_otp': OTP, 3: Solution, 4: Teams, 5: Case, 6: Complete
    subscriberId: null,
    adminEmail: '',           // Stored to bind OTP verification
    companyName: '',
    token: null,
    user: null,
    selectedProduct: null,
    availableProducts: [],
    hydratedTeams: [],
    createdCase: null,
    loading: false,
    errorMessage: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isStepComplete: (state) => (step) => {
      if (typeof state.currentStep === 'number' && typeof step === 'number') {
        return state.currentStep > step;
      }
      return false;
    },
  },

  actions: {
    /**
     * Helper: Sets the JWT token into local storage and default API client headers
     */
    setAuthToken(token) {
      this.token = token;
      localStorage.setItem('auth_token', token);
      if (apiClient.defaults?.headers) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    },

    /**
     * Check existing onboarding status (Resumption flow)
     */
    async checkStatus() {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        this.loading = true;
        this.setAuthToken(token);
        const response = await apiClient.get('/onboarding/status');
        const data = response?.data?.data || response?.data || response;

        this.subscriberId = data.subscriberId ?? data.subscriber_id;
        this.companyName = data.companyName ?? data.company_name;

        const products = data.products || [];
        if (products.length > 0) {
          this.selectedProduct = products[0];
        }

        if (data.isCompleted ?? data.is_completed) {
          this.currentStep = 6;
        } else if (data.onboardingStep ?? data.onboarding_step) {
          this.currentStep = data.onboardingStep ?? data.onboarding_step;
        }
      } catch (error) {
        console.warn('Could not resume onboarding session:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Load active commercial products catalog for Phase 3
     */
    async loadProducts() {
      try {
        this.loading = true;
        const { data } = await apiClient.get('/onboarding/products');
        this.availableProducts = data?.data || [];
      } catch (error) {
        this.errorMessage = 'Failed to load commercial product options.';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Atomic Registration (Company + User Zero + Triggers OTP Email)
     */
    async registerTenant(payload) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const response = await apiClient.post('/onboarding/register', payload);
        const resData = response?.data?.data || response?.data || response;

        this.subscriberId = resData.subscriberId ?? resData.subscriber_id;
        this.adminEmail = resData.email ?? payload.email;
        this.companyName = payload.company_name;

        // Transition to OTP verification stage (no token yet)
        this.currentStep = 'verify_otp';
        return resData;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error creating your account.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Verify 6-Digit Email OTP (Captures JWT token & advances to Step 3)
     */
    async verifyOtp(otpCode) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const response = await apiClient.post('/onboarding/verify-otp', {
          subscriber_id: this.subscriberId,
          email: this.adminEmail,
          otp: otpCode.trim(),
        });

        const resData = response?.data?.data || response?.data || response;

        // Capture Minted JWT Token
        const token = resData.token || resData.access_token;
        if (token) {
          this.setAuthToken(token);
        }

        this.user = resData.user;
        this.currentStep = 3; // Advance to Product Selection

        // Load licensed solutions for Step 3
        await this.loadProducts();
        return resData;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Invalid or expired verification code.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Resend Onboarding OTP
     */
    async resendOtp() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const { data } = await apiClient.post('/onboarding/resend-otp', {
          subscriber_id: this.subscriberId,
          email: this.adminEmail,
        });
        return data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to resend code.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Phase 3: License Commercial Product
     */
    async submitPhase3(productId) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const { data } = await apiClient.post('/onboarding/phase-3', {
          product_id: productId,
        });

        this.selectedProduct = this.availableProducts.find((p) => p.id === productId);
        this.currentStep = 4;
        return data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error selecting product.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Phase 4: Hydrate Default Teams & Clearances
     */
    async submitPhase4() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const { data } = await apiClient.post('/onboarding/phase-4');
        this.hydratedTeams = data.data.hydrated_teams || [];
        this.currentStep = 5;
        return data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error hydrating tenant teams.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Phase 5: Launch First Live Case File
     */
    async submitPhase5(payload) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const { data } = await apiClient.post('/onboarding/phase-5', payload);
        this.createdCase = data.data;
        this.currentStep = 6; // Onboarding Completed
        return data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error deploying first case file.';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },

  /**
     * Check existing onboarding status (Resumption flow)
     */
    async checkStatus() {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        this.loading = true;
        this.setAuthToken(token);
        const response = await apiClient.get('/onboarding/status');
        const data = response?.data?.data || response?.data || response;

        // If the subscriber already completed onboarding, clear wizard session
        if (data.isCompleted ?? data.is_completed) {
          this.clearSession();
          return;
        }

        this.subscriberId = data.subscriberId ?? data.subscriber_id;
        this.companyName = data.companyName ?? data.company_name;

        const products = data.products || [];
        if (products.length > 0) {
          this.selectedProduct = products[0];
        }

        if (data.onboardingStep ?? data.onboarding_step) {
          this.currentStep = data.onboardingStep ?? data.onboarding_step;
        }
      } catch (error) {
        // Expired, invalid, or deleted user token: purge immediately and reset to Step 1
        this.clearSession();
      } finally {
        this.loading = false;
      }
    },

    /**
     * Helper: Cleanly purges transient onboarding session state
     */
    clearSession() {
      this.token = null;
      this.subscriberId = null;
      this.adminEmail = '';
      this.companyName = '';
      this.currentStep = 1;
      localStorage.removeItem('auth_token');
      if (apiClient.defaults?.headers) {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    },
});