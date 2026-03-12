import apiClient from './api';

export default {
  getNonWorkingDays(params) {
    return apiClient.get('admin/non-working-days', { params });
  },

  addNonWorkingDay(data) {
    return apiClient.post('admin/non-working-days', data);
  },

  updateNonWorkingDay(id, data) {
    return apiClient.put(`admin/non-working-days/${id}`, data);
  },

  importNonWorkingDays(file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('admin/non-working-days/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
