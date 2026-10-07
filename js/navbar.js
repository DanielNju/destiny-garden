function initNavbar() {
  const h = document.querySelector('header'),
    m = h.querySelector('.menu'),
    dd = h.querySelector('.dd'),
    db = dd.querySelector('.ddb')
  m.onclick = () => {
    const o = h.classList.toggle('open')
    m.setAttribute('aria-expanded', o)
  }
  db.onclick = () => {
    const o = dd.classList.toggle('open')
    db.setAttribute('aria-expanded', o)
  }
  if (!h.classList.contains('solid')) {
    const f = () => h.classList.toggle('solid', scrollY > 40)
    f()
    addEventListener('scroll', f, { passive: true })
  }
}
