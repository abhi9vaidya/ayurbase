export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT"

export interface RolePermissions {
  canManageMedicines: boolean
  canCreatePrescriptions: boolean
  canEditPrescriptions: boolean
  canViewAllPrescriptions: boolean
  canDeletePrescriptions: boolean
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case "ADMIN":
      return {
        canManageMedicines: true,
        canCreatePrescriptions: false,
        canEditPrescriptions: true,
        canViewAllPrescriptions: true,
        canDeletePrescriptions: true,
      }
    case "DOCTOR":
      return {
        canManageMedicines: false,
        canCreatePrescriptions: true,
        canEditPrescriptions: true,
        canViewAllPrescriptions: false,
        canDeletePrescriptions: false,
      }
    case "PATIENT":
      return {
        canManageMedicines: false,
        canCreatePrescriptions: false,
        canEditPrescriptions: false,
        canViewAllPrescriptions: false,
        canDeletePrescriptions: false,
      }
    default:
      return {
        canManageMedicines: false,
        canCreatePrescriptions: false,
        canEditPrescriptions: false,
        canViewAllPrescriptions: false,
        canDeletePrescriptions: false,
      }
  }
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return getRolePermissions(role)[permission]
}

export function isAdmin(role?: UserRole): boolean {
  return role === "ADMIN"
}

export function isDoctor(role?: UserRole): boolean {
  return role === "DOCTOR"
}

export function isPatient(role?: UserRole): boolean {
  return role === "PATIENT"
}
