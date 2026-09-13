import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your softsystem account to reach your library and downloads.",
};

/** Only ever follow a redirect that stays on this site. */
function safeNext(value?: string): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next);

  if (await getCurrentUser()) redirect(target);

  return (
    <AuthShell
      label="Welcome back"
      title={
        <>
          Sign in to
          <br />
          your <span className="text-accent">library</span>.
        </>
      }
      subtitle="Everything you have ever bought is waiting, ready to download again."
      footer={
        <>
          No account yet?{" "}
          <Link
            href={`/signup${next ? `?next=${encodeURIComponent(target)}` : ""}`}
            className="text-accent underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </>
      }
      panel={{
        heading: "Buy once. Keep it forever.",
        points: [
          "Every purchase stays in your library, re-downloadable for life",
          "Creators ship updates straight to you at no extra cost",
          "Licence keys attached to every product, always to hand",
          "Sign out of every device at once if you ever need to",
        ],
      }}
    >
      <LoginForm next={target} />
    </AuthShell>
  );
}
