"use client";

import Link from "next/link";
import { FormEvent, startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  buildAbsoluteUrl,
  DEFAULT_NEXT_PATH,
  getOAuthRedirectPath,
  mapAuthErrorMessage,
  validatePassword,
} from "@/lib/auth/utils";
import { useToast } from "@/lib/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  AuthMessage,
  SocialLoginButtons,
  type SocialProvider,
} from "@/components/features/auth/AuthShared";

interface SignupClientProps {
  nextPath?: string;
  initialEmail?: string;
}

export function SignupClient({
  nextPath = DEFAULT_NEXT_PATH,
  initialEmail = "",
}: SignupClientProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<
    string | null
  >(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] =
    useState<SocialProvider | null>(null);

  const passwordError = validatePassword(password);
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

  const handleEmailSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!agreeToTerms) {
      setErrorMessage("서비스 이용을 위해 약관 동의가 필요합니다.");
      return;
    }

    setIsEmailLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildAbsoluteUrl(getOAuthRedirectPath(nextPath)),
        data: {
          agreed_to_terms: true,
          agreed_to_terms_at: new Date().toISOString(),
        },
      },
    });

    setIsEmailLoading(false);

    if (error) {
      setErrorMessage(mapAuthErrorMessage(error, "sign-up"));
      return;
    }

    if (data.session) {
      pushToast({
        tone: "success",
        title: "회원가입이 완료되었습니다.",
        description: "바로 대시보드로 이동합니다.",
      });
      handleSuccessfulNavigation(nextPath);
      return;
    }

    setPendingConfirmationEmail(email);
    setPassword("");
    setConfirmPassword("");
    setSuccessMessage("인증 메일을 보냈습니다. 메일함에서 링크를 열어 주세요.");
    pushToast({
      tone: "info",
      title: "인증 메일을 보냈습니다.",
      description: "메일함에서 확인 링크를 누르면 바로 로그인됩니다.",
    });
  };

  const handleOAuthLogin = async (provider: SocialProvider) => {
    resetMessages();
    setSocialLoadingProvider(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildAbsoluteUrl(getOAuthRedirectPath(nextPath)),
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
        emailRedirectTo: buildAbsoluteUrl(getOAuthRedirectPath(nextPath)),
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
        <div className="mb-8 text-center animate-fade-in">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            DAITJI SIGN UP
          </p>
          <h1 className="text-3xl font-bold text-foreground">회원가입</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            이메일로 먼저 계정을 만들고, 원하면 아래에서 SNS로도 바로 시작할 수
            있습니다.
          </p>
        </div>

        <div className="card animate-scale-in space-y-6">
          {errorMessage ? (
            <AuthMessage tone="error">{errorMessage}</AuthMessage>
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
                      `/login?next=${encodeURIComponent(
                        nextPath,
                      )}&email=${encodeURIComponent(
                        pendingConfirmationEmail ?? email,
                      )}`,
                    )
                  }
                >
                  로그인 화면으로 이동
                </Button>
              </div>
            </section>
          ) : (
            <>
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <Input
                  id="signup-email"
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
                  id="signup-password"
                  type="password"
                  label="비밀번호"
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
                  id="signup-password-confirm"
                  type="password"
                  label="비밀번호 확인"
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

                <label className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 px-3 py-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(event) => setAgreeToTerms(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                  />
                  <span>
                    서비스 이용 및 계정 보안 안내에 동의합니다. 이메일 인증 완료
                    후 계정이 활성화됩니다.
                  </span>
                </label>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isEmailLoading}
                  loadingText="가입 중..."
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  이메일로 회원가입
                </Button>
              </form>
            </>
          )}

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              이미 계정이 있다면{" "}
              <Link
                href={`/login?next=${encodeURIComponent(
                  nextPath,
                )}&email=${encodeURIComponent(email)}`}
                className="font-semibold text-primary hover:text-primary/80"
              >
                로그인
              </Link>
              으로 이동해 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
