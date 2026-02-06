import { format, formatDistance, formatRelative } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * Format date to Korean locale string
 */
export function formatDate(date: Date | string, formatStr: string = 'yyyy년 MM월 dd일'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: ko })
}

/**
 * Format date relative to now (e.g., "3일 전")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistance(dateObj, new Date(), { locale: ko, addSuffix: true })
}

/**
 * Format date relative with calendar (e.g., "어제 오후 2:30")
 */
export function formatRelativeCalendar(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatRelative(dateObj, new Date(), { locale: ko })
}

/**
 * Check if date is expired
 */
export function isExpired(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

/**
 * Check if date is expiring soon (within days)
 */
export function isExpiringSoon(date: Date | string, days: number = 7): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const daysUntilExpiry = Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry > 0 && daysUntilExpiry <= days
}
