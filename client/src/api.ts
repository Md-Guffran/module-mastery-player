import { API_BASE_URL } from './config';

// Define the structure for API methods
interface ApiClient {
  get: <T>(url: string, config?: RequestInit) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: RequestInit) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: RequestInit) => Promise<T>;
  delete: <T>(url: string, config?: RequestInit) => Promise<T>;
}

// Generic fetch wrapper
const fetchWrapper = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options?.headers || {}),
    ...(token ? { 'x-auth-token': token } : {}),
  };

  // Prepend API_BASE_URL if the URL doesn't already start with http
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;

  const response = await fetch(fullUrl, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
  }
  return response.json() as Promise<T>;
};

const api: ApiClient = {
  get: async <T>(url: string, config?: RequestInit) => {
    return fetchWrapper<T>(url, { ...config, method: 'GET' });
  },
  post: async <T>(url: string, data?: unknown, config?: RequestInit) => {
    return fetchWrapper<T>(url, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(data),
    });
  },
  put: async <T>(url: string, data?: unknown, config?: RequestInit) => {
    return fetchWrapper<T>(url, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(data),
    });
  },
  delete: async <T>(url: string, config?: RequestInit) => {
    return fetchWrapper<T>(url, { ...config, method: 'DELETE' });
  },
};

// Exporting named functions for specific use cases if needed,
// but the primary export for AdminDashboard will be the default 'api' object.
// For example, if AdminDashboard also needed fetchCourses specifically:
// export const fetchCourses = async (): Promise<Course[]> => { ... };

export default api;
