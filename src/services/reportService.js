const db = require('../db');

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function monthBounds(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return {
    start: `${month}-01`,
    end: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

function getMonthlySummary(userId, month) {
  const { start, end } = monthBounds(month);

  const breakdown = db
    .prepare(
      `SELECT category, COUNT(*) AS count, ROUND(SUM(amount), 2) AS total
       FROM expenses
       WHERE user_id = ? AND spent_on BETWEEN ? AND ?
       GROUP BY category
       ORDER BY total DESC, category ASC`,
    )
    .all(userId, start, end)
    .map(({ category, count, total }) => ({ category, count, total }));

  const total = roundCurrency(breakdown.reduce((sum, item) => sum + item.total, 0));
  const count = breakdown.reduce((sum, item) => sum + item.count, 0);

  return { month, total, count, breakdown };
}

function getYearlySummary(userId, year) {
  const rows = db
    .prepare(
      `SELECT substr(spent_on, 1, 7) AS month, ROUND(SUM(amount), 2) AS total, COUNT(*) AS count
       FROM expenses
       WHERE user_id = ? AND spent_on BETWEEN ? AND ?
       GROUP BY month
       ORDER BY month`,
    )
    .all(userId, `${year}-01-01`, `${year}-12-31`);

  const totalsByMonth = new Map(rows.map((row) => [row.month, row]));

  const months = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, '0')}`;
    const row = totalsByMonth.get(month);
    return { month, total: row ? row.total : 0, count: row ? row.count : 0 };
  });

  const total = roundCurrency(months.reduce((sum, item) => sum + item.total, 0));

  return { year, total, months };
}

module.exports = { getMonthlySummary, getYearlySummary };
