import { z } from "zod";

const confidenceSchema = z.object({
  merchantName: z.coerce.number().min(0).max(1).default(0),
  date: z.coerce.number().min(0).max(1).default(0),
  totalAmount: z.coerce.number().min(0).max(1).default(0),
  currency: z.coerce.number().min(0).max(1).default(0)
});

export const extractionSchema = z.object({
  merchantName: z.string().trim().nullable().default(null),
  date: z.string().trim().nullable().default(null),
  totalAmount: z.coerce.number().positive().nullable().default(null),
  currency: z.string().trim().toUpperCase().nullable().default(null),
  confidence: confidenceSchema.default({
    merchantName: 0,
    date: 0,
    totalAmount: 0,
    currency: 0
  }),
  extractionNotes: z.string().trim().default("")
});

export const reviewedReceiptSchema = z.object({
  merchantName: z.string().trim().min(1, "Merchant name is required."),
  date: z.string().trim().min(1, "Date is required."),
  totalAmount: z.coerce.number().positive("Total amount must be greater than 0."),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO code."),
  notes: z.string().trim().optional(),
  originalExtraction: extractionSchema.optional(),
  reviewedData: z.unknown().optional(),
  confidenceScore: z.coerce.number().min(0).max(1).optional()
});
