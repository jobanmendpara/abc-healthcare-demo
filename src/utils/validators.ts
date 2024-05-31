import { z } from 'zod';

export function validateName(name: string) {
  return z.string().min(1).max(255).safeParse(name).success;
}

export function validateEmail(email: string) {
  return z.string().email().safeParse(email).success;
}

export function validatePhone(phone: string) {
  const regex = /^\d{10}$/;

  return regex.test(phone.slice(-10));
}

export function validatePassword(password: string) {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isValidLength = password.length >= 8;

  return hasLower && hasUpper && hasNumber && hasSpecial && isValidLength;
}
