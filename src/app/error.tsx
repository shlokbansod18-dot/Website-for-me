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
        <p className="font-display text-[5rem] leading-none text-alert">
          !
        </p>
        <h1 className="display-2 mt-4">Something broke</h1>
        <p className="mx-auto mt-5 max-w-sm text-ink-2">
          That is on us, not you. Try again, and if it keeps happening, send support the reference
          below.
        </p>

        {error.digest ? (
          <code className="mt-5 inline-block rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-xs text-ink-3">
            {error.digest}
          </code>
        ) : null}

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-13 items-center rounded bg-accent px-7 text-[0.9375rem] font-medium text-on-accent transition-[filter] hover:brightness-110"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-13 items-center rounded border border-line-2 px-7 text-[0.9375rem] transition-colors hover:border-accent hover:text-accent"
          >
            Back to the start
          </a>
        </div>
      </div>
    </div>
  );
}
