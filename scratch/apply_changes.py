import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('scratch/backdrop_svg_clean.html', 'r', encoding='utf-8') as f:
    backdrop_svg = f.read()

with open('scratch/realistic_card_svg.html', 'r', encoding='utf-8') as f:
    card_svg = f.read()

# Add hero-map-backdrop inside hero-head before hero-copy
backdrop_html = f'''    <div class="hero-map-backdrop" aria-hidden="true">
{backdrop_svg}
    </div>'''

if '<div class="hero-map-backdrop"' not in html:
    html = html.replace('<div class="hero-head">', f'<div class="hero-head">\n{backdrop_html}', 1)

# Replace SVG content in #archipelagoSvg
pattern = r'(<svg id="archipelagoSvg"[^>]*>)(.*?)(</svg>)'
match = re.search(pattern, html, re.DOTALL)
if match:
    svg_open = match.group(1)
    svg_close = match.group(3)
    html = re.sub(pattern, f'{svg_open}\n{card_svg}\n    {svg_close}', html, flags=re.DOTALL)
else:
    print('Error: archipelagoSvg pattern not found')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated index.html successfully')

# 2. Update css/style.css
with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

hero_old = '''.hero-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.hero-copy {
  flex: 1 1 540px;
}'''

hero_new = '''.hero-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  position: relative;
  overflow: visible;
}

.hero-copy {
  flex: 1 1 540px;
  position: relative;
  z-index: 2;
}

.hero-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

/* Realistic Backdrop Map behind Title */
.hero-map-backdrop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 1100px;
  height: 100%;
  max-height: 350px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.28;
  overflow: visible;
  transition: opacity 0.3s ease;
}

.hero-map-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.backdrop-isl {
  transition: all 0.25s ease;
}

.backdrop-land {
  fill: var(--green-soft);
  stroke: var(--green);
  stroke-width: 1.15;
  stroke-linejoin: round;
  fill-opacity: 0.65;
  stroke-opacity: 0.45;
  transition: all 0.25s ease;
}

.backdrop-pin {
  fill: var(--gold);
  stroke: var(--bg);
  stroke-width: 1.2;
  opacity: 0.85;
  transition: all 0.25s ease;
}

.backdrop-isl.on .backdrop-land,
.backdrop-isl.hover .backdrop-land {
  fill: var(--green);
  fill-opacity: 0.9;
  stroke: var(--gold);
  stroke-width: 2;
  stroke-opacity: 1;
}

.backdrop-isl.on .backdrop-pin,
.backdrop-isl.hover .backdrop-pin {
  fill: var(--chili);
  r: 4.8;
}

:root[data-theme="dark"] .hero-map-backdrop {
  opacity: 0.22;
}

:root[data-theme="dark"] .backdrop-land {
  fill: rgba(86, 168, 125, 0.2);
  stroke: var(--map-stroke);
  stroke-opacity: 0.6;
}

:root[data-theme="dark"] .backdrop-pin {
  stroke: #0D1611;
}'''

if hero_old in css:
    css = css.replace(hero_old, hero_new)
else:
    print('Warning: hero_old block not matched exactly')

# Update svg-isl path stroke-width and font size
svg_isl_old = '''.svg-isl path {
  fill: var(--map-land);
  stroke: var(--map-stroke);
  stroke-width: 2;
  stroke-linejoin: round;
  transition: fill 0.22s ease, stroke 0.22s ease, filter 0.22s ease;
}

.svg-isl .isl-pin {
  fill: var(--gold);
  stroke: var(--card);
  stroke-width: 2;
  transition: r 0.2s ease, fill 0.2s ease;
}

.svg-isl-label {
  fill: var(--ink);
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px;
  font-weight: 700;
  pointer-events: none;
  transition: fill 0.2s ease;
}

.svg-isl:hover path,
.svg-isl.hover path {
  fill: color-mix(in srgb, var(--green) 32%, var(--map-land));
  stroke: var(--green);
}

.svg-isl.on path {
  fill: var(--green);
  stroke: var(--gold);
  stroke-width: 2.5;
  filter: drop-shadow(0 6px 12px rgba(27, 77, 53, 0.28));
}'''

svg_isl_new = '''.svg-isl path {
  fill: var(--map-land);
  stroke: var(--map-stroke);
  stroke-width: 1.25;
  stroke-linejoin: round;
  transition: fill 0.22s ease, stroke 0.22s ease, filter 0.22s ease;
}

.svg-isl .isl-pin {
  fill: var(--gold);
  stroke: var(--card);
  stroke-width: 2;
  transition: r 0.2s ease, fill 0.2s ease;
}

.svg-isl-label {
  fill: var(--ink);
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 11.5px;
  font-weight: 700;
  pointer-events: none;
  transition: fill 0.2s ease;
}

.svg-isl:hover path,
.svg-isl.hover path {
  fill: color-mix(in srgb, var(--green) 32%, var(--map-land));
  stroke: var(--green);
  stroke-width: 1.6;
}

.svg-isl.on path {
  fill: var(--green);
  stroke: var(--gold);
  stroke-width: 2;
  filter: drop-shadow(0 6px 12px rgba(27, 77, 53, 0.28));
}'''

