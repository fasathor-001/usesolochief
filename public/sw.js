// SoloChief service worker — safe static asset caching only.
// IMPORTANT: Never cache authenticated dashboard routes or Supabase responses.

const CACHE_NAME = 'solochief-static-v1'

const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
]

// ── Install: pre-cache critical static assets ─────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

// ── Activate: clear old caches ────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  )
})

// ── Fetch strategy ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept: non-GET, cross-origin, auth, API, or Supabase requests.
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/auth/')) return

  // Cache-first for Next.js static chunks and icon files.
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (!response || response.status !== 200) return response
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return response
        })
      }),
    )
    return
  }

  // Network-first for all page navigations.
  // Fall back to the offline page if the network is unavailable.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html')),
    )
    return
  }

  // All other requests: network only (no caching).
})
