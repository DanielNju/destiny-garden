function initMobile() {
  const h = document.querySelector('header')
  h.querySelectorAll('nav a').forEach((a) =>
    a.addEventListener('click', () => h.classList.remove('open'))
  )
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') h.classList.remove('open')
  })
}
