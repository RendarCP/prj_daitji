'use client'

import type { ActivityComponentType } from '@stackflow/react'
import { stackflow, useActivity } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Bell,
  Palette,
  Database,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import NotificationsSettingsClient from '@/app/settings/notifications/NotificationsSettingsClient'

interface SettingItem {
  id: string
  icon: ReactNode
  title: string
  description: string
  href?: string
  onClick?: () => void
}

const SettingsListActivity: ActivityComponentType = () => {
  const { push } = useFlow()
  const router = useRouter()
  const supabase = createClient()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      icon: <User className="h-5 w-5" />,
      title: '프로필 설정',
      description: 'Edit your profile',
      href: '/settings/profile',
    },
    {
      id: 'notifications',
      icon: <Bell className="h-5 w-5" />,
      title: '알림 설정',
      description: 'Manage notifications',
      onClick: () => push('NotificationSettingsActivity', {}),
    },
  ]

  const preferenceSettings: SettingItem[] = [
    {
      id: 'theme',
      icon: <Palette className="h-5 w-5" />,
      title: '테마 설정',
      description: 'Appearance & display',
      href: '/settings/theme',
    },
    {
      id: 'data',
      icon: <Database className="h-5 w-5" />,
      title: '데이터 & 백업',
      description: 'Data management',
      href: '/settings/data',
    },
  ]

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      icon: <HelpCircle className="h-5 w-5" />,
      title: '도움말',
      description: 'FAQs & support',
      href: '/settings/help',
    },
    {
      id: 'logout',
      icon: <LogOut className="h-5 w-5" />,
      title: '로그아웃',
      description: 'Sign out of your account',
      onClick: () => setShowLogoutConfirm(true),
    },
  ]

  const handleItemClick = (item: SettingItem) => {
    setLogoutError(null)
    if (item.onClick) {
      item.onClick()
      return
    }

    if (item.href) {
      router.push(item.href)
    }
  }

  const handleLogout = async () => {
    setLogoutError(null)
    setIsLoggingOut(true)

    const { error } = await supabase.auth.signOut()
    setIsLoggingOut(false)

    if (error) {
      setLogoutError(error.message || '로그아웃 중 오류가 발생했습니다.')
      return
    }

    setShowLogoutConfirm(false)
    router.replace('/login')
    router.refresh()
  }

  const renderSettingItem = (item: SettingItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item)}
      className="group w-full card hover-lift"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-foreground">
          {item.icon}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h3 className="font-semibold text-foreground">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      </div>
    </button>
  )

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            ACCOUNT
          </h2>
          <div className="space-y-2">{accountSettings.map(renderSettingItem)}</div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            PREFERENCES
          </h2>
          <div className="space-y-2">{preferenceSettings.map(renderSettingItem)}</div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            SUPPORT
          </h2>
          <div className="space-y-2">{supportSettings.map(renderSettingItem)}</div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>DAITJI v1.0.0</p>
          <p className="mt-1">© 2026 DAITJI Team</p>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-sm animate-scale-in p-6">
            <h3 className="mb-2 text-xl font-bold text-foreground">로그아웃 하시겠습니까?</h3>
            <p className="mb-6 text-muted-foreground">다시 로그인하려면 계정 정보가 필요합니다.</p>
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
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

const NotificationSettingsActivity: ActivityComponentType = () => {
  const { pop } = useFlow()
  const activity = useActivity()
  const isVisible = activity.transitionState !== 'exit-done'

  const transitionClass =
    activity.transitionState === 'enter-active'
      ? 'animate-slide-in-from-right'
      : activity.transitionState === 'exit-active'
        ? 'animate-slide-out-to-right'
        : ''

  return (
    <div
      className={`absolute inset-0 z-[60] bg-background pb-20 md:pb-6 ${
        isVisible ? transitionClass : 'pointer-events-none'
      }`}
    >
      <div className="sticky top-0 z-[61] border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="grid h-14 grid-cols-[40px_1fr_40px] items-center">
            <button
              type="button"
              onClick={() => pop()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-center text-base font-semibold text-foreground">알림 설정</h1>
            <span aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-4">
        <NotificationsSettingsClient showTitle={false} />
      </div>
    </div>
  )
}

export const { Stack, useFlow } = stackflow({
  transitionDuration: 280,
  activities: {
    SettingsListActivity,
    NotificationSettingsActivity,
  },
  plugins: [basicRendererPlugin()],
  initialActivity: () => 'SettingsListActivity',
})
