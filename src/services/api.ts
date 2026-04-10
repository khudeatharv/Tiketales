import axios from 'axios';

const baseURL = import.meta.env.PROD ? '/api' : '/';

const api = axios.create({
  baseURL,
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
