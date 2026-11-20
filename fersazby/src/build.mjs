// Sestaví statické stránky do public/. Spuštění: node src/build.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { SITE, RATES, CATS } from './data.mjs';

const OUT = new URL('../public/', import.meta.url);
const V = Date.now().toString(36); // cache-busting css/js

// ---------- pomocníci ----------
const pmt = (P, ratePct, n) => { const r = ratePct / 100 / 12; return r ? P * r / (1 - (1 + r) ** -n) : P / n; };
const kc = (x) => Math.round(x).toLocaleString('cs-CZ').replace(/\s/g, ' ') + ' Kč';
const pct = (x) => x.toFixed(2).replace('.', ',') + ' %';
const fmt = (x) => Math.round(x).toLocaleString('cs-CZ').replace(/\s/g, ' ');

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
  check: '<path d="M20 6 9 17l-5-5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

const logo = (cls = '') => `<a href="/" class="logo ${cls}" aria-label="FérSazby, úvod"><span class="logo-fer">fér</span><span class="logo-sazby">sazby</span><span class="logo-dot" aria-hidden="true"></span></a>`;

// ---------- hlava, hlavička, patička ----------
const head = ({ title, desc, path, extraHead = '' }) => `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE.url}${path}">
<meta name="theme-color" content="#0D1F3A">
<meta property="og:type" content="website">
<meta property="og:locale" content="cs_CZ">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE.url}${path}">
<meta property="og:image" content="${SITE.url}/assets/og.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/poppins-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${V}">
${extraHead}
</head>`;

const header = (active = '', solid = false) => `
<a class="skip" href="#obsah">Přeskočit na obsah</a>
<header class="site-head${solid ? ' is-solid' : ''}" id="hlavicka">
  <div class="head-in">
    ${logo()}
    <nav class="head-nav" aria-label="Hlavní nabídka">
      ${CATS.map((c) => `<a href="/${c.slug}"${active === c.key ? ' aria-current="page"' : ''}>${c.short}</a>`).join('')}
    </nav>
    <a class="head-call" href="${SITE.phoneHref}">${icon('phone')}<span>${SITE.phone.replace('+420 ', '')}</span></a>
    <button class="head-burger" type="button" aria-expanded="false" aria-controls="mobmenu" aria-label="Menu"><span></span><span></span></button>
  </div>
  <div class="mobmenu" id="mobmenu" hidden>
    ${CATS.map((c) => `<a href="/${c.slug}">${icon(c.icon)}<span>${c.name}</span>${icon('arrow', 'ic-go')}</a>`).join('')}
    <a class="mobmenu-call" href="${SITE.phoneHref}">${icon('phone')} Zavolat ${SITE.phone.replace('+420 ', '')}</a>
  </div>
</header>`;

const footer = () => `
<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      ${logo('logo-light')}
      <p>Srovnání úvěrů, konsolidací, hypoték a pojištění aut. Za webem stojí ${SITE.person}, ${SITE.personRole}.</p>
    </div>
    <div class="foot-col">
      <h3>Spočítat</h3>
      ${CATS.map((c) => `<a href="/${c.slug}">${c.name}</a>`).join('')}
    </div>
    <div class="foot-col">
      <h3>Kontakt</h3>
      <a href="${SITE.phoneHref}">${SITE.phone}</a>
      <a href="mailto:${SITE.email}">${SITE.email}</a>
      <a href="https://holazova.cz">holazova.cz</a>
    </div>
  </div>
  <div class="wrap foot-legal">
    <p>${SITE.person}, IČ ${SITE.ico}, vázaná zástupkyně společnosti ${SITE.represented} (IČ ${SITE.representedIco}), zapsaná v registru České národní banky. Uvedené sazby a splátky jsou orientační, konečné podmínky stanoví banka nebo pojišťovna podle vaší situace.</p>
    <p><a href="/ochrana-osobnich-udaju">Ochrana osobních údajů</a> · © ${new Date().getFullYear()} ${SITE.name}</p>
  </div>
</footer>`;

