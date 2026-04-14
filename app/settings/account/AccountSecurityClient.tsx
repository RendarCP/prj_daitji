"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  KeyRound,
  Link2,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  buildAbsoluteUrl,
  getOAuthRedirectPath,
  getProviderLabel,
  getUserProviders,
  hasPasswordProvider,
  mapAuthErrorMessage,
  validatePassword,
} from "@/lib/auth/utils";
import { useToastError } from "@/lib/hooks/useToastError";
import { useToast } from "@/lib/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import type { AccountUser } from "@/app/settings/SettingsContext";

function formatDate(dateString: string | null | undefined) {
  if (!dateString) {
    return "기록 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

interface AccountSecurityClientProps {
  initialUser?: AccountUser;
}

export function AccountSecurityClient({
  initialUser = null,
}: AccountSecurityClientProps) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { pushToast } = useToast();

  const [user, setUser] = useState<AccountUser>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);

  const fetchAccount = useCallback(async () => {
    const [
      { data: userData, error: userError },
      { data: identitiesData, error: identityError },
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase.auth.getUserIdentities(),
    ]);

    if (userError || identityError) {
      return {
        user: null,
        error:
          userError?.message ||
          identityError?.message ||
          "계정 정보를 불러오지 못했습니다.",
      };
    }

    return {
      user: userData.user
        ? {
            ...userData.user,
            identities: identitiesData.identities,
          }
        : null,
      error: null,
    };
  }, [supabase]);

  const loadAccount = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const result = await fetchAccount();

    if (result.error) {
      setErrorMessage(result.error);
      setIsLoading(false);
      return;
    }

    if (!result.user) {
      setIsLoading(false);
      router.replace("/login?next=/settings/account");
      return;
    }

    setUser(result.user);
    setIsLoading(false);
  }, [fetchAccount, router]);

  useEffect(() => {
    if (initialUser) {
      return;
    }

    let isCancelled = false;

    const hydrateAccount = async () => {
      const result = await fetchAccount();

      if (isCancelled) {
        return;
      }

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      if (!result.user) {
        setIsLoading(false);
        router.replace("/login?next=/settings/account");
        return;
      }

      setUser(result.user);
      setIsLoading(false);
    };

    void hydrateAccount();

    return () => {
      isCancelled = true;
    };
  }, [fetchAccount, initialUser, router]);

  const providerList = getUserProviders(user);
  const hasPassword = hasPasswordProvider(user);
  const passwordError = validatePassword(password);
  const isEmailConfirmed = Boolean(user?.email_confirmed_at);

  useToastError(errorMessage, {
    title: "계정 설정을 처리하지 못했습니다.",
  });

  const handleResendConfirmation = async () => {
    if (!user?.email) {
      setErrorMessage("인증 메일을 다시 보내려면 이메일 정보가 필요합니다.");
      return;
    }

    setErrorMessage(null);
    setIsResendingConfirmation(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: buildAbsoluteUrl(
          getOAuthRedirectPath("/settings/account"),
        ),
      },
    });

    setIsResendingConfirmation(false);

    if (error) {
      setErrorMessage(mapAuthErrorMessage(error, "resend-confirmation"));
      return;
    }

    pushToast({
      tone: "success",
      title: "인증 메일을 다시 보냈습니다.",
      description: "메일함에서 확인 링크를 누르면 계정 상태가 갱신됩니다.",
    });
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setIsSavingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsSavingPassword(false);

    if (error) {
      setErrorMessage(mapAuthErrorMessage(error, "update-password"));
      return;
    }

    setPassword("");
    setConfirmPassword("");
    pushToast({
      tone: "success",
      title: hasPassword
        ? "비밀번호가 변경되었습니다."
        : "비밀번호가 추가되었습니다.",
      description: "이제 이메일과 비밀번호로도 로그인할 수 있습니다.",
    });

    await loadAccount();
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/50 bg-secondary/10 p-6 text-sm text-muted-foreground">
        계정 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="space-y-3">
        <label className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          계정 상태
        </label>
        <Card className="rounded-2xl border-border/60 bg-card/80 p-5">
          <CardHeader className="mb-5 border-border/60 pb-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              계정 상태
            </CardTitle>
            <CardDescription>
              현재 로그인 계정의 이메일 인증 상태와 최근 로그인 기록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
              <p className="text-muted-foreground">이메일</p>
              <p className="mt-1 font-semibold text-foreground">
                {user?.email ?? "이메일 정보 없음"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
                <p className="text-muted-foreground">이메일 인증</p>
                <p className="mt-1 font-semibold text-foreground">
                  {isEmailConfirmed ? "완료" : "대기 중"}
                </p>
              </div> */}
              <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3">
                <p className="text-muted-foreground">최근 로그인</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatDate(user?.last_sign_in_at)}
                </p>
              </div>
            </div>

            {!isEmailConfirmed && user?.email ? (
              <Button
                type="button"
                variant="secondary"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                isLoading={isResendingConfirmation}
                loadingText="인증 메일 재전송 중..."
                onClick={handleResendConfirmation}
              >
                인증 메일 다시 보내기
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <label className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          로그인 수단
        </label>
        <Card className="rounded-2xl border-border/60 bg-card/80 p-5">
          <CardHeader className="mb-5 border-border/60 pb-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5 text-primary" />
              연결된 로그인 수단
            </CardTitle>
            <CardDescription>
              같은 이메일이면 같은 계정으로 이어집니다. 현재 연결된 수단만
              표시합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {providerList.length > 0 ? (
                providerList.map((provider) => (
                  <span
                    key={provider}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-sm text-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {getProviderLabel(provider)}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-sm text-muted-foreground">
                  연결된 로그인 수단이 없습니다.
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Google 또는 Kakao로 먼저 가입했더라도 여기서 비밀번호를 추가하면
              이메일 로그인도 함께 사용할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <label className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          비밀번호
        </label>
        <Card className="rounded-2xl border-border/60 bg-card/80 p-5">
          <CardHeader className="mb-5 border-border/60 pb-5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-primary" />
              {hasPassword ? "비밀번호 변경" : "비밀번호 추가"}
            </CardTitle>
            <CardDescription>
              {hasPassword
                ? "현재 로그인된 세션에서 새 비밀번호로 교체합니다."
                : "소셜 로그인 계정에 이메일 비밀번호를 추가합니다."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                id="settings-password"
                type="password"
                label={hasPassword ? "새 비밀번호" : "추가할 비밀번호"}
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
                id="settings-password-confirm"
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
                leftIcon={
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                }
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSavingPassword}
                loadingText={
                  hasPassword ? "비밀번호 변경 중..." : "비밀번호 추가 중..."
                }
              >
                {hasPassword ? "비밀번호 변경" : "비밀번호 추가"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
