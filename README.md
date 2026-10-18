# Expense Tracker API

A small REST API for tracking personal expenses, built with Node.js, Express and SQLite.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:3000` by default. It refuses to start without `JWT_SECRET`, so generate one and put it in `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

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

| Method | Path            | Description          |
| ------ | --------------- | -------------------- |
| GET    | `/expenses`     | List your expenses   |
| GET    | `/expenses/:id` | Get a single expense |
| POST   | `/expenses`     | Create an expense    |
| DELETE | `/expenses/:id` | Delete an expense    |

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
