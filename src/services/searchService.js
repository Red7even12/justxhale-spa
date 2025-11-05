import api from './api';

const searchService = {
  searchByCaseNumber(caseNumber) {
    return api.get('/search', { params: { case_number: caseNumber } });
  }
};
export default searchService;