# Tři návrhy loga FérSazby. Generuje SVG do navrhy/.
from glyphs import text, metrics
NAVY, NAVY2, TEAL, TEALD, CREAM, WHITE = '#0D1F3A', '#172C4B', '#99C6C3', '#2D7A76', '#F7F5F0', '#FFFFFF'
OUT = 'navrhy/'
def svg(w, h, body, bg=None, pad=0):
    b = f'<rect x="{-pad}" y="{-pad}" width="{w+2*pad}" height="{h+2*pad}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {w+2*pad} {h+2*pad}">{b}{body}</svg>'
def save(name, s): open(OUT + name, 'w').write(s)

# ---------- 1) Procento s fajfkou ----------
def pct_mark(c1, c2, sw=13.5, ring=True):
    # mřížka 100×100; fajfka nahrazuje šikmou čáru procenta
    rw = sw * .72; r = 12.5
    ring_attr = f'fill="none" stroke="{c2}" stroke-width="{rw:.1f}"' if ring else f'fill="{c2}"'
    rr = r if ring else r + rw / 2
    return (f'<circle cx="24" cy="23" r="{rr}" {ring_attr}/>'
            f'<circle cx="77" cy="78" r="{rr}" {ring_attr}/>'
            f'<path d="M12 56 L33 77 L84 13" fill="none" stroke="{c1}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>')

def concept1(fer, saz, c1, c2, bg=None):
    size = 100; m = metrics(size=size)
    d1, w1, b1 = text('fér', size=size, track=-0.035)
    d2, w2, b2 = text('sazby', size=size, track=-0.035, x=w1 + 0.2 * size)
    # znak: výška = výška verzálek + kousek, sedí na účaří
    H = 104; s = H / 100; gx = 0; gap = 24
    mark = f'<g transform="translate({gx},{-H}) scale({s})">{pct_mark(c1, c2)}</g>'
    tx = H + gap
    body = mark + f'<g transform="translate({tx},0)"><path fill="{fer}" d="{d1}"/><path fill="{saz}" d="{d2}"/></g>'
    W = tx + b2[2]; top = min(-H, b1[1]); bot = b2[3]
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 {top-30:.0f} {W+60:.0f} {bot-top+60:.0f}">' + (f'<rect x="-30" y="{top-30:.0f}" width="{W+60:.0f}" height="{bot-top+60:.0f}" fill="{bg}"/>' if bg else '') + body + '</svg>'

def icon1(bg, c1, c2):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="{bg}"/><g transform="translate(24,24) scale(.72)">{pct_mark(c1, c2, sw=14)}</g></svg>'

save('1-svetle.svg', concept1(TEALD, NAVY, TEALD, NAVY, WHITE))
save('1-tmave.svg', concept1(TEAL, WHITE, TEAL, WHITE, NAVY))
save('1-ikona.svg', icon1(NAVY, TEAL, WHITE))
save('1-ikona-svetla.svg', icon1(TEAL, NAVY, NAVY))

# ---------- 2) Monogram fs (vlastní geometrie, jeden tah) ----------
def fs_mono(c, sw=13.5):
    # f: kmen + háček; příčka f běží doprava a stává se horním obloukem s (mřížka 100×100)
    st = f'fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"'
    f_path = 'M30 97 V31 C30 15 39 6 55 6'
    bar_s = ('M14 44 H68 C79 44 86 48 89 54 '
             'M68 44 C56 44 50 50 50 57.5 C50 66 59 69 70 71.5 C82 74 90 78.5 90 86.5 C90 94 81 98 69 98 C59 98 52 95.5 48.5 90.5')
    return f'<path {st} d="{f_path}"/><path {st} d="{bar_s}"/>'

def icon2(bg, c):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="{bg}"/><g transform="translate(12,13) scale(.94)">{fs_mono(c)}</g></svg>'