const scripts = () => `
<script>window.FS_RATES=${JSON.stringify(RATES)};</script>
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
        ${[3, 5, 7, 10].map((y) => `<label><input type="radio" name="fixace" value="${y}"${y === 5 ? ' checked' : ''}><span>${y} let</span></label>`).join('')}
      </div>
    </div>`,
  auto: () => `
    <div class="fld">
      <span class="fld-l" id="typ-%ID%">Co chcete pojistit?</span>
      <div class="seg seg-3" role="radiogroup" aria-labelledby="typ-%ID%">
        ${['Povinné ručení', 'Havarijní', 'Obojí'].map((t, i) => `<label><input type="radio" name="typ" value="${t}"${i === 2 ? ' checked' : ''}><span>${t}</span></label>`).join('')}
      </div>
    </div>
    <div class="fld-2">
      <div class="fld"><label class="fld-l" for="vuz-%ID%">Značka a model</label><input class="txt" id="vuz-%ID%" name="vuz" placeholder="např. Škoda Octavia" autocomplete="off"></div>
      <div class="fld"><label class="fld-l" for="rok-%ID%">Rok výroby</label><input class="txt" id="rok-%ID%" name="rok" type="number" inputmode="numeric" min="1950" max="2027" placeholder="2019"></div>
    </div>
    <div class="fld"><label class="fld-l" for="konec-%ID%">Kdy vám končí současná pojistka?</label>
      <select class="txt" id="konec-%ID%" name="konec">
        <option value="">Vyberte</option>
        <option>Do měsíce</option><option>Za 1–3 měsíce</option><option>Za více než 3 měsíce</option>
        <option>Nevím</option><option>Auto teprve kupuji</option>
      </select>
    </div>`,
};

const result = (key) => key === 'auto'
  ? `<p class="calc-res calc-res-auto">${icon('shield')} Porovnám pojistné u pojišťoven a pošlu vám nejvýhodnější nabídku.</p>`
  : key === 'konsolidace'
    ? `<div class="calc-res"><div><span>Nová splátka od</span><b data-out="splatka">—</b></div><div class="calc-save"><span>Ušetříte až</span><b data-out="uspora">—</b></div></div>`
    : `<div class="calc-res"><div><span>Splátka od</span><b data-out="splatka">—</b></div><div><span>Sazba od</span><b data-out="sazba">${pct(RATES[key].our)}</b></div></div>`;

const calcPanel = (c, id, mode) => `
<form class="calc" data-cat="${c.key}" data-slug="${c.slug}" data-mode="${mode}" id="calc-${id}" ${mode === 'home' && c.key !== 'uver' ? 'hidden' : ''} novalidate>
  <div class="calc-fields">${calcFields[c.key]().replaceAll('%ID%', id)}</div>
  <div class="calc-side">
  ${result(c.key)}
  <button class="btn btn-go" type="submit"><span>${mode === 'home' ? c.cta : (c.key === 'auto' ? 'Pokračovat k nabídce' : 'Chci vidět nabídky')}</span>${icon('arrow')}</button>
  </div>
</form>`;

const homeCalc = () => `
<div class="calc-card" id="spocitat">
  <div class="tabs" role="tablist" aria-label="Co chcete spočítat">
    ${CATS.map((c, i) => `<button type="button" role="tab" id="tab-${c.key}" aria-controls="calc-h-${c.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${c.key}">${icon(c.icon)}<span>${c.short}</span></button>`).join('')}
  </div>
  ${CATS.map((c) => calcPanel(c, `h-${c.key}`, 'home').replace('<form ', `<form role="tabpanel" aria-labelledby="tab-${c.key}" `)).join('')}
  <p class="calc-note">${icon('lock')} Nezávazně a zdarma. Údaje nikam neposíláme, dokud sami nechcete.</p>
</div>`;

