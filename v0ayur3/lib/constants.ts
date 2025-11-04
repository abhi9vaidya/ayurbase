export const APPOINTMENT_STATUS = {
  SCHEDULED: "SCHEDULED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export const USER_ROLES = {
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  PATIENT: "PATIENT",
} as const

export const MEDICINE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Powder",
  "Liquid",
  "Spray",
  "Drop",
] as const

export const STATUS_COLORS = {
  SCHEDULED: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  COMPLETED: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  CANCELLED: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
} as const

export const TOAST_MESSAGES = {
  SUCCESS: {
    SAVED: "Saved successfully",
    CREATED: "Created successfully",
    UPDATED: "Updated successfully",
    DELETED: "Deleted successfully",
  },
  ERROR: {
    FETCH_FAILED: "Failed to load data",
    SAVE_FAILED: "Failed to save data",
    DELETE_FAILED: "Failed to delete item",
    UNAUTHORIZED: "You are not authorized to perform this action",
  },
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

export const VALIDATION_RULES = {
  MEDICINE_NAME_MIN_LENGTH: 2,
  MEDICINE_NAME_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 5000,
  DOSE_MAX_LENGTH: 50,
  DURATION_MAX_LENGTH: 50,
} as const
