'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, LayoutGrid, BarChart3, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/explorer',
    label: 'Browse',
    icon: Search,
  },
  {
    href: '/items',
    label: 'Items',
    icon: LayoutGrid,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: BarChart3,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-md border-t border-border shadow-soft md:hidden"
      role="navigation"
      aria-label="하단 네비게이션"
    >
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary active:bg-secondary/80'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 transition-transform',
                  isActive && 'scale-110'
                )} 
              />
              <span className={cn(
                'text-xs font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Safe Area Spacing for iOS */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  )
}
