"use client";

import Link from "next/link";
import { FormEvent, startTransition, useState } from "react";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  mapAuthErrorMessage,
  validatePassword,
} from "@/lib/auth/utils";
import { useToast } from "@/lib/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";

interface ResetPasswordClientProps {
  hasSession: boolean;
  userEmail: string | null;
  callbackError: string | null;
}

export function ResetPasswordClient({
  hasSession,
  userEmail,
  callbackError,
}: ResetPasswordClientProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(callbackError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordError = validatePassword(password);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!hasSession) {
      setErrorMessage(
        "재설정 세션이 준비되지 않았습니다. 비밀번호 재설정을 다시 요청해 주세요.",
      );
      return;
    }

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(mapAuthErrorMessage(error, "update-password"));
      return;
    }

    pushToast({
      tone: "success",
      title: "새 비밀번호가 저장되었습니다.",
      description: "이제 같은 계정으로 안전하게 로그인할 수 있습니다.",
    });

    startTransition(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center animate-fade-in">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            PASSWORD RESET
          </p>
          <h1 className="text-3xl font-bold text-foreground">새 비밀번호 설정</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            복구 링크로 연결된 세션에서 새 비밀번호를 설정합니다.
          </p>
        </div>

        <div className="card animate-scale-in space-y-6">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            재설정 요청으로 돌아가기
          </Link>

          {errorMessage ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          {!hasSession ? (
            <div className="space-y-4 rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                복구 세션이 없습니다
              </div>
              <p className="text-sm text-muted-foreground">
                링크가 만료되었거나 이미 사용되었을 수 있습니다. 새 재설정 메일을
                요청해 주세요.
              </p>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => router.push("/auth/forgot-password")}
              >
                다시 요청하기
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                {userEmail ? (
                  <>
                    <span className="font-semibold text-foreground">{userEmail}</span>
                    의 비밀번호를 새로 설정합니다.
                  </>
                ) : (
                  "현재 계정의 새 비밀번호를 설정합니다."
                )}
              </div>

              <Input
                id="new-password"
                type="password"
                label="새 비밀번호"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="영문과 숫자를 포함해 8자 이상"
                required
                autoComplete="new-password"
                error={password ? passwordError || undefined : undefined}
                helperText="영문과 숫자를 포함한 8자 이상 비밀번호를 권장합니다."
                leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
              />

              <Input
                id="new-password-confirm"
                type="password"
                label="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="비밀번호를 한 번 더 입력하세요"
                required
                autoComplete="new-password"
                error={
                  confirmPassword && password !== confirmPassword
                    ? "비밀번호가 일치하지 않습니다."
                    : undefined
                }
                leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                loadingText="새 비밀번호 저장 중..."
              >
                새 비밀번호 저장
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
