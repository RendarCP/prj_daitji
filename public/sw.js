const CACHE_NAME = 'daitji-v9'
const APP_SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-maskable.svg',
  '/offline.html',
]

function isStaticAssetRequest(request, url) {
  if (request.destination === 'style' || request.destination === 'script') {
    return true
  }

  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'audio' ||
    request.destination === 'video'
  ) {
    return true
  }

  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname === '/favicon.ico'
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ),
    ),
  )
  self.clients.claim()
})

function notifyClients(message) {
  return self.clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage(message)
      })
    })
}

function showNotificationAndReport({ title, body, options, deliveredAt }) {
  return self.registration
    .showNotification(title, options)
    .then(() => {
      return notifyClients({
        type: 'PUSH_RECEIVED',
        title,
        body,
        deliveredAt,
      })
    })
    .catch((error) => {
      console.error('[daitji-sw] showNotification failed', error)
      return notifyClients({
        type: 'PUSH_ERROR',
        title,
        body,
        deliveredAt,
        error: error instanceof Error ? error.message : String(error),
      })
    })
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data?.type === 'CLEAR_APP_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) =>
        Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))),
      ),
    )
  }
})

self.addEventListener('push', (event) => {
  let payload = {
    title: 'DAITJI',
    body: '새 알림이 도착했습니다.',
    icon: '/icon.svg',
    badge: '/icon-maskable.svg',
    tag: undefined,
    data: {
      url: '/',
    },
  }

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...event.data.json(),
      }
    } catch {
      try {
        payload.body = event.data.text()
      } catch (error) {
        payload.body = '새 알림이 도착했습니다.'
        console.error('[daitji-sw] failed to read push payload', error)
      }
    }
  }

  const deliveredAt = new Date().toISOString()
  const title = payload.title || 'DAITJI'
  const body = payload.body
  const tag = payload.tag || `daitji-push-${Date.now()}`

  event.waitUntil(
    showNotificationAndReport({
      title,
      body,
      deliveredAt,
      options: {
        body,
        icon: payload.icon || '/icon.svg',
        badge: payload.badge || '/icon-maskable.svg',
        tag,
        data: {
          ...(payload.data || { url: '/' }),
          deliveredAt,
        },
        requireInteraction: true,
        renotify: true,
        silent: false,
        timestamp: Date.now(),
      },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus()
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }

        return undefined
      }),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(async () => {
          return caches.match('/offline.html')
        }),
    )
    return
  }

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/_next/data/')
  ) {
    return
  }

  if (!isStaticAssetRequest(request, url)) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          if (!response.ok) {
            return response
          }

          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          return response
        })
        .catch(() => Response.error())
    }),
  )
})
