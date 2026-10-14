import json

with open('scratch/map-paths.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

PINS = {
    'Sumatera': (176, 150),
    'Kalimantan': (425, 135),
    'Jawa': (360, 275),
    'Bali & Nusa Tenggara': (545, 298),
    'Sulawesi': (590, 168),
    'Maluku': (695, 205),
    'Papua': (820, 215)
}
LABELS = {
    'Sumatera': (176, 126),
    'Kalimantan': (425, 108),
    'Jawa': (360, 314),
    'Bali & Nusa Tenggara': (545, 328),
    'Sulawesi': (590, 92),
    'Maluku': (695, 175),
    'Papua': (820, 160)
}

def make_svg_elements(is_backdrop=False):
    lines = []
    pid = "seaGrid_bg" if is_backdrop else "seaGrid"
    lines.append(f'''  <defs>
    <pattern id="{pid}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1000" height="360" rx="18" fill="url(#{pid})"/>
  <line x1="20" y1="134" x2="980" y2="134" stroke="currentColor" stroke-opacity="0.14" stroke-width="1" stroke-dasharray="6 6"/>
  <text x="32" y="127" fill="currentColor" fill-opacity="0.38" font-size="10" font-weight="600" letter-spacing="1.5">GARIS KHATULISTIWA 0°</text>''')
    
    for name in ['Sumatera', 'Kalimantan', 'Jawa', 'Bali & Nusa Tenggara', 'Sulawesi', 'Maluku', 'Papua']:
        path_d = d['groups'][name]
        px, py = PINS[name]
        lx, ly = LABELS[name]
        escaped_name = name.replace('&', '&amp;')
        lines.append(f'''  <g class="svg-isl" data-i="{name}">
    <path d="{path_d}"/>
    <circle class="isl-pin" cx="{px}" cy="{py}" r="4.5"/>
    <text x="{lx}" y="{ly}" text-anchor="middle" class="svg-isl-label">{escaped_name}</text>
  </g>''')
    return '\n'.join(lines)

# Backdrop SVG for behind the title:
def make_backdrop_svg():
    lines = []
    lines.append('''<svg class="hero-map-svg" viewBox="0 0 1000 360" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="mapGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--green)" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="var(--gold)" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="var(--green)" stop-opacity="0.30"/>
    </linearGradient>
  </defs>
  <line x1="20" y1="134" x2="980" y2="134" stroke="var(--green)" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="6 6"/>
  <text x="32" y="127" fill="var(--green)" fill-opacity="0.35" font-size="10" font-weight="700" letter-spacing="1.5">GARIS KHATULISTIWA 0°</text>
  <text x="968" y="127" text-anchor="end" fill="var(--green)" fill-opacity="0.35" font-size="9" font-weight="600" letter-spacing="1">SABANG SAMPAI MERAUKE</text>''')
    
    for name in ['Sumatera', 'Kalimantan', 'Jawa', 'Bali & Nusa Tenggara', 'Sulawesi', 'Maluku', 'Papua']:
        path_d = d['groups'][name]
        px, py = PINS[name]
        lx, ly = LABELS[name]
        escaped_name = name.replace('&', '&amp;')
        lines.append(f'''  <g class="backdrop-isl" data-i="{name}">
    <path class="backdrop-land" d="{path_d}"/>
    <circle class="backdrop-pin" cx="{px}" cy="{py}" r="3.5"/>
    <text x="{lx}" y="{ly}" text-anchor="middle" class="backdrop-label">{escaped_name}</text>
  </g>''')
    lines.append('</svg>')
    return '\n'.join(lines)

with open('scratch/realistic_svg.html', 'w', encoding='utf-8') as f:
    f.write(make_svg_elements())

with open('scratch/backdrop_svg.html', 'w', encoding='utf-8') as f:
    f.write(make_backdrop_svg())

print('Successfully generated realistic SVG components!')
