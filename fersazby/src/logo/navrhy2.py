# Druhé kolo loga FérSazby (Denisa 20. 11.): vybraný znak „procento s fajfkou“,
# dva zápisy názvu „FérSazby.cz“ a „FÉRsazby.cz“, ke každému tři typografická řešení.
# Výstup: navrhy2/<id>-svetle.svg, -tmave.svg
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from glyphs import load
from navrhy import pct_mark
import os

NAVY, TEAL, TEALD, WHITE = '#0D1F3A', '#99C6C3', '#2D7A76', '#FFFFFF'
OUT = 'navrhy2/'
os.makedirs(OUT, exist_ok=True)
JS = 'plus-jakarta-sans-latin.woff2'
S = 100  # velikost písma (em), účaří y = 0


class L:
    """Skládačka loga: kreslí kusy zleva doprava a hlídá rozměry."""
    def __init__(s):
        s.x = 0; s.parts = []; s.box = [1e9, 1e9, -1e9, -1e9]

    def grow(s, b):
        s.box = [min(s.box[0], b[0]), min(s.box[1], b[1]), max(s.box[2], b[2]), max(s.box[3], b[3])]

    def glyph(s, ch, col, w=800, size=S, track=0, y=0, base=None):
        f = load(JS, w); gs = f.getGlyphSet(); g = f.getBestCmap()[ord(base or ch)]
        k = size / f['head'].unitsPerEm
        pen = SVGPathPen(gs); gs[g].draw(TransformPen(pen, (k, 0, 0, -k, s.x, y)))
        bp = BoundsPen(gs); gs[g].draw(bp); b = bp.bounds
        box = (s.x + b[0] * k, y - b[3] * k, s.x + b[2] * k, y - b[1] * k)
        s.parts.append(f'<path fill="{col}" d="{pen.getCommands()}"/>'); s.grow(box)
        s.x += gs[g].width * k + track * size
        return box

    def word(s, txt, col, w=800, size=S, track=-0.03, kern=None):
        boxes = []
        for i, ch in enumerate(txt):
            boxes.append(s.glyph(ch, col, w, size, track))
            s.x += (kern or {}).get(i, 0) * size
        return boxes

    def tick_accent(s, box, col, sw, h, lift, shift=0.0):
        # fajfka místo čárky nad písmenem, stejná geometrie jako fajfka ve znaku
        # (body znaku 12,56 / 33,77 / 84,13 -> šířka 72, výška 64)
        k = h / 64; w = 72 * k
        cx = (box[0] + box[2]) / 2 + (box[2] - box[0]) * shift
        bottom = box[1] - lift
        x0 = cx - w * 0.38  # údolí fajfky lehce vlevo od středu, jako u čárky
        pts = [(x0, bottom - 21 * k), (x0 + 21 * k, bottom), (x0 + w, bottom - h)]
        p = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
        s.parts.append(f'<path d="{p}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>')
        s.grow((x0 - sw/2, bottom - h - sw/2, x0 + w + sw/2, bottom + sw/2))

    def dot(s, col, size=S, r=None, w=800):
        # tečka před cz jako kolečko z procenta
        r = r or size * 0.082
        cx = s.x + r + size * 0.02
        s.parts.append(f'<circle cx="{cx:.1f}" cy="{-r:.1f}" r="{r:.1f}" fill="{col}"/>')
        s.grow((cx - r, -2 * r, cx + r, 0)); s.x = cx + r + size * 0.035

    def mark(s, c1, c2, H=104, gap=26, y=0):
        sc = H / 100
        s.parts.append(f'<g transform="translate({s.x:.1f},{y - H:.1f}) scale({sc})">{pct_mark(c1, c2)}</g>')
        s.grow((s.x, y - H, s.x + H, y)); s.x += H + gap

    def raw(s, svg, box):
        s.parts.append(svg); s.grow(box)

    def svg(s, bg=None, pad=30):
        x0, y0, x1, y1 = s.box; x0 -= pad; y0 -= pad; w = x1 - x0 + pad; h = y1 - y0 + pad
        r = f'<rect x="{x0:.0f}" y="{y0:.0f}" width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ''
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.0f} {y0:.0f} {w:.0f} {h:.0f}">{r}{"".join(s.parts)}</svg>'


def save(name, s): open(OUT + name, 'w').write(s)

# Barvy pro světlou / tmavou verzi: (akcent, hlavní, tlumená, znak-fajfka, znak-kolečka)
LIGHT = dict(acc=TEALD, main=NAVY, mute='#6B7A8F', m1=TEALD, m2=NAVY)
DARK = dict(acc=TEAL, main=WHITE, mute='#8FA0B8', m1=TEAL, m2=WHITE)


# ---------- FérSazby.cz ----------
def a1(c):
    # Dvoubarevné slovo, .cz tlumeně a lehčím řezem: doména je doplněk, ne součást značky.
    l = L(); l.mark(c['m1'], c['m2'])
    l.word('Fér', c['acc'], 800, track=-0.035)
    l.x += 0.01 * S
    l.word('Sazby', c['main'], 800, track=-0.035)
    l.x += 0.01 * S
    l.dot(c['acc'], r=S * 0.07)
    l.word('cz', c['mute'], 500, track=-0.02)
    return l


