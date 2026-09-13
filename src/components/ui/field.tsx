import type { ComponentProps, ReactNode } from "react";

const control =
  "w-full rounded border border-line-2 bg-surface px-4 py-3 text-[0.9375rem] text-ink " +
  "placeholder:text-ink-3 outline-none transition-colors duration-150 " +
  "hover:border-ink-3 focus:border-accent focus:ring-1 focus:ring-accent";

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-ink">
        {children}
      </label>
      {hint ? <span className="text-[0.6875rem] text-ink-3">{hint}</span> : null}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-alert">
      <span aria-hidden>▲</span>
      {message}
    </p>
  );
}

type FieldProps = ComponentProps<"input"> & {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
};

export function Field({ label, name, error, hint, className = "", ...rest }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <div className={className}>
      <Label htmlFor={name} hint={hint}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${control} ${error ? "border-alert/60 focus:border-alert focus:ring-alert" : ""}`}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type TextAreaProps = ComponentProps<"textarea"> & {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
};

export function TextArea({ label, name, error, hint, className = "", ...rest }: TextAreaProps) {
  const errorId = `${name}-error`;
  return (
    <div className={className}>
      <Label htmlFor={name} hint={hint}>
        {label}
      </Label>
      <textarea
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${control} min-h-32 resize-y leading-relaxed ${error ? "border-alert/60" : ""}`}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

type SelectProps = ComponentProps<"select"> & {
  label: string;
  name: string;
  error?: string;
};

export function Select({ label, name, error, className = "", children, ...rest }: SelectProps) {
  const errorId = `${name}-error`;
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${control} cursor-pointer appearance-none pr-10`}
        {...rest}
      >
        {children}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function Checkbox({
  name,
  children,
  error,
  ...rest
}: ComponentProps<"input"> & { name: string; children: ReactNode; error?: string }) {
  return (
    <div>
      <label htmlFor={name} className="flex cursor-pointer items-start gap-3 text-[0.8125rem] text-ink-2">
        <input
          id={name}
          name={name}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-line-2 bg-surface-2 accent-[var(--accent)]"
          {...rest}
        />
        <span className="leading-snug">{children}</span>
      </label>
      <FieldError id={`${name}-error`} message={error} />
    </div>
  );
}

/** Banner used for whole-form errors and confirmations. */
export function Notice({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const tones = {
    error: "border-alert/35 bg-alert/10 text-alert",
    success: "border-accent/35 bg-accent/10 text-accent",
    info: "border-line bg-surface-2 text-ink-2",
  } as const;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded border px-4 py-3 text-[0.875rem] ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
