(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;
const G = window.gsap && window.ScrollTrigger ? window.gsap : null;
const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ROOT = document.body.dataset.root || '';
const getJSON = url => fetch(ROOT + url).then(r => r.ok ? r.json() : Promise.reject(r.status));

/* ---------- smooth scroll ---------- */
let lenis = null;
if (G) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true }); window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}
if (!window.__anchorBound) { window.__anchorBound = true; document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id === '#') return;
  const el = id === '#top' ? document.body : document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  closeMenu();
  const L = window.__lenis || lenis;
  if (L) L.scrollTo(id === '#top' ? 0 : el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}); }

/* ---------- nav ---------- */
const nav = $('#nav'), burger = $('#burger'), mbar = $('#mbar');
function closeMenu(){ nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
if (!window.__navBound) { window.__navBound = true; burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); }); }
let lastY = 0;
const onScroll = () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 60);
  nav.classList.toggle('hide', y > 500 && y > lastY && !nav.classList.contains('open'));
  mbar.classList.toggle('show', y > innerHeight * .7);
  lastY = y;
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- counters ---------- */
function fmt(el, v) {
  const d = +(el.dataset.dec || 0);
  return (el.dataset.pre || '') + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + (el.dataset.suf || '');
}
function count(el, dur = 2) {
  const end = +el.dataset.num;
  if (!G || reduce) { el.textContent = fmt(el, end); return; }
  const o = { v: 0 };
  gsap.to(o, { v: end, duration: dur, ease: 'power3.out', onUpdate: () => el.textContent = fmt(el, o.v) });
}

/* ---------- hero canvas: aurora + rising sparks ---------- */
(function heroCanvas(){
  const c = $('#heroCanvas'); if (!c) return;
  const ctx = c.getContext('2d');
  let w, h, dpr, run = true, t = 0;
  const blobs = [
    { x: .15, y: .2, r: .55, c: [122, 44, 108], sx: .00021, sy: .00017, a: .38 },
    { x: .85, y: .35, r: .45, c: [255, 107, 92], sx: .00016, sy: .00023, a: .22 },
    { x: .55, y: .95, r: .5, c: [92, 31, 138], sx: .00019, sy: .00014, a: .32 },
    { x: .7, y: .05, r: .35, c: [74, 25, 66], sx: .00025, sy: .0002, a: .45 }
  ];
  let sparks = [];
  const mouse = { x: .7, y: .4 };
  function size(){
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sparks = Array.from({ length: Math.round(w / 14) }, () => newSpark(true));
  }
  function newSpark(any){
    return { x: Math.random() * w, y: any ? Math.random() * h : h + 10, r: Math.random() * 2.2 + .6, v: Math.random() * .5 + .2, a: Math.random() * .6 + .2, drift: Math.random() * 2 * Math.PI, coral: Math.random() < .45 };
  }
  function frame(){
    if (!run) return;
    t += 16;
    ctx.fillStyle = '#2A0D25'; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    blobs.forEach((b, i) => {
      const x = (b.x + Math.sin(t * b.sx + i) * .12 + (mouse.x - .5) * .05) * w;
      const y = (b.y + Math.cos(t * b.sy + i * 2) * .12 + (mouse.y - .5) * .05) * h;
      const r = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${b.c},${b.a ?? .55})`); g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    ctx.globalCompositeOperation = 'source-over';
    sparks.forEach((s, i) => {
      s.y -= s.v; s.x += Math.sin(t * .001 + s.drift) * .25;
      if (s.y < -10) sparks[i] = newSpark(false);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = s.coral ? `rgba(255,107,92,${s.a})` : `rgba(251,246,240,${s.a * .7})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  size(); addEventListener('resize', size);
  const hero = c.parentElement;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width; mouse.y = (e.clientY - r.top) / r.height;
    hero.style.setProperty('--mx', mouse.x * 100 + '%'); hero.style.setProperty('--my', mouse.y * 100 + '%');
  });
  if (reduce) { run = true; frame(); run = false; return; }
  new IntersectionObserver(([en]) => { const was = run; run = en.isIntersecting; if (run && !was) frame(); }).observe(hero);
  frame();
})();

