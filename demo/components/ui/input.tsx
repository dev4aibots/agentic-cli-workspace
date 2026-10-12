import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full min-h-[32px] rounded-md border bg-transparent px-3 py-2 text-body outline-none transition-all placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)] ${className}`}
    style={{ borderColor: "var(--color-border-hairline)", color: "var(--color-text-primary)" }}
    {...props}
  />
));
Input.displayName = "Input";
