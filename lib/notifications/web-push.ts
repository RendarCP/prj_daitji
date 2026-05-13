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

function assertMatchingPublicKeys() {
  const serverPublicKey = process.env.WEB_PUSH_PUBLIC_KEY
  const clientPublicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY

  if (serverPublicKey && clientPublicKey && serverPublicKey !== clientPublicKey) {
    throw new Error('WEB_PUSH_PUBLIC_KEY and NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY must match')
  }
}

function getWebPushSubject() {
  const subject = process.env.WEB_PUSH_SUBJECT || process.env.NEXT_PUBLIC_APP_URL || ''

  if (!subject) {
    throw new Error('WEB_PUSH_SUBJECT or NEXT_PUBLIC_APP_URL must be configured')
  }

  if (subject === 'mailto:admin@daitji.local') {
    throw new Error('WEB_PUSH_SUBJECT must use a real mailto: address or an HTTPS URL')
  }

  if (!subject.startsWith('mailto:') && !subject.startsWith('https://')) {
    throw new Error('WEB_PUSH_SUBJECT must start with mailto: or https://')
  }

  return subject
}

export function getWebPushPublicKey() {
  assertMatchingPublicKeys()

  return process.env.WEB_PUSH_PUBLIC_KEY || process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || ''
}

export function configureWebPush() {
  if (isConfigured) {
    return
  }

  const publicKey = getWebPushPublicKey()
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY
  const subject = getWebPushSubject()

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
