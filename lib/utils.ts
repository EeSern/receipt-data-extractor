import type { ConfidenceMap } from "@/types/receipt";

export function averageConfidence(confidence?: ConfidenceMap): number {
  if (!confidence) {
    return 0;
  }

  const values = Object.values(confidence);
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export function confidenceLabel(value: number) {
  if (value >= 0.85) {
    return "High";
  }

  if (value >= 0.6) {
    return "Medium";
  }

  return "Review";
}

export function formatCurrency(amount: number | null, currency: string | null) {
  if (amount === null) {
    return "-";
  }

  return `${currency ?? ""} ${amount.toFixed(2)}`.trim();
}
