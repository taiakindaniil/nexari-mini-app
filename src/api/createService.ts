import apiClient from './apiClient';

/**
 * Helper function to create an API service with common methods
 * This reduces boilerplate when creating new services
 * 
 * @param basePath - Base path for all API calls in this service
 * @returns Service object with CRUD methods
 */
export function createApiService<T, CreateParams = Partial<T>, UpdateParams = Partial<T>>(basePath: string) {
  return {
    /**
     * Get all items
     */
    getAll: async (params?: Record<string, any>): Promise<T[]> => {
      const { data } = await apiClient.get<T[]>(basePath, { params });
      return data;
    },
    
    /**
     * Get a single item by ID
     */
    getById: async (id: string | number): Promise<T> => {
      const { data } = await apiClient.get<T>(`${basePath}/${id}`);
      return data;
    },
    
    /**
     * Create a new item
     */
    create: async (params: CreateParams): Promise<T> => {
      const { data } = await apiClient.post<T>(basePath, params);
      return data;
    },
    
    /**
     * Update an item
     */
    update: async (id: string | number, params: UpdateParams): Promise<T> => {
      const { data } = await apiClient.put<T>(`${basePath}/${id}`, params);
      return data;
    },
    
    /**
     * Delete an item
     */
    delete: async (id: string | number): Promise<void> => {
      await apiClient.delete(`${basePath}/${id}`);
    },

    /**
     * Custom GET request
     */
    get: async <R = any>(path: string, params?: Record<string, any>): Promise<R> => {
      const { data } = await apiClient.get<R>(`${basePath}${path}`, { params });
      return data;
    },

    /**
     * Custom POST request
     */
    post: async <R = any, P = any>(path: string, params?: P): Promise<R> => {
      const { data } = await apiClient.post<R>(`${basePath}${path}`, params);
      return data;
    },

    /**
     * Custom PUT request
     */
    put: async <R = any, P = any>(path: string, params?: P): Promise<R> => {
      const { data } = await apiClient.put<R>(`${basePath}${path}`, params);
      return data;
    },

    /**
     * Custom DELETE request
     */
    deleteCustom: async <R = any>(path: string): Promise<R> => {
      const { data } = await apiClient.delete<R>(`${basePath}${path}`);
      return data;
    },
  };
}

export default createApiService; 