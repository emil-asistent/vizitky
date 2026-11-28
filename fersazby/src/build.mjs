// Sestaví statické stránky do public/. Spuštění: node src/build.mjs
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { SITE, RATES, CATS, ACTIVE, HYPO_FIX_DEFAULT } from './data.mjs';
import { REVIEWS } from './recenze.mjs';
import { CONTENT } from './obsah.mjs';

const LOGO = JSON.parse(readFileSync(new URL('./logo/logo-a1.json', import.meta.url)));
const OUT = new URL('../public/', import.meta.url);
const V = Date.now().toString(36); // cache-busting css/js

// ---------- pomocníci ----------
const pmt = (P, ratePct, n) => { const r = ratePct / 100 / 12; return r ? P * r / (1 - (1 + r) ** -n) : P / n; };
const kc = (x) => Math.round(x).toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč';
const pct = (x) => x.toFixed(2).replace('.', ',') + ' %';
const fmt = (x) => Math.round(x).toLocaleString('cs-CZ').replace(/\s/g, ' ');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('');

// Pevné mezery za jednopísmennými předložkami a spojkami (jen v textu, ne v tazích).
const typo = (html) => html.replace(/>([^<]+)</g, (m, t) =>
  '>' + t.replace(/(^|[\s(])([vkszouaiVKSZOUAI])\s+/g, '$1$2 ') + '<');

const ICONS = {
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v3h-4a2 2 0 0 0 0 4h4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  car: '<path d="M5 17h14M6 17v2M18 17v2"/><path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v4H3z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  back: '<path d="M19 12H5M11 19l-7-7 7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  flip: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
  tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  sofa: '<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  coins: '<path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

// Logo A1 („FérSazby.cz“): jedna definice na stránku (<symbol>), barvy přes CSS proměnné.
// Samotný znak (procento s fajfkou) pro hero, mapu a další drobnosti.
const MARK_INNER = '<circle cx="24" cy="23" r="12.5" fill="none" class="lm-r" stroke-width="9.7"/><circle cx="77" cy="78" r="12.5" fill="none" class="lm-r" stroke-width="9.7"/><path d="M12 56 L33 77 L84 13" fill="none" class="lm-t" stroke-width="13.5" stroke-linecap="round" stroke-linejoin="round"/>';
const logoSprite = () => `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="logo-a1" viewBox="${LOGO.viewBox}">${LOGO.inner}</symbol><symbol id="logo-mark" viewBox="2 2 96 96">${MARK_INNER}</symbol></svg>`;
const markSvg = (cls = '') => `<svg class="mark-svg ${cls}" viewBox="0 0 96 96" aria-hidden="true"><use href="#logo-mark"/></svg>`;
// Vnější viewBox začíná v 0 0: <use> kreslí symbol do výřezu od počátku.
const LOGO_WH = LOGO.viewBox.split(' ').slice(2).join(' ');
const logoSvg = (cls = '') => `<svg class="logo-svg ${cls}" viewBox="0 0 ${LOGO_WH}" role="img" aria-label="FérSazby.cz"><use href="#logo-a1"/></svg>`;
const logo = (cls = '') => `<a href="/" class="logo ${cls}" aria-label="FérSazby.cz, úvod">${logoSvg()}</a>`;

// ---------- hlava, hlavička, patička ----------
const head = ({ title, desc, path, extraHead = '', noindex = false }) => `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE.url}${path}">`}
<meta name="theme-color" content="#0D1F3A">
<meta property="og:type" content="website">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="FérSazby.cz">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE.url}${path}">
<meta property="og:image" content="${SITE.url}/assets/og.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-96.png" sizes="96x96" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/poppins-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${V}">
${extraHead}
</head>`;

// Jednostránkový web (Denisa 27. 11. 2026): menu na úvodu sjíždí na sekce, z podstránek vede na úvod s kotvou.
// home = true → odkazy jen „#kotva“ (Lenis je odroluje plynule), jinak „/#kotva“.
const header = (active = '', solid = false, home = false) => {
  const b = home ? '' : '/';
  return `
${logoSprite()}
<a class="skip" href="#obsah">Přeskočit na obsah</a>
<header class="site-head${solid ? ' is-solid' : ''}" id="hlavicka">
  <div class="head-in">
    ${logo()}
    <nav class="head-nav" aria-label="Hlavní nabídka">
      ${ACTIVE.map((c) => `<a href="${b}#${c.anchor}" data-spy="${c.anchor}"${active === c.key ? ' aria-current="page"' : ''}>${c.short}</a>`).join('')}
      <a href="${b}#recenze" data-spy="recenze">Recenze</a>
    </nav>
    <div class="head-act">
      <a class="head-tel" href="${SITE.phoneHref}" aria-label="Zavolat ${SITE.phone}">${icon('phone')}<span>${SITE.phone}</span></a>
      <a class="head-cta" href="${b}#kontakt" data-spy="kontakt">${icon('chat')}<span>Kontakt</span></a>
    </div>
    <button class="head-burger" type="button" aria-expanded="false" aria-controls="mobmenu" aria-label="Menu"><span></span><span></span></button>
  </div>
  <div class="mobmenu" id="mobmenu" hidden>
    ${ACTIVE.map((c) => `<a href="${b}#${c.anchor}">${icon(c.icon)}<span>${c.name}</span>${icon('arrow', 'ic-go')}</a>`).join('')}
    <a href="${b}#recenze">${icon('chat')}<span>Recenze klientů</span>${icon('arrow', 'ic-go')}</a>
    <a class="mobmenu-cta" href="${b}#kontakt">${icon('send')} Napsat přes Kontakt</a>
    <a class="mobmenu-tel" href="${SITE.phoneHref}">${icon('phone')} Zavolat ${SITE.phone}</a>
    <a class="mobmenu-mail" href="mailto:${SITE.email}">${SITE.email}</a>
  </div>
</header>`;
};

// Patička podle Denisy 27. 11.: vlevo jen značka a jedna věta, vpravo tři služby a tlačítko na Kontakt.
// Údaje o zprostředkovateli jsou na stránce Ochrana osobních údajů (odkaz dole).
const footer = (home = false) => {
  const b = home ? '' : '/';
  return `
<footer class="site-foot">
  <div class="wrap foot-top">
    <div class="foot-brand">
      ${logo('logo-light')}
      <p>Srovnání nových úvěrů, konsolidací a&nbsp;hypoték.</p>
    </div>
    <nav class="foot-nav" aria-label="Služby">
      ${ACTIVE.map((c) => `<a href="${b}#${c.anchor}">${c.name}</a>`).join('')}
    </nav>
    <a class="btn foot-btn" href="${b}#kontakt">${icon('send')}<span>Napsat přes Kontakt</span></a>
  </div>
  <div class="foot-sig">
    <div class="wrap foot-sig-in">
      <span>© ${new Date().getFullYear()}<span class="foot-nm"> FérSazby.cz</span><i>·</i><a class="foot-gdpr" href="/ochrana-osobnich-udaju">Ochrana osobních údajů</a></span>
      <a href="https://gomatela.cz" target="_blank" rel="noopener">Web od <b>Gomatela</b><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.2 10.2 3.6v4.8L6 10.8 1.8 8.4V3.6z"/></svg></a>
    </div>
  </div>
