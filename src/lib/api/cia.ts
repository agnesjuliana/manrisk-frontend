import { apiClient } from "./config";
import type {
  CiaObjective,
  ServicePriority,
  CreateServicePriorityRequest,
  UpdateServicePriorityRequest,
  GetCiaResponse,
  ApiResponse,
} from "./types";

export const ciaApi = {
  /**
   * Get CIA objectives and service priorities
   */
  async getObjectives() {
    const response = await apiClient.get<ApiResponse<GetCiaResponse>>(
      `/cia`
    );
    return response.data;
  },

  /**
   * Update CIA objectives (confidentiality, integrity, availability)
   */
  async updateObjectives(data: {
    confidentiality?: string;
    integrity?: string;
    availability?: string;
  }) {
    const response = await apiClient.post<ApiResponse<CiaObjective>>(
      `/cia`,
      data
    );
    return response.data;
  },

  /**
   * Create a new service priority
   */
  async createPriority(data: CreateServicePriorityRequest) {
    const response = await apiClient.post<ApiResponse<ServicePriority>>(
      `/cia/priority`,
      data
    );
    return response.data;
  },

  /**
   * Update a service priority
   */
  async updatePriority(id: string, data: UpdateServicePriorityRequest) {
    const response = await apiClient.patch<ApiResponse<ServicePriority>>(
      `/cia/priority/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a service priority
   */
  async deletePriority(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/cia/priority/${id}`
    );
    return response.data;
  },
};
