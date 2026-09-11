"use client";

import { useEffect } from "react";

/**
 * Shown when a page throws. The message is deliberately generic: internal
 * error text can leak file paths, query fragments or the shape of the
 * database, so the details stay on the server and the visitor gets a digest
 * they can quote to support.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled page error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="shell grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="font-display text-[5rem] font-bold leading-none tracking-[-0.06em] text-flare">
          !
        </p>
        <h1 className="display-sm mt-4">Something broke</h1>
        <p className="mx-auto mt-5 max-w-sm text-dim">
          That is on us, not you. Try again — and if it keeps happening, send support the reference
          below.
        </p>

        {error.digest ? (
          <code className="mt-5 inline-block rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-xs text-faint">
            {error.digest}
          </code>
        ) : null}

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-13 items-center rounded-full bg-acid px-7 text-[0.9375rem] font-medium text-acid-ink transition-[filter] hover:brightness-110"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-13 items-center rounded-full border border-line-strong px-7 text-[0.9375rem] transition-colors hover:border-acid hover:text-acid"
          >
            Back to the start
          </a>
        </div>
      </div>
    </div>
  );
}
