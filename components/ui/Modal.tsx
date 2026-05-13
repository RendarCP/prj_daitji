'use client'

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock'
import { useMounted } from '@/lib/hooks/useMounted'
import { Button } from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  footer?: ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
}: ModalProps) {
  const isMounted = useMounted()
  const [visibleViewport, setVisibleViewport] = useState({
    height: '100dvh',
    top: '0px',
  })
  useBodyScrollLock(isOpen)

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
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  useEffect(() => {
    if (!isOpen) return

    const updateVisibleViewport = () => {
      const viewport = window.visualViewport

      if (!viewport) {
        setVisibleViewport({ height: '100dvh', top: '0px' })
        return
      }

      setVisibleViewport({
        height: `${viewport.height}px`,
        top: `${viewport.offsetTop}px`,
      })
    }

    updateVisibleViewport()
    window.visualViewport?.addEventListener('resize', updateVisibleViewport)
    window.visualViewport?.addEventListener('scroll', updateVisibleViewport)
    window.addEventListener('orientationchange', updateVisibleViewport)

    return () => {
      window.visualViewport?.removeEventListener(
        'resize',
        updateVisibleViewport,
      )
      window.visualViewport?.removeEventListener(
        'scroll',
        updateVisibleViewport,
      )
      window.removeEventListener('orientationchange', updateVisibleViewport)
    }
  }, [isOpen])

  if (!isMounted || !isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4',
  }

  const viewportStyle = {
    '--modal-viewport-height': visibleViewport.height,
    height: visibleViewport.height,
    top: visibleViewport.top,
  } as CSSProperties

  return createPortal(
    <div 
      className="fixed inset-x-0 z-[80] flex items-center justify-center overflow-y-auto p-4 animate-fade-in"
      style={viewportStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          'relative w-full rounded-[28px] bg-card text-card-foreground shadow-2xl animate-slide-up',
          'flex flex-col max-h-[calc(var(--modal-viewport-height)-2rem)]',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 pt-6">
            <div className="flex-1">
              {title && (
                <h2 id="modal-title" className="text-2xl font-bold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="ml-4 -mt-1 -mr-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-1">
            {footer}
          </div>
        )}
      </div>
    </div>
  , document.body)
}
