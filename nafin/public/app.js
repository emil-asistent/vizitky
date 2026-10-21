// Hlavička po odrolování
const hl = document.querySelector('.hl');
const onScroll = () => hl.classList.toggle('je-dole', scrollY > 4);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Životní situace: najetí přepne fotku
document.querySelectorAll('[data-situace]').forEach(s => {
  const polozky = s.querySelectorAll('li[data-obr]'), obr = s.querySelectorAll('.sit-obr img');
  const aktivuj = li => {
    polozky.forEach(p => p.classList.toggle('aktivni', p === li));
    obr.forEach((o, i) => o.classList.toggle('aktivni', i === +li.dataset.obr));
  };
  polozky.forEach(li => { li.addEventListener('mouseenter', () => aktivuj(li)); li.addEventListener('focusin', () => aktivuj(li)); });
});

// Mobilní menu
const burger = document.querySelector('.burger');
burger.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-otevrene');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
});
document.querySelectorAll('.mob-menu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-otevrene')));
addEventListener('keydown', e => { if (e.key === 'Escape') document.body.classList.remove('menu-otevrene'); });

// Objevení obsahu při rolování
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('videt'); io.unobserve(e.target); }
}), { threshold: .08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.ukaz').forEach(el => io.observe(el));

// Formátování
const cz = (n, d = 0) => n.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d });
const kc = n => cz(Math.round(n)) + ' Kč';
const mil = n => n >= 1e6 ? cz(n / 1e6, n % 1e6 ? 1 : 0) + ' mil. Kč' : cz(n / 1e3) + ' tis. Kč';
const pct = n => cz(n, 2) + ' %';
const splatka = (castka, sazba, roky) => {
  const r = sazba / 100 / 12, n = roky * 12;
  return r ? castka * r / (1 - Math.pow(1 + r, -n)) : castka / n;
};
const jistina = (spl, sazba, roky) => {
  const r = sazba / 100 / 12, n = roky * 12;
  return r ? spl * (1 - Math.pow(1 + r, -n)) / r : spl * n;
};

// Společné ovládání kalkulaček: jezdce, výstupy, výsledky
function kalkulacka(sel, formaty, vypocet) {
  document.querySelectorAll(sel).forEach(k => {
    const vstupy = k.querySelectorAll('input, select');
    const out = name => k.querySelector(`[data-v="${name}"]`);
    const set = (name, val) => { const el = out(name); if (el) el.textContent = val; };
    const run = () => {
      const v = {};
      vstupy.forEach(i => {
        if (i.type === 'radio') { if (i.checked) v[i.name] = i.value; return; }
        v[i.name] = i.type === 'range' ? +i.value : i.value;
        if (i.type === 'range') {
          i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min) * 100) + '%');
          const o = k.querySelector(`output[for="${i.id}"]`);
          if (o && formaty[i.name]) o.textContent = formaty[i.name](+i.value);
        }
      });
      vypocet(v, set, out, k);
    };
    vstupy.forEach(i => i.addEventListener('input', run));
    vstupy.forEach(i => i.addEventListener('change', run));
    run();
  });
}

// Srovnávač nabídky: kolik stojí rozdíl v sazbě
kalkulacka('[data-srovnani]', { castka: mil, sazba: pct, rozdil: n => '−' + cz(n, 2) + ' %', roky: n => n + ' let' }, (v, set, out) => {
  const nova = Math.max(0.5, v.sazba - v.rozdil);
  const s1 = splatka(v.castka, v.sazba, v.roky), s2 = splatka(v.castka, nova, v.roky);
  set('celkem', cz(Math.round((s1 - s2) * v.roky * 12)));
  set('mesic', kc(s1 - s2));
  set('fixace', kc((s1 - s2) * 12 * Math.min(5, v.roky)));
  set('spl1', kc(s1)); set('spl2', kc(s2)); set('nova', pct(nova));
});

// Splátka hypotéky
kalkulacka('[data-splatka]', { castka: mil, sazba: pct, roky: n => n + ' let' }, (v, set) => {
  const s = splatka(v.castka, v.sazba, v.roky), celkem = s * v.roky * 12;
  set('splatka', cz(Math.round(s)));
  set('celkem', kc(celkem));
  set('uroky', kc(celkem - v.castka));
  set('prijem', kc(Math.ceil(s / 0.45 / 1000) * 1000));
});

// Kolik mi banka půjčí: limit splátek z příjmu a LTV podle ČNB
kalkulacka('[data-dosah]', { prijem: kc, splatky: kc, vlastni: mil, sazba: pct }, (v, set) => {
  const ltv = v.mlady === '1' ? 0.9 : 0.8;
  const maxSpl = Math.max(0, v.prijem * 0.45 - v.splatky);
  const dlePrijmu = jistina(maxSpl, v.sazba, 30);
  const dleZdroju = v.vlastni * ltv / (1 - ltv);
  const uver = Math.floor(Math.min(dlePrijmu, dleZdroju) / 10000) * 10000;
  const cena = uver + v.vlastni;
  set('cena', cz(Math.round(cena / 10000) * 10000));
  set('uver', kc(uver));
  set('splatka', kc(splatka(uver, v.sazba, 30)));
  set('ltv', cena ? cz(uver / cena * 100) + ' %' : '0 %');
  set('limit', uver === 0 ? 'příjem' : dlePrijmu < dleZdroju ? 'výše příjmu' : 'vlastní zdroje');
});

