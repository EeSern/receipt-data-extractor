import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { reviewedReceiptSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const payload = reviewedReceiptSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({
        success: true,
        receiptId: crypto.randomUUID(),
        storage: "local-demo",
        message: "Supabase is not configured, so this submission was accepted for local demo only."
      });
    }

    const { data, error } = await supabase
      .from("receipts")
      .insert({
        merchant_name: payload.merchantName,
        receipt_date: payload.date || null,
        total_amount: payload.totalAmount,
        currency: payload.currency,
        original_extraction: payload.originalExtraction ?? null,
        reviewed_data: payload.reviewedData ?? {
          merchantName: payload.merchantName,
          date: payload.date,
          totalAmount: payload.totalAmount,
          currency: payload.currency,
          notes: payload.notes ?? ""
        },
        confidence_score: payload.confidenceScore ?? null,
        notes: payload.notes ?? null
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, receiptId: data.id, storage: "supabase" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit receipt.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
