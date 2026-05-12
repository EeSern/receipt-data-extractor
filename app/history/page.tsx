import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HistoryTable } from "@/components/HistoryTable";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ReceiptRecord } from "@/types/receipt";

export const dynamic = "force-dynamic";

async function getReceipts(): Promise<{ receipts: ReceiptRecord[]; storage: string }> {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return {
        receipts: [],
        storage: "local-demo"
      };
    }

    const { data, error } = await supabase
      .from("receipts")
      .select("id, merchant_name, receipt_date, total_amount, currency, confidence_score, created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      throw error;
    }

    return {
      receipts: data.map((receipt) => ({
        id: receipt.id,
        merchantName: receipt.merchant_name,
        receiptDate: receipt.receipt_date,
        totalAmount: receipt.total_amount === null ? null : Number(receipt.total_amount),
        currency: receipt.currency,
        confidenceScore:
          receipt.confidence_score === null ? null : Number(receipt.confidence_score),
        createdAt: receipt.created_at
      })),
      storage: "supabase"
    };
  } catch {
    return {
      receipts: [],
      storage: "local-demo"
    };
  }
}

export default async function HistoryPage() {
  const { receipts, storage } = await getReceipts();

  return (
    <main>
      <header className="border-b border-[var(--line)] bg-[#fffefa]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold transition hover:border-[var(--accent)]"
          >
            <ArrowLeft size={16} aria-hidden />
            Back
          </Link>
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">
            Submission history
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-3xl font-black tracking-tight">Reviewed receipts</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Saved receipts include both the reviewed fields and the original AI extraction payload
          when Supabase is configured.
        </p>
        <div className="mt-6">
          <HistoryTable receipts={receipts} storage={storage} />
        </div>
      </section>
    </main>
  );
}
