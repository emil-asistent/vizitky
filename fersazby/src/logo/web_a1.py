# Logo A1 pro web (Denisa vybrala 22. 11. 2026): znak + „FérSazby“ + „.cz“.
# Barvy řídí CSS třídy: .lm-t fajfka, .lm-r kolečka, .lf Fér + tečka, .ls Sazby, .lc cz.
# Výstup: logo-a1.json (viewBox + vnitřek SVG) pro src/build.mjs.
import json, re, io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    import navrhy2 as N
T = dict(acc='TOK_F', main='TOK_S', mute='TOK_C', m1='TOK_T', m2='TOK_R')
CLS = {'TOK_F': 'lf', 'TOK_S': 'ls', 'TOK_C': 'lc', 'TOK_T': 'lm-t', 'TOK_R': 'lm-r'}
def build(fn):
    l = fn(T)
    s = l.svg(None, pad=2)
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    inner = re.sub(r'^<svg[^>]*>|</svg>$', '', s)
    inner = re.sub(r'(fill|stroke)="(TOK_\w)"', lambda m: f'class="{CLS[m.group(2)]}"', inner)
    inner = re.sub(r'\s+', ' ', inner)
    inner = re.sub(r'-?\d+\.\d+', lambda m: ('%.1f' % float(m.group())).rstrip('0').rstrip('.'), inner)
    return vb, inner
vb, inner = build(N.a1)
w, h = [float(x) for x in vb.split()[2:]]
json.dump({'viewBox': vb, 'inner': inner, 'ratio': round(w / h, 4)}, open('logo-a1.json', 'w'))
print(vb, round(w / h, 3), len(inner))
