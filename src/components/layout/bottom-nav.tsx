"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pill navigasi bawah: Home, tombol +, Profile. Aksi privat → /login?returnTo (ditangani RequireAuth). */
export function BottomNav() {
  const pathname = usePathname();
  const isHome = pathname === "/feed";
  const isProfile = pathname === "/me" || pathname.startsWith("/me/");

  const item = (active: boolean) =>
    cn("flex flex-1 flex-col items-center gap-1 text-xs font-semibold", active ? "text-primary-300" : "text-white");

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-4 left-1/2 z-40 flex h-16 w-[min(340px,calc(100%-2rem))] -translate-x-1/2 items-center rounded-pill border border-border bg-surface/95 px-6 shadow-lg backdrop-blur"
    >
      <Link href="/feed" className={item(isHome)}>
        <Home size={20} fill={isHome ? "currentColor" : "none"} />
        Home
      </Link>
      <Link
        href="/add-post"
        aria-label="Add post"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-700"
      >
        <Plus size={24} />
      </Link>
      <Link href="/me" className={item(isProfile)}>
        <User size={20} fill={isProfile ? "currentColor" : "none"} />
        Profile
      </Link>
    </nav>
  );
}