</footer>`;
};

const scripts = () => `
<script>window.FS_RATES=${JSON.stringify(RATES)};</script>
<script src="/lenis.min.js?v=1.1.20" defer></script>
<script src="/app.js?v=${V}" defer></script>
</body>
</html>`;

// ---------- kalkulačka ----------
const money = (name, label, val, min, max, step) => `
<div class="fld">
  <label class="fld-l" for="${name}-%ID%">${label}</label>
  <div class="money" data-min="${min}" data-max="${max}" data-step="${step}">
    <button type="button" class="money-btn" data-dir="-1" aria-label="Méně">${icon('minus')}</button>
    <input id="${name}-%ID%" name="${name}" class="money-in" type="text" inputmode="numeric" autocomplete="off" value="${fmt(val)}">
    <span class="money-u">Kč</span>
    <button type="button" class="money-btn" data-dir="1" aria-label="Více">${icon('plus')}</button>
  </div>
  <input class="range" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-for="${name}" aria-label="${label}, posuvník" tabindex="-1">
</div>`;

const term = (name, label, val, min, max, unit) => `
<div class="fld">
  <div class="fld-row">
    <label class="fld-l" for="${name}-%ID%">${label}</label>
    <span class="term-in"><input id="${name}-%ID%" name="${name}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${val}" aria-describedby="${name}-%ID%-u"><span id="${name}-%ID%-u">${unit}</span></span>
  </div>
  <input class="range" type="range" min="${min}" max="${max}" step="1" value="${val}" data-for="${name}" aria-label="${label}, posuvník">
  <div class="range-ends"><span>${min} ${unit}</span><span>${max} ${unit}</span></div>
</div>`;

const calcFields = {
  uver: () => `
    ${money('castka', 'Kolik potřebujete?', 300000, 20000, 2500000, 10000)}
    ${term('mesice', 'Splatnost', 240, 12, 240, 'měs.')}`,
  konsolidace: () => `
    ${money('castka', 'Kolik celkem dlužíte?', 500000, 50000, 3000000, 10000)}
    ${money('splatka', 'Kolik teď měsíčně splácíte?', 9500, 500, 80000, 100)}
    ${term('mesice', 'Nová splatnost', 240, 12, 240, 'měs.')}`,
  hypoteka: () => `
    <div class="fld-2">
    ${money('cena', 'Cena nemovitosti', 5000000, 500000, 30000000, 100000)}
    ${money('castka', 'Výše hypotéky', 4000000, 300000, 25000000, 100000)}
    </div>
    ${term('roky', 'Splatnost', 30, 5, 30, 'let')}
    <div class="fld fld-fix">
      <span class="fld-l" id="fix-%ID%">Fixace</span>
      <div class="seg" role="radiogroup" aria-labelledby="fix-%ID%">
        ${[3, 5, 7, 10].map((y) => `<label><input type="radio" name="fixace" value="${y}"${y === HYPO_FIX_DEFAULT ? ' checked' : ''}><span>${y} ${y === 3 ? 'roky' : 'let'}</span></label>`).join('')}
      </div>
    </div>`,
};

const result = (key) => key === 'konsolidace'
  ? `<div class="calc-res"><div><span>Nová splátka od</span><b data-out="splatka">—</b></div><div class="calc-save"><span>Ušetříte až</span><b data-out="uspora">—</b></div></div>`
  : `<div class="calc-res"><div><span>Splátka od</span><b data-out="splatka">—</b></div><div><span>Sazba od</span><b data-out="sazba">${pct(RATES[key].our)}</b></div></div>`;

const calcPanel = (c, id, mode) => `
<form class="calc" data-cat="${c.key}" data-slug="${c.slug}" data-mode="${mode}" id="calc-${id}" ${mode === 'home' && c.key !== ACTIVE[0].key ? 'hidden' : ''} novalidate>
  <div class="calc-fields">${calcFields[c.key]().replaceAll('%ID%', id)}</div>
  <div class="calc-side">
  ${result(c.key)}
  <button class="btn btn-go" type="submit"><span>${mode === 'home' ? c.cta : 'Chci vidět nabídky'}</span>${icon('arrow')}</button>
  </div>
</form>`;

const homeCalc = () => `
<div class="calc-card" id="spocitat">
  <div class="tabs" role="tablist" aria-label="Co chcete spočítat">
    ${ACTIVE.map((c, i) => `<button type="button" role="tab" id="tab-${c.key}" aria-controls="calc-h-${c.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${c.key}">${icon(c.icon)}<span>${c.short}</span></button>`).join('')}
  </div>
  ${ACTIVE.map((c) => calcPanel(c, `h-${c.key}`, 'home').replace('<form ', `<form role="tabpanel" aria-labelledby="tab-${c.key}" `)).join('')}
  <p class="calc-note">${icon('lock')} Nezávazně a zdarma. Údaje nikam neposíláme, dokud sami nechcete.</p>
</div>`;

// ---------- hero úvodu v2 (23. 11. 2026 večer) ----------
// Vychází z původního hera (fotka rodiny přes celou výšku, bílá kalkulačka dole), jen dotažené:
// jedna značka nahoře (velké logo je přímo v hlavičce), velký nadpis, slib od Denisy
// a kalkulačka jako kartotéka: tři záložky se sazbou, stejně stavěná pole a tmavý výsledek s tlačítkem.
const hvBox = (name, label, val, min, max, step, unit, id, ends, cls = '') => `
<div class="hv-f ${cls}">
  <label class="hv-l" for="${name}-${id}">${label}</label>
  <div class="money hv-box" data-min="${min}" data-max="${max}" data-step="${step}">
    <button type="button" class="money-btn" data-dir="-1" aria-label="Méně">${icon('minus')}</button>
    <input id="${name}-${id}" name="${name}" class="money-in" type="text" inputmode="numeric" autocomplete="off" value="${fmt(val)}">
    <span class="money-u">${unit}</span>
    <button type="button" class="money-btn" data-dir="1" aria-label="Více">${icon('plus')}</button>
  </div>
  <input class="range" type="range" min="${min}" max="${max}" step="${unit === 'Kč' ? step : 1}" value="${val}" data-for="${name}" aria-label="${label}, posuvník" tabindex="-1">
  <div class="range-ends"><span>${ends[0]}</span><span>${ends[1]}</span></div>
