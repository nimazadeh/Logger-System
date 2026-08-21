import pc from 'picocolors';

const identity = (s) => s;

/**
 * Returns a color-utils object that is active in development
 * and is a no-op (identity functions) in production.
 */
export function getColors(isDev) {
  if (!isDev) {
    const noop = () => identity;
    return {
      method: { GET: identity, POST: identity, PUT: identity, PATCH: identity, DELETE: identity, OPTIONS: identity, HEAD: identity },
      status: () => identity,
      level: { INFO: identity, WARN: identity, ERROR: identity, DEBUG: identity },
      timestamp: identity,
      requestId: identity,
      ip: identity,
      dim: identity,
      bold: identity,
      slow: identity,
    };
  }

  return {
    method: {
      GET: pc.green,
      POST: pc.blue,
      PUT: pc.yellow,
      PATCH: pc.magenta,
      DELETE: pc.red,
      OPTIONS: pc.gray,
      HEAD: pc.gray,
    },
    status: (code) => {
      if (code >= 500) return pc.red;
      if (code >= 400) return pc.yellow;
      if (code >= 300) return pc.cyan;
      if (code >= 200) return pc.green;
      return pc.white;
    },
    level: {
      INFO: pc.green,
      WARN: pc.yellow,
      ERROR: pc.red,
      DEBUG: pc.gray,
    },
    timestamp: pc.gray,
    requestId: pc.dim,
    ip: pc.dim,
    dim: pc.dim,
    bold: pc.bold,
    slow: pc.red,
  };
}
