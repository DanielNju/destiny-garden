function initSlider() {
  document.querySelectorAll('[data-slider]').forEach((w) => {
    const s = w.querySelector('.strip')
    if (!s) return
    const a = document.createElement('div')
    a.className = 'arrows'
    ;[
      ['‹', 'Previous', -1],
      ['›', 'Next', 1],
    ].forEach(([t, l, d]) => {
      const b = document.createElement('button')
      b.textContent = t
      b.setAttribute('aria-label', l)
      b.onclick = () => s.scrollBy({ left: d * s.clientWidth * 0.8, behavior: 'smooth' })
      a.append(b)
    })
    w.append(a)
  })
}
