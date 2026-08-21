import { Router } from 'express';

const router = Router();

// POST login — password gets redacted in logs
router.post('/', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'credentials required' });
  if (username === 'admin' && password === 's3cret') {
    return res.json({ token: 'eyJhbGciOiJIUzI1NiJ9.faketoken' });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

export default router;
