import apiService from '../api/apiService';

const resource = 'auth/login';

export default {
    post(data) {
        return apiService.post(resource, data);
    }
};