# Sestaví loga-web/index.html: druhé kolo loga (FérSazby.cz × FÉRsazby.cz, po třech řešeních).
# Spouštět z kořene projektu fersazby/:  python3 src/logo/stranka2.py
import shutil, os
SRC = 'src/logo/navrhy2/'
WEB = 'loga-web/'
os.makedirs(WEB + 'loga', exist_ok=True)
for f in os.listdir(SRC):
    shutil.copy(SRC + f, WEB + 'loga/' + f)
import sys; sys.path.insert(0, 'src/logo'); os.chdir('src/logo')
from navrhy import pct_mark
os.chdir('../..')
open(WEB + 'loga/znak.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">{pct_mark("#99C6C3", "#99C6C3")}</svg>')
for f in ('1-ikona.svg', '1-ikona-svetla.svg'):
    shutil.copy('src/logo/navrhy/' + f, WEB + 'loga/' + f)

NAV = '<nav><a>Úvěr</a><a>Konsolidace</a><a>Hypotéka</a><a>Pojištění auta</a></nav>'
MAIL = 'info@fersazby.cz'

CH = [
    ('a', 'FérSazby.cz', 'Jedno slovo, dvě velká písmena. Čte se plynule a připomíná značku, kterou si člověk zapamatuje jako jméno.', [
        ('a1', 'Dvě barvy, doména v pozadí',
         'Fér v tyrkysové, Sazby v tmavě modré. Koncovka .cz je lehčím řezem a tlumeně, takže značkou zůstává FérSazby a doména jen napoví, kam jít.'),
        ('a2', 'Fajfka místo čárky',
         'Čárka nad é je malá fajfka ze znaku. Celý nápis je jednou barvou a tyrkysové zůstávají jen dva detaily: fajfka a tečka. Nejčistší a nejvíc „bankovní“.'),
        ('a3', 'Doména jako štítek',
         'FérSazby velkým písmem a .cz v malém tyrkysovém štítku nahoře, jako razítko „ověřeno“. Bez koncovky se nápis dá použít i samostatně, třeba na vizitce nebo v reklamě.'),
    ]),
    ('b', 'FÉRsazby.cz', 'Slovo FÉR velkými písmeny je hlavní sdělení. Na první pohled je jasné, co web slibuje.', [
        ('b1', 'Velké FÉR v barvě',
         'FÉR verzálkami v tyrkysové, sazby malými v tmavě modré. Přímočaré a dobře čitelné i v malé hlavičce na mobilu.'),
        ('b2', 'FÉR jako razítko',
         'FÉR vyražené v plném tyrkysovém poli, vedle sazby.cz. Nejvýraznější ze všech, v reklamě na Facebooku nebo Googlu je vidět nejdřív.'),
        ('b3', 'Silné FÉR, lehké sazby',
         'Nejtučnější FÉR s fajfkou nad É a vedle tenké sazby.cz. Kontrast řezů dělá nápis elegantní, působí nejvíc jako prémiová značka.'),
    ]),
]


def img(k, v, cls=''):
    return f'<img src="/loga/{k}-{v}.svg" alt="" class="{cls}">'


def variant(k, title, desc):
    K = k.upper()
    return f'''
<article class="v" id="{k}">
  <header class="vh"><span class="code">{K}</span><div><h3>{title}</h3><p>{desc}</p></div></header>
  <div class="duo">
    <figure class="t light">{img(k, 'svetle-bez')}</figure>
    <figure class="t dark">{img(k, 'tmave-bez')}</figure>
  </div>
  <div class="mocks">
    <div class="browser">
      <div class="chrome"><i></i><i></i><i></i><span>fersazby.cz</span></div>
      <div class="site">
        <div class="hdr">{img(k, 'tmave-bez', 'lg')}{NAV}<span class="pill">{MAIL}</span></div>
        <div class="hero-copy"><b>Sazba, která je k vám <em>prostě fér.</em></b><span>Úvěr, konsolidace, hypotéka i pojištění auta. Srovnám banky za vás.</span></div>
      </div>
      <div class="hdr light">{img(k, 'svetle-bez', 'lg')}{NAV}<span class="pill">{MAIL}</span></div>
    </div>
    <div class="phone"><div class="scr">
      <div class="ph-hdr">{img(k, 'svetle-bez', 'lg')}<span class="burger"><i></i><i></i></span></div>
      <div class="ph-hero"><b>Sazba, která je k vám <em>prostě fér.</em></b></div>
      <div class="ph-card"><small>Kolik potřebujete</small><strong>350 000 Kč</strong><span class="bar"><i></i></span><small>Splatnost <b>240 měsíců</b></small><span class="btn">Chci nový úvěr s fér sazbou</span></div>
    </div></div>
  </div>
</article>'''


