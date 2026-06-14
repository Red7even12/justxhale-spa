import apiClient from './api';

const mapToSnakeCase = (data) => {
    const mapping = {
        identificationNumber: 'identification_number',
        entityType: 'entity_type',
        parentId: 'parent_id',
        phonePrimary: 'phone_primary',
        phoneSecondary: 'phone_secondary',
        physicalAddress: 'physical_address',
        postalAddress: 'postal_address',
        metaData: 'meta_data',
        isActive: 'is_active'
    };
    
    const snakeData = { ...data };
    Object.keys(mapping).forEach(key => {
        if (snakeData[key] !== undefined) {
            snakeData[mapping[key]] = snakeData[key];
            delete snakeData[key];
        }
    });
    return snakeData;
};

export default {
    getEntities(params) {
        return apiClient.get('entities', { params });
    },
    // Useful for the parent company dropdown
    getCompanies() {
        return apiClient.get('entities', { params: { type: 'company', per_page: 100 } });
    },
    searchCompanies(query = '') {
        return apiClient.get('entities', { 
            params: { 
                type: 'company', 
                search: query,
                format: 'mini',
                limit: 15
            } 
        });
    },
    createEntity(data) {
        return apiClient.post('entities', mapToSnakeCase(data));
    },
    updateEntity(id, data) {
        return apiClient.put(`entities/${id}`, mapToSnakeCase(data));
    },
    deleteEntity(id) {
        return apiClient.delete(`entities/${id}`);
    }
};