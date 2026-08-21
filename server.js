import express from 'express';
import { requestLogger, errorLogger } from './logger/index.js';

import indexRoutes from './routes/index.js';
import itemRoutes from './routes/items.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';

const app = express();
const PORT = 3000;

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── Logger (before routes) ───────────────────────────────────────────────────
app.use(requestLogger({
  logBody: true,
  ignorePaths: ['/health'],
  slowRequestThreshold: 1000,
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/',       indexRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/login', authRoutes);
app.use('/api',     testRoutes);

// ── Error logger (after routes) ──────────────────────────────────────────────
app.use(errorLogger());

// ── Final error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  🌈  Express Logger Demo`);
  console.log(`  ➜  http://localhost:${PORT}\n`);
  console.log('  Routes:');
  console.log('    GET  /                       home');
  console.log('    GET  /health                 (ignored)');
  console.log('    GET  /api/items');
  console.log('    GET  /api/items/:id');
  console.log('    POST /api/items              { "name": "Foo" }');
  console.log('    POST /api/login              { "username": "admin", "password": "s3cret" }');
  console.log('    GET  /api/slow               (1.5s → ⚠ SLOW)');
  console.log('    GET  /api/error              (sync 500)');
  console.log('    GET  /api/async-error        (async 500)');
  console.log('');
});