/* ---------- hero: live proof toasts ---------- */
const bag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>';
const TOASTS = [
  ['£26,084 in TikTok Shop sales', 'Beauty brand, UK, 6 months'],
  ['56 orders in one week', 'Meta Ads, pet treats brand'],
  ['Cost per order down 90%', '£164.65 to £15.81 in 4 weeks'],
  ['$1,289 in 7 days', 'TikTok Shop + Shopify, US'],
  ['First sales on day 3', 'Pet store, Meta Ads'],
  ['2,037 orders', 'TikTok Shop UK, 6 months'],
  ['$509.89 from $104.16 spend', 'Baby & kids store, Meta Ads'],
  ['£3,188 in 30 days', 'TikTok Shop, UK home brand'],
  ['1,227 conversions', 'TikTok Ads, $8.14 each']
];
(function toasts(){
  const box = $('#toasts'); if (!box) return; let i = 0;
  function show(){
    const [b, s] = TOASTS[i++ % TOASTS.length];
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="ti">${bag}</span><div><b>${esc(b)}</b><span>${esc(s)}</span></div>`;
    box.prepend(el);
    const all = $$('.toast', box);
    if (G && !reduce) {
      gsap.fromTo(el, { y: -30, autoAlpha: 0, scale: .9 }, { y: 0, autoAlpha: 1, scale: 1, duration: .7, ease: 'back.out(1.7)' });
      const gap = el.offsetHeight + 12;
      all.slice(1).forEach((o, k) => gsap.to(o, { y: gap + k * 20, scale: 1 - (k + 1) * .06, autoAlpha: (k || innerWidth < 560) ? 0 : .5, duration: .7, ease: 'power3.out', onComplete: () => k && o.remove() }));
    } else { all.slice(1).forEach(o => o.remove()); }
  }
  setTimeout(() => { show(); if (!reduce) setInterval(show, 3200); }, G && !reduce ? 1900 : 0);
})();

/* ---------- hero: rotating proof cards ---------- */
(function chipCycle(){
  if (reduce) return;
  $$('.chip[data-cycle]').forEach((chip, ci) => {
    let slides; try { slides = JSON.parse(chip.dataset.cycle); } catch { return; }
    let i = 0;
    setTimeout(() => setInterval(() => {
      i = (i + 1) % slides.length;
      const [s, v, l] = slides[i];
      const sm = $('small', chip), b = $('b', chip), sp = $('span', chip);
      const swap = () => { sm.innerHTML = '<i></i>' + s; b.textContent = v; sp.textContent = l; };
      if (G) gsap.timeline().to([sm, b, sp], { yPercent: -40, autoAlpha: 0, duration: .3, stagger: .04, ease: 'power2.in' }).add(swap).fromTo([sm, b, sp], { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .5, stagger: .05, ease: 'power3.out' });
      else swap();
      if (G && $('.ring', chip)) gsap.fromTo($('.ring', chip), { strokeDashoffset: 157 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
    }, 4200 + ci * 900), 4500 + ci * 1300);
  });
})();

/* ---------- hero intro ---------- */
function heroIntro(){
  if (!$('#stage')) { pageIntro(); return; }
  const h1 = $('#h1');
  if (!G || reduce) { document.documentElement.classList.add('intro-done'); $$('.hero [data-num]').forEach(el => count(el)); return; }
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  let lines = $$('.ln', h1);
  if (window.SplitText) {
    lines = $$('.ln', h1).map(ln => { ln.style.display = 'block'; return new SplitText(ln, { type: 'lines', mask: 'lines' }).lines; }).flat();
  } else { $$('.ln', h1).forEach(ln => { ln.style.display = 'block'; }); }
  gsap.set(h1, { opacity: 1 });
  gsap.set('.hero [data-intro]', { opacity: 1 });
  tl.from('.kicker', { y: 20, autoAlpha: 0, duration: .8 }, .1)
    .from(lines, { yPercent: 110, duration: 1.2, stagger: .12 }, .2)
    .fromTo('#arch', { clipPath: 'inset(100% 0 0 0 round 999px 999px 30px 30px)', autoAlpha: 1 }, { clipPath: 'inset(0% 0 0 0 round 999px 999px 30px 30px)', duration: 1.5, ease: 'expo.inOut' }, .25)
    .from('#arch img', { scale: 1.4, duration: 2, ease: 'expo.out' }, .6)
    .from('.ring-text', { autoAlpha: 0, scale: .8, duration: 1.6 }, .7)
    .from('.hero-sub, .hero-cta, .trust', { y: 30, autoAlpha: 0, duration: 1, stagger: .1 }, .75)
    .fromTo('.chip', { y: 40, autoAlpha: 0, scale: .85 }, { y: 0, autoAlpha: 1, scale: 1, duration: 1, stagger: .15, ease: 'back.out(1.6)', onStart(){ } }, 1.2)
    .add(() => $$('.hero [data-num]').forEach(el => count(el, 2.2)), 1.3)
    .fromTo('.spark .draw', { strokeDasharray: 260, strokeDashoffset: 260 }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 1.4)
    .fromTo('.roas .ring', { strokeDashoffset: 157 }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, 1.4);

  // parallax with pointer
  if (fine) {
    const stage = $('#stage');
    const qs = $$('.chip', stage).map(c => ({ x: gsap.quickTo(c, 'x', { duration: .8, ease: 'power3' }), y: gsap.quickTo(c, 'y', { duration: .8, ease: 'power3' }), d: +c.dataset.depth }));
    const ax = gsap.quickTo('#arch', 'x', { duration: 1, ease: 'power3' }), ay = gsap.quickTo('#arch', 'y', { duration: 1, ease: 'power3' });
    $('.hero').addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      qs.forEach(q => { q.x(x * -26 * q.d); q.y(y * -20 * q.d); });
      ax(x * 10); ay(y * 8);
    });
  }
  // scroll away
  gsap.to('.hero-in', { yPercent: 12, autoAlpha: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

function pageIntro(){
  const h = $('.page-hero h1');
  if (!h) return;
  if (!G || reduce) { document.documentElement.classList.add('intro-done'); return; }
  gsap.set('.page-hero [data-intro], .page-hero h1', { opacity: 1 });
  const lines = window.SplitText ? new SplitText(h, { type: 'lines', mask: 'lines' }).lines : [h];
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.crumbs', { y: 16, autoAlpha: 0, duration: .7 }, .1)
    .from(lines, { yPercent: 110, duration: 1.1, stagger: .1 }, .15)
    .from('.page-hero [data-intro]', { y: 26, autoAlpha: 0, duration: .9, stagger: .1 }, .5);
}

/* ---------- marquee ---------- */
(function marquee(){
  const tr = $('#marquee'); if (!tr) return; const span = tr.firstElementChild;
  for (let i = 0; i < 3; i++) tr.appendChild(span.cloneNode(true));
  if (!G || reduce) return;
  const tw = gsap.to(tr, { xPercent: -25, duration: 22, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ onUpdate: s => { const v = Math.min(Math.abs(s.getVelocity()) / 400, 5); gsap.to(tw, { timeScale: (s.direction) * (1 + v), duration: .3, overwrite: true }); gsap.to(tw, { timeScale: s.direction, duration: 1.2, delay: .3 }); } });
})();

/* ---------- who tabs ---------- */
(function who(){
  const tabs = $$('.who-tabs [role=tab]'), pill = $('#whoPill'); if (!pill) return;
  const place = t => { pill.style.width = t.offsetWidth + 'px'; pill.style.transform = `translateX(${t.offsetLeft - 6}px)`; };
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(o => { o.setAttribute('aria-selected', o === t); $('#' + o.getAttribute('aria-controls')).hidden = o !== t; });
    place(t);
    const p = $('#' + t.getAttribute('aria-controls'));
    if (G && !reduce) gsap.from(p.querySelectorAll('.who-big, .niches li, .who-list li'), { y: 24, autoAlpha: 0, duration: .6, stagger: .05, ease: 'power3.out' });
  }));
  requestAnimationFrame(() => place(tabs[0])); addEventListener('resize', () => place($('.who-tabs [aria-selected=true]')));
})();

/* ---------- scroll animations ---------- */
function scrollAnims(){
  if (!G || reduce) { $$('[data-num]').forEach(el => { if (!el.closest('.hero')) el.textContent = fmt(el, +el.dataset.num); }); return; }
  // headings: line reveal
  $$('[data-split]').forEach(el => {
    if (!window.SplitText) return;
    const s = new SplitText(el, { type: 'lines', mask: 'lines' });
    gsap.from(s.lines, { yPercent: 110, duration: 1.1, stagger: .1, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  // generic rise
  gsap.set('[data-up]', { autoAlpha: 0, y: 50 });
  ScrollTrigger.batch('[data-up]', { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { y: 0, autoAlpha: 1, duration: 1, stagger: .1, ease: 'power3.out' }) });
  // counters outside hero
  $$('[data-num]').filter(el => !el.closest('.hero')).forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => count(el) }));
  // services horizontal pin
  const mm = gsap.matchMedia();
  if ($('#svcTrack')) mm.add('(min-width:1024px)', () => {
    const track = $('#svcTrack');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#svcWrap', start: 'center center', end: () => '+=' + dist(), pin: '#svcWrap', pinSpacing: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    gsap.fromTo('#svcBar', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#svcWrap', start: 'center center', end: () => '+=' + dist(), scrub: true } });
    gsap.from('.svc', { y: 80, rotate: 3, autoAlpha: 0, duration: 1.1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '#svcWrap', start: 'top 85%' } });
  });
  if ($('#svcTrack')) mm.add('(max-width:1023px)', () => {
    $$('.svc').forEach(s => gsap.from(s, { y: 60, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 88%' } }));
  });
  // before/after auto flip
  if ($('#baRows')) { ScrollTrigger.create({ trigger: '#baRows', start: 'top 55%', once: true, onEnter: () => setTimeout(() => setBA(true), 500) });
  gsap.from('.ba-row', { x: -40, autoAlpha: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '#baRows', start: 'top 85%' } }); }
  // process line
  if ($('#steps')) gsap.to('#stepsFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
  $$('.step').forEach(st => ScrollTrigger.create({ trigger: st, start: 'top 65%', onEnter: () => st.classList.add('active'), onLeaveBack: () => st.classList.remove('active') }));
  // parallax images
  $$('[data-parallax]').forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  // closing giant text
  if ($('#giant')) {
  gsap.from('#giant span', { yPercent: 60, autoAlpha: 0, scale: .9, duration: 1.2, stagger: .12, ease: 'power4.out', scrollTrigger: { trigger: '#giant', start: 'top 85%' } });
  gsap.fromTo('#giant span:last-child', { letterSpacing: '-.12em' }, { letterSpacing: '-.06em', ease: 'none', scrollTrigger: { trigger: '#giant', start: 'top bottom', end: 'bottom 40%', scrub: true } });
  }
}

/* ---------- magnetic buttons ---------- */
if (G && fine && !reduce) $$('.magnetic').forEach(b => {
  const x = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), y = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .3); y((e.clientY - r.top - r.height / 2) * .4); });
  b.addEventListener('pointerleave', () => { x(0); y(0); });
});

/* ---------- before / after ---------- */
const baT = $('#baToggle'), baS = $('#difference');
function setBA(on){ if (!baT) return; baT.setAttribute('aria-checked', on); baS.classList.toggle('ba-on', on); }
baT && baT.addEventListener('click', () => setBA(baT.getAttribute('aria-checked') !== 'true'));

/* ---------- portfolio ---------- */
function mini(points){
  const max = Math.max(...points), n = points.length;
  const pts = points.map((p, i) => [i / (n - 1) * 300, 66 - p / max * 58]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="mini" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF6B5C" stop-opacity=".35"/><stop offset="1" stop-color="#FF6B5C" stop-opacity="0"/></linearGradient></defs><path d="${d} L300 70 L0 70Z" fill="url(#gf)" class="area"/><path d="${d}" fill="none" stroke="#FF6B5C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="line"/><circle cx="${pts[n-1][0]-4}" cy="${pts[n-1][1]}" r="5" fill="#4A1942"/></svg>`;
}
async function portfolio(){
  if (!$('#cases')) return;
  let d; try { d = await getJSON('data/portfolio.json'); } catch { d = { caseStudies: [], gallery: [] }; }
  const lim = +($('#cases').dataset.limit || 99);
  $('#cases').innerHTML = (d.caseStudies || []).slice(0, lim).map(c => `
    <article class="case" data-tilt>
      ${c.image ? `<img class="case-img" src="${esc(c.image)}" alt="${esc(c.title)} result" loading="lazy">` : ''}
      <span class="tag">${esc(c.tag)}</span><h3>${esc(c.title)}</h3>
      <div class="big">${esc(c.headline?.value)}</div><div class="big-l">${esc(c.headline?.label)}</div>
      ${c.chart ? mini(c.chart) + (c.chartLabel ? `<small style="display:block;font-size:.78rem;color:var(--muted);margin-top:.3rem">${esc(c.chartLabel)}</small>` : '') : ''}
      <p class="work">${esc(c.work)}</p>
      ${(c.metrics || []).length ? `<dl>${c.metrics.map(m => `<div><dt>${esc(m.value)}</dt><dd>${esc(m.label)}</dd></div>`).join('')}</dl>` : ''}
    </article>`).join('');
  const g = d.gallery || [];
  if (g.length && $('#portfolioBlock')) {
    $('#portfolioBlock').hidden = false;
    const cats = ['All', ...new Set(g.map(p => p.type).filter(Boolean))];
    $('#filters').innerHTML = cats.map((c, i) => `<button type="button" aria-pressed="${!i}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
    $('#gallery').innerHTML = g.map(p => `<button type="button" class="g-item" data-type="${esc(p.type)}" data-src="${esc(p.image)}" data-title="${esc(p.title)}" data-link="${esc(p.link || '')}"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"><div><b>${esc(p.title)}</b><span>${esc(p.type)}</span></div></button>`).join('');
    $('#filters').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#filters button').forEach(o => o.setAttribute('aria-pressed', o === b));
      const items = $$('.g-item').filter(it => b.dataset.c === 'All' || it.dataset.type === b.dataset.c);
      $$('.g-item').forEach(it => it.hidden = !items.includes(it));
      if (G && !reduce) gsap.fromTo(items, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .05, ease: 'power3.out' });
      window.ScrollTrigger?.refresh();
    });
    $('#gallery').addEventListener('click', e => {
      const it = e.target.closest('.g-item'); if (!it) return;
      if (it.dataset.link) { window.open(it.dataset.link, '_blank', 'noopener'); return; }
      $('#lbImg').src = it.dataset.src; $('#lbImg').alt = it.dataset.title; $('#lbCap').textContent = it.dataset.title;
      $('#lightbox').classList.add('open'); $('#lbClose').focus();
    });
  }
  // tilt + chart draw
  if (G && !reduce) {
    $$('.case').forEach((c, i) => {
      gsap.from(c, { y: 70, autoAlpha: 0, duration: 1, delay: i * .12, ease: 'power3.out', scrollTrigger: { trigger: '#cases', start: 'top 85%' } });
      const line = $('.line', c), area = $('.area', c);
      if (line) { const L = line.getTotalLength(); gsap.fromTo(line, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.8, delay: .3 + i * .15, ease: 'power2.inOut', scrollTrigger: { trigger: '#cases', start: 'top 80%' } }); gsap.from(area, { autoAlpha: 0, duration: 1, delay: 1 + i * .15, scrollTrigger: { trigger: '#cases', start: 'top 80%' } }); }
      if (fine) {
        const rx = gsap.quickTo(c, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .6, ease: 'power3' });
        c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 10); rx(-((e.clientY - r.top) / r.height - .5) * 10); });
        c.addEventListener('pointerleave', () => { rx(0); ry(0); });
      }
    });
    ScrollTrigger.refresh();
  }
}
if ($('#lightbox')) { $('#lbClose').addEventListener('click', () => $('#lightbox').classList.remove('open'));
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') e.currentTarget.classList.remove('open'); });
addEventListener('keydown', e => { if (e.key === 'Escape') $('#lightbox').classList.remove('open'); }); }

