import axios from 'axios';

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    const normalized = envUrl.replace(/\/$/, '');
    if (normalized.endsWith('/api')) {
      return normalized;
    }
    return `${normalized}/api`;
  }

  if (import.meta.env.PROD) {
    return `${window.location.origin}/api`;
  }

  return '/';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
