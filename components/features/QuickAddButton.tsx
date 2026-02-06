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
    <div className={cn('fixed bottom-6 right-6 z-40', className)}>
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
          <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-slide-up">
            {onAddItem && (
              <button
                onClick={() => handleAction(onAddItem)}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
                aria-label="물품 추가"
              >
                <span className="text-sm font-medium text-secondary-900 whitespace-nowrap">
                  물품 추가
                </span>
                <div className="w-12 h-12 rounded-full bg-success-500 text-white flex items-center justify-center group-hover:bg-success-600 transition-colors">
                  <Package className="w-5 h-5" />
                </div>
              </button>
            )}
            
            {onAddLocation && (
              <button
                onClick={() => handleAction(onAddLocation)}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
                aria-label="위치 추가"
              >
                <span className="text-sm font-medium text-secondary-900 whitespace-nowrap">
                  위치 추가
                </span>
                <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center group-hover:bg-primary-600 transition-colors">
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
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all',
          'hover:shadow-xl active:scale-95',
          isOpen 
            ? 'bg-secondary-700 text-white rotate-45' 
            : 'bg-primary-500 text-white hover:bg-primary-600'
        )}
        aria-label={isOpen ? '닫기' : '빠른 추가'}
        aria-expanded={isOpen}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
