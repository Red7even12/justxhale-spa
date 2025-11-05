import { defineStore } from 'pinia';
import api from '../services/api'; // Assuming you have a pre-configured Axios instance
import router from '../router'; // To redirect after create/update

export const useEstateStore = defineStore('estate', {
  state: () => ({
    /**
     * Holds the paginated list of estates for the index page.
     * @type {Array}
     */
    estates: [],

    /**
     * Holds the full data for a single estate being viewed or edited.
     * @type {Object|null}
     */
    estate: null,

    /**
     * Holds pagination metadata from the API.
     * @type {Object|null}
     */
    pagination: null,

    /**
     * Tracks loading state for UI feedback (e.g., showing spinners).
     * @type {boolean}
     */
    loading: false,

    /**
     * Stores any errors from API calls.
     * @type {Object|null}
     */
    error: null,
  }),

  actions: {
    /**
     * Fetches a paginated list of estates from the API.
     * @param {Object} params - Query parameters for pagination, sorting, filtering.
     */
    async fetchEstates(params = { page: 1, per_page: 25 }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/estates', { params });
        this.estates = response.data.data;
        // Store pagination meta and links for a pagination component
        this.pagination = {
          meta: response.data.meta,
          links: response.data.links,
        };
      } catch (error) {
        this.error = error.response?.data || { message: 'An unknown error occurred.' };
        console.error('Failed to fetch estates:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Fetches a single estate by its ID.
     * @param {number|string} id - The ID of the estate.
     */
    async fetchEstate(id) {
      this.loading = true;
      this.error = null;
      this.estate = null; // Reset previous estate data
      try {
        const response = await api.get(`/estates/${id}`);
        this.estate = response.data;
      } catch (error) {
        this.error = error.response?.data || { message: 'An unknown error occurred.' };
        console.error(`Failed to fetch estate ${id}:`, error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Creates a new estate.
     * @param {Object} estateData - The form data for the new estate.
     */
    async createEstate(estateData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/estates', estateData);
        // Redirect to the newly created estate's detail page
        router.push({ name: 'estate-details', params: { id: response.data.id } });
      } catch (error) {
        this.error = error.response?.data || { message: 'An unknown error occurred.' };
        console.error('Failed to create estate:', error);
        // Re-throw the error so the form component knows the submission failed
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Updates an existing estate.
     * @param {Object} estateData - The form data containing updates. Must include the ID.
     */
    async updateEstate(estateData) {
      if (!estateData.id) {
        throw new Error('Estate ID is required for updates.');
      }
      this.loading = true;
      this.error = null;
      try {
        await api.put(`/estates/${estateData.id}`, estateData);
        // Redirect back to the detail page after update
        router.push({ name: 'estate-details', params: { id: estateData.id } });
      } catch (error) {
        this.error = error.response?.data || { message: 'An unknown error occurred.' };
        console.error(`Failed to update estate ${estateData.id}:`, error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * A utility action to clear the currently selected estate from state,
     * useful when navigating away or preparing a "create new" form.
     */
    clearCurrentEstate() {
        this.estate = null;
    }
  },
});