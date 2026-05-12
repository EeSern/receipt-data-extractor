type ReceiptPreviewProps = {
  previewUrl: string | null;
};

export function ReceiptPreview({ previewUrl }: ReceiptPreviewProps) {
  return (
    <section className="min-h-[420px] border-r border-[var(--line)] bg-[#ede7dc] p-4 md:p-6">
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-md border border-dashed border-[#bdb4a4] bg-[#fbfaf6]">
        {previewUrl ? (
          // Blob URLs from local uploads are best rendered directly.
          <img
            src={previewUrl}
            alt="Uploaded receipt preview"
            className="max-h-[680px] w-auto max-w-full object-contain"
          />
        ) : (
          <div className="px-8 text-center text-sm text-[var(--muted)]">
            Receipt preview appears here after upload.
          </div>
        )}
      </div>
    </section>
  );
}
