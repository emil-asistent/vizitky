// FérSazby: statický web + poptávka ověřená SMS kódem → e-mail poradkyni.
// Node + Express + nodemailer (náš mailcow). SMS přes BulkGate, v náhledu SMS_PROVIDER=log.
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));

const PORT = Number(process.env.PORT || 80);
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'fersazby.cz';
const MAIL_TO = process.env.MAIL_TO || 'info@fersazby.cz';
const MAIL_FROM = process.env.MAIL_FROM || 'FérSazby <info@fersazby.cz>';
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'log';         // log | bulkgate
const IS_PREVIEW = (h) => h !== CANONICAL_HOST && h !== 'www.' + CANONICAL_HOST;

app.use((req, res, next) => {
  if (req.hostname === 'www.' + CANONICAL_HOST) return res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
  if (IS_PREVIEW(req.hostname)) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Čisté adresy: /neco.html → /neco, /index → /, koncové lomítko pryč.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const p = req.path;
  const qs = req.originalUrl.slice(p.length);
  if (/\/index(\.html)?$/.test(p)) return res.redirect(301, p.replace(/index(\.html)?$/, '') + qs);
  if (p.endsWith('.html')) return res.redirect(301, p.slice(0, -5) + qs);
  if (p.length > 1 && p.endsWith('/')) return res.redirect(301, p.slice(0, -1) + qs);
  next();
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(IS_PREVIEW(req.hostname)
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://${CANONICAL_HOST}/sitemap.xml\n`);
});

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders: (res, file) => {
    if (/\.(woff2|webp|jpg|png|svg)$/.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    else if (/\.(css|js)$/.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    else res.setHeader('Cache-Control', 'public, max-age=300');
  },
}));

app.get('/api/health', (_req, res) => res.json({ ok: true, sms: SMS_PROVIDER, mail: !!process.env.SMTP_USER }));

// ---------- ochrana ----------
const ALLOWED = new Set([CANONICAL_HOST, 'www.' + CANONICAL_HOST, 'localhost', '127.0.0.1', ...(process.env.EXTRA_HOSTS || '').split(',').filter(Boolean)]);
const originOk = (req) => {
  const o = req.get('origin') || req.get('referer') || '';
  try { return ALLOWED.has(new URL(o).hostname); } catch { return false; }
};
const buckets = new Map();
const limited = (key, max, ms) => {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => t > now - ms);
  if (arr.length >= max) { buckets.set(key, arr); return true; }
  arr.push(now); buckets.set(key, arr); return false;
};

// ---------- čekající poptávky (v paměti, platí 15 min) ----------
const pending = new Map();
const TTL = 15 * 60 * 1000;
setInterval(() => {
  const t = Date.now() - TTL;
  for (const [k, v] of pending) if (v.created < t) pending.delete(k);
  for (const [k, v] of buckets) if (!v.some((x) => x > Date.now() - 3600e3)) buckets.delete(k);
}, 60e3).unref();

const normPhone = (v) => {
  const d = String(v || '').replace(/[^\d+]/g, '').replace(/^00/, '+');
  const m = d.match(/^(?:\+?420)?([67]\d{8})$/);
  return m ? '+420' + m[1] : null;
};
const code4 = () => String(crypto.randomInt(0, 10000)).padStart(4, '0');

async function sendSms(phone, text) {
  if (SMS_PROVIDER === 'bulkgate') {
    const r = await fetch('https://portal.bulkgate.com/api/1.0/simple/transactional', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        application_id: process.env.BULKGATE_APP_ID,
        application_token: process.env.BULKGATE_APP_TOKEN,
        number: phone.replace('+', ''), text, unicode: false, country: 'cz',
        sender_id: process.env.BULKGATE_SENDER_ID || 'gSystem',
        sender_id_value: process.env.BULKGATE_SENDER_VALUE || '',
      }),
      signal: AbortSignal.timeout(12000),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error('sms: ' + (j.error || r.status));
    return;
  }
  console.log(`[sms:log] ${phone}: ${text}`);
}

const transport = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.gomatela.cz',
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  connectionTimeout: 12000, greetingTimeout: 8000, socketTimeout: 20000,
});

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LABELS = {
  kategorie: 'Kategorie', jmeno: 'Jméno', prijmeni: 'Příjmení', email: 'E-mail', telefon: 'Telefon (ověřen SMS)',
  kalkulace: 'Kalkulace', prijem: 'Čistý měsíční příjem', zdroj: 'Zdroj příjmů', bydleni: 'Současné bydlení',
  nemovitost: 'Typ nemovitosti', ucel: 'Účel hypotéky', exekuce: 'Exekuce / insolvence', registr: 'Záznam v registru dlužníků',
  prodleni: 'Prodlení se splácením', kratkodoby: 'Nebankovní půjčka splatná příští měsíc', spz: 'SPZ', psc: 'PSČ',
  typ: 'Pojištění', vuz: 'Vůz', rok: 'Rok výroby', konec: 'Konec současné pojistky', stranka: 'Stránka',
};

