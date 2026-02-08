'use client'

import Link from 'next/link'
import { ScanBarcode, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  title?: string
  subtitle?: string
  showScan?: boolean
  showNotifications?: boolean
  notificationCount?: number
  onScanClick?: () => void
  className?: string
}

export function Header({
  title = 'DAITJI',
  subtitle = '다있지',
  showScan = true,
  showNotifications = true,
  notificationCount = 0,
  onScanClick,
  className,
}: HeaderProps) {
  const handleScanClick = () => {
    if (onScanClick) {
      onScanClick()
    } else {
      // 기본 동작: 스캔 페이지로 이동
      window.location.href = '/scan'
    }
  }

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md',
        'border-b border-border',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left Section - Logo/Title */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 group"
          >
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                {title}
              </span>
              {subtitle && (
                <span className="text-xs sm:text-sm text-muted-foreground leading-tight">
                  {subtitle}
                </span>
              )}
            </div>
          </Link>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {showScan && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleScanClick}
                className="relative text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label="바코드 스캔"
              >
                <ScanBarcode className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            )}

            {showNotifications && (
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                aria-label="알림"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {notificationCount > 0 && (
                  <Badge 
                    size="sm" 
                    variant="danger" 
                    className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 flex items-center justify-center px-1 text-[10px] sm:text-xs font-bold"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
