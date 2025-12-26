import { apiClient } from "./config"
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GetProfileResponse,
  ApiError,
} from "./types"

export const authApi = {
  /**
   * Register a new user
   * POST /users/register
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>("/users/register", data)
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
   * Login a user
   * POST /users/login
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>("/users/login", data)
      // Store token if login is successful
      if (response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token)
      }
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
   * Logout a user
   */
  logout: () => {
    localStorage.removeItem("token")
  },

  /**
   * Get current user profile
   * GET /users/me
   */
  getProfile: async (): Promise<GetProfileResponse> => {
    try {
      const response = await apiClient.get<GetProfileResponse>("/users/me")
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
