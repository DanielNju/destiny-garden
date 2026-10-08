// Destiny Garden service worker. Bump VERSION on every deploy to refresh caches.
const VERSION = 'dg-v3'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`
const MAX_RUNTIME = 80
const PRECACHE = [
  './',
  'index.html',
  'manifest.json',
  'robots.txt',
  '404.html',
  'pages/about.html',
  'pages/dining.html',
  'pages/events.html',
  'pages/accommodation.html',
  'pages/entertainment.html',
  'pages/family.html',
  'pages/gallery.html',
  'pages/contact.html',
  'css/style.css',
  'css/pages.css',
  'js/main.js',
  'js/animations.js',
  'js/data-ui.js',
  'data/site.js',
  'data/events.js',
  'data/services.js',
  'data/gallery.js',
  'favicon.ico',
  'assets/icons/app-icon.svg',
]
const CDN = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(SHELL)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {})))) // one missing file won't block install
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(ks.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

const trim = async (name, max) => {
  const c = await caches.open(name),
    keys = await c.keys()
  if (keys.length > max) {
    await c.delete(keys[0])
    trim(name, max)
  }
}

self.addEventListener('fetch', (e) => {
  const { request } = e,
    url = new URL(request.url)
  if (request.method !== 'GET' || request.headers.has('range')) return // skips video streaming
  if (/\.(mp4|webm)$/i.test(url.pathname)) return
  const sameOrigin = url.origin === location.origin
  if (!sameOrigin && !CDN.includes(url.hostname)) return

  // Pages: network first, then cache, then the 404 page
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put(request, copy))
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('404.html')))
    )
    return
  }

  // Everything else: serve cached instantly, refresh in the background
  e.respondWith(
    caches.match(request).then((hit) => {
      const net = fetch(request)
        .then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone()
            caches
              .open(RUNTIME)
              .then((c) => c.put(request, copy))
              .then(() => trim(RUNTIME, MAX_RUNTIME))
          }
          return res
        })
        .catch(() => hit)
      return hit || net
    })
  )
})
