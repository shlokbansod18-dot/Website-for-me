import { z } from "zod";

/**
 * Every piece of data that arrives from a browser is parsed through one of
 * these schemas before it reaches the database. Anything that does not match
 * is rejected with a field-level message rather than being coerced.
 */

const trimmed = (max: number) => z.string().trim().max(max);

/** Passwords people pick constantly — refused outright, however long they are. */
const BANNED_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "letmein123",
  "iloveyou1",
  "welcome123",
  "admin12345",
  "softsystem",
]);

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That is longer than 200 characters.")
  .refine((v) => !BANNED_PASSWORDS.has(v.toLowerCase()), "That password is too common, try another.")
  .refine((v) => !/^(.)\1+$/.test(v), "That password is too repetitive.");

export const emailSchema = trimmed(254)
  .toLowerCase()
  .pipe(z.string().email("Enter a valid email address."));

export const signupSchema = z.object({
  name: trimmed(80).min(2, "Tell us what to call you."),
  email: emailSchema,
  password: passwordSchema,
  marketingOptIn: z.boolean().default(false),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Please accept the terms and privacy policy." }),
  }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const profileSchema = z.object({
  name: trimmed(80).min(2, "Tell us what to call you."),
  marketingOptIn: z.boolean().default(false),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "The two passwords do not match.",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password you have not used here before.",
  });

export const billingSchema = z.object({
  fullName: trimmed(80).min(2, "Enter the name for the invoice."),
  country: trimmed(56).min(2, "Select a country."),
  city: trimmed(60).min(1, "Enter a city."),
  postalCode: trimmed(16).min(2, "Enter a postal or ZIP code."),
  addressLine: trimmed(120).min(4, "Enter a street address."),
  taxId: trimmed(32).optional().or(z.literal("")),
});

/**
 * Card fields are validated so the form can give useful feedback, but the
 * number itself is deliberately never persisted or logged — see
 * `src/lib/payments.ts`.
 */
export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\d{12,19}$/, "Enter a valid card number."))
    .refine(luhn, "That card number does not look right."),
  cardName: trimmed(80).min(2, "Enter the name on the card."),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/, "Use MM/YY.")
    .refine(notExpired, "That card has expired."),
  cvc: z.string().trim().regex(/^\d{3,4}$/, "Enter the 3 or 4 digit code."),
});

export const checkoutSchema = billingSchema.merge(paymentSchema);

export const productSchema = z.object({
  title: trimmed(90).min(3, "Give the product a title."),
  tagline: trimmed(140).min(6, "Write a one-line pitch."),
  description: trimmed(6000).min(20, "Describe what the buyer receives."),
  category: trimmed(40).min(2, "Pick a category."),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,6}(\.\d{1,2})?$/, "Use a price like 49 or 49.00.")
    .transform((v) => Math.round(Number(v) * 100)),
  compareAt: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Math.round(Number(v) * 100) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Use a number like 99."),
  highlights: trimmed(1200).optional().default(""),
  tags: trimmed(200).optional().default(""),
  accent: z
    .enum(["stone", "taupe", "ink", "burgundy", "ivory", "clay", "sage", "dusk"])
    .default("stone"),
  version: trimmed(20).default("1.0"),
  licence: trimmed(120).default("Standard commercial licence"),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const couponSchema = z
  .string()
  .trim()
  .toUpperCase()
  .max(24)
  .regex(/^[A-Z0-9-]*$/, "Coupon codes are letters, numbers and dashes.");

/* ── helpers ───────────────────────────────────────────────────────────── */

function luhn(value: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = value.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function notExpired(value: string): boolean {
  const [mm, yy] = value.split("/").map((v) => Number(v.trim()));
  const expiry = new Date(2000 + yy, mm, 1).getTime();
  return expiry > Date.now();
}

/** Turns a ZodError into the `{ field: message }` shape our forms render. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