if svg_isl_old in css:
    css = css.replace(svg_isl_old, svg_isl_new)
else:
    print('Warning: svg_isl_old block not matched exactly')

# Mobile responsive addition
mobile_old = '''@media (max-width: 680px) {
  .brand-sub {
    display: none;
  }
  .hero {
    padding-top: 22px;
  }'''

mobile_new = '''@media (max-width: 680px) {
  .brand-sub {
    display: none;
  }
  .hero {
    padding-top: 22px;
  }
  .hero-map-backdrop {
    opacity: 0.16;
    max-height: 240px;
  }'''

if mobile_old in css:
    css = css.replace(mobile_old, mobile_new)

with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('Updated css/style.css successfully')

# 3. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

sync_old = '''function syncSvgMap() {
  $$("#archipelagoSvg .svg-isl").forEach(g => {
    const isSelected = state.pulau === g.dataset.i;
    g.classList.toggle("on", isSelected);
  });
  const btnAll = $("#btnAllIslands");
  if (btnAll) {
    btnAll.hidden = !state.pulau;
  }
}'''

sync_new = '''function syncSvgMap() {
  $$("#archipelagoSvg .svg-isl").forEach(g => {
    const isSelected = state.pulau === g.dataset.i;
    g.classList.toggle("on", isSelected);
  });
  $$(".hero-map-backdrop .backdrop-isl").forEach(g => {
    const isSelected = state.pulau === g.dataset.i;
    g.classList.toggle("on", isSelected);
  });
  const btnAll = $("#btnAllIslands");
  if (btnAll) {
    btnAll.hidden = !state.pulau;
  }
}'''

if sync_old in js:
    js = js.replace(sync_old, sync_new)
else:
    print('Warning: sync_old not found in app.js')

hover_old = '''$("#map").addEventListener("mouseover", e => {
  const b = e.target.closest(".isl");
  $$("#archipelagoSvg .svg-isl").forEach(g => {
    g.classList.toggle("hover", Boolean(b && g.dataset.i === b.dataset.i));
  });
});

$("#map").addEventListener("mouseleave", () => {
  $$("#archipelagoSvg .svg-isl").forEach(g => g.classList.remove("hover"));
});

const svgMap = $("#archipelagoSvg");
if (svgMap) {
  svgMap.addEventListener("click", e => {
    const g = e.target.closest(".svg-isl");
    if (!g) return;
    selectIsland(g.dataset.i);
  });
  svgMap.addEventListener("mouseover", e => {
    const g = e.target.closest(".svg-isl");
    $$("#map .isl").forEach(b => {
      b.classList.toggle("hover", Boolean(g && b.dataset.i === g.dataset.i));
    });
  });
  svgMap.addEventListener("mouseleave", () => {
    $$("#map .isl").forEach(b => b.classList.remove("hover"));
  });
}'''

hover_new = '''$("#map").addEventListener("mouseover", e => {
  const b = e.target.closest(".isl");
  $$("#archipelagoSvg .svg-isl").forEach(g => {
    g.classList.toggle("hover", Boolean(b && g.dataset.i === b.dataset.i));
  });
  $$(".hero-map-backdrop .backdrop-isl").forEach(g => {
    g.classList.toggle("hover", Boolean(b && g.dataset.i === b.dataset.i));
  });
});

$("#map").addEventListener("mouseleave", () => {
  $$("#archipelagoSvg .svg-isl").forEach(g => g.classList.remove("hover"));
  $$(".hero-map-backdrop .backdrop-isl").forEach(g => g.classList.remove("hover"));
});

const svgMap = $("#archipelagoSvg");
if (svgMap) {
  svgMap.addEventListener("click", e => {
    const g = e.target.closest(".svg-isl");
    if (!g) return;
    selectIsland(g.dataset.i);
  });
  svgMap.addEventListener("mouseover", e => {
    const g = e.target.closest(".svg-isl");
    $$("#map .isl").forEach(b => {
      b.classList.toggle("hover", Boolean(g && b.dataset.i === b.dataset.i));
    });
    $$(".hero-map-backdrop .backdrop-isl").forEach(g => {
      g.classList.toggle("hover", Boolean(g && b.dataset.i === g.dataset.i));
    });
  });
  svgMap.addEventListener("mouseleave", () => {
    $$("#map .isl").forEach(b => b.classList.remove("hover"));
    $$(".hero-map-backdrop .backdrop-isl").forEach(g => g.classList.remove("hover"));
  });
}'''

if hover_old in js:
    js = js.replace(hover_old, hover_new)
else:
    print('Warning: hover_old not found in app.js')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Updated js/app.js successfully')
