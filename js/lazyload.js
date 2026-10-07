const R = document.body.dataset.root || ''
function initMedia(scope) {
  scope.querySelectorAll('[data-img]').forEach((e) => {
    if (e.dataset.img) e.style.backgroundImage = `url("${R + e.dataset.img}")`
  })
  scope.querySelectorAll('[data-vid]').forEach((e) => {
    if (!e.dataset.vid || e.dataset.ready) return
    e.dataset.ready = 1
    let v = e.tagName === 'VIDEO' ? e : document.createElement('video')
    if (v !== e) {
      v.muted = v.loop = v.playsInline = true
      v.preload = 'none'
      v.setAttribute('aria-hidden', 'true')
      e.append(v)
    }
    v.muted = true
    v.dataset.src = R + e.dataset.vid
    v.addEventListener('error', () => v.remove())
    vio.observe(v)
  })
}
const vio = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      const v = e.target
      if (e.isIntersecting) {
        document.querySelectorAll('video').forEach((o) => o !== v && o.pause())
        if (!v.src) v.src = v.dataset.src
        v.play().catch(() => {})
      } else v.pause()
    }),
  { threshold: 0.5 }
)
