export type ConfidenceMap = {
  merchantName: number;
  date: number;
  totalAmount: number;
  currency: number;
};

export type ReceiptExtraction = {
  merchantName: string | null;
  date: string | null;
  totalAmount: number | null;
  currency: string | null;
  confidence: ConfidenceMap;
  imageQuality: "clear" | "partially_readable" | "blurry_or_unclear";
  needsReview: boolean;
  extractionNotes: string;
};

export type ReviewedReceipt = {
  merchantName: string;
  date: string;
  totalAmount: number;
  currency: string;
  notes?: string;
};

export type ReceiptRecord = {
  id: string;
  merchantName: string;
  receiptDate: string | null;
  totalAmount: number | null;
  currency: string | null;
  confidenceScore: number | null;
  createdAt: string;
};