</div>`;
const HV = {
  uver: (id) => hvBox('castka', 'Kolik potřebujete?', 300000, 20000, 2500000, 10000, 'Kč', id, ['20 tis.', '2,5 mil.'])
    + hvBox('mesice', 'Splatnost', 240, 12, 240, 12, 'měs.', id, ['12 měs.', '240 měs.']),
  konsolidace: (id) => hvBox('castka', 'Kolik celkem dlužíte?', 500000, 50000, 3000000, 10000, 'Kč', id, ['50 tis.', '3 mil.'])
    + hvBox('splatka', 'Kolik teď měsíčně splácíte?', 9500, 500, 80000, 100, 'Kč', id, ['500 Kč', '80 tis.'])
    + hvBox('mesice', 'Nová splatnost', 240, 12, 240, 12, 'měs.', id, ['12 měs.', '240 měs.']),
  hypoteka: (id) => hvBox('cena', 'Cena nemovitosti', 5000000, 500000, 30000000, 100000, 'Kč', id, ['0,5 mil.', '30 mil.'], 'hv-slim')
    + hvBox('castka', 'Výše hypotéky', 4000000, 300000, 25000000, 100000, 'Kč', id, ['0,3 mil.', '25 mil.'], 'hv-slim')
    + hvBox('roky', 'Splatnost', 30, 5, 30, 1, 'let', id, ['5 let', '30 let'], 'hv-slim hv-roky')
    + `
<div class="hv-f hv-fix">
  <span class="hv-l" id="fix-${id}">Fixace <small>v letech</small></span>
  <div class="seg" role="radiogroup" aria-labelledby="fix-${id}">
    ${[3, 5, 7, 10].map((y) => `<label><input type="radio" name="fixace" value="${y}"${y === HYPO_FIX_DEFAULT ? ' checked' : ''}><span>${y}</span></label>`).join('')}
  </div>
  <span class="hv-fix-n">Jak dlouho vám banka sazbu podrží.</span>
</div>`,
};
const HV_INIT = { uver: [300000, 240], konsolidace: [500000, 240], hypoteka: [4000000, 360] };
const MIN_RATE = Math.min(...ACTIVE.map((c) => RATES[c.key].our));
const HV_BANKS = new Set(ACTIVE.flatMap((c) => RATES[c.key].banks.map((b) => b[0]))).size;
const hvRes = (c) => {
  const k = c.key, r = RATES[k], [P, n] = HV_INIT[k];
  const pay = pmt(P, r.our, n);
  const worst = Math.max(...r.banks.map(([, x]) => pmt(P, x, n)));
  const second = k === 'konsolidace'
    ? `<p class="hv-diff hv-save" data-hv="uspora">Ušetříte až <b>${kc(9500 - pay)}</b> měsíčně</p>`
    : `<p class="hv-diff">o&nbsp;<b data-out="rozdil">${kc(worst - pay)}</b> měsíčně méně než u&nbsp;nejdražší banky</p>`;
  return `
  <div class="hv-res">
    <div class="hv-res-top">
      <div class="hv-pay"><span class="hv-k">${k === 'konsolidace' ? 'Nová splátka od' : 'Splátka od'}</span><span class="hv-big"><b class="hv-n" data-roll="splatka">${fmt(pay)}</b><i>Kč</i></span></div>
      <div class="hv-rate"><span class="hv-k">Sazba od</span><b data-out="sazba">${pct(r.our)}</b></div>
    </div>
    ${second}
    <button class="btn btn-go" type="submit"><span>${c.cta}</span>${icon('arrow')}</button>
  </div>`;
};
const hvPanel = (c) => {
  const id = 'h-' + c.key;
  return `
<form class="calc hv-calc hv-${c.key}" data-cat="${c.key}" data-slug="${c.slug}" data-mode="home" id="calc-${id}" role="tabpanel" aria-labelledby="tab-${c.key}"${c.key !== ACTIVE[0].key ? ' hidden' : ''} novalidate>
  <div class="hv-main">
    <div class="hv-fields">${HV[c.key](id)}</div>
    <p class="hv-note">${icon('lock')}<span>Nezávazně a&nbsp;zdarma</span><span>Srovnání ${HV_BANKS} bank</span><span>Údaje nikam neposíláme, dokud sami nechcete</span></p>
  </div>
  ${hvRes(c)}
</form>`;
};
const heroV2 = () => `
<section class="hv">
  <div class="hv-bg">
    <picture class="hv-pic">
      <source media="(max-width: 860px)" srcset="/assets/hero-pokoj-m-900.webp">
      <img src="/assets/hero-pokoj-1536.webp" alt="" width="1536" height="1024" fetchpriority="high">
    </picture>
  </div>
  <div class="wrap hv-in">
    <div class="hv-txt">
      <p class="hv-brand">${logoSvg('logo-hero')}</p>
      <h1>Sazba, která<br class="hv-br"> je k&nbsp;vám<br class="hv-br"> <em>prostě&nbsp;fér.</em></h1>
      <div class="hv-perks">
        <ul>${[['coins', 'Bez poplatků'], ['handshake', 'Nezávazně'], ['gauge', 'Rychlá odezva']].map(([i, t]) => `<li>${icon(i)}<span>${t}</span></li>`).join('')}</ul>
        <p><b>Tým FérSazby</b>, ${SITE.clients} spokojených klientů po celé ČR</p>
      </div>
    </div>
    <div class="hv-card" id="spocitat">
      <div class="hv-tabs tabs" role="tablist" aria-label="Co chcete spočítat">
        ${ACTIVE.map((c, i) => `<button type="button" role="tab" id="tab-${c.key}" aria-controls="calc-h-${c.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${c.key}">${icon(c.icon)}<span class="hv-tn"><span class="hv-tl">${c.name}</span><span class="hv-ts">${c.short}</span></span><span class="hv-tr">od ${pct(RATES[c.key].our)}</span></button>`).join('')}
      </div>
      <div class="hv-body">
        ${ACTIVE.map(hvPanel).join('')}
      </div>
    </div>
  </div>
