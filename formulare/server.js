// Kontaktní formuláře statických webů money2u.cz a reality2u.cz (žádný vlastní backend nemají).
// Node + Express + nodemailer → náš mailcow SMTP (mail.gomatela.cz). Běží na Coolify, formulare.gomatela.cz.
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

const PORT = Number(process.env.PORT || 80);
const FROM_ADDR = process.env.MAIL_FROM_ADDR || 'objednavky@suorigo.cz';

// Kam která stránka posílá. Makléř z detailu nemovitosti jen s doménou webu, jinak by šlo posílat komukoli.
const SITES = {
  money2u:   { name: 'money2u.cz',   to: process.env.MONEY2U_TO   || 'info@money2u.cz',          agentDomain: null },
  reality2u: { name: 'reality2u.cz', to: process.env.REALITY2U_TO || 'asistentka@reality2u.cz',  agentDomain: 'reality2u.cz' },
};
const ORIGINS = /^https:\/\/(www\.)?(money2u\.cz|reality2u\.cz)$|^https:\/\/[a-z0-9-]+\.vercel\.app$|^http:\/\/localhost(:\d+)?$/;

const esc = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

app.use((req, res, next) => {
  const o = req.headers.origin;
  if (o && ORIGINS.test(o)) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Jednoduchý strop proti spamu: 8 odeslání za 10 minut z jedné IP.
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 600000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 8;
}

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.gomatela.cz',
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  connectionTimeout: 12000, greetingTimeout: 8000, socketTimeout: 20000,
});

// Mailcow občas vrátí přechodnou chybu (454 apod.), napodruhé projde. Trvalé 5xx neopakujeme.
async function sendWithRetry(mail) {
  const waits = [0, 1500, 4000];
  let last;
  for (const w of waits) {
    if (w) await new Promise((r) => setTimeout(r, w));
    try { return await transport.sendMail(mail); }
    catch (e) {
      last = e;
      if (e && e.responseCode >= 500) break;
    }
  }
  throw last;
}

app.get('/api/health', (_req, res) => res.json({ ok: true, smtp: !!process.env.SMTP_PASS }));

app.post('/api/:site', async (req, res) => {
  const site = SITES[req.params.site];
  if (!site) return res.status(404).json({ ok: false, error: 'unknown_site' });
  const data = req.body || {};
  if (data._honey || data.company) return res.json({ ok: true, success: true });   // honeypot
  if (tooMany(req.ip)) return res.status(429).json({ ok: false, error: 'too_many' });

  // Pole bereme tak, jak je formulář pojmenoval (česky), technická (_*) vynecháme.
  const fields = [];
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith('_') || k === 'agent_email' || k === 'stranka') continue;
    const val = String(v || '').trim().slice(0, 5000);
    if (val) fields.push([String(k).slice(0, 60), val]);
  }
  if (!fields.length) return res.status(400).json({ ok: false, error: 'empty' });
  const all = fields.map(([, v]) => v).join(' ');
  const email = (fields.find(([, v]) => isEmail(v)) || [])[1];
  const hasPhone = /(\+?\d[\d\s]{7,})/.test(all);
  if (!email && !hasPhone) return res.status(400).json({ ok: false, error: 'no_contact' });

  let to = site.to, cc;
  const agent = String(data.agent_email || '').trim().toLowerCase();
  if (site.agentDomain && isEmail(agent) && agent.endsWith('@' + site.agentDomain) && agent !== to) {
    to = agent; cc = site.to;
  }

  const name = (data['Jméno'] || data.name || '') + (data['Příjmení'] ? ' ' + data['Příjmení'] : '');
  const page = String(data.stranka || req.headers.referer || '').slice(0, 300);
  const subject = String(data._subject || `Nová poptávka z webu ${site.name}`).slice(0, 150) + (name.trim() ? ` – ${name.trim()}` : '');
  const text = `Nová zpráva z formuláře na ${site.name}.\n\n` +
    fields.map(([k, v]) => `${k}: ${v}`).join('\n') + (page ? `\n\nStránka: ${page}\n` : '\n');
  const html =
    `<div style="font-family:'Segoe UI',Arial,sans-serif;color:#0D1F3A;line-height:1.5">` +
    `<h2 style="margin:0 0 12px">Nová poptávka z webu ${esc(site.name)}</h2>` +
    `<table style="border-collapse:collapse;font-size:15px">` +
    fields.map(([k, v]) => `<tr><td style="padding:3px 14px 3px 0;color:#2D7A76;vertical-align:top"><b>${esc(k)}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join('') +
    `</table>` +
    (page ? `<p style="font-size:13px;margin:14px 0 0">Stránka: <a href="${esc(page)}">${esc(page)}</a></p>` : '') +
    `<hr style="border:none;border-top:1px solid #e5e5e5;margin:18px 0"/>` +
    `<p style="font-size:12px;color:#888;margin:0">${email ? 'Odpovědí se ozvete přímo klientovi.' : 'Klient nechal jen telefon.'}</p>` +
    `</div>`;

  try {
    await sendWithRetry({
      from: `"Web ${site.name}" <${FROM_ADDR}>`,
      to, cc,
      replyTo: email ? `"${name.replace(/"/g, '').trim() || email}" <${email}>` : undefined,
      subject, text, html,
    });
    console.log(`odesláno ${req.params.site} → ${to}${cc ? ' (cc ' + cc + ')' : ''}`);
    return res.json({ ok: true, success: true });
  } catch (e) {
    console.error('send error:', e && e.message);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
});

app.use((_req, res) => res.status(404).json({ ok: false }));
app.listen(PORT, () => console.log(`formuláře běží na :${PORT}`));
