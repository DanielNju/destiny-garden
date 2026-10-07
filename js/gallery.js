function initGallery() {
  document.querySelectorAll('#strip,#grid').forEach((box) => {
    GALLERY.forEach((u) => {
      const b = document.createElement('button')
      b.className = 'tile'
      b.setAttribute('aria-label', 'Open photo')
      b.style.backgroundImage = `url("${R + u}")`
      b.onclick = () => openModal(R + u)
      box.append(b)
    })
  })
}
