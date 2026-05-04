import webpush from 'web-push'

type NotificationEventForPush = {
  id: string
  entity_id: string
  entity_type: string
  event_type: string
  title: string
  body: string
  payload: Record<string, unknown> | null
}

let isConfigured = false

export function getWebPushPublicKey() {
  return process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || process.env.WEB_PUSH_PUBLIC_KEY || ''
}

export function configureWebPush() {
  if (isConfigured) {
    return
  }

  const publicKey = getWebPushPublicKey()
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY
  const subject =
    process.env.WEB_PUSH_SUBJECT || process.env.NEXT_PUBLIC_APP_URL || 'mailto:admin@daitji.local'

  if (!publicKey || !privateKey) {
    throw new Error('WEB_PUSH_PUBLIC_KEY and WEB_PUSH_PRIVATE_KEY must be configured')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  isConfigured = true
}

export function buildNotificationPayload(event: NotificationEventForPush) {
  const deliveredAt = Date.now()
  const itemId =
    typeof event.payload?.item_id === 'string'
      ? event.payload.item_id
      : event.entity_type === 'item'
        ? event.entity_id
        : null
  const targetUrl =
    typeof event.payload?.url === 'string' && event.payload.url.startsWith('/')
      ? event.payload.url
      : itemId
        ? `/item/${itemId}`
        : '/'

  return {
    title: event.title,
    body: event.body,
    icon: '/icon.svg',
    badge: '/icon-maskable.svg',
    tag: `${event.id}-${deliveredAt}`,
    data: {
      eventId: event.id,
      eventType: event.event_type,
      entityType: event.entity_type,
      entityId: event.entity_id,
      url: targetUrl,
      payload: event.payload ?? {},
      deliveredAt,
    },
  }
}

export { webpush }