// ---------- sdílené sekce ----------
const steps = () => `
<section class="sec steps" id="jak-to-funguje">
  <div class="wrap">
    <p class="eyebrow">Jak to funguje</p>
    <h2 class="h2">Od kalkulačky k&nbsp;podpisu<br>v&nbsp;pěti krocích</h2>
    <ol class="steps-list">
      ${[
        ['Spočítejte si to', 'Kalkulačka vám hned ukáže, jak vychází splátka u jednotlivých bank.'],
        ['Vyplňte pár údajů', 'Stačí základní informace, abych věděla, s čím vám můžu pomoct.'],
        ['Ozvu se vám', 'Probereme vaši situaci a vyjednám u bank tu nejlepší sazbu.'],
        ['Vyřídím to za vás', 'Podklady, žádost, komunikace s bankou. Provedu vás celým procesem.'],
        ['Hlídám to dál', 'Až se objeví výhodnější nabídka nebo končí fixace, ozvu se sama.'],
      ].map(([h, p], i) => `<li><span class="step-n">${String(i + 1).padStart(2, '0')}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}
    </ol>
  </div>
</section>`;

const about = () => `
<section class="sec about" id="kdo-za-tim-stoji">
  <div class="wrap about-grid">
    <figure class="about-photo">
      <img src="/assets/denisa-holazova-portret-800.webp" srcset="/assets/denisa-holazova-portret-500.webp 500w, /assets/denisa-holazova-portret-800.webp 800w, /assets/denisa-holazova-portret-1400.webp 1400w" sizes="(max-width: 860px) 90vw, 440px" alt="Denisa Holazová, finanční poradkyně" loading="lazy" width="800" height="1000">
      <figcaption><b>${SITE.person}</b><span>${SITE.personRole}</span></figcaption>
    </figure>
    <div class="about-txt">
      <p class="eyebrow eyebrow-light">Kdo za tím stojí</p>
      <h2 class="h2">Za každou sazbou<br>je skutečný člověk</h2>
      <p>Jmenuji se Denisa Holazová a finančnímu poradenství se věnuji od roku 2013. Pomohla jsem stovkám klientů s&nbsp;prvním bydlením, s&nbsp;nevýhodnými úvěry i&nbsp;se zajištěním rodiny.</p>
      <p>FérSazby jsem založila, abyste nemuseli obíhat pobočky a číst stostránkové podmínky. Srovnám nabídky bank, vyjednám sazbu a papírování beru na sebe.</p>
      <dl class="about-stats">
        <div><dt>15+</dt><dd>let praxe</dd></div>
        <div><dt>850+</dt><dd>spokojených klientů</dd></div>
        <div><dt>10</dt><dd>bank ve srovnání</dd></div>
      </dl>
      <a class="btn btn-ghost-light" href="${SITE.phoneHref}">${icon('phone')}<span>Zavolejte mi: ${SITE.phone.replace('+420 ', '')}</span></a>
    </div>
  </div>
