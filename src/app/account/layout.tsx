import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { AccountNav } from "@/components/account-nav";
import { canSell, getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="shell py-12 lg:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent font-display text-xl text-on-accent">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl">
              {user.name}
            </h1>
            <p className="truncate text-[0.8125rem] text-ink-3">
              {user.email} · member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-2 text-[0.8125rem] text-ink-2 transition-colors hover:border-alert hover:text-alert"
          >
            Sign out
          </button>
        </form>
      </header>

      <div className="grid gap-10 lg:grid-cols-[13rem_1fr] lg:gap-14">
        <AccountNav canSell={canSell(user.role)} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