/* ---------- packages ---------- */
async function packages(){
  if (!$('#pkGrid')) return;
  let d; try { d = await getJSON('data/packages.json'); } catch { return; }
  $('#pkGrid').innerHTML = d.packages.map(p => `
    <article class="pk${p.featured ? ' feat' : ''}">
      ${p.featured ? '<span class="badge">Most chosen</span>' : ''}
      <h3>${esc(p.name)}</h3><p class="for">${esc(p.for)}</p>
      <div class="price"><small>from</small><b>${esc(p.price)}</b><em>${esc(p.per)}</em></div>
      <ul>${p.features.map(f => `<li>${tick}${esc(f)}</li>`).join('')}</ul>
      <a class="btn${p.featured ? ' btn-coral' : ''}" href="${ROOT}start.html?package=${encodeURIComponent(p.name)}" data-pkg="${esc(p.name)}">Choose ${esc(p.name)}</a>
    </article>`).join('');
  if ($('#addons')) $('#addons').innerHTML = d.addons.map(a => `<div class="addon"><b>${esc(a.name)}</b><span>${esc(a.detail)}</span><strong>${esc(a.price)}</strong></div>`).join('');
  if ($('#pkNote')) $('#pkNote').textContent = d.note || '';
  if (G && !reduce) { gsap.from('.pk', { y: 80, autoAlpha: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '#pkGrid', start: 'top 85%' } }); ScrollTrigger.refresh(); }
}

