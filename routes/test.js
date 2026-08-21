import { Router } from 'express';

const router = Router();

// Simulate slow response (>1s → SLOW warning)
router.get('/slow', (_req, res) => {
  setTimeout(() => res.json({ message: 'That was slow!' }), 1500);
});

// Trigger sync 500 error
router.get('/error', (_req, _res) => {
  throw new Error('Intentional boom!');
});

// Trigger async 500 error
router.get('/async-error', async (_req, _res) => {
  await new Promise((_resolve, reject) => setTimeout(() => reject(new Error('Async boom!')), 50));
});

export default router;
