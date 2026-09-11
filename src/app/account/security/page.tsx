import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { revokeSessionAction, signOutEverywhereAction } from "@/actions/account";
import { PasswordForm } from "@/components/password-form";
import { getCurrentSession, listSessions } from "@/lib/auth";
import { formatDateTime } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Security",
  robots: { index: false, follow: false },
};

export default async function SecurityPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?next=/account/security");

  const sessions = listSessions(session.user.id);

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold tracking-[-0.035em]">Password</h2>
          <p className="mt-1 text-[0.8125rem] text-dim">
            Stored as a scrypt hash. Even we cannot read it.
          </p>
        </div>
        <div className="card p-7">
          <PasswordForm />
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-[-0.035em]">Signed-in devices</h2>
            <p className="mt-1 text-[0.8125rem] text-dim">
              Anything you do not recognise, sign it out.
            </p>
          </div>
          {sessions.length > 1 && (
            <form action={signOutEverywhereAction}>
              <button
                type="submit"
                className="rounded-full border border-flare/40 px-4 py-2 text-[0.8125rem] text-flare transition-colors hover:bg-flare hover:text-white"
              >
                Sign out everywhere
              </button>
            </form>
          )}
        </div>

        <ul className="space-y-px overflow-hidden rounded-[1.25rem] border border-line">
          {sessions.map((row) => {
            const current = row.id === session.sessionId;
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-4 bg-surface px-5 py-4 text-[0.8125rem]"
              >
                <span
                  aria-hidden
                  className={`grid size-9 shrink-0 place-items-center rounded-full border ${
                    current ? "border-acid/40 text-acid" : "border-line text-faint"
                  }`}
                >
                  ▢
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{row.user_agent ?? "Unknown device"}</span>
                    {current && (
                      <span className="rounded-full bg-acid/12 px-2 py-0.5 text-[0.625rem] text-acid">
                        THIS DEVICE
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    Last active {formatDateTime(row.last_seen_at)} · signed in{" "}
                    {formatDateTime(row.created_at)}
                  </p>
                </div>
                {!current && (
                  <form action={revokeSessionAction}>
                    <input type="hidden" name="sessionId" value={row.id} />
                    <button
                      type="submit"
                      className="shrink-0 text-xs text-faint underline-offset-4 transition-colors hover:text-flare hover:underline"
                    >
                      Sign out
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-[0.6875rem] leading-relaxed text-faint">
          We record a rough device label and a keyed hash of the IP address you signed in from —
          never the address itself. It is enough to spot a session you do not recognise, and not
          enough to build a location history.
        </p>
      </section>
    </div>
  );
}
