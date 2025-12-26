import { apiClient } from "./config"
import {
  UserManagement,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  GetUsersResponse,
  ApiError,
} from "./types"

export const usersApi = {
  /**
   * Get all users with pagination
   * GET /user-management?page=1&per_page=20&search=query
   */
  getAll: async (
    page: number = 1,
    perPage: number = 20,
    search?: string
  ): Promise<GetUsersResponse> => {
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("per_page", perPage.toString())
      if (search) {
        params.append("search", search)
      }

      const response = await apiClient.get<GetUsersResponse>(
        `/user-management?${params.toString()}`
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
   * Create a new user
   * POST /user-management
   */
  create: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    try {
      const response = await apiClient.post<CreateUserResponse>("/user-management", data)
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
   * Update a user
   * PATCH /user-management/:id
   */
  update: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<UpdateUserResponse> => {
    try {
      const response = await apiClient.patch<UpdateUserResponse>(
        `/user-management/${id}`,
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
   * Delete a user
   * DELETE /user-management/:id
   */
  delete: async (id: string): Promise<DeleteUserResponse> => {
    try {
      const response = await apiClient.delete<DeleteUserResponse>(
        `/user-management/${id}`
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

export default usersApi
