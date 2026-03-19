import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { AccountSecurityClient } from "./AccountSecurityClient";

export const metadata: Metadata = {
  title: "계정 보안",
  description: "연결된 로그인 수단과 비밀번호를 관리하세요",
};

export default async function AccountSecurityPage() {
  const supabase = await createClient();
  const [{ data: userData }, { data: identityData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getUserIdentities(),
  ]);
  const user = userData.user
    ? {
        ...userData.user,
        identities: identityData?.identities ?? userData.user.identities ?? [],
      }
    : null;

  if (!user) {
    redirect("/login?next=/settings/account");
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <Link
            href="/settings"
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label="설정으로 돌아가기"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Link>
          <AccountSecurityClient initialUser={user} />
        </div>
      </div>
    </>
  );
}
