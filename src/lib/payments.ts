import "server-only";

/**
 * Payment boundary.
 *
 * This project ships with a self-contained demo processor so the whole
 * purchase flow works the moment you clone it. It is written the way a real
 * integration should be written:
 *
 *   • the card number exists only as a local variable inside `charge()` —
 *     it is never written to the database, never logged, never put in an
 *     error message, and never sent to the browser again;
 *   • only the brand and the last four digits survive, which is all you need
 *     to show "Visa ending 4242" on a receipt;
 *   • the function returns a provider reference, exactly like Stripe's
 *     PaymentIntent id, so swapping in a real processor means replacing the
 *     body of `charge()` and nothing else.
 *
 * Before taking real money, replace this with a hosted provider (Stripe
 * Checkout, Paddle, Lemon Squeezy). Handling raw card numbers on your own
 * server drags you into PCI-DSS scope; letting the provider's iframe collect
 * them keeps you out of it.
 */

import { humanCode } from "./crypto";

export type ChargeInput = {
  cardNumber: string;
  cvc: string;
  expiry: string;
  amountCents: number;
  currency: string;
};

export type ChargeResult =
  | { ok: true; reference: string; brand: string; last4: string }
  | { ok: false; reason: string };

export function cardBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "Amex";
  if (/^6(?:011|5)/.test(cardNumber)) return "Discover";
  if (/^(60|65|81|82)/.test(cardNumber)) return "RuPay";
  return "Card";
}

export async function charge(input: ChargeInput): Promise<ChargeResult> {
  const number = input.cardNumber.replace(/\D/g, "");

  // Test numbers that let you exercise the failure paths of the UI.
  if (number.endsWith("0002")) return { ok: false, reason: "Your bank declined this card." };
  if (number.endsWith("0069")) return { ok: false, reason: "That card has expired." };
  if (number.endsWith("0119")) return { ok: false, reason: "The payment network timed out. Try again." };

  if (input.amountCents < 0) return { ok: false, reason: "Invalid amount." };

  const result = {
    ok: true as const,
    reference: `demo_${humanCode(10).toLowerCase()}`,
    brand: cardBrand(number),
    last4: number.slice(-4),
  };

  // The local variable holding the number goes out of scope here and is never
  // returned to the caller.
  return result;
}