</section>`;

// ---------- sdílené sekce ----------
const STEPS = [
  ['Spočítejte si to', 'Kalkulačka hned ukáže, jak vychází splátka u jednotlivých bank.'],
  ['Vyplňte pár údajů', 'Stačí základní informace, abychom věděli, s čím vám můžeme pomoct.'],
  ['Ozveme se vám', 'Probereme vaši situaci a vyjednáme u bank tu nejlepší sazbu.'],
  ['Vyřídíme to za vás', 'Podklady, žádost i komunikace s bankou. Provedeme vás celým procesem.'],
  ['Hlídáme to dál', 'Až se objeví výhodnější nabídka nebo končí fixace, ozveme se sami.'],
];
const steps = () => `
<section class="sec steps" id="jak-to-funguje">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow">Jak to funguje</p>
      <h2 class="h2">Od kalkulačky k&nbsp;podpisu<br>v&nbsp;pěti krocích</h2>
    </div>
    <ol class="road">
      ${STEPS.map(([h, p], i) => `<li><span class="road-n">${String(i + 1).padStart(2, '0')}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}
    </ol>
  </div>
</section>`;

// Loga bank a spořitelen, se kterými tým spolupracuje (Denisa 27. 11., obrázek + Trinity, Zonky, Cofidis, RSTS, Buřinka).
// [soubor, název, výška v px]: výšky vyrovnávají vizuální váhu log, ne jejich rámeček.
const BANK_LOGOS = [
  ['kb.svg', 'Komerční banka', 34], ['csob.svg', 'ČSOB', 42], ['raiffeisenbank.svg', 'Raiffeisenbank', 36],
  ['ceska-sporitelna.webp', 'Česká spořitelna', 46], ['mbank.svg', 'mBank', 34], ['oberbank.svg', 'Oberbank', 30],
  ['unicredit.svg', 'UniCredit Bank', 25], ['csob-hypotecni-banka.svg', 'ČSOB Hypoteční banka', 46],
  ['trinity-bank.svg', 'Trinity Bank', 14], ['zonky.svg', 'Zonky', 28], ['cofidis.svg', 'Cofidis', 28],
  ['raiffeisen-stavebni-sporitelna.svg', 'Raiffeisen stavební spořitelna', 34], ['burinka.svg', 'Stavební spořitelna České spořitelny – Buřinka', 46],
];
const bankLogos = () => `
<section class="banky" aria-labelledby="banky-h">
  <div class="wrap banky-in">
    <h2 class="banky-h" id="banky-h">Spolupracujeme s&nbsp;${BANK_LOGOS.length} bankami a&nbsp;spořitelnami</h2>
    <ul class="banky-list">${BANK_LOGOS.map(([f, n, h]) => `<li><img src="/assets/banky/${f}" alt="${n}" title="${n}" style="height:${h}px" loading="lazy" decoding="async"></li>`).join('')}</ul>
  </div>
</section>`;

// Kdo za tím stojí: místo Denisiny fotky tým po celé ČR (Denisa 27. 11.: mapa, místo fotek poradců logo FérSazby).
const MAPA = JSON.parse(readFileSync(new URL('./mapa-cr.json', import.meta.url)));
const mapSection = () => `
<section class="sec tm" id="kdo-za-tim-stoji">
  <div class="wrap tm-grid">
    <div class="tm-txt">
      <p class="eyebrow eyebrow-light">Kdo za tím stojí</p>
      <h2 class="h2">Tým poradců<br>po celé <em>republice</em></h2>
      <p>Za FérSazby stojí tým finančních poradců, kteří srovnávají nabídky bank za vás. Je jedno, jestli bydlíte v&nbsp;Praze, nebo na malé vesnici. Ozveme se vám, probereme vaši situaci a celou žádost vyřídíme za vás.</p>
      <dl class="tm-stats">
        <div><dt>${SITE.clients.replace('+', '<small>+</small>')}</dt><dd>spokojených klientů</dd></div>
        <div><dt>${SITE.volume.replace('+', '<small>+</small>')}</dt><dd>Kč v&nbsp;úvěrech, konsolidacích a&nbsp;hypotékách</dd></div>
        <div><dt>${BANK_LOGOS.length}</dt><dd>bank a&nbsp;spořitelen</dd></div>
      </dl>
    </div>
    <figure class="tm-map">
      <svg viewBox="0 0 ${MAPA.w} ${MAPA.h}" role="img" aria-label="Mapa České republiky s poradci FérSazby ve všech krajích">
        <g class="tm-kraje">${MAPA.paths.map((p) => `<path d="${p.d}"/>`).join('')}</g>
        <g class="tm-pins">${MAPA.cities.map((c, i) => `<g class="tm-pin" style="--d:${(i * 0.21).toFixed(2)}s" transform="translate(${c.x} ${c.y})"><circle class="tm-pulse" r="22"/><circle class="tm-dot" r="22"/><use href="#logo-mark" x="-12" y="-12" width="24" height="24"/></g>`).join('')}</g>
      </svg>
      <figcaption>Působíme po celé České republice</figcaption>
    </figure>
  </div>
</section>`;

// Otázky a pořadí přesně podle Denisy (WhatsApp 27. 11. 2026), stejné na úvodu i podstránkách.
const FAQ = [
  ['Kolik mě srovnání a poradenství stojí?', 'Nic. Srovnání nabídek i poradenství je pro vás zdarma a nezávazné. Odměnu nám platí banka, se kterou smlouvu nakonec uzavřete.'],
  ['Zavazuje mě vyplnění formuláře k něčemu?', 'Ne, je zcela nezávazné. Poslouží jen k orientačnímu porovnání možností podle vaší situace.'],
  ['Proč po mně chcete ověřovací SMS?', 'Kód ověří, že telefon je opravdu váš a že poptávku posíláte vy. Díky tomu se vám ozveme my, ne nikdo cizí, a nikdo jiný nemůže vaším jménem nic poslat.'],
  ['Jsou sazby v kalkulačce konečné?', 'Jsou orientační. Konečnou sazbu stanoví banka podle vašich příjmů, výdajů a dalších okolností. Naším úkolem je vyjednat co nejlepší podmínky.'],
  ['Jak rychle se mi ozvete a jak to celé probíhá?', 'Obvykle do 24 hodin v pracovní dny. Krátce probereme situaci, porovnáme nabídky a při zájmu pomůžeme s vyřízením.'],
  ['Musím někam jezdit podepisovat do banky?', 'Nemusíte, většinu zvládneme pohodlně online.'],
  ['Co se děje po sjednání úvěru nebo hypotéky?', 'Jsme k dispozici i dál, třeba při dotazech ke splátkám, pojištění nebo při budoucím refinancování.'],
  ['Na co si můžu úvěr vzít?', 'Spotřebitelský úvěr typicky na cokoliv: neúčelově pro vaši potřebu, na rekonstrukci, auto, vybavení nebo cesty. Hypotéku na bydlení, tedy na nemovitost.'],
  ['Co všechno můžu sloučit?', 'Spotřebitelské úvěry, kreditní karty, kontokorenty i půjčky od nebankovních společností. Výsledkem je jedna splátka u jedné banky.'],
  ['Co když mi v bance zamítli úvěr, půjde to u vás řešit?', 'Ano, u nás již zamítnutý úvěr v bance není žádným problémem.'],
  ['Co když vím, že nemám dostatečný příjem?', 'I s tímto si poradíme. Známe metodiky jednotlivých bank, které příjmy i výdaje započítávají různě, a prověříme, kde to lze nastavit tak, aby žádost dávala smysl.'],
  ['Je možná delší splatnost u spotřebitelského úvěru více než 10 let?', 'Ano, ve většině případů to je možné, ale posoudíme možnosti podle vaší situace.'],
];

const faq = (key) => `
<section class="sec faq" id="caste-dotazy">
  <div class="wrap faq-grid">
    <div><p class="eyebrow">Časté dotazy</p><h2 class="h2">Na co se lidé ptají</h2><p class="faq-side">Nenašli jste odpověď? <a href="${key === 'home' ? '' : '/'}#kontakt">Napište nám</a> a ozveme se.</p></div>
    <div class="faq-list">
      ${FAQ.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true"></span></summary><p>${a}</p></details>`).join('')}
    </div>
  </div>
</section>`;

// Pruh na konci podstránek: jen cesta na krátký formulář, bez telefonu (Denisa 27. 11.).
const contactBand = (tema = '') => `
<section class="cband">
  <div class="wrap cband-in">
    <div>
      <p class="cband-h">Raději se nejdřív na něco zeptat?</p>
      <p class="cband-p">Napište pár slov a&nbsp;ozveme se vám.</p>
    </div>
    <a class="btn cband-btn" href="/${tema ? '?tema=' + tema : ''}#kontakt">${icon('send')}<span>Napsat přes Kontakt</span></a>
  </div>
