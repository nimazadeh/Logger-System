import { mergeConfig } from './config.js';
import { sanitize } from './utils/sanitize.js';
import { formatDevLog, formatProdLog } from './utils/formatter.js';

function normalizeIp(ip) {
  if (!ip) return '-';
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  if (ip === '::1') return '127.0.0.1';
  return ip;
}

/**
 * Express error-handling middleware (4-arity signature).
 * Place AFTER routes so it catches thrown / next(err) errors.
 *
 * Usage:
 *   app.use(errorLogger());
 *   app.use(errorHandler); // your own final handler
 */
export function errorLogger(userConfig = {}) {
  const config = mergeConfig(userConfig);
  const isDev = process.env.NODE_ENV !== 'production';

  if (!config.enabled) {
    return function noopErrorLogger(err, _req, _res, next) { next(err); };
  }

  return function errorLogger(err, req, res, _next) {
    const entry = {
      timestamp: new Date(),
      level: 'ERROR',
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      originalUrl: req.originalUrl,
      status: (res.statusCode >= 400) ? res.statusCode : 500,
      duration: 0,
      ip: normalizeIp(req.ip || req.socket?.remoteAddress),
      userAgent: req.headers['user-agent'] || '-',
      requestId: req.requestId || '-',
      httpVersion: `HTTP/${req.httpVersion || '1.1'}`,
      protocol: req.protocol,
      contentLength: '-',
      referrer: req.headers['referer'] || '-',
      slowThreshold: config.slowRequestThreshold,
      error: {
        name: err.name || 'Error',
        message: err.message || 'Unknown error',
        stack: isDev ? err.stack : undefined,
      },
    };

    if (config.logUser && req.user) {
      entry.user = sanitize(req.user, config.sensitiveFields);
    }

    if (isDev) {
      console.error(formatDevLog(entry));
    } else {
      console.error(formatProdLog(entry));
    }

    // Pass error to the next error handler (if any)
    _next(err);
  };
}
