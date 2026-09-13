/**
 * Details about the shop itself, in one place.
 *
 * Everything customer-facing — the footer, the help page, all three legal
 * documents — reads its contact address from here, so moving to a proper
 * domain mailbox later is a one-line change rather than a hunt through the
 * pages.
 */
export const SITE = {
  name: "softsystem",

  /** The official mailbox. One address handles all three roles for now. */
  email: "hello.softsystem@gmail.com",

  /**
   * Split these out when the volume justifies separate inboxes — a domain
   * mailbox gives you support@ / privacy@ / security@ for free, and a
   * security report should not sit in the same queue as a refund request.
   */
  supportEmail: "hello.softsystem@gmail.com",
  privacyEmail: "hello.softsystem@gmail.com",
  securityEmail: "hello.softsystem@gmail.com",
} as const;

/** `mailto:` href with a subject line already filled in. */
export function mailto(address: string, subject?: string): string {
  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}
