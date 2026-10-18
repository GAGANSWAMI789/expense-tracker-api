const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const expenses = db
    .prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY spent_on DESC, id DESC')
    .all(req.user.id);
  res.json(expenses);
});

router.get('/:id', (req, res) => {
  const expense = db
    .prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(expense);
});

router.post('/', (req, res) => {
  const { title, amount, category, spentOn } = req.body;
  if (!title || amount === undefined) {
    return res.status(400).json({ error: 'title and amount are required' });
  }

  const date = spentOn || new Date().toISOString().slice(0, 10);
  const result = db
    .prepare('INSERT INTO expenses (user_id, title, amount, category, spent_on) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, title, amount, category || 'other', date);

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(expense);
});

router.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.status(204).end();
});

module.exports = router;
