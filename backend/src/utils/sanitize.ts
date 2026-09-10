import { Types } from 'mongoose';

/**
 * Escapes any special regex characters from user input to prevent ReDoS / Regex Injection.
 */
export function escapeRegex(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Ensures an ID is strictly a valid string and not a MongoDB operator or parameter-tampering object.
 */
export function toSafeString(val: unknown, fallback = ''): string {
  if (typeof val === 'string') {
    // Strip leading dollar signs to prevent operator injection
    return val.startsWith('$') ? val.slice(1) : val;
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  return fallback;
}

/**
 * Validates whether a value is a valid 24-hex-character MongoDB ObjectId string.
 */
export function isSafeObjectId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Safely converts an input to a Mongoose Types.ObjectId, returning null if invalid.
 */
export function toSafeObjectId(id: unknown): Types.ObjectId | null {
  if (!isSafeObjectId(id)) return null;
  try {
    return new Types.ObjectId(String(id).trim());
  } catch {
    return null;
  }
}

/**
 * Recursively strips keys that start with '$' or contain '.' from user-controlled objects,
 * preventing NoSQL query tampering and operator injection.
 */
export function sanitizeMongoInput<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMongoInput(item)) as any;
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Disallow MongoDB operators ($where, $gt, etc.) and prototype pollution keys
    if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor') {
      continue;
    }
    clean[key] = sanitizeMongoInput(value);
  }
  return clean as T;
}