</section>`;

const faqData = {
  common: [
    ['Kolik mě srovnání a poradenství stojí?', 'Nic. Srovnání nabídek i poradenství je pro vás zdarma a nezávazné. Odměnu mi platí banka nebo pojišťovna, se kterou smlouvu nakonec uzavřete.'],
    ['Proč po mně chcete ověřovací SMS?', 'Kód ověří, že telefon je opravdu váš a že poptávku posíláte vy. Díky tomu se vám ozvu já, ne nikdo cizí, a nikdo jiný nemůže vaším jménem nic poslat.'],
    ['Zavazuje mě vyplnění formuláře k něčemu?', 'Ne. Formulář je jen žádost o nezávaznou konzultaci. Rozhodnutí je vždy na vás.'],
    ['Jsou sazby v kalkulačce konečné?', 'Jsou orientační. Konečnou sazbu stanoví banka podle vašich příjmů, výdajů a dalších okolností. Mým úkolem je vyjednat co nejlepší podmínky.'],
  ],
  konsolidace: [['Co všechno můžu sloučit?', 'Spotřebitelské úvěry, kreditní karty, kontokorenty i půjčky od nebankovních společností. Výsledkem je jedna splátka u jedné banky.']],
  hypoteka: [['Kolik si můžu na hypotéku půjčit?', 'Banky obvykle půjčí do 80 % hodnoty nemovitosti, mladším 36 let do 90 %. Rozhoduje i výše vašich příjmů, proto vždy počítám s vaší konkrétní situací.']],
  auto: [['Co potřebuji k nabídce pojištění?', 'Stačí značka a model auta, rok výroby a kontakt. Podrobnosti, jako je číslo technického průkazu, doplníme spolu až při sjednání.']],
  uver: [['Na co si můžu úvěr vzít?', 'Na cokoliv: auto, vybavení domácnosti, rekonstrukci, dovolenou. U účelových úvěrů bývá sazba nižší, proto se vždy zeptám, na co peníze potřebujete.']],
};

const faq = (key) => `
<section class="sec faq" id="caste-dotazy">
  <div class="wrap faq-grid">
    <div><p class="eyebrow">Časté dotazy</p><h2 class="h2">Na co se lidé ptají</h2><p class="faq-side">Nenašli jste odpověď? Napište na <a href="mailto:${SITE.email}">${SITE.email}</a> nebo zavolejte.</p></div>
    <div class="faq-list">
      ${[...(faqData[key] || []), ...faqData.common].map(([q, a]) => `<details><summary>${q}<span aria-hidden="true"></span></summary><p>${a}</p></details>`).join('')}
    </div>
  </div>
</section>`;

const callBand = () => `
<section class="call-band">
  <div class="wrap call-in">
    <p class="call-h">Nechce se vám vyplňovat formulář?</p>
    <a class="call-num" href="${SITE.phoneHref}">${icon('phone')}<span>${SITE.phone}</span></a>
  </div>
