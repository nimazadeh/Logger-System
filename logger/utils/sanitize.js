import { DEFAULT_SENSITIVE_FIELDS } from '../constants.js';

const MASK = '***REDACTED***';
const MAX_DEPTH = 10;
const MAX_STRING_LENGTH = 500;

/**
 * Recursively sanitize an object, masking sensitive fields.
 * Handles nested objects, arrays, Buffers, and deep nesting.
 */
export function sanitize(obj, sensitiveFields = DEFAULT_SENSITIVE_FIELDS, depth = 0) {
  if (depth > MAX_DEPTH) return '[Object too deep]';
  if (obj === null || obj === undefined) return obj;

  // Primitives
  if (typeof obj === 'string') {
    return obj.length > MAX_STRING_LENGTH
      ? obj.slice(0, MAX_STRING_LENGTH) + `...[${obj.length} chars total]`
      : obj;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj;

  // Buffers / binary
  if (Buffer.isBuffer(obj)) return '[Buffer]';
  if (obj instanceof ArrayBuffer) return '[ArrayBuffer]';

  // Arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, sensitiveFields, depth + 1));
  }

  // Plain objects
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    if (sensitiveFields.has(key) || sensitiveFields.has(lower)) {
      sanitized[key] = MASK;
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitize(value, sensitiveFields, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
