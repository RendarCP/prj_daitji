/**
 * Helper utility functions for the DAITJI project
 */

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(expiryDate: Date | string): number {
  const date = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get expiry status
 */
export function getExpiryStatus(expiryDate: Date | string): 'valid' | 'expiring' | 'expired' {
  const days = getDaysUntilExpiry(expiryDate)
  
  if (days < 0) return 'expired'
  if (days <= 7) return 'expiring'
  return 'valid'
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Generate random ID
 */
export function generateId(prefix?: string): string {
  const random = Math.random().toString(36).substring(2, 11)
  return prefix ? `${prefix}_${random}` : random
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Format quantity with unit
 */
export function formatQuantity(quantity: number, unit?: string): string {
  if (!unit) return quantity.toString()
  return `${quantity}${unit}`
}

/**
 * Get item type label in Korean
 */
export function getItemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FOOD: '식품',
    COSMETIC: '화장품',
    MEDICINE: '의약품',
    GENERAL: '일반',
  }
  return labels[type] || type
}

/**
 * Get item status label in Korean
 */
export function getItemStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: '보관 중',
    CONSUMED: '사용 완료',
    EXPIRED: '만료됨',
    DISCARDED: '폐기',
  }
  return labels[status] || status
}
