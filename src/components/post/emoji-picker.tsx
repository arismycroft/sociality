"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

const EMOJIS = ["😀","😂","🥹","😍","😎","🤔","😭","😡","👍","👏","🙏","🔥","❤️","💜","✨","🎉","💯","👀","🙌","😅","🥰","😮","🤝","💪"];

/** Picker emoji ringan tanpa dependensi; memanggil onPick(emoji). */
export function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label="Add emoji" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted hover:text-white">
        <Smile size={20} />
      </button>
      {open && (
        <div className="absolute bottom-12 left-0 z-50 grid w-56 grid-cols-6 gap-1 rounded-xl border border-border bg-surface p-2 shadow-xl">
          {EMOJIS.map((e) => (
            <button key={e} type="button" className="rounded-md p-1 text-xl hover:bg-white/10" onClick={() => { onPick(e); setOpen(false); }}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
