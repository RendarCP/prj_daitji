'use client'

import { useState } from 'react'
import { Plus, Package, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface QuickAddButtonProps {
  onAddItem?: () => void
  onAddLocation?: () => void
  className?: string
}

export function QuickAddButton({ 
  onAddItem, 
  onAddLocation,
  className 
}: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action?: () => void) => {
    setIsOpen(false)
    action?.()
  }

  return (
    <div className={cn('fixed bottom-20 right-4 z-40 md:bottom-6', className)}>
      {/* Action Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Actions */}
          <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-fade-in">
            {onAddItem && (
              <button
                onClick={() => handleAction(onAddItem)}
                className="flex items-center gap-3 px-4 py-3 bg-card rounded-full shadow-soft hover:shadow-medium transition-all hover:scale-105 active:scale-95 group border border-border"
                aria-label="물품 추가"
              >
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  물품 추가
                </span>
                <div className="w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center group-hover:opacity-90 transition-opacity">
                  <Package className="w-5 h-5" />
                </div>
              </button>
            )}
            
            {onAddLocation && (
              <button
                onClick={() => handleAction(onAddLocation)}
                className="flex items-center gap-3 px-4 py-3 bg-card rounded-full shadow-soft hover:shadow-medium transition-all hover:scale-105 active:scale-95 group border border-border"
                aria-label="위치 추가"
              >
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  위치 추가
                </span>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:opacity-90 transition-opacity">
                  <MapPin className="w-5 h-5" />
                </div>
              </button>
            )}
          </div>
        </>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-glow flex items-center justify-center transition-all',
          'hover:shadow-medium active:scale-[0.98]',
          isOpen 
            ? 'bg-secondary text-secondary-foreground rotate-45' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
        aria-label={isOpen ? '닫기' : '빠른 추가'}
        aria-expanded={isOpen}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