</section>`;

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
  auto: () => `<div class="fld-2"><div class="fld"><label class="fld-l" for="spz">SPZ <small>(nepovinné)</small></label><input class="txt" id="spz" name="spz" autocomplete="off" placeholder="1AB 2345"></div><div class="fld"><label class="fld-l" for="psc">PSČ bydliště</label><input class="txt" id="psc" name="psc" inputmode="numeric" autocomplete="postal-code" required placeholder="738 01"></div></div>`,
};

const leadForm = (c) => `
<section class="sec lead" id="formular">
  <div class="wrap lead-grid">
    <div class="lead-side">
      <p class="eyebrow">Poslední krok</p>
      <h2 class="h2">${c.key === 'auto' ? 'Kam vám mám<br>poslat nabídku?' : 'Vyjednám vám<br>tu nejlepší sazbu'}</h2>
      <p>${c.key === 'auto' ? 'Vyplňte kontakt a já vám pošlu srovnání pojišťoven.' : 'S těmito údaji lépe pochopím vaši situaci a můžu rovnou začít srovnávat nabídky.'}</p>
      <ul class="ticks">
        <li>${icon('check')} Nezávazné a zdarma</li>
        <li>${icon('check')} Ozvu se vám osobně</li>
        <li>${icon('check')} Údaje chráním podle GDPR</li>
      </ul>
    </div>
    <div class="lead-card">
      <form class="lead-form" data-cat="${c.key}" novalidate>
        <input type="hidden" name="kategorie" value="${c.name}">
        <div class="lead-summary" data-summary hidden></div>
        <div class="fld-2">
          <div class="fld"><label class="fld-l" for="jmeno">Jméno</label><input class="txt" id="jmeno" name="jmeno" autocomplete="given-name" required></div>
          <div class="fld"><label class="fld-l" for="prijmeni">Příjmení</label><input class="txt" id="prijmeni" name="prijmeni" autocomplete="family-name" required></div>
        </div>
        <div class="fld-2">
          <div class="fld"><label class="fld-l" for="email">E-mail</label><input class="txt" id="email" name="email" type="email" autocomplete="email" required></div>
          <div class="fld"><label class="fld-l" for="telefon">Mobil</label><input class="txt" id="telefon" name="telefon" type="tel" autocomplete="tel" inputmode="tel" placeholder="777 123 456" required></div>
        </div>
        ${c.key === 'auto' ? '' : `
        <div class="fld"><label class="fld-l" for="prijem">Čistý měsíční příjem</label><div class="money money-plain"><input class="money-in" id="prijem" name="prijem" type="text" inputmode="numeric" required placeholder="35 000"><span class="money-u">Kč</span></div></div>
        ${pick('zdroj', 'Zdroj příjmů', ['Zaměstnání', 'OSVČ', 'Jiné'])}`}
        ${leadExtra[c.key]()}
        ${c.key === 'auto' ? '' : pick('bydleni', 'Současné bydlení', ['Vlastní', 'Nájem', 'Jiné'])}
        <input type="text" name="firma" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="consent"><input type="checkbox" name="souhlas" required><span>Souhlasím se <a href="/ochrana-osobnich-udaju" target="_blank">zpracováním osobních údajů</a> za účelem nezávazné nabídky.</span></label>
        <p class="form-err" role="alert" hidden></p>
        <button class="btn btn-go btn-wide" type="submit"><span>${c.key === 'auto' ? 'Chci fér pojistné' : 'Chci nejlepší sazbu'}</span>${icon('arrow')}</button>
        <p class="form-fine">Na mobil vám pošlu ověřovací kód. Poptávka odejde až po jeho zadání.</p>
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
        <h3>Hotovo, děkuji!</h3>
        <p>Poptávka je ověřená a mám ji u sebe. Ozvu se vám co nejdřív na číslo <b data-done-phone></b>.</p>
        <p class="done-sign">${SITE.person}</p>
      </div>
    </div>
  </div>
</section>`;

// ---------- srovnání nabídek ----------
const offers = (c) => `
<section class="sec offers" id="nabidky">
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
        <p class="offer-tag">Fér sazba</p>
        <p class="offer-rate"><span data-o="our-rate">${pct(RATES[c.key].our)}</span><small>úroková sazba od</small></p>
        <p class="offer-pay"><span>Měsíční splátka od</span><b data-o="our-pay">—</b></p>
        <p class="offer-diff" data-o="our-save"></p>
        <a class="btn btn-go" href="#formular"><span>Mám zájem</span>${icon('arrow')}</a>
      </article>
      <ol class="offer-list" data-o="list"></ol>
    </div>
    <p class="fine">Uvedené informace jsou pouze orientační. Konečné parametry se mohou lišit v závislosti na vaší schopnosti splácet a dalších podmínkách. Sazby bank jsou převzaté z veřejných nabídek.</p>
  </div>
</section>`;

// ---------- úvodní stránka ----------
const homeCats = () => {
  const ex = {
    uver: `Úvěr 300&nbsp;000&nbsp;Kč na 10 let: splátka od <b>${kc(pmt(300000, RATES.uver.our, 120))}</b>`,
    konsolidace: `Dluh 500&nbsp;000&nbsp;Kč, dnes splácíte 9&nbsp;500&nbsp;Kč: nově od <b>${kc(pmt(500000, RATES.konsolidace.our, 120))}</b>`,
    hypoteka: `Hypotéka 4&nbsp;mil.&nbsp;Kč na 30 let: splátka od <b>${kc(pmt(4000000, RATES.hypoteka.our, 360))}</b>`,
    auto: 'Povinné ručení i havarijní u všech velkých pojišťoven',
  };
  const big = { uver: 'od ' + pct(RATES.uver.our), konsolidace: 'od ' + pct(RATES.konsolidace.our), hypoteka: 'od ' + pct(RATES.hypoteka.our), auto: 'srovnání' };
  return `
