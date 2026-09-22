import type { Metadata } from "next";

import { SITE, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "When you can get your money back on a digital product, and how to ask.",
};

export default function RefundsPage() {
  return (
    <>
      <h1>Refund policy</h1>
      <p className="text-ink-3">Last updated: 10 September 2026</p>

      <p>
        Digital products cannot be handed back, so a refund policy has to be built on trust in both
        directions. Ours is simple: if the product is not what it said it was, you get your money
        back.
      </p>

      <h2>The window</h2>
      <p>
        <strong>14 days from purchase</strong>, provided you have not downloaded the file more than
        twice. The download count is on the product in your library, so you can always see where you
        stand.
      </p>

      <h2>Always refunded</h2>
      <ul>
        <li>The product is materially different from its description.</li>
        <li>The file is corrupt, incomplete, or will not open in the software it names.</li>
        <li>You were charged twice for the same thing.</li>
        <li>You bought it by mistake and have not downloaded it.</li>
        <li>The purchase was not made by you, tell us immediately and change your password.</li>
      </ul>

      <h2>Usually not refunded</h2>
      <ul>
        <li>
          You have downloaded and used the product, and simply changed your mind afterwards.
        </li>
        <li>
          You did not read what was included. Every product page lists this before you buy.
        </li>
        <li>
          You lack the software the product requires, the product page states what you need.
        </li>
        <li>The 14 days have passed.</li>
      </ul>
      <p>
        These are defaults, not walls. If your situation is genuinely unfair, write to us and say
        so; we would rather refund someone than argue with them.
      </p>

      <h2>How to ask</h2>
      <p>
        Email <a href={mailto(SITE.supportEmail, "softsystem, refund request")}>{SITE.supportEmail}</a> with your order number, it is on your
        receipt and at <a href="/account/orders">/account/orders</a>, and a sentence about what
        went wrong. You do not need to fill in a form or justify yourself at length.
      </p>
      <p>
        We reply within two working days. An approved refund goes back to the panel you paid with,
        and your bank usually takes another 5 to 10 days to show it.
      </p>

      <h2>What happens to the product</h2>
      <p>
        A refunded product leaves your library and its licence key is voided. You are expected to
        delete any copies you downloaded.
      </p>

      <h2>Your statutory rights</h2>
      <p>
        Nothing here removes rights you have under consumer law where you live. In some places
        buyers have a statutory cancellation right for digital purchases; where that applies, it
        applies regardless of what this page says, and it wins.
      </p>

      <h2>How a refund is handled</h2>
      <p>
        When a buyer is refunded, the sale is reversed and the platform fee is returned to you as
        well, we do not keep a commission on a sale that did not stand. A product attracting an
        unusual number of refunds gets reviewed, because that usually means the page promises
        something the file does not deliver.
      </p>
    </>
  );
}
