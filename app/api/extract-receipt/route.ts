import { NextResponse } from "next/server";
import { extractReceiptWithGemini } from "@/lib/gemini";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Receipt image is required." }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Please upload a JPG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: "Receipt image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const data = await extractReceiptWithGemini(file);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to extract receipt data.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
