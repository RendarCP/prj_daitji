import type { Metadata } from "next";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
  description: "비밀번호 재설정 메일을 요청하세요",
};

interface ForgotPasswordPageProps {
  searchParams: Promise<{
    email?: string;
    next?: string;
  }>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { email, next } = await searchParams;

  return <ForgotPasswordClient initialEmail={email} nextPath={next} />;
}