async function sendLead(lead) {
  const d = lead.data;
  if (d.parametry && d.kategorie === 'Pojištění vozidla') Object.assign(d, { typ: d.parametry.typ, vuz: d.parametry.vuz, rok: d.parametry.rok, konec: d.parametry.konec });
  const rows = Object.keys(LABELS).filter((k) => d[k]).map((k) => [LABELS[k], k === 'prijem' ? d[k] + ' Kč' : k === 'telefon' ? lead.phone : d[k]]);
  const subject = `Poptávka: ${d.kategorie} – ${d.jmeno} ${d.prijmeni}`;
  const text = `Nová ověřená poptávka z fersazby.cz\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n`;
  const html = `<div style="font-family:Arial,sans-serif;color:#0D1F3A;line-height:1.5;font-size:15px">
<p style="margin:0 0 4px;color:#2D7A76;font-weight:bold;letter-spacing:.1em;font-size:12px;text-transform:uppercase">fersazby.cz · telefon ověřen SMS</p>
<h2 style="margin:0 0 16px">${esc(d.kategorie)}: ${esc(d.jmeno)} ${esc(d.prijmeni)}</h2>
<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:5px 16px 5px 0;color:#5b6b80;vertical-align:top">${esc(k)}</td><td style="padding:5px 0"><b>${esc(v)}</b></td></tr>`).join('')}</table>
<p style="margin-top:20px"><a href="tel:${esc(lead.phone)}" style="background:#0D1F3A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Zavolat ${esc(lead.phone)}</a></p></div>`;
  await transport().sendMail({ from: MAIL_FROM, to: lead.preview ? (process.env.PREVIEW_MAIL_TO || MAIL_TO) : MAIL_TO, replyTo: d.email, subject: (lead.preview ? '[NÁHLED] ' : '') + subject, text, html });
}

const fail = (res, code, message) => res.status(code).json({ ok: false, message });

app.post('/api/poptavka', async (req, res) => {
  if (!originOk(req)) return fail(res, 403, 'Odeslání se nepovedlo.');
  const ip = req.get('cf-connecting-ip') || req.ip;
  const d = req.body || {};
  if (d.firma) return res.json({ ok: true, id: 'x' });
  const phone = normPhone(d.telefon);
  if (!phone) return fail(res, 400, 'Zadejte prosím české mobilní číslo.');
  if (!d.jmeno || !d.prijmeni || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email || '').trim())) return fail(res, 400, 'Vyplňte prosím jméno, příjmení a e-mail.');
  if (!d.souhlas) return fail(res, 400, 'Potvrďte prosím souhlas se zpracováním údajů.');
  if (limited('ip:' + ip, 6, 3600e3) || limited('tel:' + phone, 3, 3600e3)) return fail(res, 429, 'Příliš mnoho pokusů. Zkuste to prosím později nebo zavolejte.');

  const clean = {};
  for (const [k, v] of Object.entries(d)) clean[k] = typeof v === 'string' ? v.trim().slice(0, 500) : v;
  const id = crypto.randomBytes(16).toString('hex');
  const code = code4();
  const preview = IS_PREVIEW(req.hostname);
  pending.set(id, { data: clean, phone, code, tries: 0, sends: 1, lastSend: Date.now(), created: Date.now(), preview });
  try {
    await sendSms(phone, `FerSazby: vas overovaci kod je ${code}. Platí 15 minut.`.normalize('NFD').replace(/[̀-ͯ]/g, ''));
  } catch (e) {
    console.error(e); pending.delete(id);
    return fail(res, 502, 'SMS se nepodařilo odeslat. Zkontrolujte číslo nebo zavolejte.');
  }
  res.json({ ok: true, id, ...(SMS_PROVIDER === 'log' && preview ? { devCode: code } : {}) });
});

app.post('/api/poptavka/overit', async (req, res) => {
  if (!originOk(req)) return fail(res, 403, 'Ověření se nepovedlo.');
  const { id, kod } = req.body || {};
  const lead = pending.get(String(id));
  if (!lead) return fail(res, 410, 'Platnost kódu vypršela. Odešlete prosím formulář znovu.');
  if (++lead.tries > 5) { pending.delete(id); return fail(res, 429, 'Příliš mnoho pokusů. Odešlete prosím formulář znovu.'); }
  if (String(kod) !== lead.code) return fail(res, 400, `Kód nesedí. Zbývá pokusů: ${5 - lead.tries}.`);
  try { await sendLead(lead); } catch (e) { console.error(e); return fail(res, 502, 'Poptávku se nepodařilo doručit. Zavolejte prosím na 737 202 797.'); }
  pending.delete(id);
  res.json({ ok: true });
});

app.post('/api/poptavka/znovu', async (req, res) => {
  if (!originOk(req)) return fail(res, 403, 'Nepovedlo se.');
  const lead = pending.get(String((req.body || {}).id));
  if (!lead) return fail(res, 410, 'Platnost vypršela. Odešlete prosím formulář znovu.');
  if (lead.sends >= 3) return fail(res, 429, 'Kód už jsme poslali třikrát. Zavolejte nám prosím.');
  if (Date.now() - lead.lastSend < 40e3) return fail(res, 429, 'Chvilku počkejte, než pošleme další kód.');
  lead.code = code4(); lead.sends++; lead.lastSend = Date.now(); lead.tries = 0;
  try { await sendSms(lead.phone, `FerSazby: vas overovaci kod je ${lead.code}. Plati 15 minut.`); } catch (e) { console.error(e); return fail(res, 502, 'SMS se nepodařilo odeslat.'); }
  res.json({ ok: true, ...(SMS_PROVIDER === 'log' && lead.preview ? { devCode: lead.code } : {}) });
});

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`FérSazby běží na :${PORT} (sms: ${SMS_PROVIDER})`));