// Hlídač konce fixace s připomínkou do kalendáře
document.querySelectorAll('[data-fixace]').forEach(k => {
  const vstup = k.querySelector('[name=datum]'), banka = k.querySelector('[name=banka]');
  const v = n => k.querySelector(`[data-v="${n}"]`);
  const d0 = new Date(); d0.setMonth(d0.getMonth() + 18);
  vstup.value = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}`;
  vstup.min = `${new Date().getFullYear() - 1}-01`;
  const posun = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
  const fmt = d => d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
  let konec;
  const run = () => {
    if (!vstup.value) return;
    const [y, m] = vstup.value.split('-').map(Number);
    konec = new Date(y, m - 1, 1);
    const dnes = new Date(); dnes.setHours(0, 0, 0, 0);
    let r = konec.getFullYear() - dnes.getFullYear(), mm = konec.getMonth() - dnes.getMonth(), dd = konec.getDate() - dnes.getDate();
    if (dd < 0) { mm--; dd += new Date(konec.getFullYear(), konec.getMonth(), 0).getDate(); }
    if (mm < 0) { r--; mm += 12; }
    const po = konec < dnes;
    v('titulek').textContent = po ? 'Fixace už skončila, řešte to hned' : 'Do konce fixace zbývá';
    v('r').textContent = po ? 0 : r; v('m').textContent = po ? 0 : mm; v('d').textContent = po ? 0 : dd;
    const kroky = [
      [posun(konec, -12), 'Začněte sledovat sazby a vývoj trhu'],
      [posun(konec, -6), 'Pošlete nám smlouvu, porovnáme nabídky bank'],
      [posun(konec, -3), 'Nejzazší termín, kdy vám banka pošle nové podmínky'],
      [konec, 'Konec fixace, převod k jiné bance bez poplatku'],
    ];
    const dalsi = kroky.findIndex(([d]) => d >= dnes);
    v('plan').innerHTML = kroky.map(([d, t], i) => `<li${i === dalsi ? ' class="ted"' : ''}><b>${fmt(d)}</b><span>${t}</span></li>`).join('');
    k.querySelector('[data-pripomen]').href = `/kontakt?tema=fixace&fixace=${vstup.value}${banka.value ? '&banka=' + encodeURIComponent(banka.value) : ''}`;
  };
  vstup.addEventListener('input', run); vstup.addEventListener('change', run); banka.addEventListener('change', run);
  run();
  k.querySelector('[data-ics]').addEventListener('click', () => {
    const d = x => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, '0')}${String(x.getDate()).padStart(2, '0')}`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const udalost = (datum, nazev, popis, id) => [
      'BEGIN:VEVENT', `UID:${id}-${d(konec)}@nafin.cz`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d(datum)}`, `DTEND;VALUE=DATE:${d(new Date(datum.getFullYear(), datum.getMonth(), datum.getDate() + 1))}`,
      `SUMMARY:${nazev}`, `DESCRIPTION:${popis}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${nazev}`, 'TRIGGER:-PT0M', 'END:VALARM', 'END:VEVENT'];
    const popis = `Konec fixace hypotéky${banka.value ? ' (' + banka.value + ')' : ''}: ${fmt(konec)}. NAFIN pohodové finance\\, Renáta 736 108 295\\, Petr 737 931 559\\, nafin.cz`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NAFIN//Hlidac fixace//CS', 'CALSCALE:GREGORIAN',
      ...udalost(posun(konec, -6), 'Hypotéka: porovnat nabídky před koncem fixace', popis, 'fix6'),
      ...udalost(posun(konec, -3), 'Hypotéka: banka posílá nové podmínky', popis, 'fix3'),
      ...udalost(konec, 'Hypotéka: konec fixace', popis, 'fix0'),
      'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'konec-fixace.ics'; document.body.appendChild(a); a.click(); a.remove();
  });
});

// Kontaktní formulář
const form = document.querySelector('[data-form]');
if (form) {
  const q = new URLSearchParams(location.search);
  if (q.get('tema')) { const o = form.tema.querySelector(`option[value="${q.get('tema')}"]`); if (o) form.tema.value = q.get('tema'); }
  if (q.get('fixace')) {
    const [y, m] = q.get('fixace').split('-');
    form.msg.value = `Fixace mi končí ${+m}/${y}${q.get('banka') ? ' (' + q.get('banka') + ')' : ''}. Ozvěte se mi prosím včas s porovnáním nabídek.`;
  }
  const stav = form.querySelector('.form-stav');
  const ukaz = (t, cls) => { stav.textContent = t; stav.className = 'form-stav ' + cls; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim()) return ukaz('Napište prosím své jméno.', 'chyba');
    if (!d.phone.trim() && !d.email.trim()) return ukaz('Nechte nám prosím telefon, nebo e-mail.', 'chyba');
    if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return ukaz('E-mail nevypadá správně.', 'chyba');
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, tema: form.tema.selectedOptions[0].text }) });
      if (!r.ok) throw new Error(r.status);
      form.reset();
      ukaz('Děkujeme, zpráva dorazila. Ozveme se vám co nejdřív.', 'ok');
    } catch {
      ukaz('Zprávu se nepodařilo odeslat. Zavolejte nám prosím na 736 108 295, nebo napište na info@nafin.cz.', 'chyba');
    } finally { btn.disabled = false; }
  });
}
