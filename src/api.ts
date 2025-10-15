// Define the structure for API methods
interface ApiClient {
  get: <T = any>(url: string, config?: RequestInit) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: RequestInit) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: RequestInit) => Promise<T>;
  delete: <T = any>(url: string, config?: RequestInit) => Promise<T>;
}

// Generic fetch wrapper
const fetchWrapper = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
  }
  return response.json() as Promise<T>;
};

const api: ApiClient = {
  get: async (url, config) => {
    return fetchWrapper<any>(url, { ...config, method: 'GET' });
  },
  post: async (url, data, config) => {
    return fetchWrapper<any>(url, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(data),
    });
  },
  put: async (url, data, config) => {
    return fetchWrapper<any>(url, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      body: JSON.stringify(data),
    });
  },
  delete: async (url, config) => {
    return fetchWrapper<any>(url, { ...config, method: 'DELETE' });
  },
};

// Exporting named functions for specific use cases if needed,
// but the primary export for AdminDashboard will be the default 'api' object.
// For example, if AdminDashboard also needed fetchCourses specifically:
// export const fetchCourses = async (): Promise<Course[]> => { ... };

export default api;