/* ---------- reviews ---------- */
async function reviews(){
  if (!$('#rvRows')) return;
  let d; try { d = await getJSON('data/reviews.json'); } catch { d = { reviews: [] }; }
  const list = (d.reviews || []).filter(r => !r.placeholder && r.text);
  if (!list.length) { const sec = $('#rvRows').closest('section'); const h = sec && sec.querySelector('h2'); if (h) h.textContent = 'Top Rated on Upwork.'; $('#rvRows').remove(); return; }
  const card = r => `<figure class="rv${r.placeholder ? ' ph' : ''}"><div class="stars" aria-label="5 stars">★★★★★</div><p>${esc(r.text)}</p><footer><i>${esc((r.name || '?')[0])}</i><span>${esc(r.name)}${r.country ? ', ' + esc(r.country) : ''}<br>via ${esc(r.from)}</span></footer></figure>`;
  if (!list.length) return;
  const rows = list.length >= 6 ? [list.slice(0, Math.ceil(list.length / 2)), list.slice(Math.ceil(list.length / 2))] : [list];
  $('#rvRows').innerHTML = rows.map(r => `<div class="rv-row">${(r.concat(r, r, r)).map(card).join('')}</div>`).join('');
  if (G && !reduce) $$('.rv-row').forEach((row, i) => {
    gsap.fromTo(row, { xPercent: i % 2 ? -25 : 0 }, { xPercent: i % 2 ? 0 : -25, duration: 40, ease: 'none', repeat: -1 });
    row.addEventListener('pointerenter', () => gsap.to(gsap.getTweensOf(row), { timeScale: .15, duration: .5 }));
    row.addEventListener('pointerleave', () => gsap.to(gsap.getTweensOf(row), { timeScale: 1, duration: .5 }));
  });
}

