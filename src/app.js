const express = require('express');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const reportRoutes = require('./routes/reports');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
