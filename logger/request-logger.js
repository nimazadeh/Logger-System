import { mergeConfig } from './config.js';
import { resolveRequestId } from './utils/request-id.js';
import { createTimer } from './utils/timer.js';
import { sanitize } from './utils/sanitize.js';
import { formatDevLog, formatProdLog } from './utils/formatter.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeIp(ip) {
  if (!ip) return '-';
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  if (ip === '::1') return '127.0.0.1';
  return ip;
}

function shouldIgnore(path, ignorePaths) {
  return ignorePaths.some((ignored) => {
    if (ignored instanceof RegExp) return ignored.test(path);
    return path === ignored || path.startsWith(ignored);
  });
}

function shouldLogBody(req, config) {
  if (!config.logBody) return false;
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) return false;

  const contentType = req.headers['content-type'] || '';
  if (!config.loggableContentTypes.some((ct) => contentType.includes(ct))) return false;

  try {
    if (JSON.stringify(req.body).length > config.maxBodySize) return false;
  } catch {
    return false;
  }

  return true;
}

function shouldLogHeaders(config) {
  return config.logHeaders;
}

function determineLevel(statusCode, duration, slowThreshold) {
  if (statusCode >= 500) return 'ERROR';
  if (statusCode >= 400) return 'WARN';
  if (duration >= slowThreshold) return 'WARN';
  return 'INFO';
}

// ── Middleware factory ────────────────────────────────────────────────────────

export function requestLogger(userConfig = {}) {
  const config = mergeConfig(userConfig);
  const isDev = process.env.NODE_ENV !== 'production';

  if (!config.enabled) {
    return function noopLogger(_req, _res, next) { next(); };
  }

  return function logger(req, res, next) {
    // Fast-path: ignored routes
    const checkPath = (req.originalUrl || req.path || '').split('?')[0];
    if (shouldIgnore(checkPath, config.ignorePaths)) {
      return next();
    }

    const timer = createTimer();
    const requestId = resolveRequestId(req, config);
    const timestamp = new Date();

    // Attach to request for downstream use
    req.requestId = requestId;

    // Optional response header
    if (config.addRequestIdHeader) {
      res.setHeader('X-Request-ID', requestId);
    }

    let logged = false;

    function logResponse() {
      if (logged) return;
      logged = true;

      const duration = timer.elapsed();

      const entry = {
        timestamp,
        level: determineLevel(res.statusCode, duration, config.slowRequestThreshold),
        method: req.method,
        url: req.originalUrl || req.url,
        path: req.path,
        originalUrl: req.originalUrl,
        status: res.statusCode,
        duration,
        ip: normalizeIp(req.ip || req.socket?.remoteAddress),
        userAgent: req.headers['user-agent'] || '-',
        requestId,
        httpVersion: `HTTP/${req.httpVersion || '1.1'}`,
        protocol: req.protocol,
        contentLength: String(res.getHeader('content-length') || '-'),
        referrer: req.headers['referer'] || req.headers['referrer'] || '-',
        slowThreshold: config.slowRequestThreshold,
      };

      if (config.logQuery) entry.query = req.query;
      if (config.logParams) entry.params = req.params;
      if (shouldLogBody(req, config)) entry.body = sanitize(req.body, config.sensitiveFields);
      if (config.logUser && req.user) entry.user = sanitize(req.user, config.sensitiveFields);
      if (shouldLogHeaders(config)) {
        const h = { ...req.headers };
        delete h.cookie; // always strip cookies from header log
        entry.headers = sanitize(h, config.sensitiveFields);
      }

      if (isDev) {
        console.log(formatDevLog(entry));
      } else {
        console.log(formatProdLog(entry));
      }
    }

    // Log after the response is fully written
    res.on('finish', logResponse);

    // Handle client aborts (finish never fires)
    req.on('close', () => {
      if (!res.writableFinished && !logged) {
        logged = true;
        const duration = timer.elapsed();
        const entry = {
          timestamp,
          level: 'WARN',
          method: req.method,
          url: req.originalUrl || req.url,
          path: req.path,
          originalUrl: req.originalUrl,
          status: 0,
          duration,
          ip: normalizeIp(req.ip || req.socket?.remoteAddress),
          userAgent: req.headers['user-agent'] || '-',
          requestId,
          httpVersion: `HTTP/${req.httpVersion || '1.1'}`,
          protocol: req.protocol,
          contentLength: '-',
          referrer: req.headers['referer'] || '-',
          slowThreshold: config.slowRequestThreshold,
          error: { name: 'ClientAborted', message: 'Request aborted by client before response completed' },
        };

        if (isDev) {
          console.warn(formatDevLog(entry));
        } else {
          console.warn(formatProdLog(entry));
        }
      }
    });

    next();
  };
}
