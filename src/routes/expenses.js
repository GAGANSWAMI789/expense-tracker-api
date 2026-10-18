const express = require('express');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const expenseService = require('../services/expenseService');
const {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
} = require('../schemas/expense');

const router = express.Router();

router.use(requireAuth);

router.get('/', validate(listExpensesQuerySchema, 'query'), (req, res) => {
  res.json(expenseService.listExpenses(req.user.id, req.query));
});

router.get('/:id', (req, res) => {
  res.json(expenseService.findExpense(req.user.id, req.params.id));
});

router.post('/', validate(createExpenseSchema), (req, res) => {
  const expense = expenseService.createExpense(req.user.id, req.body);
  res.status(201).json(expense);
});

router.patch('/:id', validate(updateExpenseSchema), (req, res) => {
  res.json(expenseService.updateExpense(req.user.id, req.params.id, req.body));
});

router.delete('/:id', (req, res) => {
  expenseService.deleteExpense(req.user.id, req.params.id);
  res.status(204).end();
});

module.exports = router;
