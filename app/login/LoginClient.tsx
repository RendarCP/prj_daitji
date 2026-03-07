"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_NEXT_PATH = "/dashboard";

type LoginMethod = "email" | "social";

function sanitizeNextPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  return path;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.21-2.27H12v4.31h6.45a5.51 5.51 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.66Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.07.72-2.45 1.15-4.08 1.15-3.14 0-5.81-2.12-6.76-4.97H1.24v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.24 14.27A7.2 7.2 0 0 1 4.86 12c0-.79.14-1.55.38-2.27V6.64H1.24A12 12 0 0 0 0 12c0 1.94.46 3.79 1.24 5.36l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.33.61 4.57 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.24 6.64l4 3.09c.95-2.85 3.62-4.96 6.76-4.96Z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.2 2 1.5 5.7 1.5 10.3c0 2.9 1.9 5.5 4.8 7-0.2 0.8-0.9 3.1-1 3.5-0.1 0.5 0.2 0.5 0.4 0.4 0.2-0.1 3.5-2.3 4.9-3.2 0.5 0.1 1 0.1 1.4 0.1 5.8 0 10.5-3.7 10.5-8.3S17.8 2 12 2Z"
      />
    </svg>
  );
}

interface LoginClientProps {
  nextPath?: string;
}

export function LoginClient({ nextPath = DEFAULT_NEXT_PATH }: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<
    "google" | "kakao" | null
  >(null);

  const supabase = createClient();
  const redirectNext = sanitizeNextPath(searchParams.get("next") || nextPath);

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (!error) {
      return;
    }

    if (message) {
      setErrorMessage(message);
      return;
    }

    if (error === "missing_code") {
      setErrorMessage("인증 코드가 없어 로그인에 실패했습니다.");
      return;
    }

    if (error === "oauth_exchange_failed") {
      setErrorMessage("소셜 로그인 처리 중 오류가 발생했습니다.");
      return;
    }

    setErrorMessage("로그인 처리 중 문제가 발생했습니다.");
  }, [searchParams]);

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsEmailLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsEmailLoading(false);

    if (error) {
      setErrorMessage(error.message || "이메일 로그인에 실패했습니다.");
      return;
    }

    router.replace(redirectNext);
    router.refresh();
  };

  const handleOAuthLogin = async (provider: "google" | "kakao") => {
    setErrorMessage(null);
    setSocialLoadingProvider(provider);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectNext)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });

    if (error) {
      setErrorMessage(error.message || "소셜 로그인에 실패했습니다.");
      setSocialLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center animate-fade-in">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            DAITJI AUTH
          </p>
          <h1 className="text-3xl font-bold text-foreground">로그인</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            이메일 또는 소셜 계정으로 시작하세요.
          </p>
        </div>

        <div className="card animate-scale-in space-y-6">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/60 p-1">
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                method === "email"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={method === "email"}
            >
              이메일
            </button>
            <button
              type="button"
              onClick={() => setMethod("social")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                method === "social"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={method === "social"}
            >
              소셜
            </button>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {method === "email" ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
          ) : (
            <div className="space-y-3">
              <Button
                type="button"
                fullWidth
                size="lg"
                variant="outline"
                leftIcon={<GoogleIcon />}
                isLoading={socialLoadingProvider === "google"}
                loadingText="Google 연결 중..."
                onClick={() => handleOAuthLogin("google")}
              >
                Google로 로그인
              </Button>
              <Button
                type="button"
                fullWidth
                size="lg"
                className="border-0 bg-[#FEE500] text-[#191919] hover:bg-[#f8de00]"
                leftIcon={<KakaoIcon />}
                isLoading={socialLoadingProvider === "kakao"}
                loadingText="Kakao 연결 중..."
                onClick={() => handleOAuthLogin("kakao")}
              >
                Kakao로 로그인
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            아직 계정이 없다면 이메일 회원가입 후 로그인해 주세요.
          </p>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="text-primary hover:text-primary/80">
              홈으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
