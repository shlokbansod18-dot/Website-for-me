import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/settings");

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h2 className="font-display text-xl">Profile</h2>
        <p className="mt-1 text-[0.8125rem] text-ink-2">
          The short list of things we know about you.
        </p>
      </div>

      <div className="panel p-7">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
