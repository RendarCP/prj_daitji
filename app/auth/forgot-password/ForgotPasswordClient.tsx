"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  buildAbsoluteUrl,
  getPasswordRecoveryRedirectPath,
  mapAuthErrorMessage,
  sanitizeNextPath,
} from "@/lib/auth/utils";
import { useToastError } from "@/lib/hooks/useToastError";
import { useToast } from "@/lib/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";

interface ForgotPasswordClientProps {
  initialEmail?: string;
  nextPath?: string;
}

export function ForgotPasswordClient({
  initialEmail = "",
  nextPath,
}: ForgotPasswordClientProps) {
  const { pushToast } = useToast();
  const supabase = createClient();
  const [email, setEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectNext = sanitizeNextPath(nextPath);

  useToastError(errorMessage, {
    title: "재설정 메일을 보낼 수 없습니다.",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildAbsoluteUrl(getPasswordRecoveryRedirectPath()),
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(mapAuthErrorMessage(error, "reset-password"));
      return;
    }

    const message =
      "비밀번호 재설정 메일을 보냈습니다. 메일의 링크를 열면 새 비밀번호를 설정할 수 있습니다.";
    setSuccessMessage(message);
    pushToast({
      tone: "success",
      title: "재설정 메일을 보냈습니다.",
      description: "수신함과 스팸함을 함께 확인해 주세요.",
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center animate-fade-in">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            ACCOUNT RECOVERY
          </p>
          <h1 className="text-3xl font-bold text-foreground">비밀번호 재설정</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            가입한 이메일을 입력하면 보안 링크를 보내드립니다.
          </p>
        </div>

        <div className="card animate-scale-in space-y-6">
          <Link
            href={`/login?next=${encodeURIComponent(redirectNext)}&email=${encodeURIComponent(email)}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            로그인으로 돌아가기
          </Link>

          {successMessage ? (
            <div className="rounded-xl border border-success/30 bg-success/10 px-3 py-3 text-sm text-success">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="recovery-email"
              type="email"
              label="이메일"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              loadingText="재설정 메일 발송 중..."
            >
              재설정 메일 보내기
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Google 또는 Kakao로 가입한 계정이라면 같은 소셜 버튼으로 로그인한 뒤
            설정에서 비밀번호를 추가할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
