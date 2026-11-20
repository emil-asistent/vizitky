# Pomocník: obrysy písmen z našich písem jako SVG cesty (v jednotkách písma, y dolů).
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.varLib import instancer
import functools
FONTS = '/Users/emilstudio/coolify-migrace/vizitky/fersazby/public/fonts/'

@functools.lru_cache(None)
def load(name, wght=None):
    f = TTFont(FONTS + name)
    if wght and 'fvar' in f: f = instancer.instantiateVariableFont(f, {'wght': wght})
    return f

def text(s, font='plus-jakarta-sans-latin.woff2', wght=800, size=100, track=0.0, x=0, y=0, kern=None):
    """Vrátí (path_d, šířka, bounds) pro text; size = výška em v px, y = účaří."""
    f = load(font, wght); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    k = size / upm; d = []; cx = x; boxes = []
    for i, ch in enumerate(s):
        if ch == ' ': cx += 0.26 * size; continue
        g = cmap[ord(ch)]; pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, cx, y)))
        bp = BoundsPen(gs); gs[g].draw(bp)
        if bp.bounds: b = bp.bounds; boxes.append((cx + b[0]*k, y - b[3]*k, cx + b[2]*k, y - b[1]*k))
        d.append(pen.getCommands())
        cx += gs[g].width * k + track * size + ((kern or {}).get(i, 0)) * size
    bb = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    return ' '.join(d), cx - x, bb

def metrics(font='plus-jakarta-sans-latin.woff2', wght=800, size=100):
    f = load(font, wght); upm = f['head'].unitsPerEm; os2 = f['OS/2']
    return {'x': os2.sxHeight * size / upm, 'cap': os2.sCapHeight * size / upm}
