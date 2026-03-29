"use client";

import type { ReactNode } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { stackflow, useActivity } from "@stackflow/react";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Bell,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { useSettingsAccountUser } from "@/app/settings/SettingsContext";
import { createClient } from "@/lib/supabase/client";
import { AccountSecurityClient } from "@/app/settings/account/AccountSecurityClient";
import NotificationsSettingsClient from "@/app/settings/notifications/NotificationsSettingsClient";

type SettingAction =
  | {
      type: "route";
      href: string;
    }
  | {
      type: "activity";
      activity: "AccountSecurityActivity" | "NotificationSettingsActivity";
    }
  | {
      type: "logout";
    };

interface SettingItemConfig {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  action: SettingAction;
}

interface SettingSection {
  id: string;
  title: string;
  items: SettingItemConfig[];
}

const settingSections: SettingSection[] = [
  {
    id: "account",
    title: "계정 설정",
    items: [
      {
        id: "account-security",
        icon: ShieldCheck,
        title: "계정 보안",
        description: "로그인 수단과 비밀번호를 관리합니다.",
        action: {
          type: "activity",
          activity: "AccountSecurityActivity",
        },
      },
      {
        id: "notifications",
        icon: Bell,
        title: "알림 설정",
        description: "알림 수신 여부를 설정합니다.",
        action: {
          type: "activity",
          activity: "NotificationSettingsActivity",
        },
      },
    ],
  },
  // {
  //   id: "preferences",
  //   title: "PREFERENCES",
  //   items: [
  //     {
  //       id: "theme",
  //       icon: Palette,
  //       title: "테마 설정",
  //       description: "Appearance & display",
  //       action: {
  //         type: "route",
  //         href: "/settings/theme",
  //       },
  //     },
  //     {
  //       id: "data",
  //       icon: Database,
  //       title: "데이터 & 백업",
  //       description: "Data management",
  //       action: {
  //         type: "route",
  //         href: "/settings/data",
  //       },
  //     },
  //   ],
  // },
  {
    id: "support",
    title: "지원",
    items: [
      // {
      //   id: "help",
      //   icon: HelpCircle,
      //   title: "도움말",
      //   description: "FAQs & support",
      //   action: {
      //     type: "route",
      //     href: "/settings/help",
      //   },
      // },
      {
        id: "logout",
        icon: LogOut,
        title: "로그아웃",
        description: "계정에서 로그아웃합니다.",
        action: {
          type: "logout",
        },
      },
    ],
  },
];

const SettingsListActivity: ActivityComponentType = () => {
  const { push } = useFlow();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleItemClick = (item: SettingItemConfig) => {
    setLogoutError(null);
    switch (item.action.type) {
      case "route":
        router.push(item.action.href);
        return;
      case "activity":
        push(item.action.activity, {});
        return;
      case "logout":
        setShowLogoutConfirm(true);
        return;
    }
  };

  const handleLogout = async () => {
    setLogoutError(null);
    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();
    setIsLoggingOut(false);

    if (error) {
      setLogoutError(error.message || "로그아웃 중 오류가 발생했습니다.");
      return;
    }

    queryClient.clear();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: "CLEAR_APP_CACHE",
      });
    }

    setShowLogoutConfirm(false);
    router.replace("/login");
    router.refresh();
  };

  const renderSettingItem = (item: SettingItemConfig) => {
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        className="group w-full card hover-lift"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-foreground">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h3 className="font-semibold text-foreground text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <ChevronRight className="size-5 flex-shrink-0 text-muted-foreground" />
        </div>
      </button>
    );
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background sm:min-h-[calc(100dvh-4rem)]">
      <Header />
      <div className="container mx-auto max-w-3xl flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">설정</h1>
        </div>

        {settingSections.map((section) => (
          <section key={section.id} className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map(renderSettingItem)}
            </div>
          </section>
        ))}

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>DAITJI v1.0.0</p>
          <p className="mt-1">© 2026 DAITJI Team</p>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-sm animate-scale-in p-6">
            <h3 className="mb-2 text-xl font-bold text-foreground">
              로그아웃 하시겠습니까?
            </h3>
            <p className="mb-6 text-muted-foreground">
              다시 로그인하려면 계정 정보가 필요합니다.
            </p>
            {logoutError && (
              <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {logoutError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 rounded-lg bg-destructive px-5 py-2.5 font-semibold text-destructive-foreground transition-all duration-200 hover:bg-destructive/90"
              >
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

interface SettingsOverlayShellProps {
  title: string;
  transitionState: string;
  onBack: () => void;
  children: ReactNode;
}

function SettingsOverlayShell({
  title,
  transitionState,
  onBack,
  children,
}: SettingsOverlayShellProps) {
  const isVisible = transitionState !== "exit-done";

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const transitionClass =
    transitionState === "enter-active"
      ? "animate-slide-in-from-right"
      : transitionState === "exit-active"
        ? "animate-slide-out-to-right"
        : "";

  return (
    <div
      className={`fixed inset-0 z-[60] overflow-hidden bg-background overscroll-none ${
        isVisible ? transitionClass : "pointer-events-none"
      }`}
    >
      <div className="fixed inset-x-0 top-0 z-[61] border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="grid h-14 grid-cols-[40px_1fr_40px] items-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h1 className="text-center text-base font-semibold text-foreground">
              {title}
            </h1>
            <span aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-14 overflow-y-auto overscroll-contain touch-pan-y">
        <div className="container mx-auto max-w-3xl px-4 py-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}

const NotificationSettingsActivity: ActivityComponentType = () => {
  const { pop } = useFlow();
  const activity = useActivity();

  return (
    <SettingsOverlayShell
      title="알림 설정"
      transitionState={activity.transitionState}
      onBack={() => pop()}
    >
      <NotificationsSettingsClient />
    </SettingsOverlayShell>
  );
};

const AccountSecurityActivity: ActivityComponentType = () => {
  const { pop } = useFlow();
  const activity = useActivity();
  const initialUser = useSettingsAccountUser();

  return (
    <SettingsOverlayShell
      title="계정 보안"
      transitionState={activity.transitionState}
      onBack={() => pop()}
    >
      <AccountSecurityClient initialUser={initialUser} />
    </SettingsOverlayShell>
  );
};

export const { Stack, useFlow } = stackflow({
  transitionDuration: 280,
  activities: {
    SettingsListActivity,
    AccountSecurityActivity,
    NotificationSettingsActivity,
  },
  plugins: [basicRendererPlugin()],
  initialActivity: () => "SettingsListActivity",
});
