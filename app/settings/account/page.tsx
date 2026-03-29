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
      <div className="min-h-screen bg-background pb-[calc(2rem+env(safe-area-inset-bottom))] overscroll-none">
        <div className="fixed inset-x-0 top-14 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md sm:top-16">
          <div className="container mx-auto max-w-3xl px-4 py-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="설정으로 돌아가기"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="h-[53px] w-full sm:h-[57px]"
        />
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <AccountSecurityClient initialUser={user} />
        </div>
      </div>
    </>
  );
}