def a2(c):
    # Celé slovo jednou barvou, fajfka ze znaku se vrací jako čárka nad é.
    l = L(); l.mark(c['m1'], c['m2'])
    l.word('F', c['main'], 800, track=-0.035)
    eb = l.glyph('é', c['main'], 800, track=-0.035, base='e')
    l.word('r', c['main'], 800, track=-0.035)
    l.tick_accent(eb, c['acc'], sw=10.5, h=30, lift=12, shift=0.04)
    l.x += 0.01 * S
    l.word('Sazby', c['main'], 800, track=-0.035)
    l.dot(c['acc'], r=S * 0.075)
    l.word('cz', c['main'], 800, track=-0.035)
    return l


def a3(c, dark=False):
    # Doména jako štítek: „.cz“ v zaobleném poli nahoře u verzálek, jako razítko ověřeno.
    l = L(); l.mark(c['m1'], c['m2'])
    l.word('Fér', c['acc'], 800, track=-0.035)
    l.x += 0.01 * S
    l.word('Sazby', c['main'], 800, track=-0.035)
    # štítek
    l.x += 0.07 * S
    sz = S * 0.46
    tl = L(); tl.x = 0
    tl.dot(NAVY if not dark else NAVY, size=sz, r=sz * 0.09); tl.word('cz', NAVY, 800, size=sz, track=-0.01)
    tw = tl.box[2] - tl.box[0]; padx = sz * 0.34; h = sz * 0.96
    top = -S * 0.745; x0 = l.x
    bg = TEAL
    rect = f'<rect x="{x0:.1f}" y="{top:.1f}" width="{tw + 2*padx:.1f}" height="{h:.1f}" rx="{h/2:.1f}" fill="{bg}"/>'
    ty = top + h / 2 + sz * 0.36  # účaří uvnitř štítku
    inner = f'<g transform="translate({x0 + padx - tl.box[0]:.1f},{ty:.1f})">{"".join(tl.parts)}</g>'
    l.raw(rect + inner, (x0, top, x0 + tw + 2 * padx, top + h))
    l.x = x0 + tw + 2 * padx
    return l


# ---------- FÉRsazby.cz ----------
def b1(c):
    # Verzálky FÉR jako důraz, sazby malými. FÉR v akcentu, zbytek tmavě.
    l = L(); l.mark(c['m1'], c['m2'])
    l.word('FÉR', c['acc'], 800, track=-0.02)
    l.x += 0.015 * S
    l.word('sazby', c['main'], 800, track=-0.035)
    l.dot(c['acc'], r=S * 0.07)
    l.word('cz', c['mute'], 500, track=-0.02)
    return l


def b2(c, dark=False):
    # FÉR vyražené v plném poli (razítko „schváleno“), vedle sazby.cz.
    l = L(); l.mark(c['m1'], c['m2'])
    l.x -= 4
    fl = L(); boxes = fl.word('FÉR', NAVY if not dark else NAVY, 800, track=0.01)
    padx, pady = 0.17 * S, 0.15 * S
    x0 = l.x; top = fl.box[1] - pady; bot = pady
    w = fl.box[2] - fl.box[0] + 2 * padx
    rect = f'<rect x="{x0:.1f}" y="{top:.1f}" width="{w:.1f}" height="{bot - top:.1f}" rx="{0.16*S:.1f}" fill="{TEAL if dark else TEALD}"/>'
    col = NAVY if dark else WHITE
    inner = f'<g transform="translate({x0 + padx - fl.box[0]:.1f},0)">' + ''.join(p.replace(f'fill="{NAVY}"', f'fill="{col}"') for p in fl.parts) + '</g>'
    l.raw(rect + inner, (x0, top, x0 + w, bot))
    l.x = x0 + w + 0.1 * S
    l.word('sazby', c['main'], 800, track=-0.035)
    l.dot(c['acc'], r=S * 0.07)
    l.word('cz', c['main'], 800, track=-0.035)
    return l


def b3(c):
    # Kontrast řezů: FÉR nejtučnější s fajfkou místo čárky, sazby.cz tenkým řezem.
    l = L(); l.mark(c['m1'], c['m2'])
    l.word('F', c['main'], 800, track=0.0)
    eb = l.glyph('É', c['main'], 800, track=0.0, base='E')
    l.word('R', c['main'], 800, track=0.0)
    l.tick_accent(eb, c['acc'], sw=11, h=32, lift=12, shift=0.02)
    l.x += 0.04 * S
    l.word('sazby', c['main'], 300, track=-0.02)
    l.dot(c['acc'], r=S * 0.07)
    l.word('cz', c['main'], 300, track=-0.02)
    return l


V = {'a1': a1, 'a2': a2, 'a3': a3, 'b1': b1, 'b2': b2, 'b3': b3}
for k, fn in V.items():
    kw = lambda d: {'dark': d} if fn in (a3, b2) else {}
    save(f'{k}-svetle.svg', fn(LIGHT, **kw(False)).svg('#FFFFFF'))
    save(f'{k}-tmave.svg', fn(DARK, **kw(True)).svg(NAVY))
    save(f'{k}-svetle-bez.svg', fn(LIGHT, **kw(False)).svg(None, pad=2))
    save(f'{k}-tmave-bez.svg', fn(DARK, **kw(True)).svg(None, pad=2))
print('ok')
