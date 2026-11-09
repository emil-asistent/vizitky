// Vizitka Tomáš Kužela · chování stránky (navigace, animace, karty, galerie, formulář).
(function () {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (!supportsHover) document.documentElement.classList.add('touch');

  // ---------- Navigace při scrollu ----------
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobilní menu ----------
  const ham = document.getElementById('ham');
  const mobNav = document.getElementById('mob-nav');
  const setMenu = (open) => {
    mobNav.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', String(open));
    ham.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    document.body.classList.toggle('menu-open', open);
  };
  ham.addEventListener('click', () => setMenu(!mobNav.classList.contains('open')));
  mobNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (!mobNav.classList.contains('open')) return;
    if (e.key === 'Escape') { setMenu(false); ham.focus(); return; }
    if (e.key === 'Tab') {
      // fokus drží uvnitř otevřeného menu (odkazy + tlačítko zavřít)
      const items = [ham].concat(Array.from(mobNav.querySelectorAll('a')));
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 768 && mobNav.classList.contains('open')) setMenu(false); });

  // ---------- Rok v patičce ----------
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Odkrývání při scrollu ----------
  const rvEls = document.querySelectorAll('.rv');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    rvEls.forEach((el) => el.classList.add('visible'));
  } else {
    const rvObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); rvObs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    rvEls.forEach((el) => rvObs.observe(el));
  }

  // ---------- Počítadla (v HTML jsou skutečná čísla pro vyhledávače a čtení bez JS) ----------
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); cObs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((el) => {
      // jen pokud je číslo pod spodní hranou obrazovky, jinak by uživatel viděl skok
      if (el.getBoundingClientRect().top > window.innerHeight) { el.textContent = '0' + (el.dataset.suffix || ''); cObs.observe(el); }
    });
  }

  // ---------- Animace čáry průběhu ----------
  const pline = document.getElementById('process-line');
  const ptrack = document.getElementById('process-track');
  if (pline && ptrack) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      pline.classList.add('animated');
    } else {
      const pObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { pline.classList.add('animated'); pObs.unobserve(e.target); } });
      }, { threshold: 0.4 });
      pObs.observe(ptrack);
    }
  }

  // ---------- Otáčecí karty služeb ----------
  // Počítač otáčí přes :hover v CSS. Dotyková zařízení (mobil, iPad) otáčí klepnutím,
  // klávesnice Enterem nebo mezerníkem (a :focus-within).
  const flipCards = document.querySelectorAll('.flip-card');
  const setFlip = (card, on) => { card.classList.toggle('flipped', on); card.setAttribute('aria-pressed', String(on)); };
  flipCards.forEach((card) => {
    if (!supportsHover) {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const willFlip = !card.classList.contains('flipped');
        flipCards.forEach((c) => { if (c !== card) setFlip(c, false); });
        setFlip(card, willFlip);
      });
    }
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        setFlip(card, !card.classList.contains('flipped'));
      }
    });
  });

  // Na mobilu (jako u tomasvasicek.cz) se sama otočí karta, která je celá vidět a nejblíž středu obrazovky.
  if (!supportsHover && window.innerWidth < 768 && !reduceMotion) {
    let ticking = false;
    let auto = null;
    const pick = () => {
      ticking = false;
      const vh = window.innerHeight;
      let best = null;
      let bestDist = Infinity;
      flipCards.forEach((c) => {
        const r = c.getBoundingClientRect();
        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (visible / r.height < 0.85) return;
        const dist = Math.abs((r.top + r.bottom) / 2 - vh / 2);
        if (dist < bestDist) { bestDist = dist; best = c; }
      });
      if (best && best !== auto) {
        flipCards.forEach((c) => { if (c !== best) setFlip(c, false); });
        setFlip(best, true);
        auto = best;
      } else if (!best && auto) {
        setFlip(auto, false);
        auto = null;
      }
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(pick); } }, { passive: true });
  }

  // ---------- Paralaxa úvodní fotky (jen počítač) ----------
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduceMotion && supportsHover) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) heroBg.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------- Galerie money2u ----------
  const slides = document.getElementById('carouselSlides');
  const dotsWrap = document.getElementById('carouselDots');
  const wrap = document.getElementById('carouselWrap');
  if (slides && dotsWrap && wrap) {
    const total = slides.children.length;
    let cur = 0;
    let timer = null;
    let visible = false;
    let paused = false;
    const dots = [];
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'cdot';
      d.setAttribute('aria-label', 'Snímek ' + (i + 1));
      d.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(d);
      dots.push(d);
    }
    function go(n) {
      cur = (n + total) % total;
      slides.style.transform = 'translateX(-' + (cur * 100) + '%)';
      dots.forEach((d, i) => d.setAttribute('aria-current', i === cur ? 'true' : 'false'));
      Array.prototype.forEach.call(slides.children, (s, i) => s.setAttribute('aria-hidden', i === cur ? 'false' : 'true'));
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); if (visible && !paused && !reduceMotion) timer = setInterval(() => go(cur + 1), 5000); }
    wrap.addEventListener('mouseenter', () => { paused = true; stop(); });
    wrap.addEventListener('mouseleave', () => { paused = false; restart(); });
    wrap.addEventListener('focusin', () => { paused = true; stop(); });
    wrap.addEventListener('focusout', (e) => { if (!wrap.contains(e.relatedTarget)) { paused = false; restart(); } });
    document.getElementById('cPrev').addEventListener('click', () => { go(cur - 1); restart(); });
    document.getElementById('cNext').addEventListener('click', () => { go(cur + 1); restart(); });

    let startX = 0;
    let startY = 0;
    wrap.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
    wrap.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(dx < 0 ? cur + 1 : cur - 1); restart(); }
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => { visible = e.isIntersecting; restart(); });
      }, { threshold: 0.2 }).observe(wrap);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else restart(); });
    go(0);
  }

  // ---------- Kontaktní formulář → /api/contact ----------
  const form = document.getElementById('contactForm');
  if (form) {
    const note = document.getElementById('formNote');
    const btn = document.getElementById('contactSubmit');
    const label = btn ? btn.textContent : 'Odeslat zprávu';
    const show = (text, type) => { note.dataset.type = type; note.textContent = text; };
    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    let sending = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      const d = new FormData(form);
      const payload = {
        name: String(d.get('name') || '').trim(),
        email: String(d.get('email') || '').trim(),
        phone: String(d.get('phone') || '').trim(),
        msg: String(d.get('msg') || '').trim(),
        company: String(d.get('hp_kontrola') || '').trim(),   // past na boty, člověk ji nevidí
      };
      if (!payload.name || !payload.email || !payload.msg) { show('Vyplňte prosím jméno, e-mail a\u00a0zprávu.', 'error'); return; }
      if (!isEmail(payload.email)) { show('Zkontrolujte prosím e-mailovou adresu.', 'error'); return; }

      sending = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Odesílám…'; }
      show('Odesílám zprávu…', 'info');
      try {
        const resp = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const out = await resp.json().catch(() => ({}));
        if (!resp.ok || !out.ok) throw new Error(out.error || 'send_failed');
        form.reset();
        show('Děkuji, zpráva dorazila. Ozvu se vám co nejdřív.', 'ok');
      } catch (err) {
        show('Zprávu se teď nepodařilo odeslat. Zkuste to prosím znovu, nebo mi zavolejte na\u00a0734\u00a0114\u00a0698.', 'error');
      } finally {
        sending = false;
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });
  }
})();
