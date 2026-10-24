"use client";

import { cn } from "@/lib/utils";

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="tablist" className="grid border-b border-border" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px border-b-2 py-3 text-sm font-semibold",
            value === t.id ? "border-white text-white" : "border-transparent text-muted hover:text-white",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
