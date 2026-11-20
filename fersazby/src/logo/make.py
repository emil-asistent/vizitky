# Logo FérSazby: Poppins Black, čárka nad é = fajfka. Výstup: SVG cesty (žádné písmo potřeba).
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
f = TTFont(sys.argv[1]); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
TRACK = -0.045 * upm
def word(text, x0):
    parts = []; x = x0
    for ch in text:
        g = cmap[ord(ch)]; pen = SVGPathPen(gs)
        from fontTools.pens.transformPen import TransformPen
        tp = TransformPen(pen, (1, 0, 0, -1, x, 0)); gs[g].draw(tp)
        bp = BoundsPen(gs); gs[g].draw(bp)
        parts.append((ch, pen.getCommands(), x, bp.bounds))
        x += gs[g].width + TRACK
    return parts, x
fer, x1 = word('fer', 0)
sazby, x2 = word('sazby', x1 + 0.075 * upm)
e = fer[1]; ex = e[2]; eb = e[3]   # bounds of e (font units, y up)
cx = ex + (eb[0] + eb[2]) / 2; top = eb[3]
# fajfka nad e: krátké rameno vlevo, dlouhé doprava nahoru (jako čárka nad é)
s = 1
pts = [(cx - 95*s, top + 205*s), (cx + 5*s, top + 115*s), (cx + 215*s, top + 360*s)]
tick = 'M{:.0f} {:.0f} L{:.0f} {:.0f} L{:.0f} {:.0f}'.format(*[v for p in pts for v in (p[0], -p[1])])
dot_r = 0.075 * upm; dot_x = x2 + dot_r + 0.01 * upm
H = top + 360*s + 70; D = 280   # nad základnou / pod (y v sazby)
minx = min(p[3][0] + p[2] for p in fer) - 10
out = {
  'viewBox': f'{minx:.0f} {-H:.0f} {dot_x + dot_r - minx + 10:.0f} {H + D:.0f}',
  'fer': ' '.join(p[1] for p in fer), 'sazby': ' '.join(p[1] for p in sazby),
  'tick': tick, 'tickW': 0.1 * upm, 'dot': [round(dot_x), round(-dot_r), round(dot_r)],
}
json.dump(out, open(sys.argv[2], 'w'))
print(out['viewBox'])
