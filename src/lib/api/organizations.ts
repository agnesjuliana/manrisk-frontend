import { apiClient } from "./config"
import {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  ApiError,
} from "./types"

export const organizationsApi = {
  /**
   * Create a new organization
   * POST /organizations
   */
  create: async (data: CreateOrganizationRequest): Promise<CreateOrganizationResponse> => {
    try {
      const response = await apiClient.post<CreateOrganizationResponse>("/organizations", data)
      return response.data
    } catch (error: any) {
      const apiError: ApiError = error.response?.data || {
        code: error.response?.status || 500,
        message: error.message || "An error occurred",
        status: false,
      }
      throw apiError
    }
  },
}

export default organizationsApi
