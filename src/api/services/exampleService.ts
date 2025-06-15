import createApiService from '../createService';
import apiClient from '../apiClient';

// Example entity interface
export interface ExampleEntity {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

// Interface for creating a new entity
export interface CreateExampleParams {
  name: string;
  description: string;
}

// Create base CRUD service
const baseService = createApiService<ExampleEntity, CreateExampleParams>('/examples');

/**
 * Example service demonstrating how to use createApiService
 * with additional custom methods
 */
class ExampleService {
  // Include all base CRUD methods
  getAll = baseService.getAll;
  getById = baseService.getById;
  create = baseService.create;
  update = baseService.update;
  delete = baseService.delete;
  
  /**
   * Example of a custom method using the base service's custom methods
   */
  async searchByName(name: string): Promise<ExampleEntity[]> {
    return baseService.get<ExampleEntity[]>('/search', { name });
  }
  
  /**
   * Example of a custom method not using the base service
   */
  async getStats(): Promise<{ count: number; lastUpdated: string }> {
    const { data } = await apiClient.get<{ count: number; lastUpdated: string }>('/examples/stats');
    return data;
  }
  
  /**
   * Example of a bulk operation
   */
  async bulkCreate(entities: CreateExampleParams[]): Promise<ExampleEntity[]> {
    const { data } = await apiClient.post<ExampleEntity[]>('/examples/bulk', entities);
    return data;
  }
}

export const exampleService = new ExampleService();
export default exampleService; 