</section>`;

// ---------- recenze ----------
const CAT_LABEL = { uver: 'Úvěr', konsolidace: 'Konsolidace', hypoteka: 'Hypotéka' };
const reviewCard = (r) => `
<article class="rv-card" data-cat="${r.cat}">
  <p class="rv-tag">${CAT_LABEL[r.cat]}</p>
  <h3>${esc(r.title)}</h3>
  <blockquote><p>${esc(r.text)}</p></blockquote>
  <button type="button" class="rv-more" hidden aria-expanded="false">Celý příběh</button>
  <footer><span class="rv-av" aria-hidden="true">${initials(r.name)}</span><cite>${esc(r.name)}</cite></footer>
</article>`;

const reviews = (cat) => {
  const list = cat ? REVIEWS.filter((r) => r.cat === cat) : REVIEWS;
  const counts = Object.fromEntries(Object.keys(CAT_LABEL).map((k) => [k, REVIEWS.filter((r) => r.cat === k).length]));
  const hd = cat
    ? { h: CONTENT[cat]?.reviewsH || 'Co říkají klienti', p: `${list.length} příběhů lidí, kteří to řešili před vámi.` }
    : { h: 'Lidé, kterým se <span class="u">ulevilo</span>', p: `${REVIEWS.length} příběhů klientů. Vyberte si, co řešíte vy.` };
  return `
<section class="sec rv" id="recenze">
  <div class="wrap">
    <div class="rv-head">
      <div>
        <p class="eyebrow eyebrow-ink">Recenze klientů</p>
        <h2 class="h2">${hd.h}</h2>
      </div>
      <div class="rv-side">
        <p>${hd.p}</p>
        <div class="rv-nav"><button type="button" class="rv-arr" data-dir="-1" aria-label="Předchozí recenze">${icon('back')}</button><button type="button" class="rv-arr" data-dir="1" aria-label="Další recenze">${icon('arrow')}</button></div>
      </div>
    </div>
    ${cat ? '' : `<div class="rv-filter" role="group" aria-label="Filtrovat recenze">
      <button type="button" aria-pressed="true" data-f="">Všechny <small>${REVIEWS.length}</small></button>
      ${Object.entries(CAT_LABEL).map(([k, l]) => `<button type="button" aria-pressed="false" data-f="${k}">${l} <small>${counts[k]}</small></button>`).join('')}
    </div>`}
  </div>
  <div class="rv-rail" tabindex="0" role="region" aria-label="Recenze, posouvejte do strany">
    ${list.map(reviewCard).join('')}
  </div>
  <div class="wrap"><div class="rv-bar" aria-hidden="true"><span></span></div></div>
</section>`;
};

// ---------- formulář poptávky ----------
const yesno = (name, q) => `
<fieldset class="yn"><legend>${q}</legend>
  <label><input type="radio" name="${name}" value="Ano" required><span>Ano</span></label>
  <label><input type="radio" name="${name}" value="Ne" required><span>Ne</span></label>
</fieldset>`;
const pick = (name, label, opts, req = true) => `
<fieldset class="pick"><legend>${label}</legend>
  ${opts.map((o) => `<label><input type="radio" name="${name}" value="${o}"${req ? ' required' : ''}><span>${o}</span></label>`).join('')}
</fieldset>`;

const leadExtra = {
  uver: () => `${yesno('exekuce', 'Máte nebo měl/a jste někdy exekuci?')}${yesno('registr', 'Máte negativní záznam v registru dlužníků?')}${yesno('prodleni', 'Jste nebo byl/a jste v prodlení se splácením?')}`,
  konsolidace: () => `${yesno('kratkodoby', 'Máte nebankovní půjčku se splatností v příštím měsíci?')}${yesno('exekuce', 'Měl/a jste v posledních 5 letech exekuci nebo insolvenci?')}${yesno('prodleni', 'Jste teď v prodlení se splácením?')}`,
  hypoteka: () => `${pick('nemovitost', 'Typ nemovitosti', ['Byt', 'Rodinný dům', 'Pozemek'])}${pick('ucel', 'Účel hypotéky', ['Koupě', 'Stavba', 'Rekonstrukce', 'Refinancování', 'Americká hypotéka', 'Vypořádání'])}${yesno('exekuce', 'Měl/a jste v posledních 5 letech exekuci nebo insolvenci?')}`,
};

// c = kategorie podstránky; na úvodu (c = null) si klient službu vybere a doplňující otázky se přepnou.
const leadForm = (c) => {
  const multi = !c, first = c || ACTIVE[0];
  const extra = multi
    ? ACTIVE.map((x) => `<div class="lead-extra" data-for-cat="${x.key}"${x.key === first.key ? '' : ' hidden'}><fieldset class="lead-extra-in"${x.key === first.key ? '' : ' disabled'}>${leadExtra[x.key]()}</fieldset></div>`).join('')
    : leadExtra[c.key]();
  return `
<section class="sec lead" id="formular">
  <div class="wrap lead-grid">
    <div class="lead-side">
      <p class="eyebrow">Poslední krok</p>
      <h2 class="h2">Vyjednáme vám<br>tu nejlepší sazbu</h2>
      <p>S těmito údaji lépe pochopíme vaši situaci a můžeme rovnou začít srovnávat nabídky.</p>
      <ul class="ticks">
        <li>${icon('check')} Nezávazně a zdarma</li>
        <li>${icon('check')} Bez zbytečných poplatků</li>
        <li>${icon('check')} Údaje chráníme podle zákona GDPR</li>
      </ul>
    </div>
    <div class="lead-card">
      <form class="lead-form" data-cat="${first.key}" novalidate>
        <input type="hidden" name="kategorie" value="${first.name}">
        ${multi ? `<fieldset class="pick lead-cat"><legend>Co řešíte?</legend>
          ${ACTIVE.map((x) => `<label><input type="radio" name="sluzba" value="${x.key}" data-name="${x.name}"${x.key === first.key ? ' checked' : ''}><span>${icon(x.icon)}${x.name}</span></label>`).join('')}
        </fieldset>` : ''}
        <div class="lead-summary" data-summary hidden></div>
        <div class="fld-2">
          <div class="fld"><label class="fld-l" for="jmeno">Jméno</label><input class="txt" id="jmeno" name="jmeno" autocomplete="given-name" required></div>
          <div class="fld"><label class="fld-l" for="prijmeni">Příjmení</label><input class="txt" id="prijmeni" name="prijmeni" autocomplete="family-name" required></div>
        </div>
        <div class="fld-2">
          <div class="fld"><label class="fld-l" for="email">E-mail</label><input class="txt" id="email" name="email" type="email" autocomplete="email" required></div>
          <div class="fld"><label class="fld-l" for="telefon">Mobil</label><input class="txt" id="telefon" name="telefon" type="tel" autocomplete="tel" inputmode="tel" placeholder="777 123 456" required></div>
        </div>
        <div class="fld"><label class="fld-l" for="prijem">Čistý měsíční příjem</label><div class="money money-plain"><input class="money-in" id="prijem" name="prijem" type="text" inputmode="numeric" required placeholder="35 000"><span class="money-u">Kč</span></div></div>
        ${pick('zdroj', 'Zdroj příjmů', ['Zaměstnání', 'OSVČ', 'Jiné'])}
        ${extra}
        ${pick('bydleni', 'Současné bydlení', ['Vlastní', 'Nájem', 'Jiné'])}
        <input type="text" name="firma" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="consent"><input type="checkbox" name="souhlas" required><span>Souhlasím se <a href="/ochrana-osobnich-udaju" target="_blank">zpracováním osobních údajů</a> za účelem nezávazné nabídky.</span></label>
        <p class="form-err" role="alert" hidden></p>
        <button class="btn btn-go btn-wide" type="submit"><span>Chci nejlepší sazbu</span>${icon('arrow')}</button>
        <p class="form-fine">Na mobil vám pošleme ověřovací kód. Poptávka odejde až po jeho zadání.</p>
      </form>

      <form class="sms-form" hidden novalidate>
        <div class="sms-ic">${icon('lock')}</div>
        <h3>Opište kód z SMS</h3>
        <p>Poslali jsme ho na číslo <b data-sms-phone></b>. <button type="button" class="link" data-sms-back>Změnit číslo</button></p>
        <div class="otp">
          <input name="kod" inputmode="numeric" autocomplete="one-time-code" maxlength="4" pattern="[0-9]{4}" aria-label="Kód z SMS" required>
        </div>
        <p class="sms-dev" hidden></p>
        <p class="form-err" role="alert" hidden></p>
        <button class="btn btn-go btn-wide" type="submit"><span>Ověřit a odeslat</span>${icon('arrow')}</button>
        <p class="form-fine"><button type="button" class="link" data-sms-resend disabled>Poslat kód znovu</button></p>
      </form>

      <div class="done" hidden tabindex="-1">
        <div class="done-ic">${icon('check')}</div>
        <h3>Hotovo, děkujeme!</h3>
        <p>Poptávka je ověřená a máme ji u sebe. Ozveme se vám co nejdříve.</p>
        <p class="done-sign">Tým FérSazby</p>
      </div>
    </div>
  </div>
