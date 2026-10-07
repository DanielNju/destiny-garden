function initHero() {
  const h = document.querySelector('.hero'),
    c = document.getElementById('clock')
  if (h)
    new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) c.classList.remove('on')
      },
      { threshold: 0.6 }
    ).observe(h)
}
