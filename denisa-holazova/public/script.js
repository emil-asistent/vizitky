document.documentElement.classList.add('js');

// ---------- Hlavička po odrolování ----------
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
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
mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Plovoucí tlačítko na mobilu (mimo úvod a kontakt) ----------
const mobCta = document.getElementById('mobileCta');
const hero = document.getElementById('hero');
const contact = document.getElementById('kontakt');
const checkCta = () => {
  const pastHero = hero.getBoundingClientRect().bottom < 80;
  const nearContact = contact.getBoundingClientRect().top < window.innerHeight;
  mobCta.classList.toggle('show', pastHero && !nearContact);
};
checkCta();
window.addEventListener('scroll', checkCta, { passive: true });
window.addEventListener('resize', checkCta);

// ---------- Služby: záložky na počítači, rozbalování na mobilu ----------
const tabs = [...document.querySelectorAll('.svc-tabs [role="tab"]')];
const panels = [...document.querySelectorAll('.svc-panel')];
const selectTab = (i, focus) => {
  tabs.forEach((t, j) => {
    t.setAttribute('aria-selected', String(i === j));
    t.tabIndex = i === j ? 0 : -1;
  });
  panels.forEach((p, j) => {
    p.classList.toggle('is-open', i === j);
    p.querySelector('.svc-acc').setAttribute('aria-expanded', String(i === j));
  });
  if (focus) tabs[i].focus();
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(i));
  t.addEventListener('keydown', e => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    selectTab((i + d + tabs.length) % tabs.length, true);
  });
});
panels.forEach(p => {
  const acc = p.querySelector('.svc-acc');
  acc.addEventListener('click', () => {
    const open = !p.classList.contains('is-open');
    p.classList.toggle('is-open', open);
    acc.setAttribute('aria-expanded', String(open));
  });
});

// Odkaz ze služby předvyplní téma do zprávy
const msg = document.querySelector('#contactForm textarea[name="msg"]');
document.querySelectorAll('.svc-link[data-topic]').forEach(a => {
  a.addEventListener('click', () => {
    if (!msg.value.trim()) msg.value = `Dobrý den, mám zájem o: ${a.dataset.topic}.\n\n`;
  });
});

// ---------- Postupné zobrazení při rolování ----------
const rvEls = document.querySelectorAll('.why-head, .why-list li, .svc-head, .svc-body, .about-photo, .about-text > *, .process-head, .process-list li, .contact-intro, .contact-form');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  rvEls.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  rvEls.forEach(el => io.observe(el));
}

// ---------- Kontaktní formulář (odeslání rovnou na e-mail) ----------
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
const submitBtn = document.getElementById('contactSubmit');
const showNote = (text, type) => { note.hidden = false; note.dataset.type = type; note.textContent = text; };
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = new FormData(form);
  const payload = {
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    phone: String(data.get('phone') || '').trim(),
    msg: String(data.get('msg') || '').trim(),
    company: String(data.get('company') || '').trim(),
  };
  if (!payload.name || !payload.email || !payload.msg) return showNote('Vyplňte prosím jméno, e-mail a zprávu.', 'error');
  if (!isEmail(payload.email)) return showNote('Zkontrolujte prosím e-mailovou adresu.', 'error');

  const label = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Odesílám…';
  try {
    const resp = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const out = await resp.json().catch(() => ({}));
    if (!resp.ok || !out.ok) throw new Error(out.error || 'send_failed');
    form.reset();
    showNote('Děkuji, zpráva je odeslaná. Ozvu se Vám co nejdříve.', 'success');
  } catch (err) {
    showNote('Zprávu se teď nepodařilo odeslat. Zkuste to prosím znovu, nebo mi zavolejte na +420 737 202 797.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = label;
  }
});
