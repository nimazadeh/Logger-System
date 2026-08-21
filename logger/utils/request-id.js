import crypto from 'node:crypto';

/**
 * Generate a new v4 UUID.
 */
export function generateRequestId() {
  return crypto.randomUUID();
}

/**
 * Resolve a request ID: reuse the incoming header value if present,
 * otherwise generate a new one.  Attaches to req.requestId.
 */
export function resolveRequestId(req, config) {
  const incoming = req.headers[config.requestIdHeader];
  if (incoming && typeof incoming === 'string' && incoming.length <= 128) {
    return incoming;
  }
  return generateRequestId();
}
