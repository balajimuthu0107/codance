"use client";

import React, { useEffect, useState } from "react";

export default function OrchidsChatWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating chat button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[10000] inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Open chat"
      >
        <span className="text-2xl leading-none">💬</span>
      </button>

      {/* Modal (no iframe) */}
      {open && (
        <div
          className="fixed inset-0 z-[10000]"
          aria-modal="true"
          role="dialog"
          aria-labelledby="orchids-chat-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute bottom-24 right-6 w-[92vw] max-w-md rounded-xl border bg-background p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="orchids-chat-title" className="text-base font-semibold">
                Chat with us
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              This chatbot can’t be embedded due to X-Frame-Options on
              accounts.orchids.app. Open it in a dedicated tab:
            </p>

            <a
              href="https://www.orchids.app/projects/ef7a2c1a-9229-4040-8874-2eab7e7b4215"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Open Chatbot
            </a>

            <div className="mt-3 text-[11px] text-muted-foreground">
              Tip: Keep this modal open while the chatbot is in a separate tab
              to mimic a Tidio-style experience.
            </div>
          </div>
        </div>
      )}
    </>
  );
}