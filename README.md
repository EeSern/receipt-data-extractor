# ReceiptFlow AI

ReceiptFlow AI is a Next.js web app that uses Gemini to extract key receipt information and auto-fill an editable review form.

## Features

- Receipt image upload with preview
- Gemini-powered multimodal extraction
- Editable form for human review
- Field-level confidence scores
- Supabase submission storage
- Submission history page
- Local demo mode when Supabase is not configured

## Fields Extracted

- Merchant name
- Date
- Total amount
- Currency

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Gemini API
- Supabase
- Zod

## How It Works

1. The user uploads a receipt image.
2. The image is sent to the server-side `/api/extract-receipt` route.
3. Gemini extracts structured JSON for merchant name, date, total amount, currency, confidence scores, and extraction notes.
4. The user reviews and edits the extracted fields.
5. The reviewed data and original AI extraction are submitted through `/api/submit-receipt`.
6. If Supabase is configured, the data is saved and shown on `/history`.

## Model and Prompt

Model: `gemini-2.5-flash`

Prompt summary:

```txt
Extract merchantName, date, totalAmount, and currency from the receipt image.
Return structured JSON only.
Use ISO date format where possible.
Use the final payable amount, not subtotal, tax, change, or cash received.
Use 3-letter ISO currency codes.
Return null for unclear fields and lower confidence.
Include confidence scores from 0 to 1 and a short note explaining where the total was found.
```

The full prompt is in `lib/gemini.ts`.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local`:

```env
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`GEMINI_API_KEY` is required for extraction. Supabase variables are optional for the local demo, but required for persistent history.

## Supabase Table

Run this SQL in Supabase:

```sql
create table receipts (
  id uuid primary key default gen_random_uuid(),
  merchant_name text not null,
  receipt_date date,
  total_amount numeric(12, 2),
  currency text,
  original_extraction jsonb,
  reviewed_data jsonb,
  confidence_score numeric(4, 2),
  image_url text,
  notes text,
  created_at timestamp with time zone default now()
);
```

## API Routes

- `POST /api/extract-receipt` accepts multipart form data with a `file` field.
- `POST /api/submit-receipt` saves reviewed receipt data.
- `GET /api/receipts` returns recent submitted receipts.

## Limitations

- Extraction accuracy depends on receipt image quality.
- Ambiguous dates may require user review.
- Some receipts may not clearly show currency.
- The app is designed for common receipt formats, not guaranteed perfect extraction for every receipt.
