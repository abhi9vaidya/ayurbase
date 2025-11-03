export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-+$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

export function validateRequired(data: Record<string, any>, fields: string[]): boolean {
  return fields.every((field) => data[field] && String(data[field]).trim() !== "")
}

export function sanitizeInput(input: string): string {
  return input.replace(/[;'"`\\]/g, "")
}