<section class="sec cats" id="co-resite">
  <div class="wrap">
    <div class="cats-head">
      <p class="eyebrow">Co řešíte?</p>
      <h2 class="h2">Čtyři věci, ve kterých<br>se dá hodně ušetřit</h2>
    </div>
    <div class="cats-grid">
      ${CATS.map((c, i) => `
      <a class="cat cat-${c.key}" href="/${c.slug}">
        <div class="cat-img"><picture><source media="(max-width: 700px)" srcset="/assets/${c.photo}-700.webp"><img src="/assets/${c.photo}-1200.webp" alt="" loading="lazy" width="1200" height="900"></picture></div>
        <div class="cat-body">
          <span class="cat-n">0${i + 1}</span>
          <h3>${c.name}</h3>
          <p class="cat-tag">${c.tagline}</p>
          <p class="cat-big">${big[c.key]}</p>
          <p class="cat-ex">${ex[c.key]}</p>
          <span class="cat-go">${c.cta} ${icon('arrow')}</span>
        </div>
      </a>`).join('')}
    </div>
  </div>
</section>`;
};

const ld = () => `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'FinancialService', '@id': SITE.url + '/#sluzba', name: SITE.name, url: SITE.url, email: SITE.email, telephone: SITE.phone, areaServed: 'CZ',
      founder: { '@id': SITE.url + '/#denisa' }, description: 'Srovnání úvěrů, konsolidací, hypoték a pojištění aut.' },
    { '@type': 'Person', '@id': SITE.url + '/#denisa', name: SITE.person, jobTitle: 'Finanční poradkyně', url: 'https://holazova.cz', sameAs: ['https://holazova.cz'] },
  ],
})}</script>`;

const home = () => typo(`${head({ title: 'FérSazby | Úvěr, konsolidace, hypotéka a pojištění auta za fér sazbu', desc: 'Spočítejte si úvěr, konsolidaci nebo hypotéku a podívejte se, kolik byste platili u jednotlivých bank. Fér sazba od 3,99 %. Denisa Holazová.', path: '/', extraHead: ld() + '\n<link rel="preload" as="image" href="/assets/hero-1600.webp" media="(min-width: 861px)">\n<link rel="preload" as="image" href="/assets/hero-m-900.webp" media="(max-width: 860px)">' })}
<body class="pg-home">
${header()}
<main id="obsah">
  <section class="hero">
    <picture class="hero-bg">
      <source media="(max-width: 860px)" srcset="/assets/hero-m-900.webp">
      <img src="/assets/hero-1600.webp" alt="Spokojená rodina doma na gauči" width="1600" height="900" fetchpriority="high">
    </picture>
    <div class="hero-in wrap">
      <div class="hero-txt">
        <p class="hero-brand" aria-hidden="true"><span>fér</span>sazby<i></i></p>
        <h1>Sazba, která je k&nbsp;vám <em>prostě&nbsp;fér.</em></h1>
        <p class="hero-lead">Řekněte, kolik potřebujete. Srovnám banky, vyjednám sazbu a vy jen podepíšete.</p>
        <ul class="hero-proof">
          <li><b>${pct(RATES.hypoteka.our)}</b><span>hypotéka od</span></li>
          <li><b>${pct(RATES.uver.our)}</b><span>úvěr od</span></li>
          <li><b>10</b><span>bank ve srovnání</span></li>
        </ul>
      </div>
      ${homeCalc()}
    </div>
  </section>
  ${homeCats()}
  ${steps()}
  ${about()}
  ${faq('home')}
  ${callBand()}
