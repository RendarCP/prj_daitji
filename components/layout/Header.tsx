'use client'

import Link from 'next/link'
import { Menu, Bell, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
  showNotifications?: boolean
  notificationCount?: number
  showSettings?: boolean
  showProfile?: boolean
}

export function Header({
  title = 'DAITJI',
  onMenuClick,
  showNotifications = true,
  notificationCount = 0,
  showSettings = true,
  showProfile = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-secondary-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="lg:hidden"
                aria-label="메뉴 열기"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                {title}
              </h1>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="알림"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge 
                    size="sm" 
                    variant="danger" 
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            {showSettings && (
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="설정"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {showProfile && (
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="프로필"
                >
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
