import axios from 'axios';

const api = axios.create({
    // URL de tu servidor FastAPI
    baseURL: 'http://127.0.0.1:8000',
});

// Este interceptor añade el Token JWT automáticamente si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;