import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { mapCallbackErrorMessage } from "@/lib/auth/utils";
import { ResetPasswordClient } from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "새 비밀번호 설정",
  description: "복구 링크로 새 비밀번호를 설정하세요",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error, message } = await searchParams;

  return (
    <ResetPasswordClient
      hasSession={Boolean(user)}
      userEmail={user?.email ?? null}
      callbackError={mapCallbackErrorMessage(error ?? null, message)}
    />
  );
}
