import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Buttons are rectangular with a 4px radius rather than pills. Next to a
 * high-contrast serif, a squared edge reads considered; a pill reads like a
 * consumer app. The accent is spent here and almost nowhere else.
 */
const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded font-medium " +
  "transition-[background-color,border-color,color,opacity] duration-150 " +
  "disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:opacity-90",
  outline: "border border-line-2 text-ink hover:border-ink hover:bg-surface",
  ghost: "text-ink-2 hover:text-ink hover:bg-surface",
  danger: "border border-alert/40 text-alert hover:bg-alert hover:text-white hover:border-alert",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-[3.25rem] px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
