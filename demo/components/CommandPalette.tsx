"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

export interface PaletteCommand {
  id: string;
  group: "Go to" | "Actions";
  label: string;
  hint?: string;
  run: () => void;
}

/**
 * ⌘K command palette: Linear's keyboard-first soul, wired to the demo's
 * real navigation and actions. Opens on ⌘K/Ctrl+K, filters as you type,
 * ↑/↓ to move, Enter to run, Esc to close. 120ms-class micro-interactions.
 */
export function CommandPalette({
  open,
  onOpenChange,
  commands,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: PaletteCommand[];
}) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open ]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    );
  }, [commands, query]);

  React.useEffect(() => setActive(0), [filtered.length]);

  const choose = React.useCallback(
    (cmd: PaletteCommand) => {
      onOpenChange(false);
      // Run after the close so the target view is mounted and focused.
      requestAnimationFrame(() => cmd.run());
    },
    [onOpenChange],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) choose(cmd);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  React.useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active ]);

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 flex items-start justify-center p-6 pt-[18vh]"
          style={{ zIndex: "var(--z-modal)" }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "var(--color-bg-overlay)" }}
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
          <motion.div
            role="listbox"
            aria-label="Commands"
            className="card du-palette-sheen relative w-full max-w-lg overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            <div
              className="flex items-center gap-3 border-b px-4 py-3"
              style={{ borderColor: "var(--color-border-hairline)" }}
            >
              <span className="mono text-body" style={{ color: "var(--color-accent)" }} aria-hidden="true">
                ›
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command: try “run”, “safety”, “limits”…"
                aria-label="Type a command"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent text-body outline-none placeholder:text-[var(--color-text-muted)]"
                style={{ color: "var(--color-text-primary)" }}
              />
              <span className="kbd du-kbd-hint">esc</span>
            </div>
            <div ref={listRef} className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="text-caption px-3 py-6 text-center">
                  No matching commands — try another word.
                </p>
              )}
              {filtered.map((cmd, i) => {
                const header =
                  cmd.group !== lastGroup ? (
                    <p key={`g-${cmd.group}`} className="text-eyebrow px-3 pb-1 pt-3">
                      {cmd.group}
                    </p>
                  ) : null;
                lastGroup = cmd.group;
                return (
                  <React.Fragment key={cmd.id}>
                    {header}
                    <div
                      role="option"
                      aria-selected={i === active}
                      data-active={i === active}
                      className="palette-item flex cursor-pointer items-center gap-3 rounded-md px-3 py-2"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(cmd)}
                    >
                      <span
                        className="text-body"
                        style={{
                          color:
                            i === active
                              ? "var(--color-text-primary)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {cmd.label}
                      </span>
                      {cmd.hint && (
                        <span className="kbd du-kbd-hint ml-auto">{cmd.hint}</span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div
              className="flex items-center gap-4 border-t px-4 py-2"
              style={{ borderColor: "var(--color-border-hairline)" }}
            >
              <span className="text-caption">
                <span className="kbd du-kbd-hint">↑↓</span> move
              </span>
              <span className="text-caption">
                <span className="kbd du-kbd-hint">↵</span> run
              </span>
              <span className="text-caption">
                <span className="kbd du-kbd-hint">esc</span> close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
