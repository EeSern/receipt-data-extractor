import { confidenceLabel } from "@/lib/utils";

type ConfidenceBadgeProps = {
  value: number;
};

export function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  const label = confidenceLabel(value);
  const tone =
    label === "High"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : label === "Medium"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {label} {(value * 100).toFixed(0)}%
    </span>
  );
}
