"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, LayoutGrid, BarChart3, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: Home,
  },
  {
    href: "/explorer",
    label: "위치",
    icon: Search,
  },
  {
    href: "/items",
    label: "물품",
    icon: LayoutGrid,
  },
  {
    href: "/settings",
    label: "설정",
    icon: BarChart3,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const handleNavClick = (href: string, isActive: boolean) => {
    if (!isActive || typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("app:navigation-retap", {
        detail: { href, pathname },
      }),
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/80 backdrop-blur-md shadow-soft"
      role="navigation"
      aria-label="하단 네비게이션"
    >
      <div className="grid h-[calc(4.3rem+env(safe-area-inset-bottom))] grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/explorer" && pathname.startsWith("/explorer-v2"));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href, isActive)}
              className={cn(
                "flex flex-col items-center justify-start gap-1 pt-3 transition-all duration-200 touch-manipulation",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary active:bg-secondary/80",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110",
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
