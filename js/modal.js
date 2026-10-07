function openModal(src) {
  let d = document.getElementById('modal')
  if (!d) {
    d = document.createElement('dialog')
    d.id = 'modal'
    d.innerHTML = '<button aria-label="Close">×</button><img alt="">'
    d.querySelector('button').onclick = () => d.close()
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close()
    })
    document.body.append(d)
  }
  d.querySelector('img').src = src
  d.showModal()
}
