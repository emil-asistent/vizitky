// ---------- NAV scroll ----------
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Mobile menu ----------
const ham = document.getElementById('ham');
const mobNav = document.getElementById('mob-nav');
ham.addEventListener('click', () => {
  const open = mobNav.classList.toggle('open');
  ham.classList.toggle('open', open);
});
mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobNav.classList.remove('open');
  ham.classList.remove('open');
}));

// ---------- Year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Mobile sticky CTA ----------
const mobCta = document.getElementById('mobileCta');
if (mobCta) {
  const hero = document.getElementById('hero');
  const contact = document.getElementById('contact');
  const checkCta = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const contactTop = contact.getBoundingClientRect().top;
    const inHero = heroBottom > 100;
    const nearContact = contactTop < window.innerHeight + 80;
    mobCta.classList.toggle('show', !inHero && !nearContact);
  };
  checkCta();
  window.addEventListener('scroll', checkCta, { passive: true });
  window.addEventListener('resize', checkCta);
}

// ---------- Stats counter ----------
const statEls = document.querySelectorAll('.stat-num');
const animateStat = el => {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '+';
  const dur = 1600;
  const start = performance.now();
  const tick = now => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(target * eased);
    el.textContent = val + (t === 1 ? suffix : '');
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateStat(e.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
statEls.forEach(el => statObserver.observe(el));

// ---------- Services flip cards ----------
// Hover-capable zařízení (desktop) flipuje přes CSS :hover.
// Touch zařízení (mobil/tablet) bez hoveru používají tap.
const supportsHover = window.matchMedia('(hover: hover)').matches;
if (!supportsHover) {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      card.classList.toggle('flipped');
    });
  });
}

// ---------- Services swipe dots (mobile) ----------
const svcGrid = document.querySelector('.svc-grid');
const svcDots = document.querySelectorAll('#svcDots button');
const svcCards = document.querySelectorAll('.svc-card');
if (svcGrid && svcDots.length && svcCards.length) {
  const updateSvcDots = () => {
    if (window.matchMedia('(min-width: 761px)').matches) return;
    const center = svcGrid.scrollLeft + svcGrid.clientWidth / 2;
    let closestIdx = 0, closestDist = Infinity;
    svcCards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) { closestDist = dist; closestIdx = i; }
    });
    svcDots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
  };
  svcGrid.addEventListener('scroll', updateSvcDots, { passive: true });
  window.addEventListener('resize', updateSvcDots);
  svcDots.forEach(dot => dot.addEventListener('click', () => {
    const i = parseInt(dot.dataset.i, 10);
    const card = svcCards[i];
    if (!card) return;
    const target = card.offsetLeft - (svcGrid.clientWidth - card.offsetWidth) / 2;
    svcGrid.scrollTo({ left: target, behavior: 'smooth' });
  }));
  updateSvcDots();
}

// ---------- Gallery carousel ----------
const gSlides = document.querySelectorAll('.gallery-slide');
const gDots = document.querySelectorAll('#galleryDots button');
const gPrev = document.getElementById('galPrev');
const gNext = document.getElementById('galNext');
const gInner = document.querySelector('.gallery-inner');
if (gSlides.length && gInner) {
  let gIdx = 0;
  let gTimer;
  const AUTO_MS = 5500;

  const gGo = (i) => {
    gSlides[gIdx].classList.remove('active');
    gDots[gIdx].classList.remove('active');
    gIdx = (i + gSlides.length) % gSlides.length;
    gSlides[gIdx].classList.add('active');
    gDots[gIdx].classList.add('active');
  };
  const gNextFn = () => gGo(gIdx + 1);
  const gPrevFn = () => gGo(gIdx - 1);
  const gStart = () => { clearInterval(gTimer); gTimer = setInterval(gNextFn, AUTO_MS); };
  const gStop = () => clearInterval(gTimer);

  gNext.addEventListener('click', () => { gNextFn(); gStart(); });
  gPrev.addEventListener('click', () => { gPrevFn(); gStart(); });
  gDots.forEach(d => d.addEventListener('click', () => {
    gGo(parseInt(d.dataset.i, 10));
    gStart();
  }));
  gInner.addEventListener('mouseenter', gStop);
  gInner.addEventListener('mouseleave', gStart);

  // Touch swipe
  let touchStartX = 0;
  gInner.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  gInner.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx > 0 ? gPrevFn() : gNextFn(); gStart(); }
  });

  // Start autoplay až když je vidět
  const gObs = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? gStart() : gStop());
  }, { threshold: 0.2 });
  gObs.observe(gInner);
}

// ---------- Process line animation ----------
const processGrid = document.querySelector('.process-grid');
if (processGrid) {
  const procObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animate');
        procObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  procObs.observe(processGrid);
}

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll('h2, .lead, .why-card, .svc-card, .process-step, .stat, .about-photo, .about-text > p, .about-quote, .pillar, .about-personal, .about-cta, .contact-info, .contact-form');
revealEls.forEach(el => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ---------- Contact form ----------
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
const TO_EMAIL = 'samek@money2u.cz';

const showNote = (msg, type = 'info') => {
  note.hidden = false;
  note.dataset.type = type;
  note.textContent = msg;
};

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const phone = (data.get('phone') || '').toString().trim();
  const msg = (data.get('msg') || '').toString().trim();

  if (!name || !email || !msg) {
    showNote('Vyplňte prosím jméno, e-mail a zprávu.', 'error');
    return;
  }
  if (!isEmail(email)) {
    showNote('Zkontrolujte e-mailovou adresu.', 'error');
    return;
  }

  const subject = `Poptávka z webu — ${name}`;
  const body = `Jméno: ${name}\nE-mail: ${email}\nTelefon: ${phone || '—'}\n\n${msg}`;
  const mailto = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Try mailto in invisible link to detect failures
  let opened = false;
  try {
    const w = window.open(mailto, '_self');
    opened = true;
  } catch {}

  showNote(`Otevřel se váš e-mailový klient. Pokud ne, můžete mi napsat přímo na ${TO_EMAIL} nebo zavolat +420 728 225 546.`, 'success');

  // Offer clipboard copy fallback after a moment (in case mailto failed silently)
  setTimeout(async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(`${TO_EMAIL}\n\nPředmět: ${subject}\n\n${body}`);
      const extra = document.createElement('div');
      extra.style.cssText = 'margin-top:8px;font-size:13px;opacity:.85;';
      extra.textContent = '💡 Obsah zprávy jsem zkopíroval do schránky — můžete ji rovnou vložit do e-mailu.';
      note.appendChild(extra);
    } catch {}
  }, 800);
});
