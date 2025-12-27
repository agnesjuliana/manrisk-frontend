import { apiClient } from "./config";
import type {
  AssetType,
  AssetClassification,
  CreateAssetRequest,
  AssetResponse,
} from "./types";

export interface ApiResponse<T> {
  status: boolean
  code: number
  message: string
  data: T
}

export interface PaginationMetadata {
  page: number
  per_page: number
  total_data: number
  total_page: number
}

export interface GetAssetsResponse {
  data: AssetResponse[]
  metadata: PaginationMetadata
}

export const assetsApi = {
  getAssets: async (page: number = 1, per_page: number = 20) => {
    try {
      const response = await apiClient.get<ApiResponse<GetAssetsResponse>>(
        "/assets",
        {
          params: {
            page,
            per_page,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
  },

  getTypes: async () => {
    try {
      const response = await apiClient.get<ApiResponse<{ data: AssetType[] }>>(
        "/assets/type"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching asset types:", error);
      throw error;
    }
  },

  getClassifications: async () => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ data: AssetClassification[] }>
      >("/assets/classification");
      return response.data;
    } catch (error) {
      console.error("Error fetching asset classifications:", error);
      throw error;
    }
  },

  create: async (payload: CreateAssetRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<AssetResponse>>(
        "/assets",
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating asset:", error);
      throw error;
    }
  },

  update: async (id: string, payload: Partial<CreateAssetRequest>) => {
    try {
      const response = await apiClient.patch<ApiResponse<AssetResponse>>(
        `/assets/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating asset:", error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete<ApiResponse<{ id: string }>>(
        `/assets/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting asset:", error);
      throw error;
    }
  },
};
