# Sestaví public/navrhy-loga.html ze SVG v src/logo/navrhy/.
N='src/logo/navrhy/'
def rd(f): return open(N+f).read().replace('<svg ','<svg class="s" ',1)
C=[('1','Procento s fajfkou','Znak procenta, ve kterém šikmou čáru nahrazuje fajfka. Sazba, kterou někdo prověřil a je fér. Pozná se i v malé ikoně a nepotřebuje k tomu text.'),
   ('2','Monogram fs','Písmena f a s spojená jedním tahem: příčka f plynule přechází do s. Klidné a důvěryhodné jako u banky, ale díky zaobleným tahům lidské.'),
   ('3','Bublina „fér“','Slovo fér v bublině, jako když vám to někdo řekne do očí: tohle je fér. Přátelské a osobní, nejvíc sedí k tomu, že za webem stojí konkrétní člověk.')]
sec=''
for n,t,p in C:
    nav='<span class="nav">Úvěr<i></i>Konsolidace<i></i>Hypotéka<i></i>Pojištění auta</span><span class="tel">+420 737 202 797</span>'
    sec+=f'''<section class="c"><header><span class="n">0{n}</span><div><h2>{t}</h2><p>{p}</p></div></header>
<div class="row"><div class="tile w">{rd(n+'-svetle.svg')}</div><div class="tile d">{rd(n+'-tmave.svg')}</div></div>
<div class="row r2"><div class="tile ic">{rd(n+'-ikona.svg')}{rd(n+'-ikona-svetla.svg')}<div class="sm">{rd(n+'-ikona.svg')}{rd(n+'-ikona.svg')}</div></div>
<div class="tile mock"><div class="bar"><span class="lg">{rd(n+'-svetle.svg')}</span>{nav}</div><div class="bar dk"><span class="lg">{rd(n+'-tmave.svg')}</span>{nav}</div></div></div></section>'''
css='''@font-face{font-family:J;font-weight:200 800;src:url(/fonts/plus-jakarta-sans-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1E00-1EFF}
@font-face{font-family:J;font-weight:200 800;src:url(/fonts/plus-jakarta-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:J,system-ui,sans-serif;background:#ECEAE4;color:#0D1F3A;padding:48px 16px 80px}
.wrap{max-width:1180px;margin:0 auto}h1{font-size:clamp(30px,5vw,52px);letter-spacing:-.035em;line-height:1.05}.lead{color:rgba(13,31,58,.65);margin:12px 0 40px;max-width:60ch}
.c{background:#F7F5F0;border-radius:28px;padding:clamp(18px,3vw,36px);margin-bottom:28px}
.c header{display:flex;gap:20px;align-items:flex-start;margin-bottom:24px}.n{font-weight:800;font-size:15px;color:#2D7A76;padding-top:8px}
h2{font-size:clamp(24px,3vw,34px);letter-spacing:-.03em}.c header p{color:rgba(13,31,58,.7);max-width:62ch;margin-top:6px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}.r2{margin-top:16px;grid-template-columns:1fr 1.5fr}
.tile{border-radius:20px;display:flex;align-items:center;justify-content:center;padding:clamp(20px,4vw,48px) 24px;min-height:200px}
.w{background:#fff}.d{background:#0D1F3A}.tile>.s{width:100%;max-width:440px;height:auto}
.ic{background:#fff;gap:18px;flex-wrap:wrap}.ic .s{width:96px;height:96px}.sm{display:flex;gap:12px;align-items:center}.sm .s:first-child{width:32px;height:32px}.sm .s:last-child{width:16px;height:16px}
.mock{background:#fff;flex-direction:column;gap:12px;padding:20px}.bar{width:100%;display:flex;align-items:center;gap:16px;padding:14px 18px;border-radius:14px;border:1px solid rgba(13,31,58,.1);font-size:13px;font-weight:600}
.bar .lg .s{height:36px;width:auto;display:block}.bar .nav{flex:1;text-align:center;white-space:nowrap;overflow:hidden}.bar .nav i{display:inline-block;width:18px}.bar .tel{background:#0D1F3A;color:#fff;border-radius:99px;padding:7px 12px;white-space:nowrap}
.bar.dk{background:#0D1F3A;color:#fff;border-color:#0D1F3A}.bar.dk .tel{background:#99C6C3;color:#0D1F3A}
@media(max-width:800px){.row,.r2{grid-template-columns:1fr}.bar .nav{display:none}.bar{justify-content:space-between}}'''
html=f'''<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Návrhy loga | FérSazby</title><link rel="icon" href="/favicon.svg"><style>{css}</style></head><body><div class="wrap"><h1>Tři návrhy loga FérSazby</h1><p class="lead">Všechny tři drží barvy money2u (tyrkysová a tmavě modrá) jako holazova.cz. U každého je logo na světlém i tmavém pozadí, ikona (do prohlížeče, na Facebook, Instagram) a ukázka v hlavičce webu.</p>{sec}</div></body></html>'''
open('public/navrhy-loga.html','w').write(html)
