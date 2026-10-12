"use client";

import * as React from "react";

export function Dialog({
  open,
  onOpenChange,
  children,
  label,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  label: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      style={{ zIndex: "var(--z-modal)" }}
      className="fixed inset-0 flex items-center justify-center p-6"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "var(--color-bg-overlay)",
          backdropFilter: "blur(8px)",
        }}
        onClick={() => onOpenChange(false)}
      />
      <div
        className="card card-glass relative w-full max-w-lg p-6"
        style={{ animation: "dialogIn var(--motion-duration-medium) var(--motion-easing)" }}
      >
        {children}
      </div>
      <style jsx global>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
