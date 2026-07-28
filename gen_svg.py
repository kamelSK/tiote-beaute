#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur de visuels SVG éditoriaux pour Tiote Beauté.
Style : "mèches" / hair strands duotone, fond profond, glow doré, grain.
Sortie : site/assets/img/generated/*.svg
"""
import math, random, os

OUT = r"C:\Users\k.selmi\OneDrive - AF COMMUNICATION\Bureau\AVANT-PROJETS\tiote beauté\site\assets\img\generated"

# Palettes : (bg_top, bg_bot, glow, [strand colors light->dark], highlight)
PAL = {
    "gold":   ("#16130b", "#0b0b0d", "#c9a24b", ["#f4e9c8", "#e3c988", "#c9a24b", "#a07d2f"], "#f7edcf"),
    "rose":   ("#17101400"[:-2] and "#171014", "#0c0a0d", "#c98fa0", ["#f0d6de", "#e8c2cd", "#c98fa0", "#8f5f6c"], "#f6e2e9"),
    "teal":   ("#0c1614", "#0a0d0d", "#57b3a4", ["#d6f0ea", "#9fe0d4", "#57b3a4", "#2f6f66"], "#e6f7f2"),
    "plum":   ("#150f17", "#0b0a0d", "#9a6fb0", ["#e4d2ee", "#d0b2e0", "#9a6fb0", "#5f3f6c"], "#efe2f5"),
    "copper": ("#170f0a", "#0c0908", "#c9794b", ["#f0cfb8", "#e8b28f", "#c9794b", "#8f4f2f"], "#f7e3d4"),
    "champ":  ("#161307", "#0b0a06", "#d8c07a", ["#f6efd6", "#ecdcae", "#d8c07a", "#a68f4f"], "#faf3dd"),
    "noir":   ("#111114", "#0a0a0c", "#8f8f98", ["#e0e0e6", "#b8b8c0", "#8f8f98", "#5a5a62"], "#eeeef2"),
}

def strand_path(x0, w, h, sweep, amp, phase, top, bot, steps=9):
    """Une mèche : cascade douce = lean directionnel commun + une seule ondulation (hump)."""
    pts = []
    for i in range(steps + 1):
        t = i / steps
        y = (top + (bot - top) * t) * h
        # lean progressif (ease-in) + une seule bosse sinusoïdale douce
        lean = sweep * w * (t * t * (3 - 2 * t))          # smoothstep
        hump = amp * math.sin(t * math.pi + phase)         # 0 aux extrémités
        x = x0 + lean + hump
        pts.append((x, y))
    d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f} "
    for i in range(1, len(pts)):
        x1, y1 = pts[i - 1]
        x2, y2 = pts[i]
        cy = (y1 + y2) / 2
        d += f"C {x1:.1f} {cy:.1f} {x2:.1f} {cy:.1f} {x2:.1f} {y2:.1f} "
    return d

def make(name, w, h, palette, seed, density=1.0, lush=True, part=0.5):
    random.seed(seed)
    bt, bb, glow, cols, hi = PAL[palette]
    uid = f"{name}".replace("/", "_")
    n_back = int(20 * density)
    n_front = int(34 * density) if lush else int(16 * density)

    # direction de cascade commune à toute l'image (mèches cohérentes, pas de treillis)
    sweep_dir = random.uniform(0.14, 0.30) * random.choice([-1, 1])

    def strands(count, blur, wrange, orange, amprange, palette_bias):
        g = f'<g filter="url(#blur_{uid})">' if blur else '<g>'
        parts = [g]
        for _ in range(count):
            # réparties autour d'une ligne de séparation, en bande
            x0 = (part + random.uniform(-0.6, 0.6)) * w
            sweep = sweep_dir * random.uniform(0.7, 1.25)        # même sens, amplitude variée
            amp = random.uniform(*amprange) * w                  # légère ondulation
            phase = random.uniform(-0.5, 0.9)
            # longueurs superposées
            top = random.uniform(-0.08, 0.16)
            bot = random.uniform(0.86, 1.10)
            sw = random.uniform(*wrange)
            op = random.uniform(*orange)
            if random.random() < palette_bias:
                col = hi; op = min(0.9, op + 0.18)
            else:
                col = random.choice(cols)
            d = strand_path(x0, w, h, sweep, amp, phase, top, bot)
            parts.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{sw:.2f}" '
                         f'stroke-linecap="round" opacity="{op:.2f}"/>')
        parts.append('</g>')
        return "".join(parts)

    back = strands(n_back, True, (3.0, 8.0), (0.05, 0.15), (0.02, 0.06), 0.05)
    front = strands(n_front, False, (0.6, 2.4), (0.16, 0.52), (0.015, 0.05), 0.16 if lush else 0.06)

    svg = f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img">
<defs>
<linearGradient id="bg_{uid}" x1="0" y1="0" x2="0.3" y2="1">
<stop offset="0" stop-color="{bt}"/><stop offset="1" stop-color="{bb}"/>
</linearGradient>
<radialGradient id="glow_{uid}" cx="{0.28 + 0.4*random.random():.2f}" cy="0.22" r="0.9">
<stop offset="0" stop-color="{glow}" stop-opacity="0.42"/>
<stop offset="0.5" stop-color="{glow}" stop-opacity="0.10"/>
<stop offset="1" stop-color="{glow}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="vig_{uid}" cx="0.5" cy="0.45" r="0.75">
<stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
<stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
</radialGradient>
<linearGradient id="fade_{uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="{bb}" stop-opacity="0.85"/>
<stop offset="0.16" stop-color="{bb}" stop-opacity="0"/>
<stop offset="0.84" stop-color="{bb}" stop-opacity="0"/>
<stop offset="1" stop-color="{bb}" stop-opacity="0.9"/>
</linearGradient>
<filter id="blur_{uid}"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="grain_{uid}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"/></filter>
</defs>
<rect width="{w}" height="{h}" fill="url(#bg_{uid})"/>
<rect width="{w}" height="{h}" fill="url(#glow_{uid})"/>
{back}
{front}
<rect width="{w}" height="{h}" fill="url(#fade_{uid})"/>
<rect width="{w}" height="{h}" fill="url(#vig_{uid})"/>
<rect width="{w}" height="{h}" filter="url(#grain_{uid})" opacity="0.05"/>
</svg>'''
    path = os.path.join(OUT, name + ".svg")
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    return path

os.makedirs(OUT, exist_ok=True)

# ---- Services (landscape) ----
services = [
    ("service-coupe-femme", "rose"),
    ("service-coupe-homme", "noir"),
    ("service-balayage", "gold"),
    ("service-ombre", "copper"),
    ("service-barbe", "teal"),
    ("service-coloration", "plum"),
    ("service-soin", "champ"),
    ("service-mariage", "gold"),
]
for i, (n, p) in enumerate(services):
    make(n, 800, 560, p, seed=100 + i, density=1.0, lush=True)

# ---- Gallery (mix portrait / landscape) ----
gallery = [
    ("gallery-1", "gold", 800, 1100),
    ("gallery-2", "rose", 800, 800),
    ("gallery-3", "noir", 800, 800),
    ("gallery-4", "copper", 1200, 800),
    ("gallery-5", "plum", 800, 800),
    ("gallery-6", "teal", 800, 1100),
    ("gallery-7", "champ", 800, 800),
    ("gallery-8", "gold", 800, 800),
    ("gallery-9", "rose", 1200, 800),
    ("gallery-10", "copper", 800, 1100),
]
for i, (n, p, w, h) in enumerate(gallery):
    make(n, w, h, p, seed=200 + i, density=1.1, lush=True)

# ---- Before / After (before = terne/noir sparse ; after = riche) ----
pairs = [
    ("ba1-before", "noir", False), ("ba1-after", "gold", True),
    ("ba2-before", "noir", False), ("ba2-after", "rose", True),
    ("ba3-before", "noir", False), ("ba3-after", "copper", True),
]
for i, (n, p, lush) in enumerate(pairs):
    make(n, 1400, 900, p, seed=300 + i, density=0.7 if not lush else 1.2, lush=lush)

# ---- Team (compléments) ----
for i, (n, p) in enumerate([("team-3", "plum"), ("team-4", "teal")]):
    make(n, 700, 940, p, seed=400 + i, density=1.0, lush=True)

# ---- Instagram tiles ----
for i in range(6):
    pal = ["gold", "rose", "copper", "plum", "teal", "champ"][i]
    make(f"insta-{i+1}", 700, 700, pal, seed=500 + i, density=1.15, lush=True)

# ---- Hero fallback poster (wide) ----
make("hero-poster", 1920, 1080, "gold", seed=999, density=1.2, lush=True)

print("Generated SVGs in:", os.path.abspath(OUT))
print("Count:", len([f for f in os.listdir(OUT) if f.endswith('.svg')]))
