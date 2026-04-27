import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
    console.log("API CALL TEST");
    console.log("API Request:", `${config.baseURL}${config.url}`);
    return config;
});

export default api;
