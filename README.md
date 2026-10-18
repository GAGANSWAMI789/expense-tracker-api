# Expense Tracker API

A small REST API for tracking personal expenses, built with Node.js, Express and SQLite.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:3000` by default.

## Endpoints

| Method | Path            | Description          |
| ------ | --------------- | -------------------- |
| GET    | `/health`       | Health check         |
| GET    | `/expenses`     | List all expenses    |
| GET    | `/expenses/:id` | Get a single expense |
| POST   | `/expenses`     | Create an expense    |
| DELETE | `/expenses/:id` | Delete an expense    |

Example request body for creating an expense:

```json
{
  "title": "Groceries",
  "amount": 450,
  "category": "food",
  "spentOn": "2026-10-01"
}
```

## Running tests

```bash
npm test
```
