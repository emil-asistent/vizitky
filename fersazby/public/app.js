/* FérSazby: kalkulačky, srovnání bank, poptávka s ověřením SMS. Bez knihoven. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const RATES = window.FS_RATES || {};
  // Sazby kategorie; u hypotéky podle zvolené fixace (Denisa 27. 11.).
  const rateSet = (cat, fix) => (RATES[cat]?.fix && RATES[cat].fix[fix]) || RATES[cat];
  const num = (v) => Number(String(v ?? '').replace(/[^\d]/g, '')) || 0;
  const fmt = (x) => Math.round(x).toLocaleString('cs-CZ');
  const kc = (x) => fmt(x) + ' Kč';
  const pct = (x) => x.toFixed(2).replace('.', ',') + ' %';
  const pmt = (P, rate, n) => { const r = rate / 100 / 12; if (!P || !n) return 0; return r ? P * r / (1 - (1 + r) ** -n) : P / n; };
  const let_ = (y) => `${y} ${+y >= 2 && +y <= 4 ? 'roky' : 'let'}`;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Jemné rolování kolečkem myši (touchpad a dotyk zůstávají přirozené). */
  if (!still && window.Lenis && matchMedia('(pointer: fine)').matches) {
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true, anchors: { offset: -88 } });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.lenis = lenis;
  }

  // Plynulé dojetí na prvek (s Lenisem stejně jako kotvy v menu, odsazení pod hlavičku).
  const goTo = (el, block) => {
    if (!el) return;
    if (window.lenis) {
      const off = block === 'center' ? -Math.max(88, (innerHeight - el.offsetHeight) / 2) : -88;
      window.lenis.scrollTo(el, { offset: off });
    } else el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: block || 'start' });
  };

  /* ---------- přetáčení číslic u velké splátky v hero ---------- */
  const COL = '<span class="rd-c">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<span>${d}</span>`).join('') + '</span>';
  let digitW = null;   // šířky číslic v em, ať „1“ nezabírá tolik místa co „8“
  const measureDigits = (el) => {
    const cs = getComputedStyle(el), c = document.createElement('canvas').getContext('2d');
    c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const fs = parseFloat(cs.fontSize) || 1;
    digitW = [...'0123456789'].map((d) => c.measureText(d).width / fs);
  };
  const cellsOf = (el) => [...(el.querySelector('.rdw')?.children || [])];
  const sizeCells = (el, chars) => cellsOf(el).forEach((cell, i) => {
    if (cell.classList.contains('rd')) cell.style.width = (digitW[+chars[i]] - 0.03).toFixed(3) + 'em';
  });
  const turnCells = (el, chars) => cellsOf(el).forEach((cell, i) => {
    if (cell.classList.contains('rd')) cell.firstChild.style.transform = `translateY(-${+chars[i] * 10}%)`;
  });
  function roll(el, txt) {
    if (still) { el.textContent = txt; return; }
    if (el.dataset.v === txt) return;
    if (!digitW) measureDigits(el);
    const chars = [...txt], sig = chars.map((c) => (/\d/.test(c) ? 'd' : 's')).join('');
    const first = !el.dataset.sig, fresh = el.dataset.sig !== sig;
    if (fresh) {
      // Při první kresbě se číslice rozjedou z nul (číslo „naskočí“), při změně počtu číslic se jen přepíšou.
      el.dataset.sig = sig;
      el.innerHTML = '<span class="hv-sr"></span><span class="rdw" aria-hidden="true">'
        + chars.map((c) => (/\d/.test(c) ? `<span class="rd${first ? '' : ' now'}">${COL}</span>` : '<span class="rs"></span>')).join('') + '</span>';
    }
    el.dataset.v = txt; el.firstChild.textContent = txt;
    sizeCells(el, chars);
    if (first) setTimeout(() => turnCells(el, [...el.dataset.v]), 500);
    else turnCells(el, chars);
    if (fresh && !first) requestAnimationFrame(() => requestAnimationFrame(() => cellsOf(el).forEach((c) => c.classList.remove('now'))));
  }
  // Až se načte písmo, šířky číslic se přeměří (před tím se měřilo náhradním písmem).
  document.fonts?.ready.then(() => {
    const els = $$('[data-roll]').filter((el) => el.dataset.v && el.dataset.sig);
    if (!els.length) return;
    measureDigits(els[0]);
    els.forEach((el) => sizeCells(el, [...el.dataset.v]));
  });

  /* ---------- hlavička ---------- */
  const head = $('#hlavicka');
  if (head) {
    const onScroll = () => head.classList.toggle('scrolled', scrollY > 24);
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
    const burger = $('.head-burger', head), menu = $('#mobmenu');
    burger?.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open);
      menu.hidden = !open; head.classList.toggle('menu-open', open);
    });
    // Odkaz v menu (i kotva na stejné stránce) menu zavře.
    menu?.addEventListener('click', (e) => {
      if (!e.target.closest('a')) return;
      burger.setAttribute('aria-expanded', 'false'); menu.hidden = true; head.classList.remove('menu-open');
    });
  }

  /* ---------- hero úvodu: fotka se při rolování posouvá o něco pomaleji než zbytek ---------- */
  const hvPic = $('.hv-pic');
  if (hvPic && !still && matchMedia('(min-width: 861px)').matches) {
    let queued = false;
    const move = () => { queued = false; hvPic.style.transform = `translate3d(0, ${(Math.min(scrollY, 900) * 0.14).toFixed(1)}px, 0)`; };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(move); } }, { passive: true });
  }

  /* ---------- záložky na úvodu ---------- */
  const tabs = $$('.tabs [role=tab]');
  const selectTab = (btn, focus) => {
    tabs.forEach((t) => {
      const on = t === btn;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) btn.focus();
    const f = $('#' + btn.getAttribute('aria-controls'));
    if (f) calc(f);
    setLeadCat(btn.dataset.tab);
  };
  const tabFor = (cat) => tabs.find((t) => t.dataset.tab === cat);
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------- pole s částkou + posuvníky ---------- */
  const paintRange = (r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
  const rangeFor = (form, name) => $(`.range[data-for="${name}"]`, form);

  const setVal = (form, name, v, fromRange) => {
    const inp = form.elements[name]; if (!inp) return;
    const r = rangeFor(form, name);
    if (inp.classList.contains('money-in')) {
      const box = inp.closest('.money');
      v = clamp(Math.round(v), +box.dataset.min, +box.dataset.max);
      inp.value = fmt(v);
    } else {
      v = clamp(Math.round(v), +inp.min, +inp.max); inp.value = v;
    }
    if (r && !fromRange) r.value = clamp(v, +r.min, +r.max);
    if (r) paintRange(r);
  };

  $$('form.calc').forEach((form) => {
    $$('.money', form).forEach((box) => {
      const inp = $('.money-in', box), name = inp.name, step = +box.dataset.step;
      $$('.money-btn', box).forEach((b) => b.addEventListener('click', () => { setVal(form, name, num(inp.value) + step * b.dataset.dir); calc(form); }));
      inp.addEventListener('input', () => {
        const caret = inp.value.length - inp.selectionStart;
        const n = num(inp.value); inp.value = n ? fmt(n) : '';
        const p = Math.max(0, inp.value.length - caret); inp.setSelectionRange(p, p);
        const r = rangeFor(form, name); if (r) { r.value = clamp(n, +r.min, +r.max); paintRange(r); }
        calc(form);
      });
      inp.addEventListener('blur', () => { setVal(form, name, num(inp.value)); calc(form); });
    });
    $$('.term-in input', form).forEach((inp) => {
      inp.addEventListener('input', () => { const r = rangeFor(form, inp.name); if (r && inp.value) { r.value = clamp(+inp.value, +r.min, +r.max); paintRange(r); } calc(form); });
      inp.addEventListener('blur', () => { setVal(form, inp.name, +inp.value || +inp.max); calc(form); });
    });
    $$('.range', form).forEach((r) => {
      paintRange(r);
      r.addEventListener('input', () => { setVal(form, r.dataset.for, +r.value, true); calc(form); });
    });
    $$('input[type=radio], select, .txt', form).forEach((el) => el.addEventListener('change', () => calc(form)));
    form.addEventListener('submit', (e) => { e.preventDefault(); go(form); });
  });

  /* ---------- výpočet ---------- */
  const months = (form) => form.elements.roky ? num(form.elements.roky.value) * 12 : num(form.elements.mesice?.value);
  const state = (form) => {
    const cat = form.dataset.cat, el = form.elements;
    const s = { cat };
    s.castka = num(el.castka.value); s.n = months(form);
    if (cat === 'konsolidace') s.splatka = num(el.splatka.value);
    if (cat === 'hypoteka') { s.cena = num(el.cena.value); s.fixace = el.fixace.value; s.roky = num(el.roky.value); }
    s.rates = rateSet(cat, s.fixace); s.rate = s.rates.our; s.pay = pmt(s.castka, s.rate, s.n);
    return s;
  };

  function calc(form) {
    const s = state(form);
    const out = (k, v) => { const o = $(`[data-out="${k}"]`, form); if (o) o.textContent = v; };
    out('splatka', s.n ? kc(s.pay) : '—');
    out('sazba', pct(s.rate));
    if (s.cat === 'konsolidace') {
      const save = s.splatka - s.pay;
      out('uspora', save > 0 ? kc(save) + '/měs.' : 'spočítáme');
    }
    // Úvod: velké číslo splátky, rozdíl proti nejdražší bance a úspora u konsolidace.
    const big = $('[data-roll="splatka"]', form);
    if (big) roll(big, s.n ? fmt(s.pay) : '0');
    if ($('[data-out="rozdil"]', form) && RATES[s.cat]) {
      const worst = Math.max(...s.rates.banks.map(([, r]) => pmt(s.castka, r, s.n)));
      out('rozdil', kc(Math.max(0, worst - s.pay)));
    }
    const sv = $('[data-hv="uspora"]', form);
    if (sv) { const save = s.splatka - s.pay; sv.innerHTML = save > 0 ? `Ušetříte až <b>${kc(save)}</b> měsíčně` : 'Úsporu vám spočítáme osobně'; }
    if (form.dataset.mode === 'page' || (form.dataset.mode === 'home' && !form.hidden)) renderOffers(s);
    return s;
  }

  /* ---------- srovnání bank ---------- */
  const list = $('[data-o="list"]');
  $('[data-o="more"]')?.addEventListener('click', (e) => { list.classList.remove('short'); list.dataset.all = '1'; e.currentTarget.hidden = true; });
  const CAT_NAME = { uver: 'Úvěr na cokoliv', konsolidace: 'Konsolidace', hypoteka: 'Hypotéka' };
  function renderOffers(s) {
    if (!list || !RATES[s.cat]) return;
    $('[data-o="our-pay"]').textContent = kc(s.pay);
    const rateEl = $('[data-o="our-rate"]'); if (rateEl) rateEl.textContent = pct(s.rate);
    const tag = $('.offers-home [data-o="tag"]'); if (tag) tag.textContent = CAT_NAME[s.cat];
    if (list.dataset.cat !== s.cat) { list.dataset.cat = s.cat; delete list.dataset.all; }
    const rows = s.rates.banks.map(([bank, rate]) => ({ bank, rate, pay: pmt(s.castka, rate, s.n) }));
    const worst = rows.reduce((m, r) => Math.max(m, r.pay), 0);
    $('[data-o="our-save"]').textContent = worst > s.pay ? `Až o ${kc(worst - s.pay)} měsíčně méně než u nejdražší banky` : '';
    // Pruh: tyrkysová část = splátka s fér sazbou, šrafovaná = kolik byste u banky platili navíc.
    list.innerHTML = rows.map((r, i) => {
      const base = worst ? (s.pay / worst) * 100 : 0, over = worst ? ((r.pay - s.pay) / worst) * 100 : 0;
      return `<li><span class="ol-bank">${r.bank}</span><span class="ol-bar" role="img" aria-label="Navíc ${kc(r.pay - s.pay)} měsíčně"><i class="b0" style="width:${base.toFixed(1)}%"></i><i class="b1" style="width:${over.toFixed(1)}%;animation-delay:${i * 50}ms"></i></span><span class="ol-rate">${pct(r.rate)}</span><span class="ol-pay"><b>${kc(r.pay)}</b><small>+${kc(r.pay - s.pay)}</small></span></li>`;
    }).join('');
    const more = $('[data-o="more"]');
    if (more && !list.dataset.all) { list.classList.add('short'); more.hidden = rows.length <= 5; more.textContent = `Ukázat všech ${rows.length} bank`; }
    const forEl = $('[data-offers-for]');
    if (forEl) {
      const term = s.cat === 'hypoteka' ? `${s.roky} let, fixace ${let_(s.fixace)}` : `${s.n} měsíců`;
      forEl.innerHTML = `${$('.offers-home') ? CAT_NAME[s.cat] + ' ' : 'Pro '}<b>${kc(s.castka)}</b> na <b>${term}</b>`;
    }
    summary(s);
  }

  function summary(s) {
    const box = $('[data-summary]'); if (!box) return;
    let t = '';
    if (s.cat === 'hypoteka') t = `Hypotéka <b>${kc(s.castka)}</b> na nemovitost za ${kc(s.cena)}, ${s.roky} let, fixace ${let_(s.fixace)}, splátka od <b>${kc(s.pay)}</b>`;
    else if (s.cat === 'konsolidace') t = `Konsolidace <b>${kc(s.castka)}</b>, dnes splácíte ${kc(s.splatka)}, nově od <b>${kc(s.pay)}</b> na ${s.n} měsíců`;
    else t = `Úvěr <b>${kc(s.castka)}</b> na ${s.n} měsíců, splátka od <b>${kc(s.pay)}</b>`;
    box.innerHTML = t; box.hidden = !t;
  }

  /* ---------- přechod z kalkulačky ---------- */
  const PARAMS = { castka: 'castka', splatka: 'splatka', mesice: 'mesice', cena: 'cena', roky: 'roky', fixace: 'fixace' };
  function go(form) {
    const s = calc(form);
    if (form.dataset.mode === 'home' && $('#nabidky')) {
      // Jedna stránka: výsledek kalkulačky se rozepíše hned pod ní ve srovnání bank.
      summary(s); goTo($('#nabidky'));
    } else if (form.dataset.mode === 'home') {
      const q = new URLSearchParams();
      for (const k of Object.keys(PARAMS)) { const el = form.elements[k]; if (el && el.value) q.set(k, el.classList?.contains('money-in') ? num(el.value) : el.value); }
      location.href = `/${form.dataset.slug}?${q}#nabidky`;
    } else {
      summary(s);
      const target = $('#nabidky');
      target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  // Kalkulačka, ze které se právě počítá (podstránka, nebo otevřená záložka na úvodu).
  const activeCalc = () => $('form.calc[data-mode="page"]') || $$('form.calc[data-mode="home"]').find((f) => !f.hidden);

  /* ---------- poptávka na úvodu: výběr služby (propojený se záložkami kalkulačky) ---------- */
  function setLeadCat(cat) {
    const lf = $('.lead-form'); if (!lf || !$('.lead-cat', lf)) return;
    const r = $(`.lead-cat input[value="${cat}"]`, lf); if (!r) return;
    r.checked = true; lf.dataset.cat = cat; lf.elements.kategorie.value = r.dataset.name;
    $$('.lead-extra', lf).forEach((g) => { const on = g.dataset.forCat === cat; g.hidden = !on; $('fieldset', g).disabled = !on; });
  }
  $$('.lead-cat input').forEach((r) => r.addEventListener('change', () => {
    setLeadCat(r.value);
    const t = tabFor(r.value);
    if (t && t.getAttribute('aria-selected') !== 'true') selectTab(t);
  }));

  $$('form.calc').forEach((f) => calc(f));

  // Podstránka: předvyplnit z URL a hned spočítat.
  const pageForm = $('form.calc[data-mode="page"]');
  window.FS_PAGE = pageForm;
  if (pageForm) {
    const q = new URLSearchParams(location.search);
    for (const k of Object.keys(PARAMS)) {
      if (!q.has(k)) continue;
      const el = pageForm.elements[k]; if (!el) continue;
      if (el instanceof RadioNodeList || el.type === 'radio') { $$(`input[name="${k}"]`, pageForm).forEach((r) => { r.checked = r.value === q.get(k); }); }
      else if (el.classList.contains('money-in') || el.closest('.term-in')) setVal(pageForm, k, num(q.get(k)));
      else el.value = q.get(k);
    }
    const s = calc(pageForm); summary(s);
  }

  /* ---------- poptávka + SMS ---------- */
  const lead = $('.lead-form');
  if (lead) {
    const sms = $('.sms-form'), done = $('.done');
    const err = (form, msg) => { const e = $('.form-err', form); e.textContent = msg || ''; e.hidden = !msg; };
    const busy = (form, on) => { const b = $('button[type=submit]', form); b.disabled = on; b.style.opacity = on ? .6 : ''; };
    const phoneOk = (v) => /^(\+?420)?[67]\d{8}$/.test(String(v).replace(/[\s-]/g, ''));
    let leadId = null, resendTimer = null;

    $('#prijem')?.addEventListener('input', (e) => { const n = num(e.target.value); e.target.value = n ? fmt(n) : ''; });

    const validate = () => {
      let first = null;
      const mark = (el, bad) => { const host = el.closest('fieldset') || el.closest('.money') || el; host.classList.toggle('invalid', bad); if (bad && !first) first = el; };
      $$('input[required], select[required]', lead).filter((el) => !el.matches(':disabled')).forEach((el) => {
        if (el.type === 'radio') { const any = $$(`input[name="${el.name}"]`, lead).some((r) => r.checked); mark(el, !any); }
        else if (el.type === 'checkbox') mark(el, !el.checked);
        else if (el.name === 'email') mark(el, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        else if (el.name === 'telefon') mark(el, !phoneOk(el.value));
        else mark(el, !el.value.trim());
      });
      if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      return !first;
    };
    lead.addEventListener('change', (e) => { const host = e.target.closest('.invalid'); if (host) host.classList.remove('invalid'); });

    const startResend = () => {
      const b = $('[data-sms-resend]'); let t = 45; b.disabled = true;
      clearInterval(resendTimer);
      const tick = () => { b.textContent = t > 0 ? `Poslat kód znovu (${t} s)` : 'Poslat kód znovu'; b.disabled = t > 0; t--; if (t < -1) clearInterval(resendTimer); };
      tick(); resendTimer = setInterval(tick, 1000);
    };
    const showDev = (code) => { const d = $('.sms-dev'); d.hidden = !code; if (code) d.textContent = `Náhled webu: SMS se zatím neposílá, kód je ${code}.`; };

    lead.addEventListener('submit', async (e) => {
      e.preventDefault(); err(lead);
      if (!validate()) { err(lead, 'Zkontrolujte prosím zvýrazněná pole.'); return; }
      const data = Object.fromEntries(new FormData(lead));
      const ac = activeCalc();
      const calcState = ac ? state(ac) : {};
      delete data.sluzba;
      data.kalkulace = $('[data-summary]')?.textContent || '';
      data.parametry = calcState;
      data.stranka = location.pathname;
      busy(lead, true);
      try {
        const r = await fetch('/api/poptavka', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j.message || 'Odeslání se nepovedlo, zkuste to prosím znovu nebo zavolejte.');
        leadId = j.id;
        $('[data-sms-phone]').textContent = data.telefon;
        lead.hidden = true; sms.hidden = false; showDev(j.devCode);
        sms.elements.kod.value = ''; sms.elements.kod.focus({ preventScroll: true });
        sms.scrollIntoView({ block: 'center', behavior: 'smooth' });
        startResend();
      } catch (ex) { err(lead, ex.message); } finally { busy(lead, false); }
    });

    sms.elements.kod.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); if (e.target.value.length === 4) sms.requestSubmit(); });

    sms.addEventListener('submit', async (e) => {
      e.preventDefault(); err(sms);
      const kod = sms.elements.kod.value;
      if (!/^\d{4}$/.test(kod)) { err(sms, 'Kód má 4 číslice.'); return; }
      busy(sms, true);
      try {
        const r = await fetch('/api/poptavka/overit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: leadId, kod }) });
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j.message || 'Kód nesedí, zkuste to prosím znovu.');
        sms.hidden = true; done.hidden = false;
        $('[data-done-phone]').textContent = lead.elements.telefon.value;
        done.focus(); done.scrollIntoView({ block: 'center', behavior: 'smooth' });
        window.dataLayer?.push({ event: 'poptavka_overena', kategorie: lead.dataset.cat });
      } catch (ex) { err(sms, ex.message); sms.elements.kod.select(); } finally { busy(sms, false); }
    });

    $('[data-sms-resend]').addEventListener('click', async () => {
      err(sms);
      try {
        const r = await fetch('/api/poptavka/znovu', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: leadId }) });
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j.message || 'Kód se nepodařilo poslat.');
        showDev(j.devCode); startResend();
      } catch (ex) { err(sms, ex.message); }
    });
    $('[data-sms-back]').addEventListener('click', () => { sms.hidden = true; lead.hidden = false; lead.elements.telefon.focus(); });
  }

  /* ---------- recenze: pomalý samovolný posun dokola, šipky, filtr, rozbalení ---------- */
  // Karty se za railem zopakují (kopie jsou skryté pro čtečky), takže pás jede pořád dokola.
  // Najetí myší posun zastaví, šipky a tažení přepnou na ruční ovládání, po chvíli klidu se zase rozjede.
  $$('.rv').forEach((sec) => {
    const rail = $('.rv-rail', sec), bar = $('.rv-bar span', sec);
    const prev = $('.rv-arr[data-dir="-1"]', sec), next = $('.rv-arr[data-dir="1"]', sec);
    $$('.rv-card', rail).forEach((c) => {
      const k = c.cloneNode(true);
      k.classList.add('rv-clone'); k.setAttribute('aria-hidden', 'true'); k.inert = true;
      rail.appendChild(k);
    });
    const real = () => $$('.rv-card:not([hidden]):not(.rv-clone)', rail);
    let loopW = 0, loop = false;
    const measure = () => {
      rail.classList.remove('rv-noloop');
      const a = real()[0], b = $('.rv-clone:not([hidden])', rail);
      loopW = a && b ? b.offsetLeft - a.offsetLeft : 0;
      loop = loopW > rail.clientWidth + 40;
      rail.classList.toggle('rv-noloop', !loop);
    };
    const wrap = () => {
      if (!loop) return;
      if (rail.scrollLeft >= loopW) rail.scrollLeft -= loopW;
    };
    const sync = () => {
      const span = loop ? loopW : rail.scrollWidth - rail.clientWidth + 0.001;
      const w = Math.max(Math.min(1, rail.clientWidth / (span + rail.clientWidth)) * 100, 8);
      const f = loop ? (rail.scrollLeft % loopW) / loopW : rail.scrollLeft / span;
      bar.style.width = w + '%';
      bar.style.transform = `translateX(${Math.min(1, f) * (100 / w - 1) * 100}%)`;
      prev.disabled = !loop && rail.scrollLeft < 4;
      next.disabled = !loop && rail.scrollLeft > span - 4;
    };
    const step = () => { const c = real()[0]; return c ? c.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || 18) : 300; };
    const clampCheck = () => $$('.rv-card:not([hidden])', rail).forEach((c) => {
      if (c.classList.contains('open')) return;
      const p = $('blockquote p', c), b = $('.rv-more', c);
      b.hidden = p.scrollHeight <= p.clientHeight + 2;
    });

    // ----- samovolný posun -----
    const SPEED = 28;                                  // px za sekundu
    let hover = false, seen = false, manualUntil = 0, pos = 0, last = 0, raf = 0;
    const canRun = () => loop && !still && seen && !hover && !document.hidden && Date.now() > manualUntil && !$('.rv-card.open', rail);
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(t - last, 64) : 0; last = t;
      const run = canRun();
      rail.classList.toggle('rv-auto', run || hover);
      if (!run) { pos = rail.scrollLeft; return; }
      pos += (SPEED * dt) / 1000;
      if (pos >= loopW) pos -= loopW;
      rail.scrollLeft = pos;
      sync();
    };
    const manual = (ms = 5000) => { manualUntil = Date.now() + ms; rail.classList.remove('rv-auto'); };
    if (!still) {
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.2 }).observe(rail);
      rail.addEventListener('mouseenter', () => { hover = true; });
      rail.addEventListener('mouseleave', () => { hover = false; last = 0; });
      rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') manual(); });
      rail.addEventListener('touchstart', () => manual(), { passive: true });
      rail.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) manual(); }, { passive: true });
      rail.addEventListener('focusin', () => manual(8000));
      raf = requestAnimationFrame(tick);
    }

    $$('.rv-arr', sec).forEach((b) => b.addEventListener('click', () => {
      manual(6000);
      const d = +b.dataset.dir, s = step();
      if (loop && d < 0 && rail.scrollLeft - s < 0) rail.scrollLeft += loopW;
      if (loop && d > 0 && rail.scrollLeft + s >= loopW) rail.scrollLeft -= loopW;
      // Bez přichycení by šipka skončila mezi kartami, tak dojedeme na nejbližší kartu.
      const cards = $$('.rv-card:not([hidden])', rail), x = rail.scrollLeft;
      const target = cards.map((c) => c.offsetLeft - cards[0].offsetLeft).find((o) => d > 0 ? o > x + 8 : false)
        ?? cards.map((c) => c.offsetLeft - cards[0].offsetLeft).filter((o) => o < x - 8).pop() ?? 0;
      rail.scrollTo({ left: target, behavior: still ? 'auto' : 'smooth' });
    }));
    let endT = 0;
    rail.addEventListener('scroll', () => { sync(); clearTimeout(endT); endT = setTimeout(() => { if (Date.now() <= manualUntil) wrap(); sync(); }, 160); }, { passive: true });
    addEventListener('resize', () => { measure(); clampCheck(); sync(); });
    $$('.rv-more', sec).forEach((b) => b.addEventListener('click', () => {
      const c = b.closest('.rv-card'), open = c.classList.toggle('open');
      b.textContent = open ? 'Sbalit' : 'Celý příběh'; b.setAttribute('aria-expanded', open);
      manual(4000); sync();
    }));
    $$('.rv-filter button', sec).forEach((b) => b.addEventListener('click', () => {
      $$('.rv-filter button', sec).forEach((x) => x.setAttribute('aria-pressed', x === b));
      $$('.rv-card', rail).forEach((c) => { c.hidden = !!b.dataset.f && c.dataset.cat !== b.dataset.f; });
      rail.scrollTo({ left: 0 }); pos = 0; manual(2500); measure(); clampCheck(); sync();
    }));
    measure(); clampCheck(); sync();
    if (document.fonts) document.fonts.ready.then(() => { measure(); clampCheck(); sync(); });
  });

  /* ---------- otočné karty „Na co to bude“ ---------- */
  $$('.flip').forEach((card) => {
    const back = $('.flip-back', card), go = $('.flip-go', card);
    const set = (on, kb) => {
      card.classList.toggle('on', on);
      back.toggleAttribute('inert', !on); back.setAttribute('aria-hidden', String(!on));
      go.setAttribute('aria-expanded', String(on));
      // Fokus přesouváme jen při ovládání klávesnicí (jinak Safari kreslí obrys po ťuknutí).
      if (kb) (on ? $('.flip-calc', card) : go).focus({ preventScroll: true });
    };
    go.addEventListener('click', (e) => set(true, e.detail === 0));
    $('.flip-close', card).addEventListener('click', (e) => set(false, e.detail === 0));
    $('.flip-calc', card).addEventListener('click', () => {
      const homeCat = !window.FS_PAGE && card.closest('[data-cat]')?.dataset.cat;
      const pf = window.FS_PAGE || (homeCat && $(`#calc-h-${homeCat}`));
      if (!pf) return;
      if (homeCat) selectTab(tabFor(homeCat));
      setVal(pf, 'castka', +card.dataset.castka);
      if (card.dataset.mesice && pf.elements.mesice) setVal(pf, 'mesice', +card.dataset.mesice);
      if (card.dataset.roky && pf.elements.roky) {
        setVal(pf, 'roky', +card.dataset.roky);
        // Cena nemovitosti aspoň tak, aby hypotéka vycházela na 80 %.
        const cena = num(pf.elements.cena.value);
        if (cena < card.dataset.castka / 0.8) setVal(pf, 'cena', Math.ceil(card.dataset.castka / 0.8 / 100000) * 100000);
      }
      // Konsolidace: dnešní splátku zná jen klient, pole vyprázdníme a necháme ho ji doplnit.
      const sp = pf.elements.splatka;
      if (sp) { sp.value = ''; setTimeout(() => sp.focus({ preventScroll: true }), 700); }
      calc(pf);
      const k = $('#kalkulacka') || $('#spocitat');
      if (homeCat) goTo($('.hv-card'), 'center'); else k.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
      k.classList.add('pulse');
      setTimeout(() => k.classList.add('pulse-off'), 900);
      setTimeout(() => k.classList.remove('pulse', 'pulse-off'), 1700);
    });
  });

  /* ---------- kontakt ---------- */
  const kt = $('.kt-form');
  if (kt) {
    const t0 = Date.now();
    const q = new URLSearchParams(location.search).get('tema');
    const pre = q && $$('input[name="tema"]', kt).find((r) => r.value === q);
    if (pre) pre.checked = true;
    const err = (msg) => { const e = $('.form-err', kt); e.textContent = msg || ''; e.hidden = !msg; };
    const unmark = (e) => { const h = e.target.closest('.invalid'); if (h) h.classList.toggle('invalid', false); };
    kt.addEventListener('change', unmark);
    kt.addEventListener('input', unmark);
    kt.addEventListener('submit', async (e) => {
      e.preventDefault(); err();
      let first = null;
      const mark = (el, bad) => { const host = el.type === 'radio' ? el.closest('fieldset') : el; host.classList.toggle('invalid', bad); if (bad && !first) first = el; };
      const f = kt.elements;
      mark(f.jmeno, f.jmeno.value.trim().length < 2);
      mark(f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()));
      mark(f.telefon, String(f.telefon.value).replace(/\D/g, '').length < 9);
      mark($('input[name="tema"]', kt), !f.tema.value);
      if (first) { err('Doplňte prosím zvýrazněná pole.'); first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      const data = Object.fromEntries(new FormData(kt));
      data.ms = Date.now() - t0;
      const btn = $('button[type=submit]', kt); btn.disabled = true; btn.style.opacity = .6;
      try {
        const r = await fetch('/api/kontakt', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) throw new Error(j.message || 'Odeslání se nepovedlo. Zkuste to prosím znovu nebo napište na info@fersazby.cz.');
        const done = $('.kt-done');
        $('[data-kt-mail]').textContent = data.email;
        kt.hidden = true; done.hidden = false; done.focus();
        done.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (window.dataLayer) window.dataLayer.push({ event: 'kontakt_odeslan', tema: data.tema });
      } catch (ex) { err(ex.message); } finally { btn.disabled = false; btn.style.opacity = ''; }
    });
  }

  /* ---------- tlačítka u služeb: přepnou kalkulačku nahoře a dojedou k ní ---------- */
  $$('[data-pick]').forEach((a) => a.addEventListener('click', (e) => {
    const t = tabFor(a.dataset.pick); if (!t) return;
    e.preventDefault(); selectTab(t); goTo($('.hv-card'), 'center');
  }));

  /* ---------- menu na úvodu: zvýraznit sekci, ve které právě jsem ---------- */
  const spyLinks = $$('.head-nav [data-spy], .head-cta[data-spy]');
  if (spyLinks.length && $('.pg-home')) {
    const ids = [...new Set(spyLinks.map((a) => a.dataset.spy))];
    const secs = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const spy = () => {
      const y = innerHeight * 0.4; let cur = '';
      secs.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = s.id; });
      spyLinks.forEach((a) => a.classList.toggle('is-here', a.dataset.spy === cur));
    };
    let q = false;
    addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; spy(); }); } }, { passive: true });
    spy();
  }

  /* ---------- odhalení při scrollu ---------- */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const els = $$('.cats-head, .cat, .sec-head, .road li, .about-photo, .about-txt, .faq-grid > *, .offers-head, .offer-ours, .offer-box, .lead-side, .lead-card, .flip, .vs-table, .rv-head, .svc-img, .svc-txt, .svc-uses-h, .tm-txt, .tm-map, .kt-txt, .kt-card');
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  }
})();
