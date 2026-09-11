import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Join SoftSystem to buy digital products, or to start selling your own.",
};

function safeNext(value?: string): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next);

  if (await getCurrentUser()) redirect(target);

  return (
    <AuthShell
      eyebrow="First time here"
      title={
        <>
          Make an
          <br />
          <span className="text-acid">account</span>.
        </>
      }
      subtitle="Two fields and a password. No phone number, no verification maze."
      footer={
        <>
          Already have one?{" "}
          <Link
            href={`/login${next ? `?next=${encodeURIComponent(target)}` : ""}`}
            className="text-acid underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
      panel={{
        heading: "The shortest sign-up we could get away with.",
        points: [
          "We collect an email, a name and a password — nothing else",
          "Marketing email is off unless you switch it on",
          "Download everything we hold about you whenever you like",
          "Delete your account for real, in one click, with no email chase",
        ],
      }}
    >
      <SignupForm next={target} />
    </AuthShell>
  );
}
