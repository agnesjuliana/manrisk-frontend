import { apiClient } from "./config";
import type {
  ExternalStakeholder,
  CreateExternalStakeholderRequest,
  UpdateExternalStakeholderRequest,
  GetExternalStakeholdersResponse,
  ApiResponse,
} from "./types";

export const externalStakeholdersApi = {
  /**
   * Get all external stakeholders with pagination
   */
  async getAll(page: number = 1, perPage: number = 20) {
    const response = await apiClient.get<ApiResponse<GetExternalStakeholdersResponse>>(
      `/external-stakeholders?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },

  /**
   * Create a new external stakeholder
   */
  async create(data: CreateExternalStakeholderRequest) {
    const response = await apiClient.post<ApiResponse<ExternalStakeholder>>(
      `/external-stakeholders`,
      data
    );
    return response.data;
  },

  /**
   * Update an external stakeholder
   */
  async update(id: string, data: UpdateExternalStakeholderRequest) {
    const response = await apiClient.patch<ApiResponse<ExternalStakeholder>>(
      `/external-stakeholders/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an external stakeholder
   */
  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/external-stakeholders/${id}`
    );
    return response.data;
  },
};
