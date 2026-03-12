import apiClient from './api';

const mapToSnakeCase = (data) => ({
    file_type_id: data.fileTypeId,
    file_name: data.fileName,
    file_reference: data.fileReference,
    current_team_id: data.currentTeamId,
    meta_data: data.metaData || {}
});

export default {
    // Fetch cases for the current product context
    getCases(productSlug, params) {
        return apiClient.get(`${productSlug}/cases`, { params });
    },

    // Fetch the specific file types (Niches) available for this product
    // used to populate the "Add Case" dropdown
    getFileTypes(productSlug) {
        return apiClient.get(`products/${productSlug}/file-types`);
    },

    createCase(productSlug, data) {
        return apiClient.post(`${productSlug}/cases`, mapToSnakeCase(data));
    }
};