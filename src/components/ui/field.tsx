import type { ComponentProps, ReactNode } from "react";

const control =
  "w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm text-text " +
  "placeholder:text-faint outline-none transition-colors duration-200 " +
  "hover:border-line-strong focus:border-acid focus:ring-2 focus:ring-acid/25";

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
      <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-text">
        {children}
      </label>
      {hint ? <span className="text-[0.6875rem] text-faint">{hint}</span> : null}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-flare">
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
        className={`${control} ${error ? "border-flare/60 focus:border-flare focus:ring-flare/25" : ""}`}
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
        className={`${control} min-h-32 resize-y leading-relaxed ${error ? "border-flare/60" : ""}`}
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
        className={`${control} cursor-pointer appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%236b6d78'%3E%3Cpath d='M4 6l4 4 4-4'  stroke='%236b6d78' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        }}
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
      <label htmlFor={name} className="flex cursor-pointer items-start gap-3 text-[0.8125rem] text-dim">
        <input
          id={name}
          name={name}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-line-strong bg-surface-2 accent-[var(--acid)]"
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
    error: "border-flare/35 bg-flare/10 text-flare",
    success: "border-acid/35 bg-acid/10 text-acid",
    info: "border-line bg-surface-2 text-dim",
  } as const;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-[0.8125rem] ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
