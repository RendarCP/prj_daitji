"use client";

import Link from "next/link";
import { FormEvent, startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  buildAbsoluteUrl,
  DEFAULT_NEXT_PATH,
  getOAuthRedirectPath,
  mapAuthErrorMessage,
  mapCallbackErrorMessage,
  sanitizeNextPath,
} from "@/lib/auth/utils";
import { useToast } from "@/lib/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  AuthMessage,
  DaitjiLogo,
  SocialLoginButtons,
  type SocialProvider,
} from "@/components/features/auth/AuthShared";

interface LoginClientProps {
  nextPath?: string;
}

export function LoginClient({
  nextPath = DEFAULT_NEXT_PATH,
}: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const supabase = createClient();
  const callbackErrorMessage = mapCallbackErrorMessage(
    searchParams.get("error"),
    searchParams.get("message"),
  );

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<
    string | null
  >(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] =
    useState<SocialProvider | null>(null);

  const redirectNext = sanitizeNextPath(searchParams.get("next") || nextPath);
  const visibleErrorMessage = errorMessage ?? callbackErrorMessage;
  const showConfirmationState = Boolean(pendingConfirmationEmail);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSuccessfulNavigation = (path: string) => {
    startTransition(() => {
      router.replace(path);
      router.refresh();
    });
  };

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setIsEmailLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsEmailLoading(false);

    if (error) {
      const message = mapAuthErrorMessage(error, "sign-in");
      setErrorMessage(message);

      if (message?.includes("이메일 인증")) {
        setPendingConfirmationEmail(email);
      }

      return;
    }

    pushToast({
      tone: "success",
      title: "로그인되었습니다.",
      description:
        data.user?.last_sign_in_at === data.user?.created_at
          ? "첫 방문을 환영합니다. 바로 시작해 볼게요."
          : "이전 작업을 이어서 진행할 수 있습니다.",
    });

    handleSuccessfulNavigation(redirectNext);
  };

  const handleOAuthLogin = async (provider: SocialProvider) => {
    resetMessages();
    setSocialLoadingProvider(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildAbsoluteUrl(getOAuthRedirectPath(redirectNext)),
      },
    });

    if (error) {
      setErrorMessage(mapAuthErrorMessage(error, "oauth"));
      setSocialLoadingProvider(null);
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = pendingConfirmationEmail || email;

    if (!targetEmail) {
      setErrorMessage("인증 메일을 다시 보내려면 이메일 주소가 필요합니다.");
      return;
    }

    resetMessages();
    setIsResendingConfirmation(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: targetEmail,
      options: {
        emailRedirectTo: buildAbsoluteUrl(getOAuthRedirectPath(redirectNext)),
      },
    });

    setIsResendingConfirmation(false);

    if (error) {
      setErrorMessage(mapAuthErrorMessage(error, "resend-confirmation"));
      return;
    }

    setSuccessMessage("인증 메일을 다시 보냈습니다. 메일함을 확인해 주세요.");
    pushToast({
      tone: "success",
      title: "인증 메일을 다시 보냈습니다.",
      description: "수신함과 스팸함을 함께 확인해 주세요.",
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-2 text-center animate-fade-in">
          <div className="flex justify-center">
            <DaitjiLogo className="size-24" />
          </div>
        </div>

        <div className="card animate-scale-in space-y-4 p-6">
          {visibleErrorMessage ? (
            <AuthMessage tone="error">{visibleErrorMessage}</AuthMessage>
          ) : null}
          {successMessage ? (
            <AuthMessage tone="success">{successMessage}</AuthMessage>
          ) : null}

          {showConfirmationState ? (
            <section className="space-y-4 rounded-2xl border border-primary/20 bg-primary/10 p-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  이메일 확인이 필요합니다
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {pendingConfirmationEmail}
                  </span>
                  로 인증 메일을 보냈습니다. 링크를 열면 로그인 후 원래 페이지로
                  이동합니다.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  fullWidth
                  variant="secondary"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  isLoading={isResendingConfirmation}
                  loadingText="메일 재전송 중..."
                  onClick={handleResendConfirmation}
                >
                  인증 메일 다시 보내기
                </Button>
                <Button
                  type="button"
                  fullWidth
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/signup?next=${encodeURIComponent(
                        redirectNext,
                      )}&email=${encodeURIComponent(
                        pendingConfirmationEmail ?? email,
                      )}`,
                    )
                  }
                >
                  회원가입 화면으로 이동
                </Button>
              </div>
            </section>
          ) : (
            <>
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  label="이메일"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
                />

                <Input
                  id="password"
                  type="password"
                  label="비밀번호"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  autoComplete="current-password"
                  leftIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
                />

                <div className="flex items-center justify-end gap-3 text-sm">
                  <Link
                    href={`/auth/forgot-password?next=${encodeURIComponent(
                      redirectNext,
                    )}&email=${encodeURIComponent(email)}`}
                    className="font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    비밀번호 재설정
                  </Link>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isEmailLoading}
                  loadingText="로그인 중..."
                >
                  이메일로 로그인
                </Button>
              </form>

              <div className="space-y-2 text-center text-sm text-muted-foreground">
                {/* <p> */}
                <Link
                  href={`/signup?next=${encodeURIComponent(
                    redirectNext,
                  )}&email=${encodeURIComponent(email)}`}
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  회원가입 페이지로 이동
                </Link>
                {/* </p> */}
              </div>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                또는
                <span className="h-px flex-1 bg-border" />
              </div>

              <SocialLoginButtons
                title="SNS 로그인"
                description="Google 또는 Kakao 계정으로도 바로 로그인할 수 있습니다."
                socialLoadingProvider={socialLoadingProvider}
                onProviderClick={handleOAuthLogin}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
