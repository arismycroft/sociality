"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

/** Bungkus halaman privat: belum login → /login?returnTo=<halaman ini>. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, hydrated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, token, pathname, router]);

  if (!hydrated || !token) {
    return <p className="py-20 text-center text-sm text-muted">Loading…</p>;
  }
  return <>{children}</>;
}
