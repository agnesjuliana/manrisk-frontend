// Auth/User related types
export interface User {
  id: string
  email: string
  name: string
  role: "ADMIN" | "USER" | string
  createdAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface RegisterResponse {
  code: number
  message: string
  status: boolean
  data: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  code: number
  message: string
  status: boolean
  data: {
    user: User
    token: string
    expiresIn: number
  }
}

export interface GetProfileResponse {
  code: number
  message: string
  status: boolean
  data: {
    id: string
    email: string
    name: string
    role: "ADMIN" | "USER" | string
    organizationId?: string
    departmentId?: string | null
    createdAt: string
    updatedAt?: string | null
  }
}

// Organization related types
export interface Organization {
  id: string
  name: string
  address: string
  email: string
  noTelp: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrganizationRequest {
  name: string
  address: string
  email: string
  telp: string
}

export interface CreateOrganizationResponse {
  code: number
  message: string
  status: boolean
  data: Organization
}

// Department related types
export interface Department {
  id: string
  organizationId: string
  name: string
  description: string
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateDepartmentRequest {
  name: string
  description: string
  isActive: boolean
}

export interface UpdateDepartmentRequest {
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreateDepartmentResponse {
  code: number
  message: string
  status: boolean
  data: Department
}

export interface UpdateDepartmentResponse {
  code: number
  message: string
  status: boolean
  data: Department
}

export interface DeleteDepartmentResponse {
  code: number
  message: string
  status: boolean
}

export interface GetDepartmentsResponse {
  code: number
  message: string
  status: boolean
  data: {
    data: Department[]
    metadata: PaginationMetadata
  }
}

export interface PaginationMetadata {
  page: number
  per_page: number
  total_data: number
  total_page: number
}

// User Management related types
export interface UserManagement {
  id: string
  organizationId: string
  name: string
  email: string
  role: "ADMIN" | "RISK_MANAGER" | "RISK_OWNER" | "TOP_MANAGEMENT" | string
  departmentId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: "ADMIN" | "RISK_MANAGER" | "RISK_OWNER" | "TOP_MANAGEMENT"
  division_id?: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: "ADMIN" | "RISK_MANAGER" | "RISK_OWNER" | "TOP_MANAGEMENT"
  division_id?: string
}

export interface CreateUserResponse {
  code: number
  message: string
  status: boolean
  data: UserManagement
}

export interface UpdateUserResponse {
  code: number
  message: string
  status: boolean
  data: UserManagement
}

export interface DeleteUserResponse {
  code: number
  message: string
  status: boolean
}

export interface GetUsersResponse {
  code: number
  message: string
  status: boolean
  data: {
    data: UserManagement[]
    metadata: PaginationMetadata
  }
}

export interface ApiResponse<T> {
  code: number
  message: string
  status: boolean
  data: T
}

export interface ApiError {
  code: number
  message: string
  status: boolean
  errors?: Record<string, string[]>
}
