function initClock(){const c=document.getElementById("clock"),dot=c.querySelector("i"),tm=c.querySelector("b"),nm=c.querySelector("span");
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const d=e.target.dataset;tm.textContent=d.time;nm.textContent=d.name;dot.style.background=d.dot;dot.style.boxShadow=`0 0 12px ${d.dot}`;c.classList.add("on")}),{rootMargin:"-45% 0px -45% 0px"});
  document.querySelectorAll("[data-time]").forEach(s=>io.observe(s));
  const b=document.getElementById("book");if(b)new IntersectionObserver(([e])=>{if(e.isIntersecting)c.classList.remove("on")},{threshold:.3}).observe(b)}
