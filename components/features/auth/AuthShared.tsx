"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DaitjiLogo } from "./DaitjiLogo";

export type SocialProvider = "google" | "kakao";
export { DaitjiLogo };

export function GoogleIcon() {
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

export function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.2 2 1.5 5.7 1.5 10.3c0 2.9 1.9 5.5 4.8 7-0.2 0.8-0.9 3.1-1 3.5-0.1 0.5 0.2 0.5 0.4 0.4 0.2-0.1 3.5-2.3 4.9-3.2 0.5 0.1 1 0.1 1.4 0.1 5.8 0 10.5-3.7 10.5-8.3S17.8 2 12 2Z"
      />
    </svg>
  );
}

export function AuthMessage({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : tone === "success"
        ? "border-success/30 bg-success/10 text-success"
        : "border-border bg-secondary/50 text-foreground";

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${styles}`}>
      <div className="flex items-start gap-2">
        {tone === "error" ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}

interface SocialLoginButtonsProps {
  title: string;
  description: string;
  socialLoadingProvider: SocialProvider | null;
  onProviderClick: (provider: SocialProvider) => void;
}

export function SocialLoginButtons({
  socialLoadingProvider,
  onProviderClick,
}: SocialLoginButtonsProps) {
  return (
    <section className="space-y-3">
      {/* <div className="space-y-1 text-center">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div> */}
      <div className="space-y-3">
        <Button
          type="button"
          fullWidth
          size="lg"
          variant="outline"
          leftIcon={<GoogleIcon />}
          isLoading={socialLoadingProvider === "google"}
          loadingText="Google 연결 중..."
          onClick={() => onProviderClick("google")}
        >
          Google로 계속하기
        </Button>
        <Button
          type="button"
          fullWidth
          size="lg"
          className="border-0 bg-[#FEE500] text-[#191919] hover:bg-[#f8de00]"
          leftIcon={<KakaoIcon />}
          isLoading={socialLoadingProvider === "kakao"}
          loadingText="Kakao 연결 중..."
          onClick={() => onProviderClick("kakao")}
        >
          Kakao로 계속하기
        </Button>
      </div>
    </section>
  );
}
