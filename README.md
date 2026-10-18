# Expense Tracker API

A small REST API for tracking personal expenses, built with Node.js, Express and SQLite.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:3000` by default. Set `JWT_SECRET` in `.env` before running it anywhere other than your own machine.

## Authentication

Register an account, log in, and send the returned token with every request to `/expenses`:

```
Authorization: Bearer <token>
```

| Method | Path             | Description                 |
| ------ | ---------------- | --------------------------- |
| POST   | `/auth/register` | Create an account           |
| POST   | `/auth/login`    | Log in and receive a token  |

```json
{
  "email": "meera@example.com",
  "password": "password123"
}
```

## Expenses

All expense endpoints require a valid token and only work with the current user's expenses.

| Method | Path            | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/expenses`     | List your expenses        |
| GET    | `/expenses/:id` | Get a single expense      |
| POST   | `/expenses`     | Create an expense         |
| PATCH  | `/expenses/:id` | Update part of an expense |
| DELETE | `/expenses/:id` | Delete an expense         |

```json
{
  "title": "Groceries",
  "amount": 450,
  "category": "food",
  "spentOn": "2026-10-01"
}
```

`title` and `amount` are required. `amount` must be a positive number, `spentOn` must use the `YYYY-MM-DD` format and defaults to today, and `category` defaults to `other`.

### Listing and filtering

`GET /expenses` supports these query parameters:

| Parameter  | Default | Description                     |
| ---------- | ------- | ------------------------------- |
| `page`     | `1`     | Page number                     |
| `limit`    | `20`    | Items per page, up to 100       |
| `category` |         | Only return expenses in a category |

The response is paginated:

```json
{
  "data": [{ "id": 1, "title": "Groceries", "amount": 450, "category": "food", "spent_on": "2026-10-01" }],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### Errors

Errors always come back as JSON with an `error` message. Validation errors also include a `details` array listing each invalid field.

## Reports

| Method | Path               | Description                                |
| ------ | ------------------ | ------------------------------------------ |
| GET    | `/reports/monthly` | Spending by category for a month           |
| GET    | `/reports/yearly`  | Spending per month for a year              |

`/reports/monthly?month=2026-03` defaults to the current month:

```json
{
  "month": "2026-03",
  "total": 19000,
  "count": 4,
  "breakdown": [
    { "category": "housing", "count": 1, "total": 15000 },
    { "category": "food", "count": 2, "total": 3500 },
    { "category": "travel", "count": 1, "total": 500 }
  ]
}
```

`/reports/yearly?year=2026` defaults to the current year and always returns all twelve months, with zeros for months that have no expenses.

## Running tests

```bash
npm test
```
