import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Tu servidor FastAPI
});

// Interceptor para enviar el Token JWT automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('cordoba-auth') || '{}')?.state?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;