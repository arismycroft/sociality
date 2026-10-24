"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
export const MAX_BYTES = 5 * 1024 * 1024;

/** Validasi file gambar: PNG/JPG/WEBP, maks 5MB. Mengembalikan pesan error atau null. */
export function validateImage(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Only PNG, JPG or WEBP images are allowed";
  if (file.size > MAX_BYTES) return "Image must be 5MB or smaller";
  return null;
}

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string | null;
  onError?: (msg: string | null) => void;
}

/** Dropzone + preview, dengan tombol Change dan Delete setelah gambar dipilih. */
export function ImagePicker({ file, onChange, error, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    const msg = validateImage(f);
    onError?.(msg);
    if (!msg) onChange(f);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {preview ? (
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
            <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Change Image
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => { onChange(null); onError?.(null); }}>
              <Trash2 size={14} /> Delete Image
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
          className={`flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center ${drag ? "border-primary-300 bg-primary/10" : "border-border bg-surface"}`}
        >
          <ImagePlus size={24} className="text-muted" />
          <span className="text-sm"><span className="font-semibold text-primary-300">Click to upload</span> or drag and drop</span>
          <span className="text-xs text-muted">PNG, JPG or WEBP (max. 5mb)</span>
        </button>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
