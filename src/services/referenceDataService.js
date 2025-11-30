import apiClient from './api';

export default {
  getCountries() {
    return apiClient.get('/reference-data/countries');
  },
  getCompanyTypes() {
    return apiClient.get('/reference-data/company-types');
  },
  getProvinces() {
    return apiClient.get('/reference-data/provinces');
  },
};
