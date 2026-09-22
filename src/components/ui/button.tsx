import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Buttons are pills set in Inter Medium, per the brand sheet: Inter carries
 * buttons, prices and labels, and the serif is kept for statements.
 *
 * The primary button is Ink Black rather than the accent, because the sheet
 * reserves Muted Burgundy for small highlights. Burgundy arrives on hover,
 * which is where a small dose does the most work.
 */
const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-full " +
  "font-sans font-medium tracking-[0.01em] " +
  "transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150 " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-accent",
  outline: "border border-line-2 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink-2 hover:text-ink hover:bg-surface",
  danger: "border border-alert/45 text-alert hover:bg-alert hover:text-paper hover:border-alert",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-[3.4rem] px-8 text-[1.0625rem]",
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