/* ---------- blog ---------- */
async function blog(){
  const box = $('#posts'); if (!box) return;
  let d; try { d = await getJSON('blog/posts.json'); } catch { d = { posts: [] }; }
  const posts = (d.posts || []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, +(box.dataset.limit || 99));
  const date = s => new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  let html = posts.map((p, i) => `<a class="post${i === 0 ? ' first' : ''}" href="${ROOT}blog/${esc(p.slug)}.html"><div class="meta"><span class="cat">${esc(p.category)}</span><span>${date(p.date)}</span><span>${p.minutes} min read</span></div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="go">Read the guide ${arrow}</span></a>`).join('');
  if (posts.length < 3 && posts.length % 3 !== 0) html += `<div class="post soon"><h3>More guides coming soon.</h3></div>`;
  box.innerHTML = html;
  if (G && !reduce) { gsap.from('.post', { y: 60, autoAlpha: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '#posts', start: 'top 85%' } }); ScrollTrigger.refresh(); }
}

/* ---------- FAQ accordion ---------- */
$$('details').forEach(dt => {
  const s = $('summary', dt), a = $('.ans', dt);
  s.addEventListener('click', e => {
    if (!G || reduce) return;
    e.preventDefault();
    if (dt.open) { gsap.to(a, { height: 0, duration: .4, ease: 'power3.inOut', onComplete: () => { dt.open = false; gsap.set(a, { clearProps: 'height' }); ScrollTrigger.refresh(); } }); }
    else {
      $$('details[open]').forEach(o => { if (o !== dt) o.open = false; });
      dt.open = true; gsap.from(a, { height: 0, duration: .5, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
    }
  });
});

/* ---------- contact links from settings ---------- */
const waLink = text => `https://wa.me/${SITE.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const mailLink = (subj, body) => `mailto:${SITE.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
const ext = a => { a.target = '_blank'; a.rel = 'noopener'; };
if (SITE.whatsapp) $$('[data-whatsapp]').forEach(a => { a.href = waLink("Hi Eunice, I found your website and I'd like to talk about my business."); ext(a); });
if (SITE.bookingUrl) $$('[data-booking]').forEach(a => { a.href = SITE.bookingUrl; ext(a); });
if ($('#contactList')) $('#contactList').innerHTML = [SITE.socials.upwork && `<a href="${esc(SITE.socials.upwork)}" target="_blank" rel="noopener" style="color:inherit">Upwork profile (Top Rated)</a>`, SITE.email && `<a href="mailto:${esc(SITE.email)}" style="color:inherit">${esc(SITE.email)}</a>`, SITE.whatsapp && `<a href="${waLink('')}" target="_blank" rel="noopener" style="color:inherit">WhatsApp +${esc(SITE.whatsapp.replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4'))}</a>`].filter(Boolean).join('');

/* Calendly inline embed */
(function calendly(){
  const setup = $('#calSetup'); if (!setup) return;
  if (!SITE.bookingUrl) { setup.textContent = 'Setup note: add your Calendly link in the site settings and the booking calendar appears here.'; return; }
  if (!/calendly\.com/.test(SITE.bookingUrl)) return;
  const box = document.createElement('div'); box.className = 'calendly-inline-widget cal-embed';
  box.dataset.url = SITE.bookingUrl + (SITE.bookingUrl.includes('?') ? '&' : '?') + 'hide_gdpr_banner=1&background_color=fbf6f0&primary_color=4a1942';
  const s = document.createElement('script'); s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true;
  s.onload = () => { const c = $('#cal'); c.replaceChildren(box); window.Calendly?.initInlineWidgets?.(); setTimeout(() => window.ScrollTrigger?.refresh(), 600); };
  document.head.appendChild(s);
})();

/* socials */
const ICONS = {
  upwork: '<path d="M9 6V4.500A1.500 1.500 0 0110.500 3h3A1.500 1.500 0 0115 4.500V6h4.500A1.500 1.500 0 0121 7.500v11a1.500 1.500 0 01-1.500 1.500h-15A1.500 1.500 0 013 18.500v-11A1.500 1.500 0 014.500 6H9zm1.500 0h3V4.500h-3V6zM3 11.500h18v1.500H3z"/>',
  tiktok: '<path d="M16.500 3a4.800 4.800 0 004 4.300v3.100a7.800 7.800 0 01-4-1.200v6.300a5.700 5.700 0 11-5.700-5.700c.300 0 .600 0 .900.070v3.200a2.600 2.600 0 102 2.500V3h2.800z"/>',
  instagram: '<path d="M12 7.200A4.800 4.800 0 1012 16.800 4.800 4.800 0 0012 7.200zm0 7.900a3.100 3.100 0 110-6.200 3.100 3.100 0 010 6.200zM17.100 5.700a1.100 1.100 0 100 2.200 1.100 1.100 0 000-2.200zM12 3.600c2.700 0 3 0 4.100.060 2.700.120 4 1.400 4.100 4.100.060 1.100.060 1.400.060 4.100s0 3-.060 4.100c-.120 2.700-1.400 4-4.100 4.100-1.100.060-1.400.060-4.100.060s-3 0-4.100-.060c-2.700-.120-4-1.400-4.100-4.100C3.600 15 3.600 14.700 3.600 12s0-3 .060-4.100C3.800 5.200 5.100 3.900 7.800 3.700 8.900 3.600 9.300 3.600 12 3.600z"/>',
  facebook: '<path d="M13.500 21v-7.500H16l.400-3h-2.900V8.600c0-.900.300-1.500 1.500-1.500h1.500V4.400a19 19 0 00-2.200-.100c-2.200 0-3.800 1.400-3.800 3.900v2.300H8v3h2.500V21h3z"/>',
  linkedin: '<path d="M5 3.500a2 2 0 110 4 2 2 0 010-4zM3.300 9h3.400v11.500H3.300V9zm5.600 0h3.200v1.600c.500-.900 1.700-1.900 3.500-1.900 3.700 0 4.400 2.400 4.400 5.600v6.200h-3.400V15c0-1.300 0-3-1.800-3s-2.100 1.400-2.100 2.900v5.600H8.900V9z"/>',
  x: '<path d="M17.700 3h3.100l-6.800 7.800L22 21h-6.300l-4.900-6.400L5.200 21H2.100l7.300-8.300L1.700 3h6.400l4.400 5.900L17.700 3zm-1.100 16.200h1.700L7.200 4.700H5.400l11.200 14.500z"/>',
  pinterest: '<path d="M12 2a10 10 0 00-3.600 19.300c-.100-.800-.200-2 0-2.900l1.200-5s-.300-.600-.300-1.500c0-1.400.800-2.500 1.800-2.500.900 0 1.300.600 1.300 1.400 0 .900-.500 2.100-.800 3.300-.200 1 .500 1.800 1.500 1.800 1.800 0 3.100-1.900 3.100-4.600 0-2.400-1.700-4.100-4.200-4.100a4.300 4.300 0 00-4.500 4.300c0 .900.300 1.800.700 2.300.100.100.100.200.100.300l-.300 1.100c0 .200-.100.200-.300.100-1.200-.600-2-2.300-2-3.800 0-3.100 2.200-5.900 6.500-5.900 3.400 0 6 2.400 6 5.600 0 3.400-2.100 6.100-5.100 6.100-1 0-1.900-.500-2.200-1.100l-.600 2.300c-.200.800-.800 1.900-1.200 2.500A10 10 0 1012 2z"/>',
  youtube: '<path d="M21.600 7.200a2.500 2.500 0 00-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.400A2.500 2.500 0 002.400 7.200 26 26 0 002 12a26 26 0 00.400 4.800 2.500 2.500 0 001.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.400a2.500 2.500 0 001.800-1.800A26 26 0 0022 12a26 26 0 00-.400-4.800zM10 15V9l5.200 3L10 15z"/>'
};
$('#socials').innerHTML = Object.keys(ICONS).filter(k => SITE.socials[k]).map(k => {
  const url = SITE.socials[k], name = k === 'x' ? 'X' : k === 'tiktok' ? 'TikTok' : k === 'linkedin' ? 'LinkedIn' : k === 'youtube' ? 'YouTube' : k[0].toUpperCase() + k.slice(1);
  return `<a href="${esc(url)}" target="_blank" rel="noopener me" aria-label="${name}" title="${name}"><svg viewBox="0 0 24 24" fill="currentColor">${ICONS[k]}</svg></a>`;
}).join('');
$('#yr').textContent = new Date().getFullYear();

/* ---------- audit form ---------- */
(function auditForm(){
  const form = $('#auditForm'), msg = $('#auditMsg'); if (!form) return;
  const say = h => { msg.innerHTML = h; msg.classList.add('show'); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    const bad = !f.name.trim() ? form.name : !/^\S+@\S+\.\S+$/.test(f.email) ? form.email : !f.store.trim() ? form.store : null;
    if (bad) { say('Add your name, a valid email and your store or page link so I can run the audit.'); bad.focus(); return; }
    const text = `Free shop audit request\nName: ${f.name}\nEmail: ${f.email}\nStore or page: ${f.store}\nBusiness: ${f.type}\nGoal: ${f.goal}${f.message ? '\nNotes: ' + f.message : ''}`;
    if (SITE.formEndpoint) {
      try { const r = await fetch(SITE.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) }); if (!r.ok) throw 0; form.reset(); say('Request sent. Your audit will reach your email within 48 hours.'); }
      catch { say(SITE.whatsapp ? `The request didn't send. <a href="${waLink(text)}" target="_blank" rel="noopener">Send it on WhatsApp instead</a>.` : "The request didn't send. Check your connection and try again."); }
    } else if (SITE.whatsapp) say(`Your request is ready. <a href="${waLink(text)}" target="_blank" rel="noopener">Send it to me on WhatsApp</a> to finish.`);
    else if (SITE.email) say(`Your request is ready. <a href="${mailLink('Free shop audit request', text)}">Send it to me by email</a> to finish.`);
    else say('Setup note: this form is not connected yet. Add your WhatsApp number or email in the site settings.');
  });
})();

