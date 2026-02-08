'use client'

import { ReactNode, useEffect, useCallback } from 'react'
import { X, ArrowLeft, Heart, Edit } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  showBackButton?: boolean
  showFavoriteButton?: boolean
  showEditButton?: boolean
  onFavorite?: () => void
  onEdit?: () => void
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
  showBackButton = true,
  showFavoriteButton = false,
  showEditButton = false,
  onFavorite,
  onEdit,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: SidePanelProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'side-panel-title' : undefined}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Panel Content */}
      <div 
        className={cn(
          'relative bg-card w-full md:w-[400px] md:max-w-[90vw]',
          'flex flex-col h-full overflow-hidden',
          'animate-slide-in-from-right shadow-2xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {title && (
              <h2 id="side-panel-title" className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {showFavoriteButton && onFavorite && (
              <button
                onClick={onFavorite}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="즐겨찾기"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}
            {showEditButton && onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="수정"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
