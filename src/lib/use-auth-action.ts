"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

/** Jalankan aksi hanya jika login; kalau tidak → /login?returnTo=<halaman sekarang>. */
export function useAuthAction() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAppSelector((s) => s.auth.token);
  return (fn: () => void) => {
    if (!token) router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
    else fn();
  };
}
