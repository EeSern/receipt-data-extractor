"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Send } from "lucide-react";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { averageConfidence } from "@/lib/utils";
import type { ReceiptExtraction, ReviewedReceipt } from "@/types/receipt";

type ExtractedFormProps = {
  extraction: ReceiptExtraction | null;
  onSubmit: (reviewed: ReviewedReceipt) => Promise<void>;
  isSubmitting: boolean;
};

const emptyForm: ReviewedReceipt = {
  merchantName: "",
  date: "",
  totalAmount: 0,
  currency: "MYR",
  notes: ""
};

export function ExtractedForm({ extraction, onSubmit, isSubmitting }: ExtractedFormProps) {
  const [form, setForm] = useState<ReviewedReceipt>(emptyForm);

  useEffect(() => {
    if (!extraction) {
      return;
    }

    setForm({
      merchantName: extraction.merchantName ?? "",
      date: extraction.date ?? "",
      totalAmount: extraction.totalAmount ?? 0,
      currency: extraction.currency ?? "MYR",
      notes: ""
    });
  }, [extraction]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
  }

  const confidence = extraction?.confidence;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Review form</p>
          <h2 className="mt-1 text-2xl font-bold">Extracted receipt fields</h2>
        </div>
        {confidence ? (
          <div className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-right">
            <p className="text-xs text-[var(--muted)]">Avg confidence</p>
            <p className="font-bold">{(averageConfidence(confidence) * 100).toFixed(0)}%</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        <Field
          label="Merchant name"
          value={form.merchantName}
          confidence={confidence?.merchantName}
          onChange={(value) => setForm((current) => ({ ...current, merchantName: value }))}
        />
        <Field
          label="Date"
          type="date"
          value={form.date}
          confidence={confidence?.date}
          onChange={(value) => setForm((current) => ({ ...current, date: value }))}
        />
        <Field
          label="Total amount"
          type="number"
          step="0.01"
          value={String(form.totalAmount || "")}
          confidence={confidence?.totalAmount}
          onChange={(value) =>
            setForm((current) => ({ ...current, totalAmount: Number(value) }))
          }
        />
        <Field
          label="Currency"
          value={form.currency}
          confidence={confidence?.currency}
          maxLength={3}
          onChange={(value) =>
            setForm((current) => ({ ...current, currency: value.toUpperCase() }))
          }
        />
        <label className="grid gap-2 text-sm font-semibold">
          Notes
          <textarea
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            className="min-h-20 rounded-md border border-[var(--line)] bg-white px-3 py-2 font-normal outline-none ring-[var(--accent)] focus:ring-2"
            placeholder="Optional reviewer note"
          />
        </label>
      </div>

      {extraction?.extractionNotes ? (
        <div className="rounded-md border border-[#d7c79c] bg-[#fff8df] p-3 text-sm text-[#6d5014]">
          {extraction.extractionNotes}
        </div>
      ) : null}

      {extraction?.needsReview ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          This extraction needs review. Image quality: {extraction.imageQuality.replaceAll("_", " ")}.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!extraction || isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--accent-strong)]"
      >
        {isSubmitting ? <Check size={18} aria-hidden /> : <Send size={18} aria-hidden />}
        {isSubmitting ? "Submitting..." : "Submit reviewed data"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  type?: string;
  step?: string;
  maxLength?: number;
  confidence?: number;
  onChange: (value: string) => void;
};

function Field({ label, value, type = "text", step, maxLength, confidence, onChange }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      <span className="flex items-center justify-between gap-3">
        {label}
        {typeof confidence === "number" ? <ConfidenceBadge value={confidence} /> : null}
      </span>
      <input
        type={type}
        step={step}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-[var(--line)] bg-white px-3 font-normal outline-none ring-[var(--accent)] focus:ring-2"
        required={label !== "Notes"}
      />
    </label>
  );
}
