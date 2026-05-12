"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, Clock, Database, Sparkles } from "lucide-react";
import { ExtractedForm } from "@/components/ExtractedForm";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { ReceiptUploader } from "@/components/ReceiptUploader";
import { averageConfidence } from "@/lib/utils";
import type { ReceiptExtraction, ReviewedReceipt } from "@/types/receipt";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ReceiptExtraction | null>(null);
  const [status, setStatus] = useState("Upload a receipt to begin.");
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const canExtract = Boolean(file) && !isExtracting;

  const objectUrl = useMemo(() => previewUrl, [previewUrl]);

  function selectFile(nextFile: File) {
    setFile(nextFile);
    setExtraction(null);
    setSubmittedId(null);
    setError(null);
    setStatus("Receipt ready for Gemini extraction.");

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function extractReceipt() {
    if (!file) {
      return;
    }

    setIsExtracting(true);
    setError(null);
    setStatus("Analyzing receipt image with Gemini...");

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/extract-receipt", {
        method: "POST",
        body
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Extraction failed.");
      }

      setExtraction(result.data);
      setStatus("Extraction completed. Review and edit before submission.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Extraction failed.");
      setStatus("Extraction could not be completed.");
    } finally {
      setIsExtracting(false);
    }
  }

  async function submitReceipt(reviewed: ReviewedReceipt) {
    if (!extraction) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatus("Submitting reviewed receipt data...");

    try {
      const response = await fetch("/api/submit-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...reviewed,
          originalExtraction: extraction,
          reviewedData: reviewed,
          confidenceScore: averageConfidence(extraction.confidence)
        })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Submission failed.");
      }

      setSubmittedId(result.receiptId);
      setStatus(
        result.storage === "local-demo"
          ? "Submitted in local demo mode. Configure Supabase for persistent storage."
          : "Receipt submitted and saved to Supabase."
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Submission failed.");
      setStatus("Submission could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <header className="border-b border-[var(--line)] bg-[#fffefa]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-lg font-black tracking-tight">
            Receipt Data Extractor
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)]"
          >
            History
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">
              Gemini receipt extraction
            </p>
            <h1 className="mt-2 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
              Extract receipt details into an editable review form.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              Upload a common receipt image, let Gemini extract merchant, date, total and
              currency, then review the final structured data before submission.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric icon={<BrainCircuit size={18} />} label="Gemini structured JSON" />
            <Metric icon={<Clock size={18} />} label="Human review step" />
            <Metric icon={<Database size={18} />} label="Supabase-ready history" />
          </div>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm">
          <ReceiptUploader fileName={file?.name ?? null} onFileSelect={selectFile} />
          <button
            type="button"
            disabled={!canExtract}
            onClick={extractReceipt}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            <Sparkles size={18} aria-hidden />
            {isExtracting ? "Analyzing..." : "Extract with Gemini"}
          </button>
          <p className="mt-3 text-sm text-[var(--muted)]">{status}</p>
          {error ? (
            <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </p>
          ) : null}
          {submittedId ? (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Submission ID: {submittedId}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10">
        <div className="overflow-hidden rounded-md border border-[var(--line)] bg-[var(--panel)] shadow-sm">
          <div className="grid lg:grid-cols-[1fr_420px]">
            <ReceiptPreview previewUrl={previewUrl} />
            <div className="p-5 md:p-6">
              <ExtractedForm
                extraction={extraction}
                onSubmit={submitReceipt}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md border border-[var(--line)] bg-white px-3 py-2">
      <span className="text-[var(--accent)]">{icon}</span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
    </div>
  );
}
