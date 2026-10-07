;(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  document.documentElement.classList.add('js')

  // Missing images fall back to the section's green background
  document.querySelectorAll('img').forEach((img) =>
    img.addEventListener('error', () => {
      img.style.visibility = 'hidden'
    })
  )

  // Navigation: scrolled state + mobile menu
  const nav = document.getElementById('nav')
  const menu = document.getElementById('menu')
  const toggle = document.getElementById('toggle')
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

  // Scroll reveal
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible')
          io.unobserve(en.target)
        }
      }),
    { threshold: 0.15 }
  )
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

  // Plant catalogue
  const plants = [
    {
      cat: 'herbs',
      name: 'Lavender',
      latin: 'Lavandula angustifolia',
      img: 'plant-lavender.jpg',
      alt: 'Lavender in full purple bloom',
      desc: 'A silver-leaved shrub of the Mediterranean hills. Its flower spikes calm the air in the Herb Garden from June to August.',
    },
    {
      cat: 'flowers',
      name: 'Peony',
      latin: 'Paeonia lactiflora',
      img: 'plant-peony.jpg',
      alt: 'Pale pink peony in full bloom',
      desc: 'Heavy, fragrant blooms that open for only a few weeks each spring along the Secret Garden wall.',
    },
    {
      cat: 'trees',
      name: 'Ginkgo',
      latin: 'Ginkgo biloba',
      img: 'plant-ginkgo.jpg',
      alt: 'Ginkgo tree with golden autumn leaves',
      desc: 'A living fossil older than the flowering plants. Each autumn its fan-shaped leaves turn gold within days.',
    },
    {
      cat: 'medicinal',
      name: 'Echinacea',
      latin: 'Echinacea purpurea',
      img: 'plant-echinacea.jpg',
      alt: 'Purple coneflower with orange centre',
      desc: 'The purple coneflower, long used in traditional remedies, and a favourite of the garden’s bees and butterflies.',
    },
    {
      cat: 'herbs',
      name: 'Thyme',
      latin: 'Thymus vulgaris',
      img: 'plant-thyme.jpg',
      alt: 'Low mat of thyme with tiny pink flowers',
      desc: 'A low, aromatic carpet between the stepping stones. Brush it as you walk and the scent follows you.',
    },
  ]
  const $ = (id) => document.getElementById(id)
  const tabs = [...document.querySelectorAll('.plants__tabs button')]
  const figImg = $('plantImg')
  let list = plants,
    i = 0

  const show = () => {
    const p = list[i]
    figImg.classList.add('is-swapping')
    setTimeout(
      () => {
        figImg.style.visibility = ''
        figImg.src = 'images/' + p.img
        figImg.alt = p.alt
        $('plantName').textContent = p.name
        $('plantLatin').textContent = p.latin
        $('plantDesc').textContent = p.desc
        $('plantCount').textContent = `Specimen ${i + 1} of ${list.length}`
        figImg.classList.remove('is-swapping')
      },
      reduced ? 0 : 400
    )
  }

  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.setAttribute('aria-selected', t === tab))
      const c = tab.dataset.cat
      list = c === 'all' ? plants : plants.filter((p) => p.cat === c)
      i = 0
      show()
    })
  )
  figImg.addEventListener('click', () => {
    i = (i + 1) % list.length
    show()
  })

  // Gentle parallax on the immersive image
  const imm = document.querySelector('.immersive')
  const layer = imm.querySelector('.immersive__image')
  if (!reduced) {
    let ticking = false
    const move = () => {
      const r = imm.getBoundingClientRect()
      if (r.bottom > 0 && r.top < innerHeight)
        layer.style.transform = `translateY(${(r.top / innerHeight) * -8}%)`
      ticking = false
    }
    addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(move)
        }
      },
      { passive: true }
    )
  }
})()
