import { apiClient } from "./config";
import type {
  Regulation,
  CreateRegulationRequest,
  UpdateRegulationRequest,
  GetRegulationsResponse,
  ApiResponse,
} from "./types";

export const regulationsApi = {
  /**
   * Get all regulations with pagination
   */
  async getAll(page: number = 1, perPage: number = 100) {
    const response = await apiClient.get<ApiResponse<GetRegulationsResponse>>(
      `/regulations?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },

  /**
   * Create a new regulation
   */
  async create(data: CreateRegulationRequest) {
    const response = await apiClient.post<ApiResponse<Regulation>>(
      `/regulations`,
      data
    );
    return response.data;
  },

  /**
   * Update a regulation
   */
  async update(id: string, data: UpdateRegulationRequest) {
    const response = await apiClient.patch<ApiResponse<Regulation>>(
      `/regulations/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a regulation
   */
  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/regulations/${id}`
    );
    return response.data;
  },
};
