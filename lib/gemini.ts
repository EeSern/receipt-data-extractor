import { GoogleGenAI, Type } from "@google/genai";
import { extractionSchema } from "@/lib/validation";

export const receiptExtractionPrompt = `You are an AI receipt extraction assistant.

Extract these fields from the receipt image:
1. merchantName
2. date
3. totalAmount
4. currency

Rules:
- Return only JSON that matches the response schema.
- Use ISO date format YYYY-MM-DD where possible.
- totalAmount must be the final payable amount, not subtotal, tax, change, or cash received.
- currency must be a 3-letter ISO currency code such as MYR, USD, SGD, JPY, or EUR.
- RM usually means MYR. S$ usually means SGD.
- If a field is unclear, unreadable, cut off, or ambiguous, return null and use confidence below 0.50.
- Do not guess aggressively. A plausible value is not enough; the value must be visibly supported by the receipt.
- Treat blur, glare, low resolution, handwriting-like smearing, or cropped key areas as uncertainty.
- If the image is blurry or difficult to read, set imageQuality to "blurry_or_unclear", set needsReview to true, and cap all confidence scores at 0.60.
- If only some fields are readable, set imageQuality to "partially_readable", set needsReview to true, and cap unclear fields at 0.50.
- Use confidence above 0.85 only when the field is clearly visible and unambiguous.
- Use confidence between 0.60 and 0.85 only when the field is likely but not perfectly clear.
- Use confidence below 0.60 when user review is required.
- Include confidence scores from 0 to 1 for each field. Confidence means visual evidence quality, not general likelihood.
- Include a short note explaining where the total was found.`;

export async function extractReceiptWithGemini(file: File) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: receiptExtractionPrompt },
          {
            inlineData: {
              mimeType: file.type,
              data: base64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          merchantName: { type: Type.STRING, nullable: true },
          date: { type: Type.STRING, nullable: true },
          totalAmount: { type: Type.NUMBER, nullable: true },
          currency: { type: Type.STRING, nullable: true },
          imageQuality: {
            type: Type.STRING,
            enum: ["clear", "partially_readable", "blurry_or_unclear"]
          },
          needsReview: { type: Type.BOOLEAN },
          confidence: {
            type: Type.OBJECT,
            properties: {
              merchantName: { type: Type.NUMBER },
              date: { type: Type.NUMBER },
              totalAmount: { type: Type.NUMBER },
              currency: { type: Type.NUMBER }
            },
            required: ["merchantName", "date", "totalAmount", "currency"]
          },
          extractionNotes: { type: Type.STRING }
        },
        required: [
          "merchantName",
          "date",
          "totalAmount",
          "currency",
          "confidence",
          "imageQuality",
          "needsReview",
          "extractionNotes"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return extractionSchema.parse(JSON.parse(text));
}
