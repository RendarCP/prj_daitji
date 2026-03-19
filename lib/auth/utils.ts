import type { AuthError, Provider, User } from "@supabase/supabase-js";

export const DEFAULT_NEXT_PATH = "/dashboard";
export const PASSWORD_MIN_LENGTH = 8;

type AuthAction =
  | "sign-in"
  | "sign-up"
  | "oauth"
  | "reset-password"
  | "update-password"
  | "resend-confirmation";

export function sanitizeNextPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  return path;
}

export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

export function buildAbsoluteUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}

export function validatePassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "비밀번호에는 영문과 숫자를 모두 포함해 주세요.";
  }

  return null;
}

export function getProviderLabel(provider: string) {
  switch (provider) {
    case "email":
      return "이메일";
    case "google":
      return "Google";
    case "kakao":
      return "Kakao";
    default:
      return provider;
  }
}

export function getUserProviders(user: User | null | undefined) {
  const providers = new Set<string>();

  user?.identities?.forEach((identity) => {
    if (identity.provider) {
      providers.add(identity.provider);
    }
  });

  const appProviders = user?.app_metadata?.providers;
  if (Array.isArray(appProviders)) {
    appProviders.forEach((provider) => {
      if (typeof provider === "string") {
        providers.add(provider);
      }
    });
  }

  if (user?.email && providers.size === 0) {
    providers.add("email");
  }

  return Array.from(providers);
}

export function hasPasswordProvider(user: User | null | undefined) {
  return getUserProviders(user).includes("email");
}

export function isLikelyNewUser(user: User | null | undefined) {
  if (!user?.created_at || !user.last_sign_in_at) {
    return false;
  }

  return user.created_at === user.last_sign_in_at;
}

export function getOAuthRedirectPath(nextPath: string) {
  return `/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

export function getPasswordRecoveryRedirectPath() {
  return "/auth/callback?next=%2Fauth%2Freset-password";
}

export function mapAuthErrorMessage(
  error: Pick<AuthError, "message" | "status" | "code"> | null | undefined,
  action: AuthAction,
) {
  if (!error) {
    return null;
  }

  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase();

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "이메일 인증이 아직 완료되지 않았습니다. 메일함에서 인증 링크를 확인해 주세요.";
  }

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return action === "sign-in"
      ? "이메일 또는 비밀번호를 다시 확인해 주세요. 소셜로 가입했다면 같은 버튼으로 로그인해 주세요."
      : "입력 정보를 다시 확인해 주세요.";
  }

  if (
    code === "user_already_exists" ||
    message.includes("user already registered")
  ) {
    return "이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정해 주세요.";
  }

  if (message.includes("password should be")) {
    return "비밀번호 보안 조건을 충족하지 못했습니다. 영문과 숫자를 포함해 8자 이상으로 설정해 주세요.";
  }

  if (message.includes("same password")) {
    return "현재와 다른 새 비밀번호를 설정해 주세요.";
  }

  if (error.status === 429 || message.includes("rate limit")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (action === "oauth") {
    return "소셜 로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (action === "reset-password") {
    return "비밀번호 재설정 요청을 처리하지 못했습니다. 이메일 주소를 다시 확인해 주세요.";
  }

  if (action === "update-password") {
    return "비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (action === "resend-confirmation") {
    return "인증 메일을 다시 보내지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return error.message || "인증 처리 중 문제가 발생했습니다.";
}

export function mapCallbackErrorMessage(
  error: string | null,
  message?: string | null,
) {
  if (message) {
    return message;
  }

  switch (error) {
    case "missing_code":
      return "인증 코드가 없어 로그인에 실패했습니다.";
    case "oauth_exchange_failed":
      return "소셜 로그인 처리 중 오류가 발생했습니다.";
    case "recovery_session_missing":
      return "비밀번호 재설정 세션이 만료되었거나 유효하지 않습니다. 다시 요청해 주세요.";
    default:
      return error ? "로그인 처리 중 문제가 발생했습니다." : null;
  }
}

export function getPrimaryProvider(
  user: User | null | undefined,
): Provider | "email" | null {
  const [firstProvider] = getUserProviders(user);
  return (firstProvider as Provider | "email" | undefined) ?? null;
}
