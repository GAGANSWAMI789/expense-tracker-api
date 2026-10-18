const { z } = require('zod');

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const currentMonth = () => new Date().toISOString().slice(0, 7);
const currentYear = () => new Date().getUTCFullYear();

const monthlyReportQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must use the YYYY-MM format')
    .refine((value) => {
      const year = Number(value.slice(0, 4));
      return year >= MIN_YEAR && year <= MAX_YEAR;
    }, `month must be between ${MIN_YEAR} and ${MAX_YEAR}`)
    .default(currentMonth),
});

const yearlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(MIN_YEAR).max(MAX_YEAR).default(currentYear),
});

module.exports = { monthlyReportQuerySchema, yearlyReportQuerySchema };
