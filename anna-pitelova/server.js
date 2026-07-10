// Vizitka money2u: statický web + kontaktní formulář s přímým odesláním na e-mail poradce.
// Node + Express + nodemailer → náš mailcow SMTP (mail.gomatela.cz). Běží na Coolify.
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

const PORT      = Number(process.env.PORT || 80);
const MAIL_TO   = process.env.MAIL_TO;                                   // cíl = mail poradce (povinné)
const MAIL_FROM = process.env.MAIL_FROM || 'Web money2u <objednavky@suorigo.cz>';
const SITE      = process.env.SITE_NAME || 'money2u';

const esc = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

app.get('/api/health', (_req, res) => res.json({ ok: true, mailTo: !!MAIL_TO }));

app.post('/api/contact', async (req, res) => {
  const data = req.body || {};
  if (data.company) return res.json({ ok: true });                      // honeypot → tváříme se jako úspěch

  const name  = String(data.name  || '').trim().slice(0, 200);
  const email = String(data.email || '').trim().slice(0, 200);
  const phone = String(data.phone || '').trim().slice(0, 60);
  const msg   = String(data.msg   || '').trim().slice(0, 5000);

  if (!name || !email || !msg) return res.status(400).json({ ok: false, error: 'missing_fields' });
  if (!isEmail(email))         return res.status(400).json({ ok: false, error: 'bad_email' });
  if (!MAIL_TO)                return res.status(500).json({ ok: false, error: 'no_recipient' });

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.gomatela.cz',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || '1') === '1' || Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 12000, greetingTimeout: 8000, socketTimeout: 20000,
  });

  const subject = `Nová poptávka z webu · ${name}`;
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
      replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
      subject, text, html,
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error('contact send error:', e && e.message);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
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