</main>
${footer()}
${scripts()}`);

// ---------- stránka kategorie ----------
const catPage = (c) => typo(`${head({ title: c.title, desc: c.desc, path: '/' + c.slug })}
<body class="pg-cat pg-${c.key}">
${header(c.key, true)}
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
          <li>${icon('check')} Vyjednám lepší podmínky</li>
          <li>${icon('check')} Vyřídím to za vás</li>
        </ul>
      </div>
      <div class="calc-card calc-card-single">
        <p class="calc-title">${icon(c.icon)} ${c.cta}</p>
        ${calcPanel(c, 'p', 'page')}
      </div>
    </div>
  </section>
  ${c.key === 'auto' ? '' : offers(c)}
  ${leadForm(c)}
  ${steps()}
  ${faq(c.key)}
  ${callBand()}
</main>
${footer()}
${scripts()}`);

const privacy = () => typo(`${head({ title: 'Ochrana osobních údajů | FérSazby', desc: 'Jak zpracováváme osobní údaje z formulářů na webu FérSazby.', path: '/ochrana-osobnich-udaju' })}
<body class="pg-text">
${header('', true)}
<main id="obsah" class="sec text-page"><div class="wrap narrow">
<h1 class="h2">Ochrana osobních údajů</h1>
<p>Správcem osobních údajů je ${SITE.person}, IČ ${SITE.ico}, e-mail <a href="mailto:${SITE.email}">${SITE.email}</a>, telefon ${SITE.phone}.</p>
<h2>Jaké údaje a proč</h2>
<p>Z formuláře na tomto webu zpracovávám jméno, příjmení, e-mail, telefon a údaje, které sami vyplníte (výše úvěru, příjem, informace o bydlení nebo o autě). Používám je jen k tomu, abych vás kontaktovala a připravila nezávaznou nabídku. Právním základem je opatření před uzavřením smlouvy na vaši žádost a váš souhlas.</p>
<h2>Ověření telefonu</h2>
<p>Na zadané číslo odešleme jednorázový kód v SMS. Kód slouží jen k ověření, že poptávku posíláte vy.</p>
<h2>Jak dlouho</h2>
<p>Pokud spolupráce nevznikne, údaje smažu nejpozději do 12 měsíců. Pokud vznikne, řídí se uchování zákonnými lhůtami pro finanční zprostředkování.</p>
<h2>Komu je předávám</h2>
<p>Údaje předávám jen bance nebo pojišťovně, u které o nabídku požádáte, a společnosti ${SITE.represented}, kterou jako vázaná zástupkyně zastupuji. Technicky je zpracovává poskytovatel hostingu, e-mailu a SMS brány.</p>
<h2>Vaše práva</h2>
<p>Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost a odvolání souhlasu. Stačí napsat na <a href="mailto:${SITE.email}">${SITE.email}</a>. Stížnost můžete podat u Úřadu pro ochranu osobních údajů (uoou.gov.cz).</p>
</div></main>
${footer()}
${scripts()}`);

writeFileSync(new URL('index.html', OUT), home());
for (const c of CATS) writeFileSync(new URL(c.slug + '.html', OUT), catPage(c));
writeFileSync(new URL('ochrana-osobnich-udaju.html', OUT), privacy());
writeFileSync(new URL('404.html', OUT), typo(`${head({ title: 'Stránka nenalezena | FérSazby', desc: 'Tahle stránka neexistuje.', path: '/404' })}
<body class="pg-text">
${header('', true)}
<main id="obsah" class="sec text-page"><div class="wrap narrow"><p class="eyebrow">Chyba 404</p><h1 class="h2">Tahle stránka tu není</h1><p>Zkuste začít kalkulačkou na <a href="/">úvodní stránce</a> nebo zavolejte na ${SITE.phone}.</p></div></main>
${footer()}
${scripts()}`));
writeFileSync(new URL('sitemap.xml', OUT), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', ...CATS.map((c) => c.slug), 'ochrana-osobnich-udaju'].map((p) => `  <url><loc>${SITE.url}/${p}</loc></url>`).join('\n')}
</urlset>
`);
console.log('hotovo', V);
