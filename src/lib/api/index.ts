// Central export file for all API endpoints
export { authApi } from "./auth"
export { organizationsApi } from "./organizations"
export { departmentsApi } from "./departments"
export { apiClient } from "./config"
export type {
  User,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GetProfileResponse,
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentResponse,
  DeleteDepartmentResponse,
  GetDepartmentsResponse,
  PaginationMetadata,
  ApiResponse,
  ApiError,
} from "./types"
