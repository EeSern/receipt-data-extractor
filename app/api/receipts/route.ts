import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({ success: true, data: [], storage: "local-demo" });
    }

    const { data, error } = await supabase
      .from("receipts")
      .select("id, merchant_name, receipt_date, total_amount, currency, confidence_score, created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      storage: "supabase",
      data: data.map((receipt) => ({
        id: receipt.id,
        merchantName: receipt.merchant_name,
        receiptDate: receipt.receipt_date,
        totalAmount: Number(receipt.total_amount),
        currency: receipt.currency,
        confidenceScore:
          receipt.confidence_score === null ? null : Number(receipt.confidence_score),
        createdAt: receipt.created_at
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch receipts.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
