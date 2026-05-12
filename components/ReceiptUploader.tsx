"use client";

import { ChangeEvent, DragEvent, useRef } from "react";
import { FileImage, Upload } from "lucide-react";

type ReceiptUploaderProps = {
  fileName: string | null;
  onFileSelect: (file: File) => void;
};

export function ReceiptUploader({ fileName, onFileSelect }: ReceiptUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file?: File) {
    if (file) {
      onFileSelect(file);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFile(event.dataTransfer.files[0]);
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0]);
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className="rounded-md border border-dashed border-[#a8b8b0] bg-white/80 p-4"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onChange}
      />
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-md bg-[#d7e8df] text-[var(--accent)]">
          <FileImage size={22} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{fileName ?? "Upload a receipt image"}</p>
          <p className="text-xs text-[var(--muted)]">JPG, PNG, or WEBP. Max 5MB.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex size-10 items-center justify-center rounded-md bg-[var(--accent)] text-white transition hover:bg-[var(--accent-strong)]"
          title="Choose receipt image"
        >
          <Upload size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
