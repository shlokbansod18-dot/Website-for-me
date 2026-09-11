"use client";

import { useActionState, useState, useTransition } from "react";

import { deleteAccountAction, exportDataAction } from "@/actions/account";
import { Field, Notice } from "@/components/ui/field";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: false };

export function ExportData() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function download() {
    setError(null);
    startTransition(async () => {
      const result = await exportDataAction();
      if (!result.ok || !result.payload) {
        setError(result.message ?? "We could not build your export. Try again.");
        return;
      }
      const blob = new Blob([result.payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `softsystem-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDone(true);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={pending}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-6 text-sm transition-colors hover:border-acid hover:text-acid disabled:opacity-60"
      >
        {pending ? "Gathering…" : "Download my data (JSON)"}
      </button>
      {done ? (
        <p className="mt-3 text-xs text-acid">Saved to your downloads.</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-xs text-flare">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function DeleteAccount() {
  const [state, formAction, pending] = useActionState(deleteAccountAction, initial);
  const [open, setOpen] = useState(false);
  const errors = state.fieldErrors ?? {};

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center rounded-full border border-flare/40 px-6 text-sm text-flare transition-colors hover:bg-flare hover:text-white"
      >
        Delete my account
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-flare/35 bg-flare/5 p-5">
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}

      <p className="text-[0.8125rem] leading-relaxed text-dim">
        This deletes your account, your order history, your licence keys and your access to every
        file you have bought. It happens immediately and cannot be undone. Download your data first
        if you want to keep a copy.
      </p>

      <Field
        label="Your password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />

      <Field
        label="Type DELETE to confirm"
        name="confirm"
        autoComplete="off"
        placeholder="DELETE"
        required
        error={errors.confirm}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-flare px-6 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Permanently delete"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-11 items-center rounded-full border border-line px-6 text-sm text-dim transition-colors hover:text-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
