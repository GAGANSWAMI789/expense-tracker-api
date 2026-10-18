const express = require('express');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);

app.use((err, req, res, next) => {
  if (err.status >= 400 && err.status < 500) {
    const message = err.type === 'entity.parse.failed' ? 'Request body is not valid JSON' : err.message;
    return res.status(err.status).json({ error: message });
  }

  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