chapters = ''
for cid, name, lead, vs in CH:
    chapters += f'''
<section class="ch" id="{cid}">
  <div class="ch-head"><span class="ch-n">{"Zápis 1" if cid == "a" else "Zápis 2"}</span><h2>{name}</h2><p>{lead}</p></div>
  {''.join(variant(*v) for v in vs)}
</section>'''

compare = ''.join(
    f'<a class="cmp" href="#{k}"><span class="code">{k.upper()}</span>{img(k, "svetle-bez")}</a>'
    for _, _, _, vs in CH for k, _, _ in vs)

css = '''
@font-face{font-family:J;font-weight:200 800;font-display:swap;src:url(/fonts/plus-jakarta-sans-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1E00-1EFF}
@font-face{font-family:J;font-weight:200 800;font-display:swap;src:url(/fonts/plus-jakarta-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
:root{--navy:#0D1F3A;--teal:#99C6C3;--tealD:#2D7A76;--cream:#F7F5F0;--paper:#ECEAE4;--ink:rgba(13,31,58,.66)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:J,system-ui,sans-serif;background:var(--paper);color:var(--navy);-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{display:block}
.wrap{max-width:1240px;margin:0 auto;padding:0 16px}

/* úvod */
.intro{background:var(--navy);color:#fff;padding:28px 0 0;position:relative;overflow:hidden}
.intro .top{display:flex;justify-content:space-between;align-items:center;gap:16px}
.intro .top img{height:30px;width:auto}
.intro .top span{font-size:13px;font-weight:600;color:rgba(255,255,255,.6);text-align:right}
.intro .big{display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:end;padding:clamp(56px,9vw,120px) 0 clamp(40px,6vw,72px)}
.intro h1{font-size:clamp(38px,6.4vw,84px);line-height:.98;letter-spacing:-.045em;font-weight:800}
.intro h1 em{font-style:normal;color:var(--teal)}
.intro .lead{font-size:clamp(16px,1.6vw,19px);line-height:1.55;color:rgba(255,255,255,.72);max-width:44ch}
.intro .lead b{color:#fff}
.mark-xl{position:absolute;right:-4vw;top:40px;width:min(44vw,520px);opacity:.09;pointer-events:none}
.jump{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:rgba(255,255,255,.1);border-top:1px solid rgba(255,255,255,.1)}
.jump a{background:var(--navy);color:#fff;text-decoration:none;padding:26px 16px 30px;display:flex;justify-content:space-between;align-items:baseline;gap:12px;transition:background .2s}
.jump a:hover{background:#13294A}
.jump b{font-size:clamp(22px,3.4vw,40px);letter-spacing:-.035em}
.jump small{font-size:13px;color:var(--teal);font-weight:700;white-space:nowrap}

/* kapitoly */
.ch{padding:clamp(56px,8vw,110px) 0 0}
.ch-head{display:grid;grid-template-columns:auto 1fr;gap:6px 28px;align-items:end;margin-bottom:clamp(28px,4vw,48px)}
.ch-n{grid-column:1/-1;font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--tealD)}
.ch h2{font-size:clamp(44px,9vw,128px);line-height:.9;letter-spacing:-.055em;font-weight:800}
.ch-head p{color:var(--ink);font-size:16px;line-height:1.55;max-width:38ch;padding-bottom:10px}

.v{background:var(--cream);border-radius:32px;padding:clamp(16px,2.6vw,32px);margin-bottom:20px}
.vh{display:flex;gap:18px;align-items:flex-start;margin:4px 4px 22px}
.code{flex:none;display:inline-grid;place-items:center;min-width:52px;height:52px;padding:0 10px;border-radius:16px;background:var(--navy);color:var(--teal);font-weight:800;font-size:19px;letter-spacing:-.02em}
.vh h3{font-size:clamp(21px,2.4vw,28px);letter-spacing:-.03em;line-height:1.15;padding-top:2px}
.vh p{color:var(--ink);line-height:1.55;margin-top:6px;max-width:70ch;font-size:15.5px}

.duo{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.t{border-radius:22px;display:grid;place-items:center;padding:clamp(36px,6vw,72px) clamp(20px,4vw,56px);min-height:220px}
.t img{width:100%;max-width:470px;height:auto}
.light{background:#fff}.dark{background:var(--navy)}

.mocks{display:grid;grid-template-columns:1fr 290px;gap:12px;margin-top:12px;align-items:stretch}
.browser{border-radius:22px;overflow:hidden;background:#fff;display:flex;flex-direction:column;box-shadow:0 1px 0 rgba(13,31,58,.06)}
.chrome{display:flex;align-items:center;gap:6px;padding:11px 16px;background:#E4E2DC}
.chrome i{width:10px;height:10px;border-radius:50%;background:rgba(13,31,58,.18)}
.chrome span{margin-left:14px;background:#fff;border-radius:8px;padding:4px 14px;font-size:12px;font-weight:600;color:var(--ink);flex:0 1 260px}
.site{position:relative;flex:1;min-height:330px;background:linear-gradient(90deg,rgba(13,31,58,.94) 0%,rgba(13,31,58,.78) 34%,rgba(13,31,58,.1) 70%),url(/img/hero-1600.webp) 60% 30%/cover;color:#fff;display:flex;flex-direction:column}
.hdr{display:flex;align-items:center;gap:22px;padding:20px 26px}
.hdr .lg{height:34px;width:auto;flex:none}
.hdr nav{flex:1;display:flex;justify-content:center;gap:24px;font-size:14px;font-weight:600;white-space:nowrap}
.hdr nav a{position:relative}
.hdr nav a:first-child:after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;border-radius:2px;background:var(--teal)}
.pill{flex:none;font-size:13px;font-weight:700;padding:9px 15px;border-radius:99px;background:var(--teal);color:var(--navy);white-space:nowrap}
.hdr.light{color:var(--navy);border-top:1px solid rgba(13,31,58,.08)}
.hdr.light .pill{background:var(--navy);color:#fff}
.hero-copy{padding:26px 26px 34px;margin-top:auto;max-width:430px;display:grid;gap:10px}
.hero-copy b{font-size:clamp(26px,3vw,38px);line-height:1.02;letter-spacing:-.04em}
.hero-copy em{font-style:normal;color:var(--teal)}
.hero-copy span{font-size:14px;color:rgba(255,255,255,.75);line-height:1.5}

.phone{background:var(--navy);border-radius:40px;padding:9px;display:flex}
.scr{background:#fff;border-radius:32px;overflow:hidden;flex:1;display:flex;flex-direction:column}
.ph-hdr{display:flex;align-items:center;justify-content:space-between;padding:20px 16px 12px}
.ph-hdr .lg{height:24px;width:auto;max-width:190px}
.burger{display:grid;gap:5px;width:22px}.burger i{height:2.5px;border-radius:2px;background:var(--navy)}
.ph-hero{height:150px;background:linear-gradient(180deg,rgba(13,31,58,0) 30%,rgba(13,31,58,.85)),url(/img/hero-m-900.webp) 50% 25%/cover;display:flex;align-items:flex-end;padding:14px}
.ph-hero b{color:#fff;font-size:21px;line-height:1.05;letter-spacing:-.035em}
.ph-hero em{font-style:normal;color:var(--teal)}
.ph-card{margin:12px;padding:14px;border-radius:18px;background:var(--cream);display:grid;gap:6px}
.ph-card small{font-size:11px;color:var(--ink);font-weight:600}
.ph-card small b{color:var(--navy)}
.ph-card strong{font-size:22px;letter-spacing:-.03em}
.ph-card .bar{height:6px;border-radius:6px;background:rgba(13,31,58,.12);margin:4px 0 6px}
.ph-card .bar i{display:block;width:62%;height:100%;border-radius:6px;background:var(--tealD)}
.ph-card .btn{margin-top:6px;background:var(--navy);color:#fff;text-align:center;border-radius:12px;padding:11px 8px;font-size:12.5px;font-weight:700}

/* ikona + srovnání */
.icons{margin-top:clamp(56px,8vw,110px);display:grid;grid-template-columns:1fr auto;gap:24px 40px;align-items:center;background:var(--navy);color:#fff;border-radius:32px;padding:clamp(24px,4vw,48px)}
.icons h2{font-size:clamp(26px,3.4vw,40px);letter-spacing:-.035em;line-height:1.05}
.icons p{color:rgba(255,255,255,.7);line-height:1.55;margin-top:10px;max-width:52ch}
.ic{display:flex;gap:16px;align-items:center}
.ic img{width:104px;height:104px}.ic img.s{width:40px;height:40px}.ic img.xs{width:20px;height:20px}

.cmp-wrap{padding:clamp(56px,8vw,110px) 0 40px}
.cmp-wrap h2{font-size:clamp(30px,4.4vw,56px);letter-spacing:-.045em;line-height:1}
.cmp-wrap>p{color:var(--ink);margin:12px 0 28px;line-height:1.55;max-width:56ch}
.cmp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cmp{background:#fff;border-radius:20px;padding:26px 24px;display:flex;align-items:center;gap:20px;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}
.cmp:hover{transform:translateY(-2px);box-shadow:0 10px 30px -12px rgba(13,31,58,.25)}
.cmp .code{min-width:44px;height:44px;font-size:16px;border-radius:13px}
.cmp img{height:44px;width:auto;max-width:calc(100% - 70px)}
.foot{padding:30px 0 60px;color:var(--ink);font-size:14px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
.foot a{color:var(--tealD);font-weight:700}

@media(max-width:980px){
  .mocks{grid-template-columns:1fr}
  .phone{max-width:300px;margin:0 auto;width:100%}
  .hdr nav{display:none}.hdr{justify-content:space-between}
  .intro .big{grid-template-columns:1fr;gap:20px}
}
@media(max-width:700px){
  .duo,.cmp-grid{grid-template-columns:1fr}
  .ch-head{grid-template-columns:1fr}
  .jump{grid-template-columns:1fr}
  .jump a{padding:20px 16px}
  .t{min-height:150px;padding:32px 22px}
  .hdr{padding:14px 16px;gap:10px}.hdr .lg{height:24px;max-width:55%}.pill{font-size:11px;padding:7px 10px}
  .site{min-height:280px}
  .hero-copy{padding:18px 16px 22px}
  .icons{grid-template-columns:1fr}
  .cmp{padding:20px 16px;gap:14px}.cmp img{height:34px}
  .v{border-radius:24px}
}
'''