def concept2(fer, saz, mark_bg, mark_c, bg=None):
    size = 100
    d1, w1, b1 = text('Fér', size=size, wght=750, track=-0.025)
    d2, w2, b2 = text('Sazby', size=size, wght=750, track=-0.025, x=w1 + 0.01*size)
    H = 104; gap = 26
    mark = f'<g transform="translate(0,{-H+22}) scale({H/120:.3f})"><rect width="120" height="120" rx="28" fill="{mark_bg}"/><g transform="translate(12,13) scale(.94)">{fs_mono(mark_c)}</g></g>'
    tx = H + gap
    body = mark + f'<g transform="translate({tx},0)"><path fill="{fer}" d="{d1}"/><path fill="{saz}" d="{d2}"/></g>'
    W = tx + b2[2]; top = -H + 22; bot = 22
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 {top-30:.0f} {W+60:.0f} {bot-top+60:.0f}">' + (f'<rect x="-30" y="{top-30:.0f}" width="{W+60:.0f}" height="{bot-top+60:.0f}" fill="{bg}"/>' if bg else '') + body + '</svg>'

save('2-svetle.svg', concept2(TEALD, NAVY, NAVY, TEAL, WHITE))
save('2-tmave.svg', concept2(TEAL, WHITE, TEAL, NAVY, NAVY))
save('2-ikona.svg', icon2(NAVY, TEAL))
save('2-ikona-svetla.svg', icon2(TEAL, NAVY))

# ---------- 3) Bublina „fér“ ----------
def bubble(x0, y0, x1, y1, r, tail=0.3):
    h = y1 - y0; t = h * tail
    a = x0 + r * 0.7; bx = x0 + r * 0.42; c = x0 + r * 2.0
    return (f'M{x0+r:.1f} {y0:.1f} H{x1-r:.1f} Q{x1:.1f} {y0:.1f} {x1:.1f} {y0+r:.1f} V{y1-r:.1f} Q{x1:.1f} {y1:.1f} {x1-r:.1f} {y1:.1f} '
            f'H{c:.1f} L{bx:.1f} {y1+t:.1f} L{a:.1f} {y1-0.5:.1f} Q{x0:.1f} {y1:.1f} {x0:.1f} {y1-r:.1f} V{y0+r:.1f} Q{x0:.1f} {y0:.1f} {x0+r:.1f} {y0:.1f} Z')

def fer_bubble(bub, txt, size=100):
    d1, w1, b1 = text('fér', font='poppins-latin.woff2', wght=None, size=size, track=-0.03)
    px = 0.2*size
    x0, y0, x1, y1 = b1[0]-px, b1[1]-0.17*size, b1[2]+px, b1[3]+0.19*size
    return f'<path fill="{bub}" d="{bubble(x0, y0, x1, y1, 0.27*size)}"/><path fill="{txt}" d="{d1}"/>', (x0, y0, x1, y1 + (y1-y0)*0.3)

def concept3(bub, ftxt, saz, bg=None):
    size = 100
    b, bb = fer_bubble(bub, ftxt, size)
    d2, w2, b2 = text('sazby', font='poppins-latin.woff2', wght=None, size=size, track=-0.03, x=bb[2] + 0.12*size)
    body = b + f'<path fill="{saz}" d="{d2}"/>'
    left, top, W, bot = bb[0], bb[1], b2[2], max(bb[3], b2[3])
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{left-30:.0f} {top-30:.0f} {W-left+60:.0f} {bot-top+60:.0f}">' + (f'<rect x="{left-30:.0f}" y="{top-30:.0f}" width="{W-left+60:.0f}" height="{bot-top+60:.0f}" fill="{bg}"/>' if bg else '') + body + '</svg>'

def icon3(bg, bub, txt):
    b, bb = fer_bubble(bub, txt)
    w = bb[2]-bb[0]; h = bb[3]-bb[1]; sc = 86 / max(w, h)
    tx = 60 - (bb[0]+w/2)*sc; ty = 60 - (bb[1]+h/2)*sc
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="{bg}"/><g transform="translate({tx:.1f},{ty:.1f}) scale({sc:.3f})">{b}</g></svg>'

save('3-svetle.svg', concept3(TEAL, NAVY, NAVY, WHITE))
save('3-tmave.svg', concept3(TEAL, NAVY, WHITE, NAVY))
save('3-ikona.svg', icon3(NAVY, TEAL, NAVY))
save('3-ikona-svetla.svg', icon3(CREAM, TEAL, NAVY))