</section>`;
};

// ---------- srovnání nabídek ----------
const offers = (c) => `
<section class="sec offers${c.home ? ' offers-home' : ''}" id="nabidky">
  <div class="wrap">
    <div class="offers-head">
      <div>
        <p class="eyebrow">Srovnání nabídek</p>
        <h2 class="h2">Kolik byste platili<br>u jednotlivých bank</h2>
      </div>
      <p class="offers-for" data-offers-for></p>
    </div>
    <div class="offers-grid">
      <article class="offer-ours">
        <p class="offer-tag" data-o="tag">${c.home ? c.name : 'Fér sazba'}</p>
        <p class="offer-rate"><span data-o="our-rate">${pct(RATES[c.key].our)}</span><small>úroková sazba od</small></p>
        <p class="offer-pay"><span>Měsíční splátka od</span><b data-o="our-pay">—</b></p>
        <p class="offer-diff" data-o="our-save"></p>
        <a class="btn btn-go" href="#formular"><span>Mám zájem o fér sazbu</span>${icon('arrow')}</a>
      </article>
      <div class="offer-box">
        <div class="offer-legend" aria-hidden="true"><span class="lg-base">Splátka s fér sazbou</span><span class="lg-over">Co byste u banky platili navíc</span></div>
        <ol class="offer-list" data-o="list"></ol>
        <button type="button" class="offer-more" data-o="more" hidden>Ukázat všechny banky</button>
      </div>
    </div>
    <p class="fine">Uvedené informace jsou pouze orientační. Konečné parametry se mohou lišit v závislosti na vaší schopnosti splácet a dalších podmínkách. Sazby bank jsou převzaté z veřejných nabídek.</p>
  </div>
</section>`;

// ---------- pruh s čísly (prvek šablony money2u) ----------
const statBand = (c) => `
<section class="stats" aria-label="FérSazby v číslech">
  <div class="wrap stats-in">
    <div><b>${pct(RATES[c.key].our).replace(' %', '<small>%</small>')}</b><span>sazba od</span></div>
    <div><b>${RATES[c.key].banks.length}</b><span>bank ve srovnání</span></div>
    <div><b>${SITE.clients.replace('+', '<small>+</small>')}</b><span>spokojených klientů</span></div>
    <div><b>${SITE.volume.replace('+', '<small>+</small>')}</b><span>Kč v&nbsp;úvěrech a&nbsp;hypotékách</span></div>
  </div>
</section>`;

const usesGrid = (c, u) => `
    <div class="uses-grid">
      ${u.items.map((it, i) => {
        const n = it.roky ? it.roky * 12 : it.mesice;
        return `
      <article class="flip" data-castka="${it.castka}" ${it.roky ? `data-roky="${it.roky}"` : `data-mesice="${it.mesice}"`}>
        <div class="flip-in">
          <div class="flip-front">
            <div class="flip-top"><span class="flip-ic">${icon(it.icon)}</span><span class="flip-n">0${i + 1}</span></div>
            <h3>${it.name}</h3>
            <p>${it.front}</p>
            <button type="button" class="flip-go" aria-expanded="false">Otočit${icon('flip')}</button>
          </div>
          <div class="flip-back" aria-hidden="true" inert>
            <p class="flip-k">Třeba takhle</p>
            <p class="flip-sum">${fmt(it.castka)}&nbsp;Kč <span>na ${it.roky ? it.roky + ' let' : it.mesice + ' měsíců'}</span></p>
            <p class="flip-pay"><span>splátka od</span>${kc(pmt(it.castka, RATES[c.key].our, n))}</p>
            <p class="flip-txt">${it.back}</p>
            <div class="flip-act">
              <button type="button" class="flip-calc">${CONTENT[c.key]?.flipCta || 'Spočítat moje číslo'}${icon('arrow')}</button>
              <button type="button" class="flip-close" aria-label="Otočit zpět">${icon('x')}</button>
            </div>
          </div>
        </div>
      </article>`;
      }).join('')}
    </div>`;

// ---------- na co to bude (otočné karty, prvek šablony money2u) ----------
const uses = (c) => {
  const u = CONTENT[c.key]?.uses; if (!u) return '';
  return `
<section class="sec uses" id="na-co">
  <div class="wrap">
    <div class="sec-head sec-head-split">
      <div>
        <p class="eyebrow">${u.kicker}</p>
        <h2 class="h2">${u.h}</h2>
      </div>
      <p class="sec-lead">${u.p}</p>
    </div>
    ${usesGrid(c, u)}
  </div>
