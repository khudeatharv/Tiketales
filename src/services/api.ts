import axios from 'axios';

const api = axios.create({
  baseURL: '/', // Same origin since we proxy via Express/Vite in dev
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
