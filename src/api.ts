import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API Interceptor: Token found:', !!token); // Log if token exists
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
