import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import type { AccountUser } from "./SettingsContext";

export const metadata: Metadata = {
  title: "Settings",
  description: "설정",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: userData }, { data: identityData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getUserIdentities(),
  ]);
  const user: AccountUser = userData.user
    ? {
        ...userData.user,
        identities: identityData?.identities ?? userData.user.identities ?? [],
      }
    : null;

  if (!user) {
    redirect("/login?next=/settings");
  }

  return <SettingsClient initialAccountUser={user} />;
}
