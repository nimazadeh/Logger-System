/**
 * Default set of sensitive field names (lowercased) that will be
 * automatically masked with ***REDACTED*** in log output.
 */
export const DEFAULT_SENSITIVE_FIELDS = new Set([
  // Authentication
  'password', 'passwd', 'pwd',
  'confirm_password', 'confirmPassword',
  'old_password', 'oldPassword',
  'new_password', 'newPassword',

  // Tokens
  'token', 'access_token', 'accessToken',
  'refresh_token', 'refreshToken',
  'jwt', 'jwt_token', 'jwtToken',
  'bearer', 'bearer_token', 'bearerToken',

  // Auth headers
  'authorization', 'auth',

  // Cookies / sessions
  'cookie', 'cookies', 'session', 'session_id', 'sessionId',

  // API keys
  'api_key', 'apiKey', 'api-key',
  'secret_key', 'secretKey', 'secret-key',
  'access_key', 'accessKey', 'access-key',

  // Secrets
  'secret', 'secrets',
  'private_key', 'privateKey', 'private-key',
  'signing_key', 'signingKey',

  // Payment
  'credit_card', 'creditCard',
  'card_number', 'cardNumber',
  'cvv', 'cvc', 'ccv', 'cvv2',
  'ssn', 'social_security_number',

  // Misc
  'pin', 'pin_code', 'pinCode',
  'otp', 'one_time_password',
  'encryption_key', 'encryptionKey',
]);
