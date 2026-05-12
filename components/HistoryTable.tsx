import { formatCurrency } from "@/lib/utils";
import type { ReceiptRecord } from "@/types/receipt";

type HistoryTableProps = {
  receipts: ReceiptRecord[];
  storage: string;
};

export function HistoryTable({ receipts, storage }: HistoryTableProps) {
  if (storage === "local-demo") {
    return (
      <div className="rounded-md border border-[#d7c79c] bg-[#fff8df] p-4 text-sm text-[#6d5014]">
        Supabase is not configured yet. Submissions are accepted in local demo mode, but persistent
        history will appear after adding Supabase environment variables.
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="rounded-md border border-[var(--line)] bg-white p-8 text-center text-sm text-[var(--muted)]">
        No submitted receipts yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#ece5d7] text-xs uppercase text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3">Merchant</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id} className="border-t border-[var(--line)]">
              <td className="px-4 py-3 font-semibold">{receipt.merchantName}</td>
              <td className="px-4 py-3">{receipt.receiptDate ?? "-"}</td>
              <td className="px-4 py-3">{formatCurrency(receipt.totalAmount, receipt.currency)}</td>
              <td className="px-4 py-3">
                {receipt.confidenceScore === null
                  ? "-"
                  : `${(receipt.confidenceScore * 100).toFixed(0)}%`}
              </td>
              <td className="px-4 py-3">
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(receipt.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
