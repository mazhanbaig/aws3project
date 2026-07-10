export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequired(value: unknown, field: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return { field, message: `${field} is required` };
  }
  return null;
}

export function validateString(value: unknown, field: string, maxLength = 500): ValidationError | null {
  if (typeof value !== 'string') {
    return { field, message: `${field} must be a string` };
  }
  if (value.trim().length === 0) {
    return { field, message: `${field} cannot be empty` };
  }
  if (value.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters` };
  }
  return null;
}

export function validateUrl(value: unknown, field: string): ValidationError | null {
  const strErr = validateString(value, field, 2048);
  if (strErr) return strErr;

  try {
    const url = new URL(value as string);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { field, message: `${field} must use http or https protocol` };
    }
  } catch {
    return { field, message: `${field} is not a valid URL` };
  }

  return null;
}

export function validateEmail(value: unknown): ValidationError | null {
  const strErr = validateString(value, 'email', 255);
  if (strErr) return strErr;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test((value as string).trim())) {
    return { field: 'email', message: 'Invalid email format' };
  }

  return null;
}

export function validatePassword(value: unknown): ValidationError | null {
  const strErr = validateString(value, 'password', 128);
  if (strErr) return strErr;

  if ((value as string).length < 6) {
    return { field: 'password', message: 'Password must be at least 6 characters' };
  }

  return null;
}

export function validatePositiveInt(value: unknown, field: string): ValidationError | null {
  const num = parseInt(value as string, 10);
  if (isNaN(num) || num < 1) {
    return { field, message: `${field} must be a positive integer` };
  }
  return null;
}
