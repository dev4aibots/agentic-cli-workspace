"use client";

/**
 * Hero "Run your first task" call-to-action.
 * The anchor scrolls to #app natively; the dispatched event tells AppSection
 * to also switch to the "Run a task" tab (QA-4: without it the user could
 * land on whichever tab they left open).
 */
export function HeroCta() {
  return (
    <a
      href="#app"
      className="btn-primary no-underline"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("demo:go-run"));
      }}
    >
      Run your first task
    </a>
  );
}
