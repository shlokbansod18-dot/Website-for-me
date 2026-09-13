import type { Metadata } from "next";

import { SITE, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The agreement between you and softsystem, written in plain English.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of service</h1>
      <p className="text-ink-3">Last updated: 10 September 2026</p>

      <p>
        These are the rules for using softsystem, both as someone buying digital products and as
        someone selling them. Using the site means you accept them.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You need to be 16 or older, and the details you give us must be accurate.</li>
        <li>
          Keep your password to yourself. You are responsible for what happens under your account,
          which is why we give you a device list and a one-click sign-out-everywhere.
        </li>
        <li>
          One person, one account. Sharing an account to share purchases is not allowed and may cost
          you both.
        </li>
      </ul>

      <h2>Buying</h2>
      <ul>
        <li>
          A purchase gives you a licence to use the product, not ownership of it. What the licence
          permits is stated on each product page.
        </li>
        <li>
          Unless the product says otherwise, you may use it in your own work and in work you deliver
          to clients. You may not resell it, redistribute it, or put it up as your own.
        </li>
        <li>
          Your library, and your ability to download what you bought, lasts as long as your account
          does.
        </li>
        <li>
          Prices are in US dollars. Your bank sets the conversion rate and may add its own fee.
        </li>
      </ul>

      <h2>Selling</h2>
      <ul>
        <li>
          You must own what you upload, or hold a licence that lets you sell it. Uploading someone
          else&rsquo;s work will get the product removed and probably the account too.
        </li>
        <li>
          The product must be what its page says it is. Misleading listings are removed without
          notice.
        </li>
        <li>
          softsystem takes 5% of each sale. There are no listing fees and no monthly charges.
        </li>
        <li>
          You may unpublish anything at any time. People who already bought it keep their download —
          that sale was already made.
        </li>
        <li>
          You may not upload malware, anything illegal, or anything designed to harm the person who
          downloads it.
        </li>
      </ul>

      <h2>What is not allowed</h2>
      <ul>
        <li>Attempting to access accounts, orders or files that are not yours.</li>
        <li>
          Automated scraping, credential stuffing, or load that degrades the service for everyone
          else.
        </li>
        <li>Reselling, sublicensing or redistributing products you bought here.</li>
        <li>Using the site to break the law where you are, or where we are.</li>
      </ul>
      <p>
        Security researchers are welcome — see the disclosure note on the <a href="/help">help
        page</a>. Test against your own accounts, not other people&rsquo;s.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep the shop running continuously and will not manage it perfectly. The service
        is provided as it is, without a guarantee that it will always be available or always be
        error-free.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, our liability for any claim connected with the service is
        limited to what you paid us in the twelve months before the claim. Nothing here limits
        liability that cannot legally be limited — including for death, personal injury, or fraud.
      </p>

      <h2>Ending things</h2>
      <p>
        You can delete your account whenever you like, from{" "}
        <a href="/account/privacy">/account/privacy</a>. We can suspend or close an account that
        breaks these terms; where it is reasonable to do so, we will explain why first.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change materially, the date at the top changes and we will tell you before
        the new version applies to you.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={mailto(SITE.supportEmail, "softsystem — question")}>{SITE.supportEmail}</a>
      </p>
    </>
  );
}