</section>`;
};

// ---------- sami v bance × s FérSazby ----------
const versus = (c) => `
<section class="sec vs" id="proc-fersazby">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow eyebrow-light">Proč přes FérSazby</p>
      <h2 class="h2">Sami na pobočce,<br>nebo <em>s námi</em>?</h2>
    </div>
    <div class="vs-table" role="table" aria-label="Srovnání: sami v bance a s FérSazby">
      <div class="vs-row vs-top" role="row"><span role="columnheader" class="vs-k"><span class="sr">Co</span></span><span role="columnheader" class="vs-a">Sami v bance</span><span role="columnheader" class="vs-b">S FérSazby</span></div>
      ${(CONTENT[c.key]?.versus || CONTENT.versus).map(([k, a, b]) => `<div class="vs-row" role="row"><span role="rowheader" class="vs-k">${k}</span><span role="cell" class="vs-a">${icon('x')}<span>${a}</span></span><span role="cell" class="vs-b">${icon('check')}<span>${b.replace('%RATE%', pct(c.home ? MIN_RATE : RATES[c.key].our))}</span></span></div>`).join('')}
    </div>
  </div>
</section>`;

// ---------- citace v úvodu podstránky ----------
const heroQuote = (c) => {
  const q = CONTENT[c.key]?.heroQuote; if (!q) return '';
  return `<figure class="hq"><span class="rv-av" aria-hidden="true">${initials(q.name)}</span><div><blockquote><p>${q.text}</p></blockquote><figcaption>${q.name} · <a href="#recenze">další recenze</a></figcaption></div></figure>`;
};

// ---------- úvodní stránka: sekce služeb (jedna stránka, menu sjíždí sem) ----------
const EX = {
  uver: () => `Úvěr 300&nbsp;000&nbsp;Kč na 10 let: splátka od <b>${kc(pmt(300000, RATES.uver.our, 120))}</b>`,
  konsolidace: () => `Dluh 500&nbsp;000&nbsp;Kč, dnes splácíte 9&nbsp;500&nbsp;Kč: nově od <b>${kc(pmt(500000, RATES.konsolidace.our, 120))}</b>`,
  hypoteka: () => `Hypotéka 4&nbsp;mil.&nbsp;Kč na 30 let: splátka od <b>${kc(pmt(4000000, RATES.hypoteka.our, 360))}</b>`,
};
const catSection = (c, i) => {
  const u = CONTENT[c.key]?.uses;
  return `
<section class="sec svc svc-${c.key}${i % 2 ? ' svc-flip' : ''}" id="${c.anchor}" data-cat="${c.key}">
  <div class="wrap">
    <div class="svc-head">
      <figure class="svc-img"><picture><source media="(max-width: 700px)" srcset="/assets/${c.photo}-700.webp"><img src="/assets/${c.photo}-1200.webp" alt="" loading="lazy" width="1200" height="900"></picture>
        <figcaption class="svc-rate"><span>sazba od</span><b>${pct(RATES[c.key].our)}</b></figcaption>
      </figure>
      <div class="svc-txt">
        <p class="eyebrow"><span class="svc-n">0${i + 1}</span>${c.name}</p>
        <h2 class="h2">${c.h1}</h2>
        <p class="svc-lead">${c.lead}</p>
        <p class="svc-ex">${EX[c.key]()}</p>
        <a class="btn btn-go svc-go" href="#spocitat" data-pick="${c.key}"><span>${c.cta}</span>${icon('arrow')}</a>
      </div>
    </div>
    ${u ? `<div class="svc-uses">
      <div class="svc-uses-h"><h3>${u.h.replace(/<br>/g, ' ')}</h3><p>${u.p}</p></div>
      ${usesGrid(c, u)}
    </div>` : ''}
  </div>
</section>`;
};

const ld = () => `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'FinancialService', '@id': SITE.url + '/#sluzba', name: SITE.name, url: SITE.url, email: SITE.email, telephone: SITE.phone, areaServed: 'CZ',
      description: 'Srovnání nových úvěrů, konsolidací a hypoték.' },
  ],
})}</script>`;

// Jedna stránka (Denisa 27. 11.): kalkulačka → srovnání bank → poptávka, pak služby, recenze, tým, dotazy a kontakt.
const home = () => typo(`${head({ title: 'FérSazby.cz | Úvěr, konsolidace a hypotéka za fér sazbu', desc: `Spočítejte si úvěr, konsolidaci nebo hypotéku a podívejte se, kolik byste platili u jednotlivých bank. Fér sazba od ${pct(MIN_RATE)}.`, path: '/', extraHead: ld() + '\n<link rel="preload" as="image" href="/assets/hero-pokoj-1536.webp" media="(min-width: 861px)">\n<link rel="preload" as="image" href="/assets/hero-pokoj-m-900.webp" media="(max-width: 860px)">' })}
<body class="pg-home">
${header('', false, true)}
<main id="obsah">
  ${heroV2()}
  ${bankLogos()}
  ${offers({ ...ACTIVE[0], home: true })}
  ${leadForm(null)}
  ${ACTIVE.map(catSection).join('')}
  ${versus({ key: 'home', home: true })}
  ${reviews()}
  ${steps()}
  ${mapSection()}
  ${faq('home')}
  ${contactSection(true)}
</main>
${footer(true)}
${scripts()}`);

// ---------- stránka kategorie ----------
const catPage = (c) => typo(`${head({ title: c.title, desc: c.desc, path: '/' + c.slug })}
<body class="pg-cat pg-${c.key}">
${header(c.key)}
<main id="obsah">
  <section class="phero">
    <div class="phero-bg" style="--img:url(/assets/${c.photo}-1200.webp)" aria-hidden="true"></div>
    <div class="wrap phero-in">
      <div class="phero-txt">
        <nav class="crumbs" aria-label="Drobečková navigace"><a href="/">FérSazby</a><span>/</span><span aria-current="page">${c.name}</span></nav>
        <h1>${c.h1}</h1>
        <p class="hero-lead">${c.lead}</p>
        <ul class="ticks ticks-light">
          <li>${icon('check')} Srovnání bank zdarma</li>
          <li>${icon('check')} Vyjednáme lepší podmínky</li>
          <li>${icon('check')} Vyřídíme to za vás</li>
        </ul>
        ${heroQuote(c)}
      </div>
      <div class="calc-card calc-card-single" id="kalkulacka">
        <p class="calc-title">${icon(c.icon)} ${c.cta}</p>
        ${calcPanel(c, 'p', 'page')}
      </div>
    </div>
  </section>
  ${statBand(c)}
  ${offers(c)}
  ${reviews(c.key)}
  ${leadForm(c)}
  ${uses(c)}
  ${versus(c)}
  ${steps()}
  ${faq(c.key)}
  ${contactBand(c.key)}
