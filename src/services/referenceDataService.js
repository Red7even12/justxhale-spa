import apiClient from './api.js';// Assuming you have a central axios instance

const referenceDataService = {
  getProvinces() {
    return apiClient.get('/reference-data/provinces');
  },

  getCountries() {
    return apiClient.get('/reference-data/countries');  
  },

  getCompanyTypes() {
    return apiClient.get('/reference-data/company-types');
  },
};

export default referenceDataService;