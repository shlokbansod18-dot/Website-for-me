import type { Metadata } from "next";

import { SITE, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What softsystem collects, why, how long it is kept, and how to get rid of it.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="text-faint">Last updated: 10 September 2026</p>

      <p>
        This policy describes what softsystem collects, why we need it, and what you can do about
        it. It is short because the list is short.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your name and email address</strong>, because we need something to sign you in
          with and a name to put on your receipts.
        </li>
        <li>
          <strong>A scrypt hash of your password.</strong> Not the password — a one-way hash of it,
          which lets us check a sign-in without ever being able to read what you typed.
        </li>
        <li>
          <strong>Your purchases</strong>, their licence keys, and how many times you have
          downloaded each one, so your library keeps working.
        </li>
        <li>
          <strong>Your billing address and tax ID</strong>, if you enter one, because an invoice
          legally needs it. This is encrypted with AES-256-GCM before it is written to disk.
        </li>
        <li>
          <strong>Your card brand and its last four digits.</strong> Never the card number itself —
          see below.
        </li>
        <li>
          <strong>A rough device label and a keyed hash of your IP address</strong> for each
          signed-in session, so you can spot a device you do not recognise and so we can rate-limit
          attacks. We do not store the IP address itself.
        </li>
      </ul>

      <h2>What we deliberately do not collect</h2>
      <p>
        Your card number, your phone number, your date of birth, your location, your behaviour on
        other websites, or any profile assembled by an advertising network. This site loads no
        third-party scripts, fonts, or pixels of any kind — you can verify that in your
        browser&rsquo;s network tab.
      </p>

      <h2>Cookies</h2>
      <p>
        Three, all strictly necessary for the site to function: your sign-in session, the contents
        of your bag, and any coupon you have applied. All three are signed and HTTP-only, meaning
        JavaScript cannot read them. There are no analytics or advertising cookies, which is why
        this site does not show you a consent banner.
      </p>

      <h2>Payments</h2>
      <p>
        Your card number exists only for the moment a payment is authorised, and is then discarded.
        It is never stored, never written to a log, and never included in an error message. When
        this site is connected to a real payment provider, the card details go directly to that
        provider and do not pass through our servers at all.
      </p>

      <h2>Who else sees your data</h2>
      <p>
        Nobody. We do not sell, rent, trade or share personal data — there is no arrangement under
        which we could. The only exception would be a valid, binding legal order, and we would tell
        you it had happened unless we were legally prohibited from doing so.
      </p>
      <p>
        Sellers see the title and price of what sold, not who bought it. Seller accounts have no
        access to customer records.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Account data lasts as long as your account. Orders and their encrypted billing details are
        kept with the order, because tax law generally requires invoices to be retained. Sessions
        expire after 30 days, or immediately when you sign out. Rate-limit records are discarded
        within hours.
      </p>

      <h2>Your controls</h2>
      <ul>
        <li>
          <strong>See everything</strong> — <a href="/account/privacy">/account/privacy</a> lists
          every category of data we hold about you.
        </li>
        <li>
          <strong>Take a copy</strong> — one button downloads all of it as a JSON file.
        </li>
        <li>
          <strong>Correct it</strong> — change your name and email preferences at{" "}
          <a href="/account/settings">/account/settings</a>.
        </li>
        <li>
          <strong>Delete it</strong> — one button, password-confirmed, immediate and permanent. No
          cooling-off period and no email chase.
        </li>
        <li>
          <strong>Sign out everywhere</strong> — revoke any device from{" "}
          <a href="/account/security">/account/security</a>.
        </li>
      </ul>
      <p>
        If you are in the UK, EU, India, California or anywhere else with a data protection law,
        those rights apply to you and the controls above are how you exercise them. You do not need
        to email anyone first.
      </p>

      <h2>Marketing</h2>
      <p>
        Off unless you explicitly switch it on. If you do, every message has a one-click
        unsubscribe, and your address is never passed to anyone else.
      </p>

      <h2>Children</h2>
      <p>
        This shop is not intended for children under 16. We do not knowingly hold data about
        children, and will delete it promptly if we learn we have.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that affects you, the date at the top changes and we will
        tell you before it takes effect.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions and security reports both go to{" "}
        <a href={mailto(SITE.privacyEmail, "softsystem — privacy")}>{SITE.privacyEmail}</a>. For a
        security issue, please read the disclosure note on the{" "}
        <a href="/help">help page</a> first.
      </p>
    </>
  );
}