</main>
${footer()}
${scripts()}`);

// ---------- kontakt (sekce na úvodu, stejná i na /kontakt) ----------
const TEMATA = [['uver', 'Nový úvěr', 'wallet'], ['konsolidace', 'Konsolidace', 'layers'], ['hypoteka', 'Hypotéka', 'home'], ['jine', 'Něco jiného', 'chat']];
const contactSection = (home) => `
  <section class="kt" id="kontakt">
    <div class="wrap kt-grid">
      <div class="kt-txt">
        <p class="eyebrow eyebrow-light">Kontakt</p>
        ${home ? '<h2 class="kt-h">' : '<h1>'}Napište, s čím<br><em>potřebujete pomoct</em>${home ? '</h2>' : '</h1>'}
        <p class="kt-lead">Čtyři políčka a jedno tlačítko. Zpráva nám přijde rovnou do mailu a ozveme se vám. Žádný e-mail si psát nemusíte.</p>
        <ul class="kt-ticks">
          <li>${icon('check')} Ozveme se vám co nejdříve</li>
          <li>${icon('check')} Nezávazně a zdarma</li>
          <li>${icon('mail')} Raději e-mailem? <a href="mailto:${SITE.email}">${SITE.email}</a></li>
        </ul>
      </div>
      <div class="kt-card">
        <form class="kt-form" novalidate>
          <div class="fld"><label class="fld-l" for="k-jmeno">Jméno a příjmení</label><input class="txt" id="k-jmeno" name="jmeno" autocomplete="name" required></div>
          <div class="fld-2">
            <div class="fld"><label class="fld-l" for="k-email">E-mail</label><input class="txt" id="k-email" name="email" type="email" autocomplete="email" inputmode="email" required></div>
            <div class="fld"><label class="fld-l" for="k-tel">Telefon</label><input class="txt" id="k-tel" name="telefon" type="tel" autocomplete="tel" inputmode="tel" placeholder="777 123 456" required></div>
          </div>
          <fieldset class="kt-topics"><legend>S čím potřebujete pomoct?</legend>
            ${TEMATA.map(([v, l, ic]) => `<label><input type="radio" name="tema" value="${v}" required><span>${icon(ic)}${l}</span></label>`).join('')}
          </fieldset>
          <div class="fld"><label class="fld-l" for="k-zprava">Chcete něco dodat? <small>(nepovinné)</small></label><textarea class="txt" id="k-zprava" name="zprava" rows="3" maxlength="2000" placeholder="Třeba kolik potřebujete nebo kdy se vám hodí zavolat"></textarea></div>
          <input type="text" name="firma" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="form-err" role="alert" hidden></p>
          <button class="btn btn-go btn-wide" type="submit"><span>Odeslat</span>${icon('send')}</button>
          <p class="form-fine">Odesláním souhlasíte, že vás kvůli zprávě kontaktujeme. <a href="/ochrana-osobnich-udaju">Jak nakládáme s osobními údaji</a></p>
        </form>
        <div class="done kt-done" hidden tabindex="-1">
          <div class="done-ic">${icon('check')}</div>
          <h2>Děkujeme, zprávu máme</h2>
          <p>Ozveme se vám co nejdříve na <b data-kt-mail></b> nebo na telefon.</p>
          <p class="done-sign">Tým FérSazby</p>
          <a class="link" href="${home ? '' : '/'}#spocitat">Zpět na kalkulačky</a>
        </div>
      </div>
    </div>
  </section>`;
const contactPage = () => typo(`${head({ title: 'Kontakt | FérSazby.cz', desc: 'Napište nám, s čím potřebujete pomoct. Krátký formulář, zpráva přijde rovnou na info@fersazby.cz.', path: '/kontakt' })}
<body class="pg-kontakt">
${header('kontakt', true)}
<main id="obsah">
${contactSection(false)}
</main>
${footer()}
${scripts()}`);

// Údaje o zprostředkovateli sem přesunuté z patičky (Denisa 27. 11.). Správce musí být jmenovitě uvedený (GDPR).
const privacy = () => typo(`${head({ title: 'Ochrana osobních údajů | FérSazby.cz', desc: 'Jak zpracováváme osobní údaje z formulářů na webu FérSazby a kdo službu zprostředkovává.', path: '/ochrana-osobnich-udaju' })}
<body class="pg-text">
${header('', true)}
<main id="obsah" class="sec text-page"><div class="wrap narrow">
<h1 class="h2">Ochrana osobních údajů</h1>
<p>Správcem osobních údajů je ${SITE.person}, IČ ${SITE.ico}, provozovatelka webu FérSazby.cz, e-mail <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
<h2>Jaké údaje a proč</h2>
<p>Z formulářů na tomto webu zpracováváme jméno, příjmení, e-mail, telefon a údaje, které sami vyplníte (výše úvěru, příjem, informace o bydlení nebo text zprávy). Používáme je jen k tomu, abychom vás kontaktovali a připravili nezávaznou nabídku. Právním základem je opatření před uzavřením smlouvy na vaši žádost a váš souhlas.</p>
<h2>Ověření telefonu</h2>
<p>U poptávky z kalkulačky odešleme na zadané číslo jednorázový kód v SMS. Kód slouží jen k ověření, že poptávku posíláte vy.</p>
<h2>Jak dlouho</h2>
<p>Pokud spolupráce nevznikne, údaje smažeme nejpozději do 12 měsíců. Pokud vznikne, řídí se uchování zákonnými lhůtami pro finanční zprostředkování.</p>
<h2>Komu je předáváme</h2>
<p>Vaši poptávku vyřizuje finanční poradce z našeho týmu. Údaje dále předáváme jen bance, u které o nabídku požádáte, a společnosti ${SITE.represented}, jejímž jménem zprostředkování probíhá. Technicky je zpracovává poskytovatel hostingu, e-mailu a SMS brány.</p>
<h2>Vaše práva</h2>
<p>Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost a odvolání souhlasu. Stačí napsat na <a href="mailto:${SITE.email}">${SITE.email}</a>. Stížnost můžete podat u Úřadu pro ochranu osobních údajů (uoou.gov.cz).</p>
<h2 id="zprostredkovatel">Informace o zprostředkovateli</h2>
<p>${SITE.person}, IČ ${SITE.ico}, vázaná zástupkyně společnosti ${SITE.represented} (IČ ${SITE.representedIco}), zapsaná v registru České národní banky. Uvedené sazby a splátky jsou orientační, konečné podmínky stanoví banka podle vaší situace.</p>
</div></main>
${footer()}
${scripts()}`);

writeFileSync(new URL('index.html', OUT), home());
for (const c of ACTIVE) writeFileSync(new URL(c.slug + '.html', OUT), catPage(c));
for (const c of CATS.filter((x) => x.active === false)) { const f = new URL(c.slug + '.html', OUT); if (existsSync(f)) unlinkSync(f); }
writeFileSync(new URL('kontakt.html', OUT), contactPage());
writeFileSync(new URL('ochrana-osobnich-udaju.html', OUT), privacy());
writeFileSync(new URL('404.html', OUT), typo(`${head({ title: 'Stránka nenalezena | FérSazby.cz', desc: 'Tahle stránka neexistuje.', path: '/404', noindex: true })}
<body class="pg-text">
${header('', true)}
<main id="obsah" class="sec text-page"><div class="wrap narrow"><p class="eyebrow">Chyba 404</p><h1 class="h2">Tahle stránka tu není</h1><p>Zkuste začít kalkulačkou na <a href="/">úvodní stránce</a> nebo nám <a href="/#kontakt">napište</a>.</p></div></main>
${footer()}
${scripts()}`));
writeFileSync(new URL('sitemap.xml', OUT), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', ...ACTIVE.map((c) => c.slug), 'kontakt', 'ochrana-osobnich-udaju'].map((p) => `  <url><loc>${SITE.url}/${p}</loc></url>`).join('\n')}
</urlset>
`);
console.log('hotovo', V);
