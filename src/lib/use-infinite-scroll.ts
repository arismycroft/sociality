"use client";

import { useEffect, useRef } from "react";

/** Mengembalikan ref sentinel; saat terlihat → panggil onReach (jika enabled). */
export function useInfiniteScroll(onReach: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onReach();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onReach, enabled]);
  return ref;
}
