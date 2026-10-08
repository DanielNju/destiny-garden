// Fills [data-render] containers and [data-wa] / [data-maps] links from /data/*.js
;(() => {
  const up = location.pathname.includes('/pages/') ? '../' : '',
    pg = up ? '' : 'pages/'
  const each = (s, fn) => document.querySelectorAll(s).forEach(fn)
  if (typeof SITE !== 'undefined') {
    each(
      '[data-wa]',
      (a) => (a.href = `https://wa.me/${SITE.wa}?text=${encodeURIComponent('Hello ' + SITE.name)}`)
    )
    each('[data-maps]', (a) => (a.href = SITE.maps))
  }
  if (typeof SERVICES !== 'undefined')
    each('[data-render=day]', (el) => {
      el.innerHTML = SERVICES.map(
        (s) => `<article class="day__item reveal" style="--dot:${s.dot}">
        <p class="day__time">${s.time}<small>${s.name}</small></p>
        <div><h3><a href="${pg}${s.page}">${s.title}</a></h3><p>${s.text}</p>
        <ul class="day__tags">${s.tags.map((t) => `<li>${t}</li>`).join('')}</ul></div>
        <img src="${up}${s.img}" alt="${s.name}" loading="lazy"></article>`
      ).join('')
    })
  if (typeof EVENTS !== 'undefined')
    each('[data-render=events]', (el) => {
      el.innerHTML = EVENTS.map(
        (e) => `<article class="card reveal"><h3>${e.title}</h3><p>${e.text}</p></article>`
      ).join('')
    })
})()
