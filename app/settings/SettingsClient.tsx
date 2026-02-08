'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Bell, 
  Palette, 
  Database, 
  HelpCircle, 
  LogOut,
  ChevronRight 
} from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { cn } from '@/lib/utils/cn'

interface SettingItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  href?: string
  onClick?: () => void
}

export function SettingsClient() {
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      icon: <User className="w-5 h-5" />,
      title: '프로필 설정',
      description: 'Edit your profile',
      href: '/settings/profile',
    },
    {
      id: 'notifications',
      icon: <Bell className="w-5 h-5" />,
      title: '알림 설정',
      description: 'Manage notifications',
      href: '/settings/notifications',
    },
  ]

  const preferenceSettings: SettingItem[] = [
    {
      id: 'theme',
      icon: <Palette className="w-5 h-5" />,
      title: '테마 설정',
      description: 'Appearance & display',
      href: '/settings/theme',
    },
    {
      id: 'data',
      icon: <Database className="w-5 h-5" />,
      title: '데이터 & 백업',
      description: 'Data management',
      href: '/settings/data',
    },
  ]

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      icon: <HelpCircle className="w-5 h-5" />,
      title: '도움말',
      description: 'FAQs & support',
      href: '/settings/help',
    },
    {
      id: 'logout',
      icon: <LogOut className="w-5 h-5" />,
      title: '로그아웃',
      description: 'Sign out of your account',
      onClick: () => setShowLogoutConfirm(true),
    },
  ]

  const handleItemClick = (item: SettingItem) => {
    if (item.onClick) {
      item.onClick()
    } else if (item.href) {
      router.push(item.href)
    }
  }

  const renderSettingItem = (item: SettingItem) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item)}
      className="w-full card hover-lift group"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-foreground">
          {item.icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <h3 className="font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </button>
  )

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Account Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            ACCOUNT
          </h2>
          <div className="space-y-2">
            {accountSettings.map(renderSettingItem)}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            PREFERENCES
          </h2>
          <div className="space-y-2">
            {preferenceSettings.map(renderSettingItem)}
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            SUPPORT
          </h2>
          <div className="space-y-2">
            {supportSettings.map(renderSettingItem)}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground mt-12">
          <p>DAITJI v1.0.0</p>
          <p className="mt-1">© 2026 DAITJI Team</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-sm w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-foreground mb-2">
              로그아웃 하시겠습니까?
            </h3>
            <p className="text-muted-foreground mb-6">
              다시 로그인하려면 계정 정보가 필요합니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-secondary"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: Implement logout
                  console.log('Logout')
                  setShowLogoutConfirm(false)
                }}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold py-2.5 px-5 rounded-lg transition-all duration-200"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
