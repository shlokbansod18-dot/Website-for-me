import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Buttons are pills, set in the display grotesque at semibold. Against a wall
 * of hard-cropped poster covers, a soft capsule is the one friendly shape on
 * the page — and it is what a hand reaches for on a phone. Coral is spent
 * here and almost nowhere else, so a primary button is always the thing to
 * press next.
 */
const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-full " +
  "font-display font-semibold tracking-[-0.02em] " +
  "transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-150 " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent shadow-[var(--glow)] hover:brightness-110",
  outline: "border border-line-2 text-ink hover:border-accent-2 hover:text-accent-2",
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
