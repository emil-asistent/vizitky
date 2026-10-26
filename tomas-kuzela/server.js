// Vizitka money2u: statický web + kontaktní formulář s přímým odesláním na e-mail poradce.
// Node + Express + nodemailer → náš mailcow SMTP (mail.gomatela.cz). Běží na Coolify.
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

// Náhledové adresy (mimo ostrou doménu) do vyhledávačů nepouštět.
const CANONICAL_HOST = process.env.CANONICAL_HOST || 'tomaskuzela.eu';
app.use((req, res, next) => {
  if (req.hostname !== CANONICAL_HOST) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

const PORT      = Number(process.env.PORT || 80);
const MAIL_TO   = process.env.MAIL_TO;                                   // cíl = mail poradce (povinné)
const MAIL_FROM = process.env.MAIL_FROM || 'Web money2u <objednavky@suorigo.cz>';
const SITE      = process.env.SITE_NAME || 'money2u';

const esc = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

app.get('/api/health', (_req, res) => res.json({ ok: true, mailTo: !!MAIL_TO }));

// Ochrana formuláře: jen z vlastního webu a nejvýš pár zpráv za čtvrt hodiny z jedné adresy.
const ALLOWED_HOSTS = new Set([CANONICAL_HOST, 'www.' + CANONICAL_HOST, 'tomas-kuzela.gomatela.cz', 'localhost', '127.0.0.1']);
const hits = new Map();                                                   // ip -> [časy odeslání]
const LIMIT = 5, WINDOW_MS = 15 * 60 * 1000;
setInterval(() => { const t = Date.now() - WINDOW_MS; for (const [k, v] of hits) { const r = v.filter((x) => x > t); r.length ? hits.set(k, r) : hits.delete(k); } }, WINDOW_MS).unref();

app.post('/api/contact', async (req, res) => {
  const origin = req.get('origin') || req.get('referer') || '';
  let originHost = '';
  try { originHost = new URL(origin).hostname; } catch (_) { /* bez Origin (např. curl) */ }
  if (originHost && !ALLOWED_HOSTS.has(originHost)) return res.status(403).json({ ok: false, error: 'origin' });

  const ip = req.get('cf-connecting-ip') || req.ip || 'neznamá';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => t > now - WINDOW_MS);
  if (recent.length >= LIMIT) return res.status(429).json({ ok: false, error: 'too_many' });

  const data = req.body || {};
  if (data.company) return res.json({ ok: true });                      // honeypot → tváříme se jako úspěch

  const name  = String(data.name  || '').trim().slice(0, 200);
  const email = String(data.email || '').trim().slice(0, 200);
  const phone = String(data.phone || '').trim().slice(0, 60);
  const msg   = String(data.msg   || '').trim().slice(0, 5000);

  if (!name || !email || !msg) return res.status(400).json({ ok: false, error: 'missing_fields' });
  if (!isEmail(email))         return res.status(400).json({ ok: false, error: 'bad_email' });
  if (!MAIL_TO)                return res.status(500).json({ ok: false, error: 'no_recipient' });
  recent.push(now); hits.set(ip, recent);

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.gomatela.cz',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || '1') === '1' || Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 12000, greetingTimeout: 8000, socketTimeout: 20000,
  });

  const subject = `Nová poptávka z webu od ${name}`;
  const text =
    `Nová zpráva z kontaktního formuláře (${SITE}).\n\n` +
    `Jméno: ${name}\nE-mail: ${email}\nTelefon: ${phone || 'neuvedeno'}\n\nZpráva:\n${msg}\n`;
  const html =
    `<div style="font-family:'Segoe UI',Arial,sans-serif;color:#0D1F3A;line-height:1.5">` +
    `<h2 style="margin:0 0 12px">Nová poptávka z webu</h2>` +
    `<table style="border-collapse:collapse;font-size:15px">` +
    `<tr><td style="padding:2px 12px 2px 0;color:#2D7A76"><b>Jméno</b></td><td>${esc(name)}</td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#2D7A76"><b>E-mail</b></td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>` +
    `<tr><td style="padding:2px 12px 2px 0;color:#2D7A76"><b>Telefon</b></td><td>${esc(phone) || 'neuvedeno'}</td></tr>` +
    `</table>` +
    `<p style="margin:14px 0 4px;color:#2D7A76"><b>Zpráva</b></p>` +
    `<p style="margin:0;white-space:pre-wrap">${esc(msg)}</p>` +
    `<hr style="border:none;border-top:1px solid #e5e5e5;margin:18px 0"/>` +
    `<p style="font-size:12px;color:#888;margin:0">Odesláno z kontaktního formuláře webu ${esc(SITE)}. Odpovědí se ozvete přímo klientovi.</p>` +
    `</div>`;

  try {
    await transport.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: { name, address: email },
      subject, text, html,
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error('contact send error:', e && e.message);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
});

// Na tomaskuzela.eu dřív stála jen parkovací stránka WEDOS, vlastní starý web nebyl.
// Všechno neznámé proto míří na úvod.
const LEGACY = { '/sluzby': '/#services', '/o-mne': '/#about', '/kontakt': '/#contact' };
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const p = req.path.replace(/\/+$/, '').toLowerCase();
  if (!p) return next();                              // kořen servíruje statika
  if (p === '/index.html' || p === '/index') return res.redirect(301, '/');
  if (p.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'not_found' });
  if (LEGACY[p]) return res.redirect(301, LEGACY[p]);
  if (/\.[a-z0-9]{2,12}$/i.test(p)) return next();     // soubory nechat statice, ať 404 zůstane 404
  return res.redirect(301, '/');
});

// Statika z public/: kód (HTML/CSS/JS) revaliduje, média mají dlouhou immutable cache.
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders: (res, fp) => {
    if (/\.(jpg|jpeg|png|gif|webp|svg|woff2?|ttf|ico|mp4)$/i.test(fp)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

app.listen(PORT, () => console.log(`web+contact běží na :${PORT} · MAIL_TO=${MAIL_TO || '(chybí!)'}`));
