;(() => {
  const { gsap, ScrollTrigger } = window
  if (!gsap || !ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  gsap.registerPlugin(ScrollTrigger)
  document.documentElement.classList.add('gsap')
  const $ = (s) => gsap.utils.toArray(s)

  // The one orchestrated moment: hero sequence on load
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo('.hero__image', { scale: 1.2 }, { scale: 1.1, duration: 2.4 }, 0)
    .from('.hero__eyebrow', { opacity: 0, y: 16, duration: 1 }, 0.5)
    .from('.hero__title span', { yPercent: 105, duration: 1.3, stagger: 0.14 }, 0.6)
    .from('.hero__description, .hero__actions > *', { opacity: 0, y: 20, duration: 1, stagger: 0.12 }, 1.2)

  // Hero image drifts slower than the page
  $('.hero').forEach((h) =>
    gsap.to(h.querySelector('.hero__image'), {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true },
    })
  )
  $('.immersive__image').forEach((i) =>
    gsap.fromTo(i, { yPercent: -6 }, { yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: i.parentNode, scrub: true } })
  )

  // Content rises in, staggered per batch
  const sel = '.reveal, .steps li, .exp__item'
  gsap.set(sel, { opacity: 0, y: 36 })
  ScrollTrigger.batch(sel, {
    start: 'top 90%', once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', overwrite: true }),
  })

  // Gallery: respond to a filter click
  document.querySelector('.filters')?.addEventListener('click', () =>
    requestAnimationFrame(() =>
      gsap.fromTo('.masonry button:not([hidden])', { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out', overwrite: true })
    )
  )
  addEventListener('load', () => ScrollTrigger.refresh())
})()