/* ---------- start a project ---------- */
(function starter(){
  if (!$('#goals')) return;
  const pick = { goals: new Set(), biz: '', budget: '', when: '' };
  const qp = new URLSearchParams(location.search).get('package'); if (qp) pick.forced = qp;
  const LABEL = { meta: 'Meta Ads', tiktok: 'TikTok Ads', shop: 'TikTok Shop setup', google: 'Google Merchant Center', store: 'Store design or redesign', ugc: 'UGC videos', fix: 'Fix ads that aren\'t working' };
  const ADDON = { shop: 'TikTok Shop setup', google: 'Google Merchant Center setup', store: 'Shopify store design or redesign', ugc: 'UGC videos' };
  $$('#start .chips').forEach(group => group.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (group.hasAttribute('data-single')) { $$('button', group).forEach(o => o.setAttribute('aria-pressed', o === b && b.getAttribute('aria-pressed') !== 'true')); pick[group.id] = b.getAttribute('aria-pressed') === 'true' ? b.dataset.v : ''; }
    else { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); on ? pick.goals.add(b.dataset.v) : pick.goals.delete(b.dataset.v); }
    if (G && !reduce) gsap.fromTo(b, { scale: .92 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    update();
  }));
  $$('[data-pkg]').forEach(a => a.addEventListener('click', () => { pick.forced = a.dataset.pkg; update(); }));
  document.addEventListener('click', e => { const a = e.target.closest('[data-pkg]'); if (a) { pick.forced = a.dataset.pkg; update(); } });
  function update(){
    const g = pick.goals, ads = ['meta', 'tiktok', 'fix'].filter(k => g.has(k));
    let pkg, why;
    if (pick.forced && !g.size) { pkg = pick.forced; why = 'Good choice. Add what you need on the left and send it to me.'; }
    else if (!g.size) { pkg = 'Pick a few options'; why = 'Choose what you want on the left and I\'ll suggest a package.'; }
    else if ((g.has('meta') && g.has('tiktok')) || (ads.length && (g.has('shop') || g.has('google')) && pick.budget === 'Over $2,000')) { pkg = 'Scale'; why = 'You want more than one channel running together, so one person managing it all saves you time and money.'; }
    else if (ads.length && (pick.biz === 'Just starting' || pick.budget === 'Under $500' || g.has('fix'))) { pkg = 'Launch'; why = 'Start with a clean setup and a first campaign. Once it sells, we move to monthly management.'; }
    else if (ads.length) { pkg = 'Growth'; why = 'Monthly management on one platform, with new creatives tested every week.'; }
    else { pkg = 'One-off project'; why = 'You need a specific job done. I\'ll send you a quote after a short chat.'; }
    $('#spPkg').textContent = pkg; $('#spWhy').textContent = why;
    const adds = [...g].filter(k => ADDON[k]).map(k => ADDON[k]);
    $('#spAdd').innerHTML = adds.map(a => `<li>${esc(a)}</li>`).join('');
    if (G && !reduce) gsap.fromTo('#spPkg', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, ease: 'power3.out' });
    const text = `Hi Eunice, I'd like to start a project.\nI want: ${[...g].map(k => LABEL[k]).join(', ') || 'not sure yet'}\nBusiness: ${pick.biz || '-'}\nAd budget: ${pick.budget || '-'}\nStart: ${pick.when || '-'}\nSuggested: ${pkg}`;
    const wa = $('#spWa'), ml = $('#spMail');
    if (SITE.whatsapp) { wa.href = waLink(text); ext(wa); }
    if (SITE.email) { ml.href = mailLink('New project enquiry', text); }
  }
  update();
})();

/* ---------- boot ---------- */
heroIntro();
scrollAnims();
Promise.all([portfolio(), packages(), reviews(), blog()]).then(() => G && ScrollTrigger.refresh());
addEventListener('load', () => G && ScrollTrigger.refresh());
})();
