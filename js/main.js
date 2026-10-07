function slot(s){return `<div class="band t-${s.theme}" data-time="${s.time}" data-name="${s.name}" data-dot="${s.dot}"><section class="slot"><div><div class="time">${s.time}</div><h2>${s.title}</h2><p>${s.text}</p><ul>${s.tags.map(t=>`<li>${t}</li>`).join("")}</ul><a class="more" href="${R}pages/${s.page}">Read more</a></div><div class="media" data-img="${s.img}" data-vid="${s.vid||""}"></div></section></div>`}
const $=id=>document.getElementById(id);
if($("slots"))$("slots").innerHTML=SERVICES.map(slot).join("");
if($("service")){const s=SERVICES.find(x=>x.key===$("service").dataset.service);if(s)$("service").innerHTML=slot(s)}
if($("events"))$("events").innerHTML=EVENTS.map(e=>`<div class="card"><h3>${e.title}</h3><p>${e.text}</p></div>`).join("");
initMedia(document);initGallery();initSlider();initNavbar();initMobile();initClock();initHero();
const f=$("form");if(f)f.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(f);
  const m=`Hello ${SITE.name}, I'm ${d.get("n")}. I'd like to book for ${d.get("g")} guests${d.get("d")?" on "+d.get("d"):""}. It's for: ${d.get("o")}.`;
  window.open(`https://wa.me/${SITE.wa}?text=${encodeURIComponent(m)}`,"_blank","noopener")});
if("serviceWorker" in navigator)navigator.serviceWorker.register(R+"sw.js").catch(()=>{});