html = f'''<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Logo FérSazby, 2. kolo</title>
<meta name="description" content="Vybraný znak FérSazby ve dvou zápisech názvu, ke každému tři řešení.">
<link rel="icon" href="/loga/1-ikona.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>{css}</style></head><body>
<header class="intro">
  <img class="mark-xl" src="/loga/znak.svg" alt="">
  <div class="wrap">
    <div class="top"><img src="/loga/a1-tmave-bez.svg" alt="FérSazby"><span>Logo, 2. kolo</span></div>
    <div class="big">
      <h1>Váš znak, <em>dva zápisy</em> názvu, šest řešení.</h1>
      <p class="lead">Znak procenta s fajfkou zůstává, jak jste ho vybrala. Tady je nápis vedle něj ve dvou podobách, <b>FérSazby.cz</b> a <b>FÉRsazby.cz</b>, ke každé tři řešení. V hlavičce už je místo telefonu e-mail info@fersazby.cz. Každé řešení má kód, stačí napsat třeba „A2“.</p>
    </div>
  </div>
  <div class="jump"><a href="#a"><b>FérSazby.cz</b><small>A1 – A3</small></a><a href="#b"><b>FÉRsazby.cz</b><small>B1 – B3</small></a></div>
</header>
<main class="wrap">
{chapters}
<section class="icons">
  <div><h2>Ikona zůstává stejná</h2><p>Pro všech šest řešení platí jedna ikona: znak procenta s fajfkou. Použije se jako ikona v prohlížeči, profilová fotka na Facebooku a Instagramu a obrázek u reklam.</p></div>
  <div class="ic"><img src="/loga/1-ikona.svg" alt=""><img src="/loga/1-ikona-svetla.svg" alt=""><img class="s" src="/loga/1-ikona.svg" alt=""><img class="xs" src="/loga/1-ikona.svg" alt=""></div>
</section>
<section class="cmp-wrap" id="srovnani">
  <h2>Všech šest vedle sebe</h2>
  <p>V tomhle měřítku bude logo vidět v hlavičce webu. Kliknutím se vrátíte k detailu.</p>
  <div class="cmp-grid">{compare}</div>
</section>
<footer class="foot"><span>Připravil Vojtěch Poláček · +420 797 848 297</span><a href="/puvodni-navrhy">Původní tři návrhy loga</a></footer>
</main>
</body></html>'''
open(WEB + 'index.html', 'w').write(html)
print('ok', len(html))
