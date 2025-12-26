import { apiClient } from "./config"
import { ApiError } from "./types"

export interface ScaleStatus {
  id: string
  level: number
  title: string
  createdAt: string
  updatedAt: string | null
}

export interface RiskCriteriaData {
  id: string
  organizationId: string
  isFMEA: boolean
  scale: number
  threshold: number
  createdAt: string
  updatedAt: string | null
  scaleStatuses: ScaleStatus[]
}

export interface RiskCriteriaRequest {
  isFMEA?: boolean
  threshold?: number
}

export interface SaveScaleRequest {
  scale: number
  scale_status: string[]
}

export interface SaveScaleResponse {
  code: number
  message: string
  status: boolean
  data?: {
    data: ScaleStatus[]
    total: number
  }
}

export interface GetRiskCriteriaResponse {
  code: number
  message: string
  status: boolean
  data?: RiskCriteriaData
}

export interface RiskCriteriaResponse {
  code: number
  message: string
  status: boolean
  data?: any
}

export const riskCriteriaApi = {
  /**
   * Get risk criteria settings
   * GET /risk-criteria
   */
  get: async (): Promise<GetRiskCriteriaResponse> => {
    try {
      const response = await apiClient.get<GetRiskCriteriaResponse>(
        "/risk-criteria"
      )
      return response.data
    } catch (error: any) {
      const apiError: ApiError = error.response?.data || {
        code: error.response?.status || 500,
        message: error.message || "Gagal mengambil kriteria risiko",
        status: false,
      }
      throw apiError
    }
  },

  /**
   * Update risk criteria settings
   * POST /risk-criteria
   */
  update: async (payload: RiskCriteriaRequest): Promise<RiskCriteriaResponse> => {
    try {
      const response = await apiClient.post<RiskCriteriaResponse>(
        "/risk-criteria",
        payload
      )
      return response.data
    } catch (error: any) {
      const apiError: ApiError = error.response?.data || {
        code: error.response?.status || 500,
        message: error.message || "Gagal mengupdate kriteria risiko",
        status: false,
      }
      throw apiError
    }
  },

  /**
   * Save scale status labels
   * POST /risk-criteria/scale
   */
  saveScale: async (payload: SaveScaleRequest): Promise<SaveScaleResponse> => {
    try {
      const response = await apiClient.post<SaveScaleResponse>(
        "/risk-criteria/scale",
        payload
      )
      return response.data
    } catch (error: any) {
      const apiError: ApiError = error.response?.data || {
        code: error.response?.status || 500,
        message: error.message || "Gagal menyimpan skala",
        status: false,
      }
      throw apiError
    }
  },
}
