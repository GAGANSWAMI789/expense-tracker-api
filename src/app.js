const express = require('express');
const expenseRoutes = require('./routes/expenses');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/expenses', expenseRoutes);

module.exports = app;
