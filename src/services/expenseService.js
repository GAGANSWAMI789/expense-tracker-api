const db = require('../db');
const HttpError = require('../utils/httpError');

const COLUMN_FOR_FIELD = {
  title: 'title',
  amount: 'amount',
  category: 'category',
  spentOn: 'spent_on',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function findExpense(userId, id) {
  const expense = db
    .prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?')
    .get(id, userId);

  if (!expense) {
    throw new HttpError(404, 'Expense not found');
  }
  return expense;
}

function listExpenses(userId, { page, limit, category }) {
  const offset = (page - 1) * limit;

  let filter = 'WHERE user_id = ?';
  const params = [userId];
  if (category) {
    filter += ' AND category = ?';
    params.push(category);
  }

  const expenses = db
    .prepare(`SELECT * FROM expenses ${filter} ORDER BY spent_on DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM expenses ${filter}`).get(...params);

  return {
    data: expenses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function createExpense(userId, { title, amount, category, spentOn }) {
  const result = db
    .prepare('INSERT INTO expenses (user_id, title, amount, category, spent_on) VALUES (?, ?, ?, ?, ?)')
    .run(userId, title, amount, category, spentOn || today());

  return findExpense(userId, result.lastInsertRowid);
}

function updateExpense(userId, id, changes) {
  findExpense(userId, id);

  const fields = Object.entries(changes).filter(([, value]) => value !== undefined);
  const assignments = fields.map(([field]) => `${COLUMN_FOR_FIELD[field]} = ?`).join(', ');
  const values = fields.map(([, value]) => value);

  db.prepare(`UPDATE expenses SET ${assignments} WHERE id = ? AND user_id = ?`).run(...values, id, userId);

  return findExpense(userId, id);
}

function deleteExpense(userId, id) {
  const result = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
  if (result.changes === 0) {
    throw new HttpError(404, 'Expense not found');
  }
}

module.exports = {
  findExpense,
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
