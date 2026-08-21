import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/', (_req, res) => {
  res.json({ message: '🚀 Logger middleware demo — every request is logged with color!' });
});

export default router;
