"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, X, XCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { searchUsers } from "@/lib/api";
import { useDebounce } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";

interface Props {
  /** inline = dropdown di navbar desktop; overlay = layar penuh di mobile. */
  variant?: "inline" | "overlay";
  onClose?: () => void;
}

export function SearchBox({ variant = "inline", onClose }: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const q = useDebounce(value.trim(), 300);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlay = variant === "overlay";

  // q wajib diisi oleh API → hanya query saat ada kata kunci.
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["user-search", q],
    queryFn: () => searchUsers(q),
    enabled: q.length > 0,
  });

  useEffect(() => {
    if (overlay) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [overlay]);

  const close = () => {
    setOpen(false);
    onClose?.();
  };
  const users = data?.items ?? [];
  const showPanel = q.length > 0 && (overlay || open);

  const results = (
    <div className={cn(overlay ? "px-4 py-3" : "p-2")}>
      {isFetching && users.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Searching…</p>
      ) : isError ? (
        <p className="py-6 text-center text-sm text-danger">{error.message}</p>
      ) : users.length === 0 ? (
        <div className={cn("text-center", overlay ? "pt-32" : "py-6")}>
          <p className="font-semibold">No results found</p>
          <p className="mt-1 text-sm text-muted">Change your keyword</p>
        </div>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              <Link
                href={u.isMe ? "/me" : `/profile/${encodeURIComponent(u.username)}`}
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/5"
              >
                <Avatar src={u.avatarUrl} name={u.name} size={overlay ? 44 : 36} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-muted">{u.username}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div ref={wrapRef} className={cn("relative", overlay && "fixed inset-0 z-50 bg-black")}>
      <div className={cn("flex items-center gap-3", overlay && "h-16 border-b border-border px-4")}>
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus={overlay}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search"
            aria-label="Search users"
            className="h-10 w-full rounded-pill border border-border bg-surface pl-9 pr-9 text-sm text-white placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          {value && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
        {overlay && (
          <button type="button" aria-label="Close search" onClick={close} className="text-white">
            <X size={24} />
          </button>
        )}
      </div>

      {showPanel &&
        (overlay ? (
          results
        ) : (
          <div className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl">
            {results}
          </div>
        ))}
    </div>
  );
}
