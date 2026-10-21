// NAFIN pohodové finance: statický web + kontaktní formulář s odesláním na info@nafin.cz.
// Node + Express + nodemailer → náš mailcow SMTP. Vzor: vizitky money2u. Běží na Coolify.
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));

const CANONICAL_HOST = process.env.CANONICAL_HOST || 'www.nafin.cz';
const PORT = Number(process.env.PORT || 80);
const MAIL_TO = process.env.MAIL_TO;
const MAIL_FROM = process.env.MAIL_FROM || 'Web NAFIN <objednavky@suorigo.cz>';

// Holá doména → www, náhledové adresy mimo vyhledávače
app.use((req, res, next) => {
  if (req.hostname === 'nafin.cz') return res.redirect(301, `https://www.nafin.cz${req.originalUrl}`);
  if (req.hostname !== CANONICAL_HOST) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

// Jednoduchá brzda proti spamu: max 5 zpráv za 10 minut z jedné IP
const hits = new Map();
const limited = ip => {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 600000);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 5;
};

app.get('/api/health', (_req, res) => res.json({ ok: true, mailTo: !!MAIL_TO }));

app.post('/api/contact', async (req, res) => {
  const d = req.body || {};
  if (d.company) return res.json({ ok: true });
  if (limited(req.ip)) return res.status(429).json({ ok: false, error: 'too_many' });
  const name = String(d.name || '').trim().slice(0, 200);
  const email = String(d.email || '').trim().slice(0, 200);
  const phone = String(d.phone || '').trim().slice(0, 60);
  const tema = String(d.tema || '').trim().slice(0, 100);
  const msg = String(d.msg || '').trim().slice(0, 5000);
  if (!name || (!phone && !email)) return res.status(400).json({ ok: false, error: 'missing_fields' });
  if (email && !isEmail(email)) return res.status(400).json({ ok: false, error: 'bad_email' });
  if (!MAIL_TO) return res.status(500).json({ ok: false, error: 'no_recipient' });

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.gomatela.cz',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || '1') === '1',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 12000, greetingTimeout: 8000, socketTimeout: 20000,
  });
  const radek = (k, v) => `<tr><td style="padding:4px 14px 4px 0;color:#0f8597"><b>${k}</b></td><td>${v}</td></tr>`;
  try {
    await transport.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      ...(email ? { replyTo: `"${name.replace(/"/g, '')}" <${email}>` } : {}),
      subject: `Web nafin.cz: ${tema || 'dotaz'} · ${name}`,
      text: `Nová zpráva z webu nafin.cz\n\nTéma: ${tema}\nJméno: ${name}\nTelefon: ${phone || 'neuvedeno'}\nE-mail: ${email || 'neuvedeno'}\n\n${msg}\n`,
      html: `<div style="font-family:Arial,sans-serif;color:#0b1820;line-height:1.5"><h2 style="margin:0 0 12px">Nová zpráva z webu nafin.cz</h2><table style="border-collapse:collapse;font-size:15px">${radek('Téma', esc(tema))}${radek('Jméno', esc(name))}${radek('Telefon', phone ? `<a href="tel:${esc(phone.replace(/\s/g, ''))}">${esc(phone)}</a>` : 'neuvedeno')}${radek('E-mail', email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : 'neuvedeno')}</table><p style="margin:16px 0 4px;color:#0f8597"><b>Zpráva</b></p><p style="margin:0;white-space:pre-wrap">${esc(msg) || '(bez textu)'}</p></div>`,
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('contact send error:', e && e.message);
    res.status(502).json({ ok: false, error: 'send_failed' });
  }
});

// Staré adresy z původního webu (React SPA)
const LEGACY = { '/aboutus': '/o-nas', '/services': '/sluzby', '/calculate': '/nastroje', '/contact': '/kontakt', '/hypoteka': '/nastroje' };
app.use((req, res, next) => {
  const p = req.path.replace(/\/+$/, '') || '/';
  if (LEGACY[p]) return res.redirect(301, LEGACY[p]);
  if (p !== req.path && p !== '/') return res.redirect(301, p + (req.url.slice(req.path.length) || ''));
  if (/\.html$/.test(p)) return res.redirect(301, p.replace(/(index)?\.html$/, '') || '/');
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  setHeaders: (res, fp) => {
    res.setHeader('Cache-Control', /\.(webp|jpg|png|svg|woff2?|ico)$/i.test(fp) ? 'public, max-age=2592000' : /\.(css|js)$/i.test(fp) ? 'public, max-age=31536000, immutable' : 'no-cache');
  },
}));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`nafin web běží na :${PORT} · MAIL_TO=${MAIL_TO || '(chybí!)'}`));
