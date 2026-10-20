"use client";

import * as React from "react";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; hint?: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" aria-label="Demo sections" className="flex flex-col gap-1">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(t.id)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-body outline-none"
            style={{
              color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              background: isActive ? "var(--color-bg-hover)" : "transparent",
              fontWeight: isActive ? 500 : 400,
              transition: "var(--motion-transition-state)",
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                e.currentTarget.style.background = "var(--color-bg-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: isActive
                  ? "var(--color-accent)"
                  : "var(--color-border-hairline)",
              }}
            />
            <span className="flex-1">{t.label}</span>
            {t.hint && <span className="kbd">{t.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
