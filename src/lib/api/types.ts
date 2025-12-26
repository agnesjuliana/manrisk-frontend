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
