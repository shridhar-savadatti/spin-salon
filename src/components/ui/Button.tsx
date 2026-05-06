"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "light" | "outline" | "outline-light" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      // Dark button — use on white/light backgrounds
      primary:
        "bg-zinc-900 text-white hover:bg-zinc-700 focus:ring-zinc-400 shadow-sm hover:shadow-md",
      // White button — use on dark/zinc-900 backgrounds
      light:
        "bg-white text-zinc-900 hover:bg-zinc-100 focus:ring-white/50 shadow-sm hover:shadow-md",
      // Dark outline — use on white/light backgrounds
      outline:
        "border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white focus:ring-zinc-400",
      // White outline — use on dark/zinc-900 backgrounds
      "outline-light":
        "border-2 border-white/60 text-white hover:bg-white hover:text-zinc-900 focus:ring-white/40",
      ghost:
        "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-300",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400 shadow-sm",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
