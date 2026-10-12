"use client";

import * as React from "react";

export function ScrollArea({
  className = "",
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`overflow-y-auto ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Separator({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ height: 1, background: "var(--color-border-hairline)" }}
      role="separator"
    />
  );
}

/** Minimal CSS tooltip — title shown on hover, Linear tokens. */
export function Tooltip({
  tip,
  children,
}: {
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <span className="tooltip-wrap" style={{ position: "relative", display: "inline-flex" }}>
      {children}
      <span className="tooltip-tip text-caption" role="tooltip">
        {tip}
      </span>
      <style jsx>{`
        .tooltip-tip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: var(--color-bg-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-hairline);
          border-radius: var(--radius-control);
          padding: 6px 10px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--motion-duration-micro) var(--motion-easing),
            transform var(--motion-duration-micro) var(--motion-easing);
          z-index: var(--z-popover);
        }
        .tooltip-wrap:hover .tooltip-tip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
    </span>
  );
}
