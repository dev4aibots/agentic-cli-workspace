"use client";

import * as React from "react";

/**
 * BlurText — hand reimplementation of the react-bits BlurText hero anchor
 * (word-by-word blur reveal; ~40 lines). No react-bits dependency shipped.
 * Honors prefers-reduced-motion via the .blur-word CSS rules.
 */
export function BlurText({
  text,
  delay = 120,
  className = "",
  as: Tag = "h1",
}: {
  text: string;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
}) {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement | null>(null);
  const words = React.useMemo(() => text.split(" "), [text]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`blur-word${visible ? " revealed" : ""}`}
          style={{ transitionDelay: `${i * delay}ms` }}
        >
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
