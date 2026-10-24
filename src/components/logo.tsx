import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <line
          key={i}
          x1="16"
          y1="2.5"
          x2="16"
          y2="12.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          transform={`rotate(${i * 22.5} 16 16)`}
        />
      ))}
    </svg>
  );
}

export function Logo({ size = 28, className, href = "/feed" }: { size?: number; className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 text-white", className)}>
      <LogoMark size={size} />
      <span className="text-xl font-bold tracking-tight">Sociality</span>
    </Link>
  );
}
