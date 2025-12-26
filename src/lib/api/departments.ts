import { apiClient } from "./config"
import {
  Department,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  DeleteDepartmentResponse,
  GetDepartmentsResponse,
  ApiError,
} from "./types"

export const departmentsApi = {
  /**
   * Get all departments with pagination
   * GET /departments?page=1&per_page=10&search=query
   */
  getAll: async (
    page: number = 1,
    perPage: number = 10,
    search?: string
  ): Promise<GetDepartmentsResponse> => {
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("per_page", perPage.toString())
      if (search) {
        params.append("search", search)
      }

      const response = await apiClient.get<GetDepartmentsResponse>(
        `/departments?${params.toString()}`
      )
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

  /**
   * Create a new department
   * POST /departments
   */
  create: async (data: CreateDepartmentRequest): Promise<CreateDepartmentResponse> => {
    try {
      const response = await apiClient.post<CreateDepartmentResponse>("/departments", data)
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

  /**
   * Update a department
   * PATCH /departments/:id
   */
  update: async (
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<UpdateDepartmentResponse> => {
    try {
      const response = await apiClient.patch<UpdateDepartmentResponse>(
        `/departments/${id}`,
        data
      )
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

  /**
   * Delete a department
   * DELETE /departments/:id
   */
  delete: async (id: string): Promise<DeleteDepartmentResponse> => {
    try {
      const response = await apiClient.delete<DeleteDepartmentResponse>(
        `/departments/${id}`
      )
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

export default departmentsApi
