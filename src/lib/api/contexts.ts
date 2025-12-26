import { apiClient } from "./config"
import { ApiError } from "./types"

export interface Context {
  id: string
  organizationId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface CreateContextRequest {
  name: string
  description: string
}

export interface CreateContextResponse {
  code: number
  message: string
  status: boolean
  data: Context
}

export interface GetContextsResponse {
  code: number
  message: string
  status: boolean
  data: {
    data: Context[]
    metadata: {
      page: number
      per_page: number
      total: number
      total_pages: number
    }
  }
}

export interface UpdateContextRequest {
  name?: string
  description?: string
}

export interface UpdateContextResponse {
  code: number
  message: string
  status: boolean
  data: Context
}

export interface DeleteContextResponse {
  code: number
  message: string
  status: boolean
  data?: any
}

export const contextsApi = {
  /**
   * Get all contexts with pagination
   * GET /contexts?page=1&per_page=10
   */
  getAll: async (
    page: number = 1,
    perPage: number = 10
  ): Promise<GetContextsResponse> => {
    try {
      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("per_page", perPage.toString())

      const response = await apiClient.get<GetContextsResponse>(
        `/contexts?${params.toString()}`
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
   * Create a new context
   * POST /contexts
   */
  create: async (data: CreateContextRequest): Promise<CreateContextResponse> => {
    try {
      const response = await apiClient.post<CreateContextResponse>("/contexts", data)
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
   * Update a context
   * PATCH /contexts/:id
   */
  update: async (
    id: string,
    data: UpdateContextRequest
  ): Promise<UpdateContextResponse> => {
    try {
      const response = await apiClient.patch<UpdateContextResponse>(
        `/contexts/${id}`,
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
   * Delete a context
   * DELETE /contexts/:id
   */
  delete: async (id: string): Promise<DeleteContextResponse> => {
    try {
      const response = await apiClient.delete<DeleteContextResponse>(
        `/contexts/${id}`
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

export default contextsApi
