import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "1 Minutes Ago" gaya desain; fallback ke dayjs relative time. */
export function timeAgo(iso: string) {
  return dayjs(iso).fromNow();
}

/** Hanya izinkan path internal untuk redirect returnTo (cegah open redirect). */
export function safeReturn(path: string | null | undefined, fallback = "/feed") {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export function initials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
