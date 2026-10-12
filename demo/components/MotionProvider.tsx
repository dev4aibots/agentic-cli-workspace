"use client";

import * as React from "react";
import { MotionConfig } from "motion/react";

/**
 * Root motion provider: every animation in the demo inherits the user's
 * reduced-motion preference. Linear's motion is quiet; when the OS says
 * reduce, everything goes still (the CSS layer backs this up too).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
