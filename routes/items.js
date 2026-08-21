import { Router } from 'express';

const router = Router();

// GET list
router.get('/', (_req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Widget' },
      { id: 2, name: 'Gadget' },
      { id: 3, name: 'Doohickey' },
    ],
  });
});

// GET single
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id < 1) return res.status(400).json({ error: 'Invalid id' });
  if (id > 3) return res.status(404).json({ error: 'Item not found' });
  res.json({ id, name: `Item #${id}` });
});

// POST create — body logging + sanitization demo
router.post('/', (req, res) => {
  const { name, secret_token } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  res.status(201).json({ id: Date.now(), name, receivedSecret: secret_token });
});

export default router;
