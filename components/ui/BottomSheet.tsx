'use client'

import { ReactNode, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showDragHandle?: boolean
  currentStep?: number
  totalSteps?: number
  maxHeight?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showDragHandle = true,
  currentStep,
  totalSteps,
  maxHeight = 'max-h-[80vh]',
}: BottomSheetProps) {
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
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottom-sheet-title' : undefined}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Sheet Content */}
      <div 
        className={cn(
          'relative bg-card w-full rounded-t-3xl',
          'flex flex-col overflow-hidden',
          'animate-slide-up-sheet shadow-2xl',
          maxHeight
        )}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-muted rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex-1">
            {title && (
              <h2 id="bottom-sheet-title" className="text-xl font-bold text-foreground">
                {title}
              </h2>
            )}
            {currentStep !== undefined && totalSteps !== undefined && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        index < currentStep
                          ? 'bg-primary'
                          : index === currentStep
                          ? 'bg-primary/60'
                          : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Step {currentStep + 1} of {totalSteps}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors ml-4"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
