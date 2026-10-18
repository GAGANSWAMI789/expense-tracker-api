const { z } = require('zod');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a date in YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'must be a valid date');

const createExpenseSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(100),
  amount: z.number().positive().max(10_000_000),
  category: z.string().trim().toLowerCase().min(1).max(30).default('other'),
  spentOn: isoDate.optional(),
});

const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'at least one field must be provided',
  });

const listExpensesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().trim().toLowerCase().max(30).optional(),
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
};
