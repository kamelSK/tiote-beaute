/* =====================================================================
   TIOTE BEAUTÉ — main.js (V2 multipage / expérience premium)
   Lenis · GSAP reveals (lines/zoom/parallax) · curseur custom ·
   fond évolutif · magnetic · Google reviews · avant/après carrousel ·
   lightbox · compteurs · dark mode · nav
   ===================================================================== */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    const pre = $('#preloader');
    if (pre) setTimeout(() => pre.classList.add('is-done'), 1300);
    ScrollTrigger && ScrollTrigger.refresh();
  });

  /* ================= THEME ================= */
  const root = document.documentElement;
  const saved = localStorage.getItem('tb-theme');
  if (saved) root.setAttribute('data-theme', saved);
  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('tb-theme', next);
  });

  /* ================= LENIS smooth scroll ================= */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else { requestAnimationFrame(raf); }
  }

  /* ================= Smooth anchors ================= */
  $$('a[href*="#"]').forEach(a => {
    const url = a.getAttribute('href');
    const hash = url.includes('#') ? '#' + url.split('#')[1] : '';
    const samePage = url.startsWith('#') || url.split('#')[0] === '' ||
                     url.split('#')[0] === location.pathname.split('/').pop();
    if (!hash || hash.length < 2 || !samePage) return;
    const target = document.querySelector(hash);
    if (!target) return;
    a.addEventListener('click', e => {
      e.preventDefault(); closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.3 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ================= NAV ================= */
  const nav = $('#nav');
  const bar = $('#scrollProgress');
  const back = $('#backTop');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
    const st = document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    back?.classList.toggle('is-visible', window.scrollY > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#navBurger');
  function closeMenu() { nav?.classList.remove('is-open'); burger?.setAttribute('aria-expanded', 'false'); }
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  back?.addEventListener('click', () => { lenis ? lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ================= CURSEUR PERSONNALISÉ ================= */
  if (canHover && !reduce) {
    const ring = document.createElement('div'); ring.className = 'cursor';
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    document.body.append(ring, dot);
    document.body.classList.add('has-custom-cursor');

    let rx, dx;
    if (hasGSAP) {
      rx = { x: gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), y: gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' }) };
      dx = { x: gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), y: gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' }) };
    }
    window.addEventListener('mousemove', e => {
      if (hasGSAP) { rx.x(e.clientX); rx.y(e.clientY); dx.x(e.clientX); dx.y(e.clientY); }
      else { ring.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`; dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`; }
    });
    document.addEventListener('mouseleave', () => { ring.classList.add('is-hidden'); dot.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', () => { ring.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); });
    const hoverSel = 'a, button, [data-cursor], .s-card, .g-item, .t-card, .g-card, summary, .ba-compare';
    document.addEventListener('mouseover', e => { if (e.target.closest(hoverSel)) ring.classList.add('is-hover'); });
    document.addEventListener('mouseout', e => { if (e.target.closest(hoverSel)) ring.classList.remove('is-hover'); });
  }

  /* ================= FOND ÉVOLUTIF ================= */
  (function evolvingBg() {
    const layer = $('.page-bg');
    const sections = $$('[data-bg]');
    if (!layer || !sections.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) layer.style.background = en.target.dataset.bg; });
    }, { threshold: 0.01, rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(s => io.observe(s));
  })();

  /* ================= SPLIT LINES (pour data-reveal-lines) ================= */
  function splitLines(el) {
    if (el.dataset.split === '1') return $$('.line > span', el);
    const text = el.textContent.trim();
    el.textContent = '';
    const frag = document.createDocumentFragment();
    const words = text.split(/\s+/).map(w => {
      const s = document.createElement('span');
      s.style.display = 'inline-block';
      s.textContent = w;
      frag.appendChild(s);
      frag.appendChild(document.createTextNode(' '));
      return s;
    });
    el.appendChild(frag);
    // group by top offset -> lines
    const lines = []; let cur = null, top = null;
    words.forEach(w => {
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; }
      cur.push(w);
    });
    el.textContent = '';
    const inners = [];
    lines.forEach(group => {
      const line = document.createElement('span'); line.className = 'line';
      const inner = document.createElement('span');
      inner.textContent = group.map(w => w.textContent).join(' ');
      line.appendChild(inner); el.appendChild(line); el.appendChild(document.createTextNode(' '));
      inners.push(inner);
    });
    el.dataset.split = '1';
    return inners;
  }

  /* ================= REVEALS (GSAP) ================= */
  if (hasGSAP && !reduce) {
    // generic fade-up
    $$('[data-reveal]').forEach(el => gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    }));

    // hero words
    if ($('[data-reveal-word]')) gsap.to('[data-reveal-word]', { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out', stagger: .12, delay: 1.4 });

    // line reveals
    $$('[data-reveal-lines]').forEach(el => {
      const inners = splitLines(el);
      gsap.to(inners, {
        y: 0, opacity: 1, duration: 1.05, ease: 'power4.out', stagger: .1,
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    // zoom scrub on images
    $$('[data-zoom]').forEach(el => {
      const img = $('img', el) || $('.svg-cover', el) || el.firstElementChild;
      if (!img) return;
      gsap.fromTo(img, { scale: 1.18 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // parallax
    $$('[data-parallax]').forEach(el => {
      const amt = parseFloat(el.dataset.parallax) || 0.15;
      gsap.to(el, { yPercent: -amt * 100, ease: 'none',
        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // why icons draw
    $$('.why__item').forEach(item => ScrollTrigger.create({ trigger: item, start: 'top 82%', onEnter: () => item.classList.add('is-visible') }));

    // story float parallax
    const float = $('.story__img--float');
    if (float) gsap.to(float, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });

  } else {
    $$('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    $$('[data-reveal-word]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    $$('[data-reveal-lines]').forEach(el => { el.style.opacity = 1; });
    $$('[data-zoom] img').forEach(img => img.style.transform = 'none');
    $$('.why__item').forEach(el => el.classList.add('is-visible'));
  }

  /* ================= MAGNETIC BUTTONS ================= */
  if (canHover && !reduce) {
    $$('[data-magnetic]').forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        if (hasGSAP) gsap.to(el, { x: mx * strength, y: my * strength, duration: .5, ease: 'power3' });
        else el.style.transform = `translate(${mx * strength}px,${my * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        if (hasGSAP) gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,0.4)' });
        else el.style.transform = '';
      });
    });
  }

  /* ================= STAT COUNTERS ================= */
  const runCounter = el => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const dur = 1800, start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = dec ? v.toFixed(dec).replace('.', ',') : Math.floor(v).toLocaleString('fr-FR');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = dec ? target.toFixed(dec).replace('.', ',') : target.toLocaleString('fr-FR');
    };
    requestAnimationFrame(step);
  };
  const counters = $$('[data-count]');
  if (counters.length) {
    const io = new IntersectionObserver((es, obs) => es.forEach(e => { if (e.isIntersecting) { runCounter(e.target); obs.unobserve(e.target); } }), { threshold: .5 });
    counters.forEach(c => io.observe(c));
  }

  /* ================= COMPARAISON AVANT/APRÈS (réutilisable) ================= */
  function initCompare(wrap) {
    const before = $('.ba-compare__before', wrap);
    const handle = $('.ba-compare__handle', wrap);
    if (!before || !handle) return null;
    let dragging = false;
    const set = clientX => {
      const r = wrap.getBoundingClientRect();
      let x = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * 100;
      before.style.width = x + '%'; handle.style.left = x + '%';
    };
    const start = () => dragging = true;
    const end = () => dragging = false;
    const move = e => { if (dragging) set(e.touches ? e.touches[0].clientX : e.clientX); };
    handle.addEventListener('mousedown', start);
    wrap.addEventListener('mousedown', e => { start(); set(e.clientX); });
    window.addEventListener('mouseup', end);
    window.addEventListener('mousemove', move);
    handle.addEventListener('touchstart', start, { passive: true });
    wrap.addEventListener('touchstart', e => { start(); set(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend', end);
    window.addEventListener('touchmove', move, { passive: true });
    handle.setAttribute('tabindex', '0');
    handle.addEventListener('keydown', e => {
      const cur = parseFloat(before.style.width) || 50;
      if (e.key === 'ArrowLeft') set(wrap.getBoundingClientRect().left + wrap.getBoundingClientRect().width * (cur - 4) / 100);
      if (e.key === 'ArrowRight') set(wrap.getBoundingClientRect().left + wrap.getBoundingClientRect().width * (cur + 4) / 100);
    });
    // demo animation
    const demo = () => {
      if (reduce || !hasGSAP) return;
      const o = { v: 50 };
      gsap.timeline().to(o, { v: 68, duration: .8, ease: 'power2.inOut', onUpdate: () => { before.style.width = o.v + '%'; handle.style.left = o.v + '%'; } })
        .to(o, { v: 36, duration: 1, ease: 'power2.inOut', onUpdate: () => { before.style.width = o.v + '%'; handle.style.left = o.v + '%'; } })
        .to(o, { v: 50, duration: .7, ease: 'power2.inOut', onUpdate: () => { before.style.width = o.v + '%'; handle.style.left = o.v + '%'; } });
    };
    return { demo };
  }

  // Single (page accueil) — un seul comparatif
  const singleBA = $('#baCompare');
  if (singleBA) {
    const inst = initCompare(singleBA);
    if (inst && hasGSAP && !reduce) ScrollTrigger.create({ trigger: singleBA, start: 'top 70%', once: true, onEnter: inst.demo });
  }

  // Carrousel avant/après (page galerie)
  (function baCarousel() {
    const car = $('#baCarousel');
    if (!car) return;
    const slides = $$('.ba-slide', car);
    const dotsWrap = $('.ba-carousel__dots', car);
    const insts = slides.map(s => initCompare($('.ba-compare', s)));
    let i = 0;
    slides.forEach((_, n) => {
      const b = document.createElement('button'); b.setAttribute('aria-label', 'Transformation ' + (n + 1));
      b.addEventListener('click', () => go(n)); dotsWrap.appendChild(b);
    });
    const dots = $$('button', dotsWrap);
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      if (insts[i]) insts[i].demo();
    }
    $('#baNext', car)?.addEventListener('click', () => go(i + 1));
    $('#baPrev', car)?.addEventListener('click', () => go(i - 1));
    go(0);
  })();

  /* ================= GOOGLE REVIEWS CARROUSEL ================= */
  (function greviews() {
    const root = $('#greviews');
    if (!root) return;
    const track = $('.greviews__track', root);
    const cards = $$('.g-card', track);
    if (!cards.length) return;
    let i = 0, timer;
    const perView = () => { const w = window.innerWidth; return w <= 620 ? 1 : w <= 900 ? 2 : 3; };
    const maxIndex = () => Math.max(0, cards.length - perView());
    function go(n) {
      i = Math.max(0, Math.min(n, maxIndex()));
      const step = cards[0].getBoundingClientRect().width + 22;
      const x = -i * step;
      if (hasGSAP) gsap.to(track, { x, duration: .7, ease: 'power3.out' });
      else track.style.transform = `translateX(${x}px)`;
    }
    function reset() { clearInterval(timer); timer = setInterval(() => go(i >= maxIndex() ? 0 : i + 1), 5000); }
    $('#grNext', root)?.addEventListener('click', () => { go(i + 1); reset(); });
    $('#grPrev', root)?.addEventListener('click', () => { go(i - 1); reset(); });
    // swipe
    let sx = null;
    track.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    track.addEventListener('touchend', e => {
      if (sx === null) return;
      const d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 40) { go(d < 0 ? i + 1 : i - 1); reset(); }
      sx = null;
    }, { passive: true });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => go(i), 150); });
    go(0); reset();
  })();

  /* ================= TESTIMONIALS (ancien carrousel, si présent) ================= */
  (function reviews() {
    const track = $('#reviewsTrack');
    if (!track) return;
    const slides = $$('.review', track);
    const dotsWrap = $('#revDots');
    let i = 0, timer;
    slides.forEach((_, n) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Avis ' + (n + 1)); b.addEventListener('click', () => { go(n); reset(); }); dotsWrap.appendChild(b); });
    const dots = $$('button', dotsWrap);
    function go(n) { i = (n + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`; dots.forEach((d, k) => d.classList.toggle('is-active', k === i)); }
    function reset() { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); }
    $('#revNext')?.addEventListener('click', () => { go(i + 1); reset(); });
    $('#revPrev')?.addEventListener('click', () => { go(i - 1); reset(); });
    go(0); reset();
  })();

  /* ================= LIGHTBOX ================= */
  (function lightbox() {
    const items = $$('[data-lightbox] img, #galleryGrid .g-item img');
    const lb = $('#lightbox'); const lbImg = $('#lbImg');
    if (!items.length || !lb) return;
    let idx = 0;
    const srcs = items.map(i => i.dataset.full || i.getAttribute('src'));
    const open = i => { idx = i; lbImg.src = srcs[idx]; lbImg.alt = items[idx].alt; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); };
    const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); };
    const go = d => { idx = (idx + d + srcs.length) % srcs.length; lbImg.src = srcs[idx]; lbImg.alt = items[idx].alt; };
    items.forEach((img, i) => img.closest('figure, a, .g-item')?.addEventListener('click', e => { e.preventDefault(); open(i); }));
    $('#lbClose')?.addEventListener('click', close);
    $('#lbNext')?.addEventListener('click', () => go(1));
    $('#lbPrev')?.addEventListener('click', () => go(-1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1);
    });
  })();

  /* ================= WHATSAPP — fenêtre de chat ================= */
  (function whatsapp() {
    const btn = $('.floater--wa');
    if (!btn) return;
    const waHref = btn.getAttribute('href') || 'https://wa.me/33000000000';
    const num = (waHref.match(/wa\.me\/(\d+)/) || [])[1] || '33000000000';
    const chatLink = 'https://wa.me/' + num + '?text=' + encodeURIComponent("Bonjour Tiote Beauté, j'aimerais des informations.");

    // Badge notification sur le bouton
    const badge = document.createElement('span');
    badge.className = 'wa-badge'; badge.textContent = '1';
    btn.appendChild(badge);

    // Fenêtre de chat
    const pop = document.createElement('div');
    pop.className = 'wa-popup'; pop.id = 'waPopup';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Chat WhatsApp Tiote Beauté');
    pop.innerHTML = `
      <div class="wa-popup__head">
        <span class="wa-popup__avatar">✂</span>
        <div class="wa-popup__title"><strong>Tiote Beauté</strong><span>En ligne</span></div>
        <button class="wa-popup__close" type="button" aria-label="Fermer le chat">✕</button>
      </div>
      <div class="wa-popup__body">
        <div class="wa-popup__typing" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="wa-popup__msg" hidden>
          <div class="wa-popup__bubble">👋 Bonjour et bienvenue chez <strong>Tiote Beauté</strong> !<br>Comment puis-je vous aider ?</div>
          <p class="wa-popup__meta">L'équipe répond généralement en quelques minutes</p>
          <a class="wa-popup__cta" href="${chatLink}" target="_blank" rel="noopener">
            <svg viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.4.7 4.7 1.9 6.7L3 29l7-1.8c1.9 1 4 1.6 6 1.6 7 0 12.5-5.5 12.5-12.5S23 3 16 3z"/></svg>
            Démarrer la conversation
          </a>
        </div>
      </div>`;
    document.body.appendChild(pop);

    const typing = $('.wa-popup__typing', pop);
    const msg = $('.wa-popup__msg', pop);
    let firstOpen = true;

    const open = () => {
      pop.classList.add('is-open');
      btn.classList.add('is-active');
      btn.setAttribute('aria-expanded', 'true');
      if (firstOpen) {
        firstOpen = false;
        typing.style.display = ''; msg.hidden = true;
        setTimeout(() => { typing.style.display = 'none'; msg.hidden = false; }, reduce ? 0 : 1100);
      }
    };
    const close = () => {
      pop.classList.remove('is-open');
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => pop.classList.contains('is-open') ? close() : open();

    // Le bouton flottant ouvre la fenêtre au lieu d'aller direct sur WhatsApp
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', e => { e.preventDefault(); toggle(); });

    $('.wa-popup__close', pop).addEventListener('click', close);
    // La fenêtre s'ouvre d'elle-même après quelques secondes (une seule fois par visite)
    if (!sessionStorage.getItem('tb-wa-seen')) {
      setTimeout(() => { if (firstOpen) { open(); sessionStorage.setItem('tb-wa-seen', '1'); } }, 6000);
    }
    // Fermer au clic extérieur / Échap
    document.addEventListener('click', e => {
      if (pop.classList.contains('is-open') && !pop.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  })();

  /* ================= Image fallback ================= */
  $$('img').forEach(img => img.addEventListener('error', () => {
    if (img.dataset.fallback) return; img.dataset.fallback = '1';
    img.style.background = 'linear-gradient(135deg, var(--surface-2), var(--ink-3))';
  }, { once: true }));

})();
