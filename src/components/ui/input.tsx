"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** Input bergaya desain: label tebal, kotak gelap, border merah saat error. */
export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, type = "text", className, id, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const isPassword = type === "password";

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-white">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && show ? "text" : type}
            aria-invalid={!!error}
            className={cn(
              "h-12 w-full rounded-xl border bg-surface px-4 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-300",
              error ? "border-danger" : "border-border",
              isPassword && "pr-11",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Field.displayName = "Field";
