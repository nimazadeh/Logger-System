import { DEFAULT_SENSITIVE_FIELDS } from './constants.js';

/**
 * Default configuration for the logger middleware.
 * All options can be overridden by passing a config object to requestLogger().
 */
export const DEFAULT_CONFIG = {
  enabled: true,

  // What to log
  logBody: false,
  logHeaders: false,
  logQuery: true,
  logParams: true,
  logUser: true,

  // Security
  autoSanitize: true,
  sensitiveFields: DEFAULT_SENSITIVE_FIELDS,
  maxBodySize: 1024 * 100, // 100 KB — skip logging bodies larger than this

  // Request ID
  requestIdHeader: 'x-request-id',
  addRequestIdHeader: true,

  // Performance
  slowRequestThreshold: 1000, // ms

  // Route filtering
  ignorePaths: ['/health', '/favicon.ico', '/robots.txt'],

  // Body Content-Types eligible for logging
  loggableContentTypes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'text/plain',
  ],
};

/**
 * Deep-merge user-supplied config over defaults.
 * Sensitive fields and ignorePaths are union-merged.
 */
export function mergeConfig(userConfig = {}) {
  const config = { ...DEFAULT_CONFIG };

  for (const [key, value] of Object.entries(userConfig)) {
    if (value === undefined) continue;

    if (key === 'sensitiveFields' && Array.isArray(value)) {
      config.sensitiveFields = new Set([...DEFAULT_CONFIG.sensitiveFields, ...value]);
    } else if (key === 'ignorePaths' && Array.isArray(value)) {
      config.ignorePaths = [...DEFAULT_CONFIG.ignorePaths, ...value];
    } else {
      config[key] = value;
    }
  }

  return config;
}
