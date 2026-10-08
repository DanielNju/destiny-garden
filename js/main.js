;(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const $$ = (s) => document.querySelectorAll(s)
  document.documentElement.classList.add('js')
  $$('img').forEach((i) => i.addEventListener('error', () => (i.style.visibility = 'hidden')))

  const nav = document.getElementById('nav'),
    menu = document.getElementById('menu'),
    toggle = document.getElementById('toggle')
  const onScroll = () => nav.classList.toggle('nav--scrolled', scrollY > 60)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open)
    nav.classList.toggle('nav--open', open)
    toggle.setAttribute('aria-expanded', open)
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    document.body.style.overflow = open ? 'hidden' : ''
  }
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')))
  menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false))
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false))

  const io = new IntersectionObserver(
    (es) =>
      es.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible')
          io.unobserve(en.target)
        }
      }),
    { threshold: 0.15 }
  )
  $$('.reveal').forEach((el) => io.observe(el))

  // Parallax (home only)
  const imm = document.querySelector('.immersive')
  if (imm && !reduced && !window.gsap) {
    const layer = imm.querySelector('.immersive__image')
    let t = false
    addEventListener(
      'scroll',
      () => {
        if (!t) {
          t = true
          requestAnimationFrame(() => {
            const r = imm.getBoundingClientRect()
            if (r.bottom > 0 && r.top < innerHeight)
              layer.style.transform = `translateY(${(r.top / innerHeight) * -8}%)`
            t = false
          })
        }
      },
      { passive: true }
    )
  }

  // Gallery: filter + lightbox
  const g = document.querySelector('.masonry')
  if (g) {
    const dlg = document.querySelector('dialog.lb'),
      im = dlg.querySelector('img')
    $$('.filters button').forEach((b) =>
      b.addEventListener('click', () => {
        $$('.filters button').forEach((x) => x.setAttribute('aria-pressed', x === b))
        g.querySelectorAll('button').forEach(
          (i) => (i.hidden = b.dataset.f !== 'all' && i.dataset.cat !== b.dataset.f)
        )
      })
    )
    g.addEventListener('click', (e) => {
      const i = e.target.closest('img')
      if (i) {
        im.src = i.src
        im.alt = i.alt
        dlg.showModal()
      }
    })
    dlg.addEventListener('click', () => dlg.close())
  }

  $$('form[data-delivery="whatsapp"]').forEach((f) =>
    f.addEventListener('submit', (e) => {
      e.preventDefault()
      const fields = new FormData(f)
      const details = Array.from(fields.entries())
        .filter(([, value]) => String(value).trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      const href = `https://wa.me/${SITE.wa}?text=${encodeURIComponent(
        `Hello ${SITE.name}, I would like to get in touch.\n\n${details}`
      )}`
      const note = f.querySelector('.form-note')
      const link = document.createElement('a')
      link.href = href
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = 'Open WhatsApp and send your request.'
      note.replaceChildren(document.createTextNode('Your request is ready. '), link)
    })
  )
})()
