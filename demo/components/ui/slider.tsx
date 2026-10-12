"use client";

import * as React from "react";

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
  format: (v: number) => string;
  disabled?: boolean;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  format,
  disabled = false,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="text-label" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </label>
        <span
          className="mono-nums text-body"
          style={{ color: "var(--color-text-primary)" }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="slider"
        style={
          {
            "--fill": `${pct}%`,
          } as React.CSSProperties
        }
      />
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: var(--radius-pill);
          background: linear-gradient(
            to right,
            var(--color-accent) 0%,
            var(--color-accent) var(--fill),
            var(--color-border-hairline) var(--fill),
            var(--color-border-hairline) 100%
          );
          outline: none;
          cursor: pointer;
          transition: var(--motion-transition-state);
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-text-primary);
          border: none;
          transition: var(--motion-transition-state);
        }
        .slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .slider::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--color-text-primary); border: none;
        }
        .slider:focus-visible { box-shadow: 0 0 0 2px var(--color-border-accent); }
        .slider:disabled { cursor: not-allowed; opacity: 1; }
        .slider:disabled::-webkit-slider-thumb { background: var(--color-text-muted); }
      `}</style>
    </div>
  );
}
