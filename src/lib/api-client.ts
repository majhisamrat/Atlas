import axios from 'axios';

const getStoredAuthToken = () => {
  return localStorage.getItem('access_token') ?? localStorage.getItem('token') ?? '';
};

const getApiBaseURL = () => {
  // During development, use the Vite proxy (starts with /)
  // During production, use the full API URL from env
  if (import.meta.env.DEV) {
    return '/api/v1';
  }
  
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return `${apiUrl}/api/v1`;
  }
  return '/api/v1';
};

export const apiClient = axios.create({
  baseURL: getApiBaseURL(),
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    console.log('Adding Authorization header, token:', token.substring(0, 20) + '...');
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    console.log('No token found for request');
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear token and redirect to login if not already on login page
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      error.message = detail;
    } else if (Array.isArray(detail) && detail[0]?.msg) {
      error.message = detail[0].msg;
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);
