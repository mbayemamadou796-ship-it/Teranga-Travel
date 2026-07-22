export function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9+\s-]{8,15}$/.test(phone);
}
