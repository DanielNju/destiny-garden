const V = 'dg-v2',
  MEDIA = 'dg-media',
  CORE = [
    './',
    'index.html',
    '404.html',
    'css/variables.css',
    'css/reset.css',
    'css/main.css',
    'css/navbar.css',
    'css/hero.css',
    'css/about.css',
    'css/experiences.css',
    'css/events.css',
    'css/dining.css',
    'css/entertainment.css',
    'css/family.css',
    'css/gallery.css',
    'css/contact.css',
    'css/footer.css',
    'css/animations.css',
    'css/responsive.css',
    'js/lazyload.js',
    'js/hero.js',
    'js/slider.js',
    'js/gallery.js',
    'js/modal.js',
    'js/animations.js',
    'js/navbar.js',
    'js/mobile.js',
    'js/main.js',
    'data/site.js',
    'data/services.js',
    'data/events.js',
    'data/gallery.js',
    'pages/about.html',
    'pages/events.html',
    'pages/dining.html',
    'pages/accommodation.html',
    'pages/entertainment.html',
    'pages/family.html',
    'pages/gallery.html',
    'pages/contact.html',
  ]
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((k) =>
        Promise.all(k.filter((x) => x !== V && x !== MEDIA).map((x) => caches.delete(x)))
      )
  )
  self.clients.claim()
})
self.addEventListener('fetch', (e) => {
  const r = e.request,
    u = new URL(r.url)
  if (r.method !== 'GET' || u.origin !== location.origin || /\.mp4$/.test(u.pathname)) return
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r)
        .then((x) => {
          const y = x.clone()
          caches.open(V).then((c) => c.put(r, y))
          return x
        })
        .catch(() => caches.match(r).then((m) => m || caches.match('404.html')))
    )
    return
  }
  const n = /\.(png|jpe?g|webp|svg)$/.test(u.pathname) ? MEDIA : V
  e.respondWith(
    caches.match(r).then(
      (m) =>
        m ||
        fetch(r).then((x) => {
          if (x.ok) {
            const y = x.clone()
            caches.open(n).then((c) => c.put(r, y))
          }
          return x
        })
    )
  )
})
