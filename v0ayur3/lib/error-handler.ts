export interface ApiError {
  status: number
  message: string
  details?: string
}

export class AppError extends Error {
  status: number
  details?: string

  constructor(message: string, status = 500, details?: string) {
    super(message)
    this.status = status
    this.details = details
    this.name = "AppError"
  }
}

export function handleApiError(error: any): ApiError {
  if (error.response) {
    // API responded with error
    return {
      status: error.response.status,
      message: error.response.data?.message || "An error occurred",
      details: error.response.data?.details,
    }
  } else if (error.request) {
    // Request made but no response
    return {
      status: 0,
      message: "No response from server. Please check your connection.",
    }
  } else {
    // Something else happened
    return {
      status: 500,
      message: error.message || "An unexpected error occurred",
    }
  }
}

export function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error
  }
  if (error instanceof AppError) {
    return error.message
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return "An unexpected error occurred"
}

export function isAuthError(error: any): boolean {
  return error?.response?.status === 401 || error?.response?.status === 403
}

export function isNotFoundError(error: any): boolean {
  return error?.response?.status === 404
}

export function isConflictError(error: any): boolean {
  return error?.response?.status === 409
}

export function isValidationError(error: any): boolean {
  return error?.response?.status === 400
}
