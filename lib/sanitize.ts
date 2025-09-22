// lib/sanitize.ts
import mongoSanitize from "mongo-sanitize";

/**
 * Sanitizes input to prevent NoSQL injection attacks
 * Removes any keys that start with '$' or contain '.'
 */
export function sanitizeInput<T>(input: T): T {
  return mongoSanitize(input);
}

/**
 * Sanitizes and validates email input
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email);
  if (typeof sanitized !== "string") {
    throw new Error("Invalid email format");
  }
  return sanitized.toLowerCase().trim();
}

/**
 * Sanitizes string input and ensures it's actually a string
 */
export function sanitizeString(input: any): string {
  const sanitized = sanitizeInput(input);
  if (typeof sanitized !== "string") {
    throw new Error("Invalid string input");
  }
  return sanitized.trim();
}

/**
 * Sanitizes object with multiple fields for user authentication
 */
export function sanitizeAuthInput(data: {
  email?: any;
  username?: any;
  password?: any;
  passwordConfirm?: any;
  token?: any;
  otp?: any;
}) {
  const result: any = {};

  if (data.email !== undefined) {
    result.email = sanitizeEmail(data.email);
  }

  if (data.username !== undefined) {
    result.username = sanitizeString(data.username);
  }

  if (data.password !== undefined) {
    result.password = sanitizeString(data.password);
  }

  if (data.passwordConfirm !== undefined) {
    result.passwordConfirm = sanitizeString(data.passwordConfirm);
  }

  if (data.token !== undefined) {
    result.token = sanitizeString(data.token);
  }

  if (data.otp !== undefined) {
    result.otp = sanitizeString(data.otp);
  }

  return result;
}
