import * as React from "react";

const toneBorder: Record<string, string> = {
  success: "var(--color-status-success)",
  danger: "var(--color-status-danger)",
  warning: "var(--color-status-warning)",
  info: "var(--color-status-info)",
  accent: "var(--color-accent)",
  muted: "var(--color-text-muted)",
};

export function Badge({
  tone = "muted",
  children,
  className = "",
}: {
  tone?: keyof typeof toneBorder;
  children: React.ReactNode;
  className?: string;
}) {
  const c = toneBorder[tone];
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2 py-0.5 text-caption font-medium ${className}`}
      style={{
        color: c,
        background: `color-mix(in srgb, ${c} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
        fontSize: "1.2rem",
      }}
    >
      {children}
    </span>
  );
}
