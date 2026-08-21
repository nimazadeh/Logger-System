import { getColors } from './colors.js';

const METHOD_PAD = 7;

function formatTimestamp(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').slice(0, 23);
}

function formatDuration(ms) {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function truncate(str, max = 80) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '…';
}

// ── Dev formatter (coloured, human-readable) ─────────────────────────────────

export function formatDevLog(entry) {
  const colors = getColors(true);
  const ts = colors.timestamp(formatTimestamp(entry.timestamp));
  const level = colors.level[entry.level](` ${entry.level.padEnd(5)} `);
  const method = (colors.method[entry.method] || identity)(entry.method.padEnd(METHOD_PAD));
  const url = entry.url;
  const statusColor = colors.status(entry.status);
  const status = statusColor(` ${entry.status} `);

  const isSlow = entry.duration >= entry.slowThreshold;
  const duration = isSlow
    ? colors.slow(` ⚠  ${formatDuration(entry.duration)} SLOW`)
    : colors.dim(formatDuration(entry.duration));

  const main = `${ts} ${level}${method}${url}  ${status} ${duration}`;

  const extras = [];

  if (entry.ip && entry.ip !== '-') {
    extras.push(`  IP: ${colors.ip(entry.ip)}`);
  }
  if (entry.requestId) {
    extras.push(`  req:${colors.requestId(entry.requestId.slice(0, 8))}`);
  }

  if (entry.query && Object.keys(entry.query).length > 0) {
    extras.push(`  Query: ${colors.dim(JSON.stringify(entry.query))}`);
  }
  if (entry.params && Object.keys(entry.params).length > 0) {
    extras.push(`  Params: ${colors.dim(JSON.stringify(entry.params))}`);
  }
  if (entry.body && Object.keys(entry.body).length > 0) {
    extras.push(`  Body: ${colors.dim(truncate(JSON.stringify(entry.body), 120))}`);
  }
  if (entry.headers && Object.keys(entry.headers).length > 0) {
    extras.push(`  Headers: ${colors.dim(truncate(JSON.stringify(entry.headers), 120))}`);
  }
  if (entry.user) {
    extras.push(`  User: ${colors.dim(JSON.stringify(entry.user))}`);
  }
  if (entry.error) {
    extras.push(`  ${colors.level.ERROR('Error:')} ${entry.error.message}`);
    if (entry.error.stack) {
      extras.push(`  ${colors.dim(entry.error.stack.split('\n').slice(0, 6).join('\n  '))}`);
    }
  }
  if (entry.contentLength && entry.contentLength !== '-') {
    extras.push(`  Size: ${colors.dim(entry.contentLength)}B`);
  }

  return extras.length > 0 ? main + '\n' + extras.join('\n') : main;
}

// ── Prod formatter (structured JSON) ─────────────────────────────────────────

export function formatProdLog(entry) {
  const obj = {
    timestamp: entry.timestamp.toISOString(),
    level: entry.level,
    method: entry.method,
    url: entry.url,
    path: entry.path,
    originalUrl: entry.originalUrl,
    status: entry.status,
    responseTime: Math.round(entry.duration * 100) / 100,
    ip: entry.ip,
    userAgent: entry.userAgent,
    requestId: entry.requestId,
    httpVersion: entry.httpVersion,
    protocol: entry.protocol,
    contentLength: entry.contentLength,
    referrer: entry.referrer,
  };

  if (entry.query && Object.keys(entry.query).length > 0) obj.query = entry.query;
  if (entry.params && Object.keys(entry.params).length > 0) obj.params = entry.params;
  if (entry.body && Object.keys(entry.body).length > 0) obj.body = entry.body;
  if (entry.headers && Object.keys(entry.headers).length > 0) obj.headers = entry.headers;
  if (entry.user) obj.user = entry.user;
  if (entry.error) {
    obj.error = {
      name: entry.error.name,
      message: entry.error.message,
      stack: entry.error.stack,
    };
  }

  return JSON.stringify(obj);
}

// Needed by getColors prod path
function identity(s) { return s; }
